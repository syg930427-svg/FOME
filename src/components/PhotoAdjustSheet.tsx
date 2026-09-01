import React, { useState } from 'react';
import { LayoutChangeEvent, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PURPOSES } from '../api';
import { COMPOSITION_OPTIONS } from '../api/mockData';
import { PurposeId } from '../api/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';
import { FramingPreview } from './FramingPreview';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  purposeId: PurposeId | null;
};

const ROTATION_MIN = -15;
const ROTATION_MAX = 15;

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

/**
 * 05-02 — 원본 사진 "기술적 조정" 전용 Bottom Sheet. 회전/얼굴 크기·위치만
 * 다루고, AI가 최종 사진을 만들 때 참고하는 "구도"(상체 범위) 선택은 여기
 * 없다 — 그건 S08의 `options.composition`이 전담한다(PhotoFlow 최종 스펙
 * §6). 이 화면은 `session.sourceCrop`만 읽고 쓰며, `options.composition`은
 * 미리보기 박스 모양을 보여주기 위해 읽기 전용으로만 참조한다.
 */
export function PhotoAdjustSheet({ visible, onDismiss, purposeId }: Props) {
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const sourceCrop = useSession((s) => s.sourceCrop);
  const setSourceCrop = useSession((s) => s.setSourceCrop);
  const composition = useSession((s) => s.options.composition);
  const [rotationTrackWidth, setRotationTrackWidth] = useState(280);
  const [sizeTrackWidth, setSizeTrackWidth] = useState(280);
  const [offsetTrackWidth, setOffsetTrackWidth] = useState(280);

  // 미리보기 박스 모양만 참고 — composition 값 자체는 이 화면에서 절대 바꾸지 않는다.
  const previewShape = COMPOSITION_OPTIONS.find((o) => o.id === composition) ?? COMPOSITION_OPTIONS[1];

  function handleTrack(x: number, width: number, onChange: (v: number) => void) {
    onChange(clamp(x / width));
  }

  function handleRotationTrack(x: number, width: number) {
    const ratio = clamp(x / width);
    setSourceCrop({ rotationDeg: Math.round(ROTATION_MIN + ratio * (ROTATION_MAX - ROTATION_MIN)) });
  }

  function resetAdjust() {
    setSourceCrop({ rotationDeg: 0, faceSize: 0.58, faceOffsetY: 0.44 });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>사진 조정</Text>
          {purpose && (
            <View style={styles.policyBadge}>
              <Text style={styles.policyBadgeText}>{purpose.title.replace(' 사진', '')} 기준</Text>
            </View>
          )}
        </View>

        <FramingPreview
          height={170}
          topPct={previewShape.topPct}
          sidePct={previewShape.sidePct}
          faceScale={previewShape.faceScale}
          badge={previewShape.title}
          tone="primary"
          style={styles.preview}
        />

        <View style={styles.body}>
          <SliderRow
            label="회전"
            value={(sourceCrop.rotationDeg - ROTATION_MIN) / (ROTATION_MAX - ROTATION_MIN)}
            valueLabel={`${sourceCrop.rotationDeg}°`}
            onLayout={(e) => setRotationTrackWidth(e.nativeEvent.layout.width)}
            onPress={(x) => handleRotationTrack(x, rotationTrackWidth)}
          />
          <SliderRow
            label="크기"
            value={sourceCrop.faceSize}
            valueLabel={`${Math.round(sourceCrop.faceSize * 100)}%`}
            onLayout={(e) => setSizeTrackWidth(e.nativeEvent.layout.width)}
            onPress={(x) => handleTrack(x, sizeTrackWidth, (v) => setSourceCrop({ faceSize: v }))}
          />
          <SliderRow
            label="위·아래"
            value={sourceCrop.faceOffsetY}
            valueLabel={`${Math.round(sourceCrop.faceOffsetY * 100)}%`}
            onLayout={(e) => setOffsetTrackWidth(e.nativeEvent.layout.width)}
            onPress={(x) => handleTrack(x, offsetTrackWidth, (v) => setSourceCrop({ faceOffsetY: v }))}
          />
          <Text style={styles.adjustHint}>얼굴 크기·위치·기울기만 조정돼요. 어떤 구도로 만들지는 AI 옵션에서 골라요.</Text>
          <Pressable style={styles.autoButton} onPress={resetAdjust}>
            <Text style={styles.autoButtonText}>자동으로 맞추기</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="적용" onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

function SliderRow({
  label,
  value,
  valueLabel,
  onLayout,
  onPress,
}: {
  label: string;
  value: number;
  valueLabel: string;
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
      <Text style={styles.sliderValue}>{valueLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(23,23,25,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  grabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  policyBadge: { backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  policyBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  preview: { width: '100%' },
  body: { gap: 12 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sliderLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, width: 46 },
  sliderTrack: { flex: 1, height: 20, justifyContent: 'center' },
  sliderTrackLine: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: colors.borderSubtle },
  sliderFill: { position: 'absolute', left: 0, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  sliderKnob: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, marginLeft: -10 },
  sliderValue: { fontSize: 12, color: colors.textTertiary, width: 34, textAlign: 'right' },
  adjustHint: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textTertiary, paddingTop: 2 },
  autoButton: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  autoButtonText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  actions: { paddingTop: 4 },
});
