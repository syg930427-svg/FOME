import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { InfoBanner, PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'FacePosition'>;

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

/** 05-04 — 얼굴 위치 조정. Two sliders sharing the same drag/tap model; "자동으로 맞추기" is a one-shot landmark reset. */
export default function FacePosition({ navigation }: Props) {
  const framing = useSession((s) => s.framing);
  const setFraming = useSession((s) => s.setFraming);
  const purposeId = useSession((s) => s.purposeId);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const [sizeTrackWidth, setSizeTrackWidth] = useState(280);
  const [offsetTrackWidth, setOffsetTrackWidth] = useState(280);

  function handleTrack(x: number, width: number, onChange: (v: number) => void) {
    onChange(clamp(x / width));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="얼굴 위치"
        onBack={navigation.goBack}
        right={
          purpose ? (
            <View style={styles.policyBadge}>
              <Text style={styles.policyBadgeText}>{purpose.title.replace(' 사진', '')} 기준</Text>
            </View>
          ) : undefined
        }
      />

      <Text style={styles.hint}>얼굴이 기준선 안에 들어오도록 사진을 움직여 주세요.</Text>

      <View style={styles.previewWrap}>
        <View style={styles.figureLayer}>
          <View
            style={[
              styles.figure,
              {
                width: 200 * (0.7 + framing.faceSize * 0.5),
                height: 320 * (0.7 + framing.faceSize * 0.5),
                marginBottom: -60 + framing.faceOffsetY * 80,
              },
            ]}
          />
        </View>
        <View style={styles.guideBox} pointerEvents="none" />
        <View style={[styles.guideLine, { top: 44 }]} pointerEvents="none" />
        <Text style={[styles.guideLabel, { top: 36 }]}>머리 정점</Text>
        <View style={[styles.guideLine, { top: 170 }]} pointerEvents="none" />
        <Text style={[styles.guideLabel, { top: 162 }]}>눈높이</Text>
        <View style={[styles.guideLine, { bottom: 52 }]} pointerEvents="none" />
        <Text style={[styles.guideLabel, { bottom: 44 }]}>턱선</Text>
        <View style={styles.moveHandle} pointerEvents="none">
          <Text style={styles.moveHandleGlyph}>✥</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <SliderRow
          label="크기"
          value={framing.faceSize}
          onLayout={(e: LayoutChangeEvent) => setSizeTrackWidth(e.nativeEvent.layout.width)}
          onPress={(x) => handleTrack(x, sizeTrackWidth, (v) => setFraming({ faceSize: v }))}
        />
        <SliderRow
          label="위·아래"
          value={framing.faceOffsetY}
          onLayout={(e: LayoutChangeEvent) => setOffsetTrackWidth(e.nativeEvent.layout.width)}
          onPress={(x) => handleTrack(x, offsetTrackWidth, (v) => setFraming({ faceOffsetY: v }))}
        />

        <InfoBanner tone="info" text="얼굴 크기와 위치만 조정돼요. 얼굴 형태나 생김새는 바뀌지 않아요." />

        <Pressable style={styles.autoButton} onPress={() => setFraming({ faceSize: 0.58, faceOffsetY: 0.44 })}>
          <Text style={styles.autoButtonText}>자동으로 맞추기</Text>
        </Pressable>
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton label="위치 확정" onPress={() => navigation.navigate('FramingSelect')} />
      </View>
    </SafeAreaView>
  );
}

function SliderRow({
  label,
  value,
  onLayout,
  onPress,
}: {
  label: string;
  value: number;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: (x: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <Pressable style={styles.sliderTrack} onLayout={onLayout} onPress={(e) => onPress(e.nativeEvent.locationX)}>
        <View style={styles.sliderTrackLine} />
        <View style={[styles.sliderFill, { width: `${value * 100}%` }]} />
        <View style={[styles.sliderKnob, { left: `${value * 100}%` }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  policyBadge: { backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  policyBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  hint: { fontSize: 14, color: colors.textTertiary, lineHeight: 21, paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  previewWrap: { marginHorizontal: spacing.screenPadding, height: 380, borderRadius: 16, backgroundColor: colors.surfacePlaceholder, overflow: 'hidden', position: 'relative' },
  figureLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'flex-end' },
  figure: { borderTopLeftRadius: 999, borderTopRightRadius: 999, backgroundColor: colors.placeholderFigure },
  guideBox: { position: 'absolute', left: 78, right: 78, top: 44, bottom: 52, borderWidth: 2, borderColor: colors.primary, borderRadius: 4 },
  guideLine: { position: 'absolute', left: 78, right: 78, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderTopColor: 'rgba(0,102,255,0.55)' },
  guideLabel: { position: 'absolute', left: 12, fontSize: 10.5, fontWeight: '700', color: colors.primary, backgroundColor: colors.surface, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  moveHandle: { position: 'absolute', right: 12, top: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(23,23,25,0.7)', alignItems: 'center', justifyContent: 'center' },
  moveHandleGlyph: { color: colors.inverseText, fontSize: 14 },
  controls: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, gap: 12 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sliderLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, width: 52 },
  sliderTrack: { flex: 1, height: 20, justifyContent: 'center' },
  sliderTrackLine: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: colors.borderSubtle },
  sliderFill: { position: 'absolute', left: 0, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  sliderKnob: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, marginLeft: -10 },
  autoButton: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  autoButtonText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
