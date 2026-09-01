import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Product, ProductId } from '../api/types';
import { colors } from '../theme/tokens';

const KRW = new Intl.NumberFormat('ko-KR');

export function formatSpecCount(specCount: Product['specCount']): string {
  return specCount === 'all' ? '전체' : `${specCount}개`;
}
export function formatRetouchLevel(level: Product['retouchLevel']): string {
  return level === 'premium' ? '고급' : '기본';
}
export function formatPrintSets(sets: Product['printSets']): string {
  return sets === 0 ? '없음' : `${sets}세트`;
}
export function formatAddonPrice(v: Product['addonRegenPrice']): string {
  return v === 'free' ? '무료' : `${KRW.format(v)}원`;
}
export function formatShippingFee(v: Product['shippingFee']): string {
  return v === 'free' ? '무료' : `${KRW.format(v)}원`;
}

type Props = {
  products: Product[];
  selectedId: ProductId | null;
  onSelect: (id: ProductId) => void;
  onCompare: () => void;
};

/**
 * S09(07-01) 상품 카드 — 기본 카드엔 핵심 6개 정보만 노출하고, 전체 10개 항목은
 * "5개 상품 비교하기"를 눌러야 보이는 별도 표(ProductCompareModal)로 분리한다
 * (PhotoFlow 최종 스펙 §8). "1장/4장/8장" 같은 수량 표현은 쓰지 않는다.
 */
export function ProductPicker({ products, selectedId, onSelect, onCompare }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>어떤 상품으로 만들까요?</Text>
        <Text style={styles.subtitle}>목적/규격 수와 무료 재생성 횟수는 상품마다 달라요.</Text>
      </View>

      <View style={styles.list}>
        {products.map((p) => {
          const active = p.id === selectedId;
          return (
            <Pressable key={p.id} style={[styles.row, active && styles.rowActive]} onPress={() => onSelect(p.id)}>
              <View style={[styles.radio, active && styles.radioActive]}>{active && <Text style={styles.radioGlyph}>✓</Text>}</View>
              <View style={styles.rowTextCol}>
                <View style={styles.rowTitleRow}>
                  <Text style={styles.rowTitle}>{p.name}</Text>
                  <Text style={styles.rowPrice}>{KRW.format(p.price)}원</Text>
                </View>
                <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>
                  목적/규격 {formatSpecCount(p.specCount)} · {formatRetouchLevel(p.retouchLevel)} 보정 · 무료 재생성 {p.freeRegenCount}회
                </Text>
                <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>
                  고화질 디지털 포함 · 인화 {formatPrintSets(p.printSets)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.compareLink} onPress={onCompare}>
        <Text style={styles.compareLinkText}>5개 상품 비교하기</Text>
        <Text style={styles.compareLinkChevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 22, gap: 16, backgroundColor: colors.surface },
  titleBlock: { gap: 4 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13.5, color: colors.textTertiary, lineHeight: 13.5 * 1.5 },
  list: { gap: 9 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, marginTop: 2 },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  radioGlyph: { color: colors.inverseText, fontSize: 11 },
  rowTextCol: { flex: 1, gap: 3 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  rowPrice: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12.5, color: colors.textTertiary, lineHeight: 12.5 * 1.4 },
  rowSubtitleActive: { fontSize: 12.5, color: colors.infoText, lineHeight: 12.5 * 1.4 },
  compareLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 4 },
  compareLinkText: { fontSize: 13.5, fontWeight: '700', color: colors.primary },
  compareLinkChevron: { fontSize: 15, color: colors.primary },
});
