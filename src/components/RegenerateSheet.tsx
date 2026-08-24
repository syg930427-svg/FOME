import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

export type RegenerateChoice = 'same' | 'differentPhoto' | 'changeOptions';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (choice: RegenerateChoice) => void;
  freeRetryAvailable: boolean;
};

/** 08-05 — 생성 재시도. "같은 사진" is free once per attempt; other two hand off to earlier screens. */
export function RegenerateSheet({ visible, onDismiss, onConfirm, freeRetryAvailable }: Props) {
  const [choice, setChoice] = useState<RegenerateChoice>(freeRetryAvailable ? 'same' : 'differentPhoto');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>어떻게 다시 만들까요?</Text>
          <Text style={styles.body}>재시도는 1회 무료예요. 옵션은 그대로 유지돼요.</Text>
        </View>

        <View style={styles.options}>
          <Pressable
            style={[styles.row, choice === 'same' && styles.rowActive, !freeRetryAvailable && styles.rowDisabled]}
            disabled={!freeRetryAvailable}
            onPress={() => setChoice('same')}
          >
            <View style={[styles.iconWrap, choice === 'same' && styles.iconWrapActive]}>
              <Text style={[styles.iconGlyph, choice === 'same' && styles.iconGlyphActive]}>↻</Text>
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>같은 사진으로 재시도</Text>
              <Text style={choice === 'same' ? styles.rowSubtitleActive : styles.rowSubtitle}>
                {freeRetryAvailable ? '무료 · 1회 남음' : '무료 재시도 소진'}
              </Text>
            </View>
            {choice === 'same' && (
              <View style={styles.checkDot}>
                <Text style={styles.checkDotGlyph}>✓</Text>
              </View>
            )}
          </Pressable>

          <Pressable style={[styles.row, choice === 'differentPhoto' && styles.rowActive]} onPress={() => setChoice('differentPhoto')}>
            <View style={styles.iconWrap}>
              <View style={styles.photoIconShape} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>다른 사진으로 다시</Text>
              <Text style={styles.rowSubtitle}>촬영 또는 앨범에서 선택</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable style={[styles.row, choice === 'changeOptions' && styles.rowActive]} onPress={() => setChoice('changeOptions')}>
            <View style={styles.iconWrap}>
              <Text style={styles.iconGlyph}>⚙</Text>
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>옵션 바꿔서 다시</Text>
              <Text style={styles.rowSubtitle}>배경·보정 강도 조정</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onDismiss}>
            <Text style={styles.cancelButtonText}>닫기</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={() => onConfirm(choice)}>
            <Text style={styles.confirmButtonText}>{choice === 'same' ? '무료로 재시도' : '계속하기'}</Text>
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
  textBlock: { gap: 6 },
  title: { fontSize: 19, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.textSecondaryAlt },
  options: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  rowDisabled: { opacity: 0.45 },
  iconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.primaryTintStrong },
  iconGlyph: { fontSize: 15, color: colors.textTertiary },
  iconGlyphActive: { color: colors.primary },
  photoIconShape: { width: 16, height: 12, borderRadius: 2, borderWidth: 2, borderColor: colors.textTertiary },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12.5, color: colors.infoText },
  checkDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkDotGlyph: { color: colors.inverseText, fontSize: 11 },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  actions: { flexDirection: 'row', gap: 10 },
  cancelButton: { width: 100, height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  confirmButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontSize: 17, fontWeight: '700', color: colors.inverseText },
});
