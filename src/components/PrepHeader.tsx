import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  /** Header block background — CameraPrep는 colors.primary, Album 가이드는 colors.inverseBg. */
  bg: string;
  /** Nav row 타이틀(예: "촬영 준비"). */
  title: string;
  /** 우측 배지 텍스트(예: "CAMERA"/"ALBUM"). */
  badge: string;
  /** H2 — `\n`으로 줄바꿈 지정. */
  heading: string;
  subtitle: string;
  /** 서브텍스트 색 — 두 화면이 rgba 투명도만 다름(.88/.82). */
  subtitleColor: string;
  onBack: () => void;
};

/**
 * Claude Design 핸드오프(사진 준비 안내 2화면) 전용 헤더 블록 — nav row(back·
 * 타이틀·배지, height 44) + H2 + subtitle이 한 색상 배경 위에 얹힌 구조.
 * 앱 공용 `ScreenHeader`(height 52, 배경 항상 흰색/투명)와는 높이·배경 규격이
 * 달라 그대로 재사용할 수 없어서, 이 핸드오프의 두 화면(CameraPrep/
 * S06_Upload) 전용으로 별도 컴포넌트를 둔다 — 두 화면이 색상·문구만 다르고
 * 구조는 완전히 동일해서 공유한다(중복 방지).
 */
export function PrepHeader({ bg, title, badge, heading, subtitle, subtitleColor, onBack }: Props) {
  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <View style={styles.navRow}>
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="뒤로">
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 18, gap: 10 },
  navRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { fontSize: 20, color: colors.inverseText },
  title: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  badge: { marginLeft: 'auto', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.18)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  heading: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.35, letterSpacing: -0.48, color: colors.inverseText },
  subtitle: { fontSize: 14, lineHeight: 14 * 1.5 },
});
