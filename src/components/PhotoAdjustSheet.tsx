import React, { useState } from 'react';
import { LayoutChangeEvent, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PURPOSES } from '../api';
import { FRAMING_LOCKED_PURPOSES, FRAMING_OPTIONS } from '../api/mockData';
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

type Tab = 'range' | 'adjust';

const DEFAULT_VISIBLE: string[] = ['faceShoulders', 'faceNeck', 'upperChest', 'waistUp'];
const ROTATION_MIN = -15;
const ROTATION_MAX = 15;

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

/**
 * 사진 범위·위치 조정 Bottom Sheet — 구 SCREEN PhotoCrop(05-03) / FacePosition
 * (05-04) / FramingSelect(05-05)를 하나의 시트로 통합. "범위" 탭이 옛
 * FramingSelect의 목록을, "세부 조정" 탭이 옛 PhotoCrop의 회전 + FacePosition의
 * 크기·위치 슬라이더를 대체한다. 모든 값은 session.framing에 즉시 반영되고
 * 별도 "확정" 단계 없이 시트를 닫으면 그대로 적용된다 (05-15 개념 흡수).
 */
export function PhotoAdjustSheet({ visible, onDismiss, purposeId }: Props) {
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const framing = useSession((s) => s.framing);
  const setFraming = useSession((s) => s.setFraming);
  const [tab, setTab] = useState<Tab>('range');
  const [showAll, setShowAll] = useState(false);
  const [rotationTrackWidth, setRotationTrackWidth] = useState(280);
  const [sizeTrackWidth, setSizeTrackWidth] = useState(280);
  const [offsetTrackWidth, setOffsetTrackWidth] = useState(280);

  const isLocked = purposeId ? FRAMING_LOCKED_PURPOSES.has(purposeId) : false;
  const visibleOptions = FRAMING_OPTIONS.filter((opt) => {
    if (isLocked && (opt.id === 'waistUp' || opt.id === 'fullUpperBody')) return false;
    if (!showAll && !DEFAULT_VISIBLE.includes(opt.id)) return false;
    return true;
  }).sort((a, b) => (a.id === 'faceShoulders' ? -1 : b.id === 'faceShoulders' ? 1 : 0));
  const selected = FRAMING_OPTIONS.find((o) => o.id === framing.framingId) ?? FRAMING_OPTIONS[2];

  function handleTrack(x: number, width: number, onChange: (v: number) => void) {
    onChange(clamp(x / width));
  }

  function handleRotationTrack(x: number, width: number) {
    const ratio = clamp(x / width);
    setFraming({ rotationDeg: Math.round(ROTATION_MIN + ratio * (ROTATION_MAX - ROTATION_MIN)) });
  }

  function resetAdjust() {
    setFraming({ rotationDeg: 0, faceSize: 0.58, faceOffsetY: 0.44 });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>범위·위치 조정</Text>
          {purpose && (
            <View style={styles.policyBadge}>
              <Text style={styles.policyBadgeText}>{purpose.title.replace(' 사진', '')} 기준</Text>
            </View>
          )}
        </View>

        <FramingPreview
          height={170}
          topPct={selected.topPct}
          sidePct={selected.sidePct}
          faceScale={selected.faceScale}
          dashed={selected.dashed}
          badge={selected.title}
          tone="primary"
          style={styles.preview}
        />

        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === 'range' && styles.tabActive]} onPress={() => setTab('range')}>
            <Text style={[styles.tabText, tab === 'range' && styles.tabTextActive]}>범위</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === 'adjust' && styles.tabActive]} onPress={() => setTab('adjust')}>
            <Text style={[styles.tabText, tab === 'adjust' && styles.tabTextActive]}>세부 조정</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {tab === 'range' ? (
            <>
              {visibleOptions.map((opt) => {
                const active = framing.framingId === opt.id;
                const disabled = isLocked && opt.id !== 'faceShoulders';
                return (
                  <Pressable
                    key={opt.id}
                    style={[styles.row, active && styles.rowActive, disabled && styles.rowDisabled]}
                    disabled={disabled}
                    onPress={() => setFraming({ framingId: opt.id })}
                  >
                    <FramingPreview
                      height={44}
                      topPct={opt.topPct}
                      sidePct={opt.sidePct}
                      faceScale={opt.faceScale}
                      dashed={opt.dashed}
                      style={styles.rowThumb}
                    />
                    <View style={styles.rowTextCol}>
                      <Text style={styles.rowTitle}>{opt.title}</Text>
                      <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>{opt.subtitle}</Text>
                    </View>
                    {opt.id === 'faceShoulders' ? (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedBadgeText}>권장</Text>
                      </View>
                    ) : active ? (
                      <View style={styles.checkDot}>
                        <Text style={styles.checkDotGlyph}>✓</Text>
                      </View>
                    ) : (
                      <Text style={styles.chevron}>›</Text>
                    )}
                  </Pressable>
                );
              })}
              {!showAll && (
                <Pressable onPress={() => setShowAll(true)}>
                  <Text style={styles.showAllLink}>8가지 범위 모두 보기</Text>
                </Pressable>
              )}
              {isLocked && (
                <Text style={styles.lockNote}>
                  이 목적은 규격상 Face &amp; Shoulders로 고정돼요. 다른 범위는 규격을 벗어날 수 있어요.
                </Text>
              )}
            </>
          ) : (
            <>
              <SliderRow
                label="회전"
                value={(framing.rotationDeg - ROTATION_MIN) / (ROTATION_MAX - ROTATION_MIN)}
                valueLabel={`${framing.rotationDeg}°`}
                onLayout={(e) => setRotationTrackWidth(e.nativeEvent.layout.width)}
                onPress={(x) => handleRotationTrack(x, rotationTrackWidth)}
              />
              <SliderRow
                label="크기"
                value={framing.faceSize}
                valueLabel={`${Math.round(framing.faceSize * 100)}%`}
                onLayout={(e) => setSizeTrackWidth(e.nativeEvent.layout.width)}
                onPress={(x) => handleTrack(x, sizeTrackWidth, (v) => setFraming({ faceSize: v }))}
              />
              <SliderRow
                label="위·아래"
                value={framing.faceOffsetY}
                valueLabel={`${Math.round(framing.faceOffsetY * 100)}%`}
                onLayout={(e) => setOffsetTrackWidth(e.nativeEvent.layout.width)}
                onPress={(x) => handleTrack(x, offsetTrackWidth, (v) => setFraming({ faceOffsetY: v }))}
              />
              <Text style={styles.adjustHint}>얼굴 크기·위치·기울기만 조정돼요. 얼굴 형태나 생김새는 바뀌지 않아요.</Text>
              <Pressable style={styles.autoButton} onPress={resetAdjust}>
                <Text style={styles.autoButtonText}>자동으로 맞추기</Text>
              </Pressable>
            </>
          )}
        </ScrollView>

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
    maxHeight: '86%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  grabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  policyBadge: { backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  policyBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  preview: { width: '100%' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, height: 38, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.inverseBg },
  tabText: { fontSize: 13.5, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.inverseText, fontWeight: '700' },
  body: { maxHeight: 300 },
  bodyContent: { gap: 8, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  rowDisabled: { opacity: 0.4 },
  rowThumb: { width: 34 },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12.5, color: colors.infoText },
  recommendedBadge: { backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  recommendedBadgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  checkDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkDotGlyph: { color: colors.inverseText, fontSize: 11 },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  showAllLink: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.primary, paddingVertical: 6 },
  lockNote: { fontSize: 12, lineHeight: 12 * 1.5, color: colors.textDisabled, paddingTop: 4 },
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
