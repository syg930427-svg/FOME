import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

type Props = {
  /** "01", "02" ... — 이미 zero-padding된 문자열을 그대로 받는다. */
  index: string;
  title: string;
  description: string;
  /** index chip 색상만 분기 — CameraPrep은 primary(파랑), Album은 neutral(중립 회색). */
  tone: 'primary' | 'neutral';
};

/**
 * 핸드오프 "Rule card" — index chip(26×26) + title(16/700) + description(14/1.45).
 * CameraPrep(5개)·S06_Upload 사진 선택 기준(6개) 두 화면이 문구·개수만 다르고
 * 카드 구조는 동일해서 공유 컴포넌트로 둔다(핸드오프 Implementation Checklist
 * #4: "index chip 색상만 variant로 분기").
 */
export function PrepRuleCard({ index, title, description, tone }: Props) {
  const primary = tone === 'primary';
  return (
    <View style={styles.card}>
      <View style={[styles.chip, primary ? styles.chipPrimary : styles.chipNeutral]}>
        <Text style={[styles.chipText, primary ? styles.chipTextPrimary : styles.chipTextNeutral]}>{index}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: radius.cardList, borderWidth: 1, borderColor: colors.border },
  chip: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chipPrimary: { backgroundColor: colors.primaryTint },
  chipNeutral: { backgroundColor: colors.surfaceSubtleAlt },
  chipText: { fontSize: 13, fontWeight: '700' },
  chipTextPrimary: { color: colors.primary },
  chipTextNeutral: { color: colors.textPrimary },
  textCol: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  description: { fontSize: 14, lineHeight: 14 * 1.45, color: colors.textSecondaryAlt },
});
