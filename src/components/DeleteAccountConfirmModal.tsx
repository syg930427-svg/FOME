import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/tokens';

const CONFIRM_PHRASE = '탈퇴합니다';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  photoCount: number;
  creditBalance: number;
};

const KRW = new Intl.NumberFormat('ko-KR');

/**
 * 14-07 — 회원 탈퇴 확인. Irreversible, so the CTA only enables once both the
 * exact confirm phrase is typed AND the checkbox is checked (per handoff).
 */
export function DeleteAccountConfirmModal({ visible, onDismiss, onConfirm, photoCount, creditBalance }: Props) {
  const [phrase, setPhrase] = useState('');
  const [agreed, setAgreed] = useState(false);

  const phraseMatches = phrase === CONFIRM_PHRASE;
  const canConfirm = phraseMatches && agreed;

  function handleDismiss() {
    setPhrase('');
    setAgreed(false);
    onDismiss();
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setPhrase('');
    setAgreed(false);
    onConfirm();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconGlyph}>!</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>정말 탈퇴할까요?</Text>
            <Text style={styles.body}>
              사진 {photoCount}장과 크레딧 {KRW.format(creditBalance)}원이 즉시 삭제되고 복구할 수 없어요.
            </Text>
          </View>
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>
            확인을 위해 <Text style={styles.fieldLabelStrong}>{CONFIRM_PHRASE}</Text>를 입력해 주세요
          </Text>
          <View style={[styles.input, phraseMatches && styles.inputMatched]}>
            <TextInput
              value={phrase}
              onChangeText={setPhrase}
              placeholder={CONFIRM_PHRASE}
              placeholderTextColor={colors.textDisabledAlt}
              style={styles.inputText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {phraseMatches && (
              <View style={styles.inputCheck}>
                <Text style={styles.inputCheckGlyph}>✓</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkboxGlyph}>✓</Text>}
          </View>
          <Text style={styles.agreeText}>얼굴 정보와 사진이 즉시 삭제되며 복구할 수 없다는 점에 동의해요.</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.backButton} onPress={handleDismiss}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </Pressable>
          <Pressable style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]} onPress={handleConfirm} disabled={!canConfirm}>
            <Text style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}>탈퇴하기</Text>
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
    gap: 16,
  },
  grabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headerRow: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { color: colors.error, fontSize: 19, fontWeight: '700' },
  headerTextCol: { flex: 1, gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, lineHeight: 14 * 1.55, color: colors.textSecondaryAlt },
  fieldCol: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  fieldLabelStrong: { color: colors.error },
  input: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  inputMatched: { borderColor: colors.primary },
  inputText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  inputCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  inputCheckGlyph: { color: colors.inverseText, fontSize: 11 },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxGlyph: { color: colors.inverseText, fontSize: 11 },
  agreeText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  actions: { flexDirection: 'row', gap: 10 },
  backButton: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  confirmButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  confirmButtonDisabled: { backgroundColor: colors.surfaceSubtleAlt },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  confirmButtonTextDisabled: { color: colors.textDisabled },
});
