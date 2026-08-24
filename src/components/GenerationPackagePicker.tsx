import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GENERATION_PACKAGES, MOCK_CREDIT_BALANCE } from '../api';
import { colors } from '../theme/tokens';

const KRW = new Intl.NumberFormat('ko-KR');

type Props = {
  selected: 1 | 4 | 8;
  onSelect: (count: 1 | 4 | 8) => void;
};

/** 07-03 — 생성 횟수·비용. Embedded in S09; the payable total also drives 07-04's CTA label. */
export function GenerationPackagePicker({ selected, onSelect }: Props) {
  const pkg = GENERATION_PACKAGES.find((p) => p.count === selected) ?? GENERATION_PACKAGES[1];
  const payable = Math.max(0, pkg.price - MOCK_CREDIT_BALANCE);

  return (
    <View style={styles.card}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>몇 장을 만들까요?</Text>
        <Text style={styles.subtitle}>여러 장을 만들면 마음에 드는 사진을 골라 쓸 수 있어요.</Text>
      </View>

      <View style={styles.list}>
        {GENERATION_PACKAGES.map((p) => {
          const active = p.count === selected;
          return (
            <Pressable
              key={p.count}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => onSelect(p.count)}
            >
              <View style={[styles.radio, active && styles.radioActive]}>{active && <Text style={styles.radioGlyph}>✓</Text>}</View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>{p.count}장</Text>
                <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>{p.description}</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.rowPrice}>{KRW.format(p.price)}원</Text>
                {p.originalPrice ? <Text style={styles.rowOriginalPrice}>{KRW.format(p.originalPrice)}원</Text> : null}
              </View>
              {p.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>추천</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>사진 {selected}장</Text>
          <Text style={styles.breakdownValue}>{KRW.format(pkg.price)}원</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>보유 크레딧</Text>
          <Text style={styles.breakdownValueAccent}>- {KRW.format(Math.min(MOCK_CREDIT_BALANCE, pkg.price))}원</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>결제 금액</Text>
          <Text style={styles.totalValue}>{KRW.format(payable)}원</Text>
        </View>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteGlyph}>i</Text>
        <Text style={styles.noteText}>생성이 실패하면 금액이 차감되지 않아요. 재생성은 1회 무료예요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 22,
    gap: 16,
    backgroundColor: colors.surface,
  },
  titleBlock: { gap: 4 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13.5, color: colors.textTertiary, lineHeight: 13.5 * 1.5 },
  list: { gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  radioGlyph: { color: colors.inverseText, fontSize: 11 },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12.5, color: colors.infoText },
  priceCol: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowOriginalPrice: { fontSize: 11.5, color: colors.textTertiary, textDecorationLine: 'line-through' },
  recommendedBadge: { position: 'absolute', top: -9, right: 14, backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  recommendedBadgeText: { fontSize: 10.5, fontWeight: '700', color: colors.inverseText },
  breakdown: { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 14, gap: 2 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  breakdownLabel: { flex: 1, fontSize: 13.5, color: colors.textSecondaryAlt },
  breakdownValue: { fontSize: 13.5, fontWeight: '600', color: colors.textPrimary },
  breakdownValueAccent: { fontSize: 13.5, fontWeight: '600', color: colors.primary },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  totalLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 19, fontWeight: '700', color: colors.textPrimary },
  noteBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  noteGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
});
