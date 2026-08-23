import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { prefetchBootstrap } from '../../api';
import { RootStackParamList } from '../../navigation/types';
import { useAppEntry } from '../../state/appEntry';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const TRACK_WIDTH = 120;
const INDICATOR_WIDTH = 58;
const MAX_DISPLAY_MS = 2000;

/** 01-01 — Splash. Prefetches policy/version bootstrap, then routes; never requests permissions here. */
export default function Splash({ navigation }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const onboardingCompleted = useAppEntry((s) => s.onboardingCompleted);
  const hydrated = useAppEntry((s) => s.hydrated);
  const hydrate = useAppEntry((s) => s.hydrate);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!hydrated) await hydrate();

      const timeout = new Promise<{ ok: false; reason: 'server_error' }>((resolve) =>
        setTimeout(() => resolve({ ok: false, reason: 'server_error' }), MAX_DISPLAY_MS)
      );
      const result = await Promise.race([prefetchBootstrap(), timeout]);
      if (cancelled) return;

      if (!result.ok) {
        navigation.reset({ index: 0, routes: [{ name: result.reason === 'update_required' ? 'UpdateRequired' : 'ServerError' }] });
        return;
      }

      const nextCompleted = useAppEntry.getState().onboardingCompleted;
      navigation.reset({ index: 0, routes: [{ name: nextCompleted ? 'S01_Purpose' : 'Onboarding' }] });
    }

    boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRACK_WIDTH - INDICATOR_WIDTH] });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.body}>
        <View style={styles.mark}>
          <View style={styles.markFigure} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.brand}>AI PHOTO</Text>
          <Text style={styles.title}>목적에 맞는 증명사진</Text>
          <Text style={styles.subtitle}>여권 · 신분증 · 면허증 · 면접까지{'\n'}목적을 고르면 기준이 정해져요</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.track}>
          <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]} />
        </View>
        <Text style={styles.version}>버전 1.0.0 · 정책 데이터 확인 중</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0066FF' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 40 },
  mark: {
    width: 112,
    height: 144,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markFigure: { width: 62, height: 92, borderTopLeftRadius: 31, borderTopRightRadius: 31, backgroundColor: 'rgba(255,255,255,0.86)' },
  textBlock: { alignItems: 'center', gap: 10 },
  brand: { fontSize: 15, fontWeight: '700', letterSpacing: 2.1, color: 'rgba(255,255,255,0.72)' },
  title: { fontSize: 27, fontWeight: '700', letterSpacing: -0.5, color: '#fff', textAlign: 'center', lineHeight: 27 * 1.35 },
  subtitle: { fontSize: 15, lineHeight: 15 * 1.55, color: 'rgba(255,255,255,0.78)', textAlign: 'center' },
  footer: { paddingHorizontal: 40, paddingBottom: 44, alignItems: 'center', gap: 16 },
  track: { width: TRACK_WIDTH, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' },
  indicator: { width: INDICATOR_WIDTH, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  version: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
});
