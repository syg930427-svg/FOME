import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGeneration, GENERATION_FAILURE_CODE, GENERATION_FAILURE_TIPS, getGeneration } from '../api';
import { PhotoPlaceholder, PrimaryButton, SecondaryButton } from '../components';
import { BellGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getNotificationsPermission, requestNotificationsPermission } from '../permissions';
import { useAppEntry } from '../state/appEntry';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S10_Generating'>;

type Phase = 'progress' | 'done' | 'failed';

/**
 * S10 — AI 생성 상태. Phase 4: fake progress(구 +34%씩 증가하던 퍼센트,
 * 고정 4단계 리스트)를 전부 제거했다. mock이 실제 서버 단계를 제공하지
 * 않으므로 무한 로딩 인디케이터만 보여주는 neutral 상태가 기본이다 —
 * 실제 서버가 `generation.steps`를 채워주는 날이 오면 그때 단계별 UI를
 * 추가하면 되고, 지금은 `steps`가 항상 null이라 그 분기 자체가 없다.
 * "진행 상황 보기" 같은 가짜 상세 UI, 타임아웃/오프라인 시뮬레이션 화면도
 * 함께 제거했다 — 최종 상태 모델은 정확히 queued/running(둘 다 이 화면의
 * 'progress' phase) · done · failed 뿐이다.
 * Hardware/gesture back is still guarded — leaving requires the confirm modal.
 */
