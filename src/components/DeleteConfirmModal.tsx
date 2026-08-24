import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DeleteScope } from '../state/myPhotos';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (scope: DeleteScope) => void;
  resultCount: number;
  hasPrintSheet?: boolean;
};

/** 13-06 — 사진 삭제 확인. Destructive and irreversible; lets the user scope it to "original only". */
export function DeleteConfirmModal({ visible, onDismiss, onConfirm, resultCount, hasPrintSheet }: Props) {
  const [scope, setScope] = useState<DeleteScope>('both');

  const bothSummary = hasPrintSheet
    ? `원본 1장 + 결과 ${resultCount}장 + 인화용 시트`
    : `원본 1장 + 결과 ${resultCount}장`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconGlyph}>!</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>삭제하면 되돌릴 수 없어요</Text>
            <Text style={styles.body}>이미 앨범에 저장한 사진은 그대로 남지만, 앱에서는 다시 받을 수 없어요.</Text>
          </View>
        </View>

        <View style={styles.options}>
          <Pressable style={[styles.option, scope === 'both' && styles.optionActiveBoth]} onPress={() => setScope('both')}>
            <View style={[styles.radio, scope === 'both' && styles.radioActiveBoth]}>
              {scope === 'both' && <Text style={styles.radioGlyph}>✓</Text>}
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>원본과 결과 모두 삭제</Text>
              <Text style={scope === 'both' ? styles.optionSubtitleActive : styles.optionSubtitle}>{bothSummary}</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.option, scope === 'originalOnly' && styles.optionActive]} onPress={() => setScope('originalOnly')}>
            <View style={[styles.radio, scope === 'originalOnly' && styles.radioActive]}>
              {scope === 'originalOnly' && <Text style={styles.radioGlyph}>✓</Text>}
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>원본만 삭제</Text>
              <Text style={styles.optionSubtitle}>결과 {resultCount}장은 남겨두기</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteGlyph}>i</Text>
          <Text style={styles.noteText}>결제 내역과 영수증은 법령에 따라 별도로 보관돼요.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onDismiss}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => onConfirm(scope)}>
            <Text style={styles.deleteButtonText}>영구 삭제</Text>
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
    paddingTop: 24,
    paddingBottom: 28,
    gap: 18,
  },
  grabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headerRow: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { color: colors.error, fontSize: 19, fontWeight: '700' },
  headerTextCol: { flex: 1, gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, lineHeight: 14 * 1.55, color: colors.textSecondaryAlt },
  options: { gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  optionActive: { borderWidth: 1.5, borderColor: colors.borderStrong },
  optionActiveBoth: { borderWidth: 2, borderColor: colors.error, backgroundColor: '#FDF7F7' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.textSecondary },
  radioActiveBoth: { backgroundColor: colors.error, borderColor: colors.error },
  radioGlyph: { color: colors.inverseText, fontSize: 11 },
  optionTextCol: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  optionSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  optionSubtitleActive: { fontSize: 12.5, color: '#A33' },
  noteBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  noteGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  actions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  deleteButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
});
