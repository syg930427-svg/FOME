import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  /** True when there's in-progress work that logging out would drop (05-14-style loss). */
  hasInProgressWork: boolean;
};

/**
 * 14-05 — 로그아웃. A sheet over 설정, not a screen: logging out doesn't
 * delete the account, so the CTA stays neutral (#171719), not error-red.
 */
export function LogoutSheet({ visible, onDismiss, onConfirm, hasInProgressWork }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.headerCol}>
          <Text style={styles.title}>로그아웃할까요?</Text>
          <Text style={styles.body}>계정을 지우는 게 아니라 이 기기에서만 나가요. 다시 로그인하면 사진이 그대로 있어요.</Text>
        </View>

        <View style={styles.rows}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>계정에 보관된 사진</Text>
            <Text style={styles.rowValue}>그대로 유지</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>크레딧</Text>
            <Text style={styles.rowValue}>그대로 유지</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>앨범에 저장한 사진</Text>
            <Text style={styles.rowValue}>영향 없음</Text>
          </View>
        </View>

        {hasInProgressWork && (
          <View style={styles.warnBox}>
            <Text style={styles.warnGlyph}>!</Text>
            <Text style={styles.warnText}>만들던 사진이 있으면 먼저 저장해 주세요. 로그아웃하면 진행 중 작업은 사라져요.</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onDismiss}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>로그아웃</Text>
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
  headerCol: { gap: 7 },
  title: { fontSize: 19, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, lineHeight: 14 * 1.55, color: colors.textSecondaryAlt },
  rows: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { flex: 1, fontSize: 13.5, color: colors.textSecondaryAlt },
  rowValue: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  warnBox: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 12, backgroundColor: colors.warningBg },
  warnGlyph: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  warnText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.warningStrong },
  actions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  confirmButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.inverseBg, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
});