export default function S10_Generating({ navigation, route }: Props) {
  const activeGenerationId = useSession((s) => s.activeGenerationId);
  const setActiveGenerationId = useSession((s) => s.setActiveGenerationId);
  const generation = useSession((s) => s.getActiveGeneration());
  const addGeneration = useSession((s) => s.addGeneration);
  const updateActiveGeneration = useSession((s) => s.updateActiveGeneration);
  const generationCount = useSession((s) => s.generationCount);
  const setGenerationCount = useSession((s) => s.setGenerationCount);
  const photoId = useSession((s) => s.photoId);
  const policyId = useSession((s) => s.policyId);
  const options = useSession((s) => s.options);
  const setResultIndex = useSession((s) => s.setResultIndex);

  const [phase, setPhase] = useState<Phase>(generation?.status === 'done' ? 'done' : generation?.status === 'failed' ? 'failed' : 'progress');
  const [retrying, setRetrying] = useState(false);
  const allowLeaveRef = useRef(false);

  const notifPromptShown = useAppEntry((s) => s.notifPromptShown);
  const markNotifPromptShown = useAppEntry((s) => s.markNotifPromptShown);
  const [notifSheetVisible, setNotifSheetVisible] = useState(false);

  // 딥링크/푸시로 이 화면에 진입했을 때를 대비한 진입점 — route가 가리키는
  // generationId가 지금 active인 것과 다르면 그쪽으로 active를 옮긴다. 지금
  // 이 앱의 모든 진입 경로(S09→GenerationStarted→S10, 이 화면 자신의 재시도)는
  // 이미 같은 id를 넘기므로 정상 흐름에선 이 분기가 실행되지 않는다 — 나중에
  // 실제 푸시 알림 딥링크가 다른 generationId를 들고 들어오는 경로가 생기면
  // 여기서 그대로 받아준다(단, 그 generation이 이 세션의 이력에 실제로 있을
  // 때만 — 영속화 전이라 앱을 껐다 켜면 이력 자체가 사라진다는 한계는 있음).
  useEffect(() => {
    if (route.params.generationId !== activeGenerationId) {
      setActiveGenerationId(route.params.generationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.generationId]);

  // 01-07: fires once, right as generation starts. Declining never blocks generation.
  useEffect(() => {
    if (notifPromptShown) return;
    let cancelled = false;
    (async () => {
      const status = await getNotificationsPermission();
      if (!cancelled && status === 'not_determined') setNotifSheetVisible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [notifPromptShown]);

  async function handleAllowNotifications() {
    await requestNotificationsPermission();
    markNotifPromptShown();
    setNotifSheetVisible(false);
  }

  function handleSkipNotifications() {
    markNotifPromptShown();
    setNotifSheetVisible(false);
  }

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current) return;
      e.preventDefault();
      Alert.alert('생성을 취소할까요?', '지금 나가면 진행 중인 생성이 취소돼요.', [
        { text: '계속 기다리기', style: 'cancel' },
        {
          text: '취소하고 나가기',
          style: 'destructive',
          onPress: () => {
            allowLeaveRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
  }, [navigation]);

  useEffect(() => {
    if (!activeGenerationId || phase !== 'progress') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getGeneration(activeGenerationId, generationCount);
        if (cancelled) return;
        // active 하나만 patch — 다른 이력(구 Generation 1/2...)은 절대 건드리지 않는다.
        updateActiveGeneration({ status: result.status, steps: result.steps, previewUrl: result.previewUrl ?? undefined, results: result.results ?? undefined });
        if (result.status === 'done') {
          setPhase('done');
        } else if (result.status === 'failed') {
          setPhase('failed');
        }
      } catch {
        // mock은 오프라인을 흉내내지 않는다 — 실패로만 수렴시킨다.
        if (!cancelled) setPhase('failed');
      }
    };

    const interval = setInterval(poll, 2000);
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Only (re)poll while actively progressing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGenerationId, phase]);

  function handleGoBackground() {
    allowLeaveRef.current = true;
    navigation.popToTop();
  }

  function handleViewResult() {
    setResultIndex(0); // Preview는 항상 결과 1장 — 고를 게 없다.
    allowLeaveRef.current = true;
    navigation.replace('S11_Preview', activeGenerationId ? { generationId: activeGenerationId } : {});
  }

  // 실패한 시도를 다시 시도 — 새 generationId를 발급해 이력에 "추가"할 뿐,
  // 실패한 기존 Generation은 지우거나 덮어쓰지 않고 이력에 그대로 남는다
  // (addGeneration은 push이지 교체가 아니다). Preview Credit은 이미 S09에서
  // 이 시도 한 번에 대해서만 소모됐고, 여기서 다시 소모하지 않는다.
  async function handleRetry() {
    if (retrying || !photoId || !policyId) {
      handleGoBackground();
      return;
    }
    setRetrying(true);
    try {
      setGenerationCount(1);
      const { generationId, etaSeconds } = await createGeneration(
        photoId,
        policyId,
        { hair: options.hair, expression: options.expression, background: options.background },
        1
      );
      // 실패했던 시도가 paidRegen 출신(isPaid:true로 만들어졌던 것)이면 재시도도
      // 그대로 Paid 상태를 유지한다 — Preview였다면 계속 Preview로 남는다.
      addGeneration({ id: generationId, status: 'queued', steps: null, etaSeconds, isPaid: generation?.isPaid ?? false });
      setPhase('progress');
    } finally {
      setRetrying(false);
    }
  }

  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.doneHeader}>
          <Text style={styles.doneHeaderTitle}>완료</Text>
        </View>
        <View style={styles.doneIntro}>
          <View style={styles.doneCheck}>
            <Text style={styles.doneCheckGlyph}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>사진이{'\n'}완성됐어요</Text>
          <Text style={styles.doneSubtitle}>결과를 확인해 보세요.</Text>
        </View>
        <View style={styles.donePreviewWrap}>
          <PhotoPlaceholder width={172} height={224} radius={16} tone="primary" />
        </View>
        <View style={styles.ctaArea}>
          <PrimaryButton label="결과 확인하기" onPress={handleViewResult} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'failed') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={handleGoBackground} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>만들기 실패</Text>
        </View>
        <ScrollView contentContainerStyle={styles.failBody}>
          <View style={styles.failIconWrap}>
            <View style={styles.failIconCircle}>
              <Text style={styles.failIconGlyph}>!</Text>
            </View>
          </View>
          <View style={styles.failTextBlock}>
            <Text style={styles.failTitle}>사진을 만들지{'\n'}못했어요</Text>
            <Text style={styles.failBodyText}>원본 사진에서 얼굴을 충분히 인식하지 못했어요. Preview Credit은 추가로 차감되지 않아요.</Text>
          </View>
          <View style={styles.failTipsBox}>
            <Text style={styles.failTipsTitle}>이렇게 하면 성공률이 높아져요</Text>
            {GENERATION_FAILURE_TIPS.map((tip) => (
              <View key={tip} style={styles.failTipRow}>
                <Text style={styles.failTipDot}>·</Text>
                <Text style={styles.failTipText}>{tip}</Text>
              </View>
            ))}
          </View>
          <View style={styles.failCodeRow}>
            <Text style={styles.failCodeText}>오류 코드 {GENERATION_FAILURE_CODE}</Text>
            <Text style={styles.failContactLink}>문의하기</Text>
          </View>
        </ScrollView>
        <View style={styles.ctaArea}>
          <PrimaryButton label="다시 시도" loading={retrying} onPress={handleRetry} />
          <SecondaryButton label="홈으로 돌아가기" onPress={handleGoBackground} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.progressBody}>
        <ActivityIndicator size="large" color={colors.primary} />
        <View style={styles.progressTextBlock}>
          <Text style={styles.progressTitle}>사진을 만들고 있어요</Text>
          <Text style={styles.progressSubtitle}>완료되면 알림으로 알려드려요. 이 화면을 나가도 계속 진행돼요.</Text>
        </View>
      </View>

      <View style={styles.ctaArea}>
        <SecondaryButton label="홈으로 돌아가기" onPress={handleGoBackground} />
      </View>

      <PermissionSheet
        visible={notifSheetVisible}
        icon={<BellGlyph />}
        title="완성되면 알려드릴까요?"
        body="생성에는 시간이 조금 걸려요. 알림을 켜면 앱을 닫아도 완성 시점에 바로 알려드려요."
        checklist={['사진 생성 완료 알림', '다운로드 만료 · 결제 관련 안내']}
        note="광고성 알림은 보내지 않아요"
        primaryLabel="알림 받기"
        onPrimary={handleAllowNotifications}
        secondaryLabel="앱에서 직접 확인할게요"
        onSecondary={handleSkipNotifications}
        onDismiss={handleSkipNotifications}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding },
  back: { fontSize: 20, color: colors.textPrimary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  progressBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 40 },
  progressTextBlock: { alignItems: 'center', gap: 8 },
  progressTitle: { fontSize: 19, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  progressSubtitle: { fontSize: 13.5, color: colors.textTertiary, lineHeight: 13.5 * 1.6, textAlign: 'center' },

  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 28, gap: 10 },

  // done
  doneHeader: { height: 52, alignItems: 'center', justifyContent: 'center' },
  doneHeaderTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  doneIntro: { alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  doneCheck: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  doneCheckGlyph: { color: colors.inverseText, fontSize: 24, fontWeight: '700' },
  doneTitle: { fontSize: 23, fontWeight: '700', lineHeight: 23 * 1.34, textAlign: 'center', color: colors.textPrimary },
  doneSubtitle: { fontSize: 14, color: colors.textTertiary, textAlign: 'center' },
  donePreviewWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // failed
  failBody: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, gap: 20, paddingBottom: 24 },
  failIconWrap: { width: '100%', height: 190, borderRadius: 16, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, alignItems: 'center', justifyContent: 'center' },
  failIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  failIconGlyph: { color: colors.error, fontSize: 24, fontWeight: '700' },
  failTextBlock: { gap: 8 },
  failTitle: { fontSize: 23, fontWeight: '700', lineHeight: 23 * 1.34, letterSpacing: -0.3, color: colors.textPrimary },
  failBodyText: { fontSize: 14.5, color: colors.textSecondaryAlt, lineHeight: 14.5 * 1.6 },
  failTipsBox: { padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 9 },
  failTipsTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  failTipRow: { flexDirection: 'row', gap: 8 },
  failTipDot: { color: colors.primary, fontWeight: '700' },
  failTipText: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.textSecondary },
  failCodeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  failCodeText: { fontSize: 12.5, color: colors.textTertiary },
  failContactLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
});
