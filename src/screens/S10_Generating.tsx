import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelGeneration, GENERATION_FAILURE_CODE, GENERATION_FAILURE_TIPS, GENERATION_STEP_LABELS, getGeneration } from '../api';
import { PhotoPlaceholder, PrimaryButton, RegenerateChoice, RegenerateSheet, SecondaryButton } from '../components';
import { BellGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getNotificationsPermission, requestNotificationsPermission } from '../permissions';
import { useAppEntry } from '../state/appEntry';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S10_Generating'>;

type Phase = 'progress' | 'done' | 'failed' | 'timeout' | 'offline';

const CANCEL_ENABLED_AFTER_SEC = 15;
const TIMEOUT_AFTER_SEC = 180;

/** S10 — AI 생성 중. Hardware/gesture back is blocked; leaving requires the confirm modal. */
export default function S10_Generating({ navigation }: Props) {
  const generation = useSession((s) => s.generation);
  const setGeneration = useSession((s) => s.setGeneration);
  const generationCount = useSession((s) => s.generationCount);
  const photoId = useSession((s) => s.photoId);
  const freeRetryUsed = useSession((s) => s.freeRetryUsed);
  const markFreeRetryUsed = useSession((s) => s.markFreeRetryUsed);
  const setResultIndex = useSession((s) => s.setResultIndex);

  const [phase, setPhase] = useState<Phase>(generation?.status === 'done' ? 'done' : 'progress');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [regenerateVisible, setRegenerateVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const allowLeaveRef = useRef(false);

  const notifPromptShown = useAppEntry((s) => s.notifPromptShown);
  const markNotifPromptShown = useAppEntry((s) => s.markNotifPromptShown);
  const [notifSheetVisible, setNotifSheetVisible] = useState(false);

  const progress = generation?.progress ?? 0;
  const stepIndex = Math.min(GENERATION_STEP_LABELS.length - 1, Math.floor((progress / 100) * GENERATION_STEP_LABELS.length));
  const remainingSeconds = Math.max(0, Math.round((generation?.etaSeconds ?? 20) * (1 - progress / 100)));

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

  // Elapsed-time clock — gates "취소" (15s) and flips to the timeout state (180s),
  // matching a real backend's own worst case even though the mock never runs that long.
  useEffect(() => {
    if (phase !== 'progress') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'progress' && elapsed >= TIMEOUT_AFTER_SEC) setPhase('timeout');
  }, [elapsed, phase]);

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
    if (!generation || phase !== 'progress') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getGeneration(generation.id, generationCount);
        if (cancelled) return;
        setGeneration({ ...generation, status: result.status, progress: result.progress, previewUrl: result.previewUrl ?? undefined, results: result.results ?? undefined });
        if (result.status === 'done') {
          setPhase('done');
        } else if (result.status === 'failed') {
          setPhase('failed');
        }
      } catch {
        if (!cancelled) setPhase('offline');
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
  }, [generation?.id, phase]);

  function handleGoBackground() {
    allowLeaveRef.current = true;
    navigation.popToTop();
  }

  function handleCancel() {
    if (elapsed < CANCEL_ENABLED_AFTER_SEC || !generation) return;
    Alert.alert('만들기를 취소할까요?', '결제한 금액은 그대로 환불돼요.', [
      { text: '계속 만들기', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: async () => {
          await cancelGeneration(generation.id);
          allowLeaveRef.current = true;
          navigation.popToTop();
        },
      },
    ]);
  }

  function handleViewResult() {
    setResultIndex(selectedThumb);
    allowLeaveRef.current = true;
    navigation.replace('S11_Preview');
  }

  function handleReconnectNow() {
    setElapsed(0);
    setPhase('progress');
  }

  function handleRegenerateConfirm(choice: RegenerateChoice) {
    setRegenerateVisible(false);
    if (choice === 'differentPhoto') {
      allowLeaveRef.current = true;
      navigation.navigate('PhotoInputMethod', {});
      return;
    }
    if (choice === 'changeOptions') {
      allowLeaveRef.current = true;
      navigation.navigate('S08_Options');
      return;
    }
    // 'same' — free retry, same photo/policy/options, fresh generation id.
    if (!photoId) return;
    markFreeRetryUsed();
    setElapsed(0);
    setGeneration({ id: `gen_${Date.now()}`, status: 'queued', progress: 0, etaSeconds: generation?.etaSeconds });
    setPhase('progress');
  }

  const completedLabel = useMemo(() => `${stepIndex} / ${GENERATION_STEP_LABELS.length} 완료`, [stepIndex]);

  if (phase === 'done') {
    const results = generation?.results ?? Array.from({ length: generationCount }, (_, i) => `mock://result-${i}`);
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.doneHeader}>
          <Text style={styles.doneHeaderTitle}>완료</Text>
        </View>
        <View style={styles.doneIntro}>
          <View style={styles.doneCheck}>
            <Text style={styles.doneCheckGlyph}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>사진 {results.length}장이{'\n'}준비됐어요</Text>
          <Text style={styles.doneSubtitle}>마음에 드는 사진을 골라 저장하세요.</Text>
        </View>
        <ScrollView contentContainerStyle={styles.doneGrid}>
          {results.map((_, i) => (
            <Pressable key={i} style={[styles.doneCell, i === selectedThumb && styles.doneCellSelected]} onPress={() => setSelectedThumb(i)}>
              <PhotoPlaceholder width={88} height={140} radius={0} tone={i === selectedThumb ? 'primary' : 'neutral'} />
              {i === selectedThumb && (
                <View style={styles.doneCellCheck}>
                  <Text style={styles.doneCellCheckGlyph}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.ctaArea}>
          <PrimaryButton label="결과 자세히 보기" onPress={handleViewResult} />
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
            <Text style={styles.failBodyText}>원본 사진에서 얼굴을 충분히 인식하지 못했어요. 결제 금액은 차감되지 않았어요.</Text>
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
          <PrimaryButton
            label="다른 사진으로 다시 만들기"
            onPress={() => {
              allowLeaveRef.current = true;
              navigation.navigate('PhotoInputMethod', {});
            }}
          />
          <SecondaryButton label="같은 사진으로 재시도" onPress={() => setRegenerateVisible(true)} />
        </View>
        <RegenerateSheet
          visible={regenerateVisible}
          onDismiss={() => setRegenerateVisible(false)}
          onConfirm={handleRegenerateConfirm}
          freeRetryAvailable={!freeRetryUsed}
        />
      </SafeAreaView>
    );
  }

  if (phase === 'offline') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.offlineBanner}>
          <View style={styles.offlineBannerDot} />
          <Text style={styles.offlineBannerText}>네트워크에 연결되지 않았어요</Text>
        </View>
        <View style={styles.header}>
          <Pressable onPress={handleGoBackground} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>사진 만드는 중</Text>
        </View>
        <ScrollView contentContainerStyle={styles.failBody}>
          <View style={styles.offlineIconWrap}>
            <View style={styles.offlineIconShape} />
            <View style={styles.offlineIconSlash} />
          </View>
          <View style={styles.failTextBlock}>
            <Text style={styles.failTitle}>연결이 끊겼어요</Text>
            <Text style={styles.failBodyText}>사진 만들기는 서버에서 계속 진행되고 있어요. 연결되면 자동으로 이어서 보여드려요.</Text>
          </View>
          <View style={styles.offlineSafeBox}>
            <Text style={styles.offlineSafeTitle}>진행은 안전하게 저장돼 있어요</Text>
            <Text style={styles.offlineSafeText}>앱을 완전히 종료해도 결과는 사라지지 않아요. 다시 접속하면 홈에서 이어서 확인할 수 있어요.</Text>
          </View>
        </ScrollView>
        <View style={styles.ctaArea}>
          <PrimaryButton label="지금 다시 연결" onPress={handleReconnectNow} />
          <SecondaryButton label="홈으로 이동" onPress={handleGoBackground} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'timeout') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={handleGoBackground} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>사진 만드는 중</Text>
          <Text style={styles.timeoutElapsed}>
            {Math.floor(elapsed / 60)}분 {elapsed % 60}초 경과
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.failBody}>
          <View style={styles.timeoutIconWrap}>
            <View style={styles.timeoutIconCircle}>
              <View style={styles.timeoutHourHand} />
              <View style={styles.timeoutMinuteHand} />
            </View>
          </View>
          <View style={styles.failTextBlock}>
            <Text style={styles.failTitle}>평소보다 오래{'\n'}걸리고 있어요</Text>
            <Text style={styles.failBodyText}>요청이 많아 대기 중이에요. 기다리지 않아도 괜찮아요. 완료되면 알림으로 알려드려요.</Text>
          </View>
          <View style={styles.timeoutSteps}>
            <View style={styles.timeoutStepDone}>
              <View style={styles.timeoutStepDoneDot}>
                <Text style={styles.timeoutStepDoneGlyph}>✓</Text>
              </View>
              <Text style={styles.timeoutStepDoneLabel}>얼굴 위치 정렬</Text>
            </View>
            <View style={styles.timeoutStepActive}>
              <View style={styles.timeoutStepActiveDot} />
              <Text style={styles.timeoutStepActiveLabel}>배경 정리 · 대기 중</Text>
            </View>
          </View>
          <View style={styles.timeoutInfoBox}>
            <Text style={styles.timeoutInfoGlyph}>i</Text>
            <Text style={styles.timeoutInfoText}>5분을 넘기면 자동으로 취소되고 결제 금액이 전액 환불돼요.</Text>
          </View>
        </ScrollView>
        <View style={styles.ctaArea}>
          <PrimaryButton label="알림 받고 나가기" onPress={handleGoBackground} />
          <SecondaryButton label="계속 기다리기" onPress={() => setPhase('progress')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleGoBackground} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>사진 만드는 중</Text>
        <Text style={styles.etaText}>약 {remainingSeconds}초 남음</Text>
      </View>

      <View style={styles.thumbWrap}>
        <PhotoPlaceholder width={172} height={224} radius={16} tone="primary" />
        <View style={styles.thumbBadge}>
          <Text style={styles.thumbBadgeText}>{completedLabel}</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{GENERATION_STEP_LABELS[stepIndex]}</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
      </View>

      <ScrollView style={styles.stepsScroll} contentContainerStyle={styles.steps}>
        {GENERATION_STEP_LABELS.map((label, i) => {
          const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
          return (
            <View key={label} style={[styles.stepRow, state === 'active' && styles.stepRowActive]}>
              {state === 'done' ? (
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotGlyph}>✓</Text>
                </View>
              ) : (
                <View style={[styles.stepRing, state === 'active' && styles.stepRingActive]} />
              )}
              <Text style={[styles.stepLabel, state === 'active' && styles.stepLabelActive, state === 'pending' && styles.stepLabelPending]}>
                {label}
              </Text>
              {state !== 'pending' && (
                <Text style={[styles.stepStatus, state === 'active' && styles.stepStatusActive]}>{state === 'done' ? '완료' : '진행 중'}</Text>
              )}
            </View>
          );
        })}
        <View style={styles.backgroundNote}>
          <Text style={styles.backgroundNoteGlyph}>i</Text>
          <Text style={styles.backgroundNoteText}>앱을 닫아도 계속 만들어져요. 완료되면 알림으로 알려드려요.</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="백그라운드로 계속하기" onPress={handleGoBackground} />
        <Pressable onPress={handleCancel} hitSlop={8} disabled={elapsed < CANCEL_ENABLED_AFTER_SEC}>
          <Text style={[styles.cancelLink, elapsed < CANCEL_ENABLED_AFTER_SEC && styles.cancelLinkDisabled]}>만들기 취소</Text>
        </Pressable>
      </View>

      <PermissionSheet
        visible={notifSheetVisible}
        icon={<BellGlyph />}
        title="완성되면 알려드릴까요?"
        body="생성에는 20초 정도 걸려요. 알림을 켜면 앱을 닫아도 완성 시점에 바로 알려드려요."
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
  etaText: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  timeoutElapsed: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: colors.warning },

  thumbWrap: { alignSelf: 'center', marginTop: 8, marginBottom: 18, position: 'relative' },
  thumbBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  thumbBadgeText: { fontSize: 10.5, fontWeight: '700', color: colors.primary },

  progressBlock: { paddingHorizontal: spacing.screenPadding, gap: 8, paddingBottom: 18 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  progressPercent: { fontSize: 13, fontWeight: '700', color: colors.primary },

  stepsScroll: { flex: 1 },
  steps: { paddingHorizontal: spacing.screenPadding, gap: 9, paddingBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 13, backgroundColor: colors.surfaceSubtle },
  stepRowActive: { backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: '#DDE9FB' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepDotGlyph: { color: colors.inverseText, fontSize: 11 },
  stepRing: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt },
  stepRingActive: { backgroundColor: 'transparent', borderWidth: 2.5, borderColor: colors.primaryTintStrong, borderTopColor: colors.primary },
  stepLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  stepLabelActive: { fontWeight: '700', color: colors.primary },
  stepLabelPending: { color: colors.textTertiary },
  stepStatus: { fontSize: 12.5, color: colors.textTertiary },
  stepStatusActive: { color: colors.infoText },
  backgroundNote: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 12, backgroundColor: colors.surfaceSubtle, marginTop: 4 },
  backgroundNoteGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  backgroundNoteText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },

  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 28, gap: 10 },
  cancelLink: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.textDisabled },
  cancelLinkDisabled: { color: colors.textDisabled, opacity: 0.5 },

  // 08-03 done
  doneHeader: { height: 52, alignItems: 'center', justifyContent: 'center' },
  doneHeaderTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  doneIntro: { alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  doneCheck: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  doneCheckGlyph: { color: colors.inverseText, fontSize: 24, fontWeight: '700' },
  doneTitle: { fontSize: 23, fontWeight: '700', lineHeight: 23 * 1.34, textAlign: 'center', color: colors.textPrimary },
  doneSubtitle: { fontSize: 14, color: colors.textTertiary, textAlign: 'center' },
  doneGrid: { paddingHorizontal: spacing.screenPadding, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  doneCell: { width: '47%', height: 200, borderRadius: 14, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  doneCellSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface },
  doneCellCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  doneCellCheckGlyph: { color: colors.inverseText, fontSize: 11 },

  // 08-04 failed / shared fail-style layout
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

  // 08-06 offline
  offlineBanner: { height: 32, backgroundColor: colors.warningBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  offlineBannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning },
  offlineBannerText: { fontSize: 12.5, fontWeight: '700', color: colors.warningStrong },
  offlineIconWrap: { width: '100%', height: 190, borderRadius: 16, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  offlineIconShape: { width: 60, height: 44, borderRadius: 8, borderWidth: 2.5, borderColor: colors.textDisabledAlt },
  offlineIconSlash: { position: 'absolute', width: 78, borderTopWidth: 2.5, borderTopColor: colors.textDisabledAlt, transform: [{ rotate: '-38deg' }] },
  offlineSafeBox: { padding: 15, borderRadius: 14, backgroundColor: colors.primaryTint, gap: 8 },
  offlineSafeTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  offlineSafeText: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.infoText },

  // 08-07 timeout
  timeoutIconWrap: { width: '100%', height: 190, borderRadius: 16, backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#F5E3C0', alignItems: 'center', justifyContent: 'center' },
  timeoutIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 2.5, borderColor: '#E8B54A', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  timeoutHourHand: { position: 'absolute', width: 2, height: 16, backgroundColor: colors.warning, top: 12, borderRadius: 1 },
  timeoutMinuteHand: { position: 'absolute', width: 12, height: 2, backgroundColor: colors.warning, left: 26, top: 26, borderRadius: 1 },
  timeoutSteps: { gap: 9 },
  timeoutStepDone: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: 13, backgroundColor: colors.surfaceSubtle },
  timeoutStepDoneDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  timeoutStepDoneGlyph: { color: colors.inverseText, fontSize: 11 },
  timeoutStepDoneLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  timeoutStepActive: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: 13, backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#F5E3C0' },
  timeoutStepActiveDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: '#F0D9A8', borderTopColor: colors.warning },
  timeoutStepActiveLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.warningStrong },
  timeoutInfoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.primaryTint },
  timeoutInfoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  timeoutInfoText: { flex: 1, fontSize: 13, lineHeight: 13 * 1.5, color: colors.infoText },
});
