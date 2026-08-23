import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { AspectPreset } from '../state/session';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoCrop'>;

const ASPECT_LABEL: Record<AspectPreset, string> = { passport: '여권 35×45', '3x4': '3×4', free: '자유' };
const FRAME_LABEL: Record<AspectPreset, string> = { passport: '35 × 45 mm', '3x4': '3 × 4', free: '자유 비율' };
const ROTATION_MIN = -15;
const ROTATION_MAX = 15;

/** 05-03 — 사진 Crop. Rotation is a real slider; pan is a lightweight single-finger drag (no pinch-zoom yet). */
export default function PhotoCrop({ navigation }: Props) {
  const framing = useSession((s) => s.framing);
  const setFraming = useSession((s) => s.setFraming);
  const editLevel = useSession((s) => s.editLevel);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const [trackWidth, setTrackWidth] = useState(220);

  // Passport/ID policies lock the output ratio — RULE: regulated dimensions can't drift.
  const aspectLocked = editLevel === 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStart.current = pan;
      },
      onPanResponderMove: (_evt, gesture) => {
        setPan({
          x: clamp(panStart.current.x + gesture.dx, -40, 40),
          y: clamp(panStart.current.y + gesture.dy, -40, 40),
        });
      },
    })
  ).current;

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  function handleRotationTrackPress(x: number, trackWidth: number) {
    const ratio = clamp(x / trackWidth, 0, 1);
    const deg = Math.round(ROTATION_MIN + ratio * (ROTATION_MAX - ROTATION_MIN));
    setFraming({ rotationDeg: deg });
  }

  function reset() {
    setFraming({ rotationDeg: 0 });
    setPan({ x: 0, y: 0 });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>범위 조정</Text>
        <Pressable style={styles.resetButton} onPress={reset} hitSlop={8}>
          <Text style={styles.resetText}>초기화</Text>
        </Pressable>
      </View>

      <View style={styles.stage} {...panResponder.panHandlers}>
        <View style={styles.cropWindow}>
          <View style={styles.cropClip}>
            <View
              style={[
                styles.figureLayer,
                { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: `${framing.rotationDeg}deg` }] },
              ]}
            >
              <View style={styles.figure} />
            </View>
            <View style={styles.dimOverlay} pointerEvents="none" />
            <View style={styles.frameInner} pointerEvents="none">
              <View style={styles.gridLineV1} />
              <View style={styles.gridLineV2} />
              <View style={styles.gridLineH1} />
              <View style={styles.gridLineH2} />
            </View>
          </View>
          <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />
          <View style={styles.dimensionBadge} pointerEvents="none">
            <Text style={styles.dimensionBadgeText}>{FRAME_LABEL[framing.aspect]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.aspectRow}>
          {(['passport', '3x4', 'free'] as const).map((preset) => {
            const disabled = aspectLocked && preset !== 'passport';
            const active = framing.aspect === preset;
            return (
              <Pressable
                key={preset}
                style={[styles.aspectTab, active && styles.aspectTabActive, disabled && styles.aspectTabDisabled]}
                disabled={disabled}
                onPress={() => setFraming({ aspect: preset })}
              >
                <Text style={[styles.aspectTabText, active && styles.aspectTabTextActive]}>{ASPECT_LABEL[preset]}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rotationRow}>
          <Text style={styles.rotationLabel}>회전</Text>
          <Pressable
            style={styles.rotationTrack}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onPress={(e) => handleRotationTrackPress(e.nativeEvent.locationX, trackWidth)}
          >
            <View
              style={[
                styles.rotationKnob,
                { left: `${((framing.rotationDeg - ROTATION_MIN) / (ROTATION_MAX - ROTATION_MIN)) * 100}%` },
              ]}
            />
          </Pressable>
          <Text style={styles.rotationValue}>{framing.rotationDeg}°</Text>
        </View>
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton label="범위 확정" onPress={() => navigation.navigate('FacePosition')} />
      </View>
    </SafeAreaView>
  );
}

const FRAME_W = 215;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E0E10' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.screenPadding, marginTop: 44 },
  back: { fontSize: 20, color: colors.inverseText },
  title: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  resetButton: { marginLeft: 'auto' },
  resetText: { fontSize: 14, fontWeight: '700', color: '#4D9BFF' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cropWindow: { width: FRAME_W, height: 300, position: 'relative' },
  cropClip: { ...StyleSheet.absoluteFill, overflow: 'hidden', borderRadius: 2 },
  figureLayer: { ...StyleSheet.absoluteFill, backgroundColor: '#2A2C30', alignItems: 'center', justifyContent: 'flex-end' },
  figure: { width: FRAME_W * 0.72, height: 300 * 1.15, borderTopLeftRadius: FRAME_W * 0.36, borderTopRightRadius: FRAME_W * 0.36, backgroundColor: '#43474D' },
  dimOverlay: { ...StyleSheet.absoluteFill },
  frameInner: { ...StyleSheet.absoluteFill, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  gridLineV1: { position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 0, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.28)' },
  gridLineV2: { position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 0, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.28)' },
  gridLineH1: { position: 'absolute', top: '33.3%', left: 0, right: 0, height: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.28)' },
  gridLineH2: { position: 'absolute', top: '66.6%', left: 0, right: 0, height: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.28)' },
  corner: { position: 'absolute', width: 22, height: 22 },
  cornerTL: { top: -8, left: -8, borderLeftWidth: 3, borderTopWidth: 3, borderColor: colors.inverseText },
  cornerTR: { top: -8, right: -8, borderRightWidth: 3, borderTopWidth: 3, borderColor: colors.inverseText },
  cornerBL: { bottom: -8, left: -8, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: colors.inverseText },
  cornerBR: { bottom: -8, right: -8, borderRightWidth: 3, borderBottomWidth: 3, borderColor: colors.inverseText },
  dimensionBadge: { position: 'absolute', top: -36, left: -6, backgroundColor: 'rgba(0,102,255,0.9)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  dimensionBadgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  controls: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, paddingBottom: 10, gap: 12 },
  aspectRow: { flexDirection: 'row', gap: 8 },
  aspectTab: { flex: 1, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  aspectTabActive: { backgroundColor: colors.inverseText },
  aspectTabDisabled: { opacity: 0.35 },
  aspectTabText: { fontSize: 13, fontWeight: '600', color: colors.inverseText },
  aspectTabTextActive: { color: colors.textPrimary, fontWeight: '700' },
  rotationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rotationLabel: { fontSize: 12, color: 'rgba(255,255,255,0.55)', width: 34 },
  rotationTrack: { flex: 1, height: 20, justifyContent: 'center' },
  rotationKnob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: colors.inverseText, marginLeft: -8 },
  rotationValue: { fontSize: 12, color: colors.inverseText, width: 28, textAlign: 'right' },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, paddingBottom: 28 },
});
