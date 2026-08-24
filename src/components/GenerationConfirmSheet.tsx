import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { colors } from '../theme/tokens';

const KRW = new Intl.NumberFormat('ko-KR');

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  submitting: boolean;
  count: 1 | 4 | 8;
  amount: number;
  purposeSpecLine: string;
  optionsSpecLine: string;
};

/** 07-04 — 생성 전 최종 확인. The only screen where payment happens for the generation attempt itself. */
export function GenerationConfirmSheet({
  visible,
  onDismiss,
  onConfirm,
  submitting,
  count,
  amount,
  purposeSpecLine,
  optionsSpecLine,
}: Props) {
  const [agreed, setAgreed] = useState(true);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={submitting ? undefined : onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerRow}>
          <PhotoPlaceholder width={58} height={74} radius={8} tone="primary" />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>사진 {count}장을 만들까요?</Text>
            <Text style={styles.headerBody}>약 40초 정도 걸려요. 앱을 닫아도 계속 만들어져요.</Text>
          </View>
        </View>

        <View style={styles.specBox}>
          <View style={[styles.specRow, styles.specRowDivider]}>
            <Text style={styles.specLabel}>목적</Text>
            <Text style={styles.specValue}>{purposeSpecLine}</Text>
          </View>
          <View style={[styles.specRow, styles.specRowDivider]}>
            <Text style={styles.specLabel}>옵션</Text>
            <Text style={styles.specValue}>{optionsSpecLine}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>결제</Text>
            <Text style={styles.specValue}>{amount > 0 ? `${KRW.format(amount)}원` : '크레딧으로 결제'}</Text>
          </View>
        </View>

        <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>{agreed && <Text style={styles.checkGlyph}>✓</Text>}</View>
          <Text style={styles.agreeText}>
            사진은 제작 목적으로만 사용되고 완료 후 30일 뒤 자동 삭제돼요. <Text style={styles.agreeLink}>약관 보기</Text>
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onDismiss} disabled={submitting}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmButton, (!agreed || submitting) && styles.confirmButtonDisabled]}
            disabled={!agreed || submitting}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {submitting ? '처리 중…' : amount > 0 ? `${KRW.format(amount)}원 결제하고 만들기` : '크레딧으로 만들기'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 16,
  },
  grabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headerRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  headerTextCol: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerBody: { fontSize: 13.5, lineHeight: 13.5 * 1.5, color: colors.textSecondaryAlt },
  specBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  specRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  specRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  specLabel: { fontSize: 13, color: colors.textTertiary, width: 78 },
  specValue: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  agreeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 13, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkGlyph: { color: colors.inverseText, fontSize: 11 },
  agreeText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  agreeLink: { fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', gap: 10 },
  cancelButton: { width: 100, height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  confirmButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  confirmButtonDisabled: { backgroundColor: colors.surfaceSubtleAlt },
  confirmButtonText: { fontSize: 17, fontWeight: '700', color: colors.inverseText },
});
