import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generationStepLabel, getGeneration, GENERATION_STEPS } from '../api';
import { PhotoPlaceholder, PrimaryButton, SecondaryButton } from '../components';
import { BellGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getNotificationsPermission, requestNotificationsPermission } from '../permissions';
import { useAppEntry } from '../state/appEntry';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S10_Generating'>;

/** S10 — AI 생성 중. Hardware/gesture back is blocked; leaving requires the confirm modal. */
export default function S10_Generating({ navigation }: Props) {
  const generation = useSession((s) => s.generation);
  const setGeneration = useSession((s) => s.setGeneration);
  const [failed, setFailed] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;
  const allowLeaveRef = useRef(false);

  const notifPromptShown = useAppEntry((s) => s.notifPromptShown);
  const markNotifPromptShown = useAppEntry((s) => s.markNotifPromptShown);
  const [notifSheetVisible, setNotifSheetVisible] = useState(false);

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

  const progress = generation?.progress ?? 0;
  const stepIndex = Math.min(GENERATION_STEPS.length - 1, Math.floor((progress / 100) * GENERATION_STEPS.length));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

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
    if (!generation || generation.status === 'done' || failed) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getGeneration(generation.id);
        if (cancelled) return;
        setGeneration({ id: result.generationId, status: result.status, progress: result.progress, previewUrl: result.previewUrl ?? undefined });
        if (result.status === 'done') {
          allowLeaveRef.current = true;
          navigation.replace('S11_Preview');
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const interval = setInterval(poll, 2000);
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Only (re)poll when the generation id or terminal state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation?.id, generation?.status, failed]);

  function retry() {
    setFailed(false);
    setGeneration(generation ? { ...generation, status: 'queued', progress: 0 } : null);
  }

  function backToHome() {
    allowLeaveRef.current = true;
    navigation.popToTop();
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
          <PhotoPlaceholder width={66} height={88} radius={0} tone="primary" style={styles.ringInner} />
        </Animated.View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>사진을 만들고 있어요</Text>
          <Text style={styles.subtitle}>선택한 스타일을 적용하고 있습니다.{'\n'}보통 20초 정도 걸려요.</Text>
        </View>

        <View style={styles.steps}>
          {GENERATION_STEPS.map((_, i) => {
            const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
            return (
              <View key={i} style={styles.stepRow}>
                {state === 'done' ? (
                  <View style={styles.stepDot}>
                    <Text style={styles.stepDotGlyph}>✓</Text>
                  </View>
                ) : (
                  <View style={[styles.stepRing, state === 'active' && styles.stepRingActive]} />
                )}
                <Text style={[styles.stepLabel, state === 'active' && styles.stepLabelActive, state === 'pending' && styles.stepLabelPending]}>
                  {generationStepLabel(i)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {failed && (
        <View style={styles.failCard}>
          <Text style={styles.failLabel}>FAILED 상태</Text>
          <Text style={styles.failText}>사진 생성에 실패했습니다. 잠시 후 다시 시도해주세요.</Text>
          <View style={styles.failButtons}>
            <PrimaryButton label="다시 시도" danger style={styles.failRetry} onPress={retry} />
            <SecondaryButton label="처음으로" compact style={styles.failHome} onPress={backToHome} />
          </View>
        </View>
      )}

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
  body: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 28 },
  ring: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: colors.primaryTintStrong,
    borderTopColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: { borderColor: 'transparent' },
  titleBlock: { alignItems: 'center', gap: 8 },
  title: { fontSize: 23, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textTertiary, textAlign: 'center', lineHeight: 15 * 1.55 },
  steps: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepDotGlyph: { color: colors.inverseText, fontSize: 11 },
  stepRing: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  stepRingActive: { borderColor: colors.primary },
  stepLabel: { fontSize: 14, color: colors.textSecondaryAlt },
  stepLabelActive: { fontWeight: '700', color: colors.textPrimary },
  stepLabelPending: { color: colors.textDisabledAlt },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  failCard: { margin: 20, marginTop: 0, marginBottom: 24, padding: 15, borderRadius: 14, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, gap: 10 },
  failLabel: { fontSize: 12, fontWeight: '700', color: colors.errorStrong },
  failText: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.errorStrongAlt },
  failButtons: { flexDirection: 'row', gap: 8 },
  failRetry: { flex: 1 },
  failHome: { flex: 1 },
});
