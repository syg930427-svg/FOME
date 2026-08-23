import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

const DETAIL_LABELS = ['머리', '눈·눈썹', '입·표정', '어깨'];

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  badge: string;
};

/**
 * 03-04 — 샘플 이미지 확대. Full-screen modal with head-alignment guide lines
 * (머리 정점 / 눈높이 / 턱선) that can be hidden, and a detail-crop thumbnail
 * strip. Pinch-zoom and swipe-down-to-close are noted in the design but not
 * implemented here — this ships tap-to-close and the toggle/thumbnail
 * interactions, which cover the actual content the modal exists to show.
 */
export function ImageZoomModal({ visible, onClose, title, badge }: Props) {
  const [guidesVisible, setGuidesVisible] = useState(true);
  const [detailIndex, setDetailIndex] = useState(0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>×</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.togglePill} onPress={() => setGuidesVisible((v) => !v)} hitSlop={6}>
            <Text style={styles.togglePillText}>{guidesVisible ? '기준 숨기기' : '기준 보기'}</Text>
          </Pressable>
        </View>

        <View style={styles.stage}>
          <View style={styles.frame}>
            <View style={styles.figure} />
            {guidesVisible && (
              <>
                <View style={[styles.guideLine, { top: 56 }]} />
                <Text style={[styles.guideLabel, { top: 40 }]}>머리 정점</Text>
                <View style={[styles.guideLine, { top: 186 }]} />
                <Text style={[styles.guideLabel, { top: 170 }]}>눈높이</Text>
                <View style={[styles.guideLine, { bottom: 44 }]} />
                <Text style={[styles.guideLabel, { bottom: 50 }]}>턱선</Text>
              </>
            )}
          </View>
          <Text style={styles.badge}>{badge}</Text>
          <Text style={styles.caption}>두 손가락으로 확대 · 아래로 밀어서 닫기</Text>
        </View>

        <View style={styles.thumbRow}>
          {DETAIL_LABELS.map((label, i) => (
            <Pressable
              key={label}
              style={[styles.thumb, i === detailIndex && styles.thumbSelected]}
              onPress={() => setDetailIndex(i)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>머리 · 눈높이 · 턱선</Text>
            <Text style={styles.noteText}>머리 정점과 턱선이 프레임 안에 모두 들어오고, 눈높이가 세로 중앙보다 약간 위에 오도록 촬영해요.</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
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
  togglePill: { marginLeft: 'auto', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)' },
  togglePillText: { fontSize: 12, fontWeight: '600', color: colors.inverseText },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 290, height: 400, borderRadius: 12, backgroundColor: '#3A3D42', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  figure: { width: 170, height: 280, borderTopLeftRadius: 85, borderTopRightRadius: 85, backgroundColor: '#54585F' },
  guideLine: { position: 'absolute', left: 52, right: 52, borderTopWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.6)', borderStyle: 'dashed' },
  guideLabel: { position: 'absolute', right: 18, fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.82)' },
  badge: {
    position: 'absolute',
    top: 14,
    left: 20,
    fontSize: 11,
    fontWeight: '700',
    color: colors.inverseText,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  caption: { position: 'absolute', bottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.62)' },
  thumbRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  thumb: { flex: 1, height: 82, borderRadius: 9, backgroundColor: '#2A2C30' },
  thumbSelected: { backgroundColor: '#3A3D42', borderWidth: 2, borderColor: colors.inverseText },
  footer: { paddingHorizontal: 20, paddingBottom: 28, gap: 10 },
  noteBox: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', gap: 5 },
  noteTitle: { fontSize: 13, fontWeight: '700', color: colors.inverseText },
  noteText: { fontSize: 13, lineHeight: 13 * 1.5, color: 'rgba(255,255,255,0.72)' },
  closeButton: { height: 54, borderRadius: 14, backgroundColor: colors.inverseText, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
});
