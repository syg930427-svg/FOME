import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { POLICY_AI_DOES_NOT, POLICY_DETAILS } from '../api';
import { PurposeId } from '../api/types';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  purposeId: PurposeId | null;
  purposeShort: string;
};

/** 07-02 — 적용 정책 상세. Read-only reference, opened from S09; doesn't gate anything. */
export function PolicyDetailModal({ visible, onClose, purposeId, purposeShort }: Props) {
  const detail = purposeId ? POLICY_DETAILS[purposeId] : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>×</Text>
          </Pressable>
          <Text style={styles.title}>적용된 기준</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{purposeShort} · KR</Text>
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.introBlock}>
            <Text style={styles.introTitle}>이 사진에 적용되는 기준</Text>
            {detail ? <Text style={styles.introSubtitle}>{detail.subtitle}</Text> : null}
          </View>

          {detail ? (
            <View style={styles.specBox}>
              {detail.rows.map((row, i) => (
                <View key={row.label} style={[styles.specRow, i < detail.rows.length - 1 && styles.specRowDivider]}>
                  <Text style={styles.specLabel}>{row.label}</Text>
                  <Text style={styles.specValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.notBox}>
            <Text style={styles.notTitle}>AI가 하지 않는 것</Text>
            {POLICY_AI_DOES_NOT.map((line) => (
              <View key={line} style={styles.notRow}>
                <Text style={styles.notDash}>–</Text>
                <Text style={styles.notText}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningGlyph}>!</Text>
            <Text style={styles.warningText}>
              최종 접수 여부는 제출 기관이 판단해요. 이 앱은 규격에 맞게 제작을 돕지만 접수 승인을 보장하지 않아요.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.sourceLink}>규격 원문 보기</Text>
          <Pressable style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>확인했어요</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginTop: 44 },
  close: { fontSize: 20, color: colors.textPrimary },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  badge: { marginLeft: 'auto', backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 4, gap: 14, paddingBottom: 24 },
  introBlock: { gap: 5 },
  introTitle: { fontSize: 21, fontWeight: '700', lineHeight: 21 * 1.35, letterSpacing: -0.3, color: colors.textPrimary },
  introSubtitle: { fontSize: 13.5, color: colors.textTertiary, lineHeight: 13.5 * 1.55 },
  specBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  specRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  specRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  specLabel: { fontSize: 13, color: colors.textTertiary, width: 104 },
  specValue: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  notBox: { padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 9 },
  notTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  notRow: { flexDirection: 'row', gap: 8 },
  notDash: { color: colors.textTertiary, fontWeight: '700', fontSize: 13.5 },
  notText: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.textSecondary },
  warningBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.warningBg },
  warningGlyph: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 13 * 1.5, color: colors.warningStrong },
  footer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, gap: 10 },
  sourceLink: { textAlign: 'center', fontSize: 13.5, fontWeight: '600', color: colors.primary },
  confirmButton: { height: 54, borderRadius: 14, backgroundColor: colors.inverseBg, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontSize: 17, fontWeight: '700', color: colors.inverseText },
});
