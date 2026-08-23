import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { FRAMING_LOCKED_PURPOSES, FRAMING_OPTIONS } from '../api/mockData';
import { FramingPreview, PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'FramingSelect'>;

const DEFAULT_VISIBLE: string[] = ['faceShoulders', 'faceNeck', 'upperChest', 'waistUp'];

/** 05-05 (+ 05-06~05-13 state list) — 상체 범위 선택. Locked purposes hide out-of-spec ranges and pin the recommended one. */
export default function FramingSelect({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const framing = useSession((s) => s.framing);
  const setFraming = useSession((s) => s.setFraming);
  const [showAll, setShowAll] = useState(false);

  const isLocked = purposeId ? FRAMING_LOCKED_PURPOSES.has(purposeId) : false;
  const visibleOptions = FRAMING_OPTIONS.filter((opt) => {
    if (isLocked && (opt.id === 'waistUp' || opt.id === 'fullUpperBody')) return false;
    if (!showAll && !DEFAULT_VISIBLE.includes(opt.id)) return false;
    return true;
  }).sort((a, b) => (a.id === 'faceShoulders' ? -1 : b.id === 'faceShoulders' ? 1 : 0));

  const selected = FRAMING_OPTIONS.find((o) => o.id === framing.framingId) ?? FRAMING_OPTIONS[2];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="상체 범위"
        onBack={navigation.goBack}
        right={
          purpose ? (
            <View style={styles.policyBadge}>
              <Text style={styles.policyBadgeText}>{purpose.title.replace(' 사진', '')} 권장</Text>
            </View>
          ) : undefined
        }
      />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>어디까지 보이게 할까요?</Text>
        <Text style={styles.subtitle}>목적에 따라 권장 범위가 달라요. 미리보기로 확인하고 고르세요.</Text>
      </View>

      <View style={styles.previewSection}>
        <FramingPreview
          height={250}
          topPct={selected.topPct}
          sidePct={selected.sidePct}
          faceScale={selected.faceScale}
          dashed={selected.dashed}
          badge={selected.title}
          tone={selected.id === 'faceShoulders' ? 'primary' : 'neutral'}
          style={styles.previewFrame}
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
              <FramingPreview height={44} topPct={opt.topPct} sidePct={opt.sidePct} faceScale={opt.faceScale} dashed={opt.dashed} style={styles.rowThumb} />
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
          <Text style={styles.lockNote}>이 목적은 규격상 Face &amp; Shoulders로 고정돼요. 다른 범위는 규격을 벗어날 수 있어요.</Text>
        )}
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="이 범위로 진행" onPress={() => navigation.navigate('PhotoConfirmFinal')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  policyBadge: { backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  policyBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  titleBlock: { paddingHorizontal: spacing.screenPadding, paddingBottom: 16, gap: 5 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.32, letterSpacing: -0.4, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  previewSection: { paddingHorizontal: spacing.screenPadding, paddingBottom: 16 },
  previewFrame: { width: '100%' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.screenPadding, gap: 8, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  rowDisabled: { opacity: 0.4 },
  rowThumb: { width: 34 },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12.5, color: colors.infoText },
  recommendedBadge: { backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  recommendedBadgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  checkDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkDotGlyph: { color: colors.inverseText, fontSize: 11 },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  showAllLink: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.primary, paddingVertical: 6 },
  lockNote: { fontSize: 12, lineHeight: 12 * 1.5, color: colors.textDisabled, paddingTop: 4 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 28 },
});
