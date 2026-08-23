import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  photoUri?: string | null;
  purposeLabel: string;
  onReplace: () => void;
  onUse: () => void;
};

/**
 * 05-02 — 사진 확대 (over SCREEN-07). Lets the user pinch-check their own
 * photo against the purpose's output frame before committing to it. No
 * PASS/FAIL judgement — "확인하면 좋은 것" guidance only (RULE-05).
 */
export function PhotoZoomModal({ visible, onClose, photoUri, purposeLabel, onReplace, onUse }: Props) {
  const [guideVisible, setGuideVisible] = useState(true);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>×</Text>
          </Pressable>
          <Text style={styles.title}>내가 선택한 사진</Text>
          <Pressable style={styles.togglePill} onPress={() => setGuideVisible((v) => !v)} hitSlop={6}>
            <Text style={styles.togglePillText}>가이드 겹쳐보기</Text>
          </Pressable>
        </View>

        <View style={styles.stage}>
          <View style={styles.frameWrap}>
            <View style={styles.frame}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderFigure} />
              )}
              {guideVisible && (
                <View style={styles.guideOverlay}>
                  <Text style={styles.guideBadge}>{purposeLabel} 프레임 기준</Text>
                </View>
              )}
            </View>
            <Text style={styles.zoomTag}>1.8×</Text>
          </View>
          <Text style={styles.caption}>두 손가락으로 확대 · 아래로 밀어서 닫기</Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>확인하면 좋은 것</Text>
          <Text style={styles.tipText}>눈·눈썹이 가려지지 않았는지, 얼굴에 강한 그림자가 없는지, 초점이 흐리지 않은지 확대해서 확인해 보세요.</Text>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.replaceButton} onPress={onReplace}>
            <Text style={styles.replaceButtonText}>사진 교체</Text>
          </Pressable>
          <Pressable style={styles.useButton} onPress={onUse}>
            <Text style={styles.useButtonText}>이 사진 사용</Text>
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
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  frameWrap: { position: 'relative' },
  frame: { width: 300, height: 410, borderRadius: 12, backgroundColor: '#33363B', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  placeholderFigure: { width: 186, height: 300, borderTopLeftRadius: 93, borderTopRightRadius: 93, backgroundColor: '#4C5057' },
  guideOverlay: { position: 'absolute', top: 34, left: 64, right: 64, bottom: 0, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)', borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  guideBadge: { position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: '700', color: colors.inverseText, backgroundColor: 'rgba(0,102,255,0.9)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden' },
  zoomTag: { position: 'absolute', top: 14, right: 0, fontSize: 11, fontWeight: '700', color: colors.inverseText, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 5, paddingHorizontal: 9, paddingVertical: 5, overflow: 'hidden' },
  caption: { fontSize: 12, color: 'rgba(255,255,255,0.62)' },
  tipBox: { marginHorizontal: 20, marginBottom: 16, padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', gap: 5 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: colors.inverseText },
  tipText: { fontSize: 13, lineHeight: 13 * 1.5, color: 'rgba(255,255,255,0.72)' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 28 },
  replaceButton: { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center' },
  replaceButtonText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  useButton: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.inverseText, alignItems: 'center', justifyContent: 'center' },
  useButtonText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
