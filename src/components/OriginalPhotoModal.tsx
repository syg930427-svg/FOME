import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PhotoOrder } from '../api';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  order: PhotoOrder | null;
  onDeleteNow: () => void;
  onRemake: () => void;
};

/** 13-04 — 원본 사진 보기. Sensitive data, so it opens alone in a dark viewer with its own deletion notice. */
export function OriginalPhotoModal({ visible, onClose, order, onDeleteNow, onRemake }: Props) {
  if (!order) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>×</Text>
          </Pressable>
          <Text style={styles.title}>원본 사진</Text>
        </View>

        <View style={styles.stage}>
          <View style={[styles.frame, { backgroundColor: order.tone === 'primary' ? '#2A3346' : '#33363B' }]}>
            <View style={[styles.figure, { backgroundColor: order.tone === 'primary' ? '#4C5C7E' : '#4C5057' }]} />
          </View>
          <Text style={styles.caption}>{order.createdFullLabel} 촬영 · 3024×4032</Text>
        </View>

        <View style={styles.footer}>
          {order.originalDeleteLabel ? (
            <View style={styles.warnBox}>
              <Text style={styles.warnTitle}>원본은 7일 뒤 자동 삭제돼요</Text>
              <Text style={styles.warnText}>{order.originalDeleteDetailLabel}. 그 뒤에는 이 사진으로 다시 만들 수 없어요.</Text>
            </View>
          ) : (
            <View style={styles.warnBox}>
              <Text style={styles.warnTitle}>원본이 이미 삭제됐어요</Text>
              <Text style={styles.warnText}>결과 파일만 남아있어요. 이 사진으로는 다시 만들 수 없어요.</Text>
            </View>
          )}
          <View style={styles.actions}>
            <Pressable style={styles.deleteButton} onPress={onDeleteNow} disabled={!order.originalDeleteLabel}>
              <Text style={[styles.deleteButtonText, !order.originalDeleteLabel && styles.deleteButtonTextDisabled]}>지금 삭제</Text>
            </Pressable>
            <Pressable style={styles.remakeButton} onPress={onRemake} disabled={!order.originalDeleteLabel}>
              <Text style={[styles.remakeButtonText, !order.originalDeleteLabel && styles.remakeButtonTextDisabled]}>
                이 원본으로 다시 만들기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E0E10' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginTop: 44 },
  close: { fontSize: 20, color: colors.inverseText },
  title: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  frame: { width: 296, height: 382, borderRadius: 12, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  figure: { width: '58%', height: '75%', borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  caption: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  footer: { paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  warnBox: { padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', gap: 7 },
  warnTitle: { fontSize: 13.5, fontWeight: '700', color: colors.inverseText },
  warnText: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: 'rgba(255,255,255,0.7)' },
  actions: { flexDirection: 'row', gap: 10 },
  deleteButton: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  deleteButtonTextDisabled: { color: 'rgba(255,255,255,0.35)' },
  remakeButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.inverseText, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  remakeButtonText: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  remakeButtonTextDisabled: { color: colors.textDisabled },
});
