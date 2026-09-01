import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Product, ProductId } from '../api/types';
import { colors } from '../theme/tokens';
import { formatAddonPrice, formatPrintSets, formatRetouchLevel, formatShippingFee, formatSpecCount } from './ProductPicker';

const KRW = new Intl.NumberFormat('ko-KR');

type Props = {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  selectedId: ProductId | null;
  onSelect: (id: ProductId) => void;
};

const COLUMN_WIDTH = 118;
const LABEL_WIDTH = 92;

type Row = { label: string; value: (p: Product) => string };

const ROWS: Row[] = [
  { label: '가격', value: (p) => `${KRW.format(p.price)}원` },
  { label: '목적/규격 수', value: (p) => formatSpecCount(p.specCount) },
  { label: 'AI 보정', value: (p) => formatRetouchLevel(p.retouchLevel) },
  { label: '무료 재생성', value: (p) => `${p.freeRegenCount}회` },
  { label: '고화질 디지털', value: () => '포함' },
  { label: '인화 세트', value: (p) => formatPrintSets(p.printSets) },
  { label: '추가 재생성', value: (p) => formatAddonPrice(p.addonRegenPrice) },
  { label: '추가 인화', value: (p) => formatAddonPrice(p.addonPrintPrice) },
  { label: '배송비', value: (p) => formatShippingFee(p.shippingFee) },
  { label: '보관 기간', value: (p) => `${p.retentionDays}일` },
];

/** 5개 상품 비교 — PhotoFlow 최종 스펙 §8의 10개 항목 전부. ProductPicker의 기본 카드와 분리된 상세 표. */
export function ProductCompareModal({ visible, onClose, products, selectedId, onSelect }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>×</Text>
          </Pressable>
          <Text style={styles.title}>상품 비교</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.tableWrap}>
          <View>
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelCell]} />
              {products.map((p) => {
                const active = p.id === selectedId;
                return (
                  <Pressable key={p.id} style={[styles.cell, styles.headCell, active && styles.headCellActive]} onPress={() => onSelect(p.id)}>
                    <Text style={[styles.headCellName, active && styles.headCellNameActive]}>{p.name}</Text>
                    {active && <Text style={styles.headCellCheck}>선택됨</Text>}
                  </Pressable>
                );
              })}
            </View>

            {ROWS.map((row, i) => (
              <View key={row.label} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                <View style={[styles.cell, styles.labelCell]}>
                  <Text style={styles.labelText}>{row.label}</Text>
                </View>
                {products.map((p) => (
                  <View key={p.id} style={[styles.cell, p.id === selectedId && styles.cellActiveCol]}>
                    <Text style={styles.valueText}>{row.value(p)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface, paddingTop: 44 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  close: { fontSize: 20, color: colors.textPrimary },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  tableWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  row: { flexDirection: 'row' },
  rowAlt: { backgroundColor: colors.surfaceSubtle },
  cell: { width: COLUMN_WIDTH, paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, justifyContent: 'center' },
  labelCell: { width: LABEL_WIDTH },
  labelText: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  valueText: { fontSize: 13, color: colors.textPrimary, textAlign: 'center' },
  cellActiveCol: { backgroundColor: colors.primaryTint },
  headCell: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.border, gap: 3 },
  headCellActive: { backgroundColor: colors.primaryTint, borderBottomColor: colors.primary },
  headCellName: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  headCellNameActive: { color: colors.primary },
  headCellCheck: { fontSize: 10.5, fontWeight: '700', color: colors.primary },
  footer: { padding: 20, paddingBottom: 28 },
  confirmButton: { height: 54, borderRadius: 14, backgroundColor: colors.inverseBg, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontSize: 17, fontWeight: '700', color: colors.inverseText },
});
