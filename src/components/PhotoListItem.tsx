import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PhotoOrder } from '../api';
import { colors } from '../theme/tokens';

type Props = {
  order: PhotoOrder;
  editMode?: boolean;
  selected?: boolean;
  onPress: () => void;
};

/** 13-02 — PhotoListItem. DEFAULT / EDIT MODE (checkbox) states; swipe-to-delete isn't implemented (see README). */
export function PhotoListItem({ order, editMode, selected, onPress }: Props) {
  const metaColor = order.status === 'unpaid' ? styles.metaWarning : styles.metaMuted;

  return (
    <Pressable
      style={[styles.row, editMode && styles.rowEditMode, editMode && selected && styles.rowSelected]}
      onPress={onPress}
    >
      {editMode && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkboxGlyph}>✓</Text>}
        </View>
      )}

      <View style={[styles.thumb, editMode && styles.thumbSmall, { backgroundColor: order.tone === 'primary' ? '#DDE9FB' : colors.surfacePlaceholderAlt }]}>
        <View style={[styles.thumbFigure, { backgroundColor: order.tone === 'primary' ? '#B8CFF0' : colors.placeholderFigure }]} />
        {order.watermarked && <Text style={styles.sampleWatermark}>SAMPLE</Text>}
      </View>

      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{order.title}</Text>
          {order.status === 'purchased' && (
            <View style={styles.badgePurchased}>
              <Text style={styles.badgePurchasedText}>구매 완료</Text>
            </View>
          )}
          {order.status === 'unpaid' && (
            <View style={styles.badgeUnpaid}>
              <Text style={styles.badgeUnpaidText}>미결제</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>
          {order.createdLabel} · 결과 {order.resultCount}장{order.productShort ? ` · ${order.productShort}` : ''}
        </Text>
        {!editMode && <Text style={[styles.meta, metaColor]}>{order.metaLabel}</Text>}
      </View>

      {!editMode && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 13, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  rowEditMode: { gap: 11 },
  rowSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxGlyph: { color: colors.inverseText, fontSize: 12 },
  thumb: { width: 66, height: 86, borderRadius: 9, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  thumbSmall: { width: 56, height: 74 },
  thumbFigure: { width: '58%', height: '70%', borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  sampleWatermark: {
    position: 'absolute',
    top: '46%',
    left: '50%',
    marginLeft: -24,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(23,23,25,0.24)',
    transform: [{ rotate: '-24deg' }],
  },
  textCol: { flex: 1, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  badgePurchased: { backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: '#DDE9FB', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgePurchasedText: { fontSize: 10.5, fontWeight: '700', color: colors.primary },
  badgeUnpaid: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#F5E3C4', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeUnpaidText: { fontSize: 10.5, fontWeight: '700', color: colors.warningStrong },
  meta: { fontSize: 12.5, color: colors.textTertiary },
  metaMuted: { color: colors.textTertiary },
  metaWarning: { fontSize: 12, color: colors.warning },
  chevron: { fontSize: 18, color: colors.textDisabledAlt, alignSelf: 'center' },
});
