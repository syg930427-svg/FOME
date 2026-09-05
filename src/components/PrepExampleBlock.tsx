import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

type Props = {
  tone: 'good' | 'bad';
  label: string;
  caption: string;
  /** 3열 grid에 들어갈 셀 3개 — 셀 배경·실루엣 모양(회전/2인 등)이 화면마다 달라 각 화면이 직접 채운다. */
  children: React.ReactNode;
};

/**
 * 핸드오프 "Good/Bad examples block" 겉틀 — 라벨 + 3열 grid + 캡션. 셀 내부
 * (배경색·실루엣 크기·회전 등)는 CameraPrep·S06_Upload 두 화면에서 서로 달라
 * `children`으로 각 화면이 직접 그린다(변형이 큰 부분까지 억지로 데이터화하지
 * 않고, 반복되는 겉틀·라벨·캡션 스타일만 공유 — 핸드오프 Implementation
 * Checklist #5: "variant: 'good' | 'bad' 단일 컴포넌트").
 */
export function PrepExampleBlock({ tone, label, caption, children }: Props) {
  const good = tone === 'good';
  return (
    <View style={[styles.block, good ? styles.goodBlock : styles.badBlock]}>
      <Text style={[styles.label, good ? styles.goodLabel : styles.badLabel]}>{label}</Text>
      <View style={styles.grid}>{children}</View>
      <Text style={[styles.caption, good ? styles.goodCaption : styles.badCaption]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { padding: 15, borderRadius: radius.cardLarge, borderWidth: 1, gap: 11 },
  goodBlock: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  badBlock: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },
  label: { fontSize: 14, fontWeight: '700' },
  goodLabel: { color: colors.successStrong },
  badLabel: { color: colors.errorStrong },
  grid: { flexDirection: 'row', gap: 8 },
  caption: { fontSize: 13, lineHeight: 13 * 1.55 },
  goodCaption: { color: colors.successText },
  badCaption: { color: colors.errorStrongAlt },
});
