import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraGlyph, PhotoGlyph } from './EntryIcons';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onRetake: () => void;
  onReselect: () => void;
};

/**
 * 05-14 — 사진 교체 확인 시트. Destructive (drops crop/framing/face-position),
 * so it's gated behind a confirm sheet rather than acting immediately.
 * Purpose and options are unaffected and the copy says so explicitly.
 */
export function ReplacePhotoSheet({ visible, onDismiss, onRetake, onReselect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>사진을 교체할까요?</Text>
          <Text style={styles.body}>지금까지 조정한 범위와 얼굴 위치 설정이 사라져요. 선택한 목적과 옵션은 그대로 유지돼요.</Text>
        </View>
        <View style={styles.options}>
          <Pressable style={styles.optionRow} onPress={onRetake}>
            <View style={styles.optionIconWrap}>
              <CameraGlyph />
            </View>
            <Text style={styles.optionLabel}>다시 촬영하기</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable style={styles.optionRow} onPress={onReselect}>
            <View style={[styles.optionIconWrap, styles.optionIconWrapMuted]}>
              <PhotoGlyph color={colors.textTertiary} />
            </View>
            <Text style={styles.optionLabel}>앨범에서 다시 선택</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
        <Pressable style={styles.cancelButton} onPress={onDismiss}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </Pressable>
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
  body: { fontSize: 14, lineHeight: 14 * 1.55, color: colors.textSecondaryAlt },
  options: { gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  optionIconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  optionIconWrapMuted: { backgroundColor: colors.surfaceSubtleAlt },
  optionLabel: { flex: 1, fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  cancelButton: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
});
