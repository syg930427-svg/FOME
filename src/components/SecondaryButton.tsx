import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  /** Height 48–54; list-row secondary CTAs in a row (e.g. S07, S12 sizing) use 48. */
  compact?: boolean;
  /** Outline-on-dark variant used on camera/zoom-modal dark surfaces (e.g. 04-06). */
  dark?: boolean;
};

/** Secondary CTA — height 48–54, radius 12–14, border 1px #DBDCDF, text 15–16/600 #46474C. */
export function SecondaryButton({ label, onPress, style, compact, dark }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        dark ? styles.baseDark : styles.baseLight,
        compact && styles.compact,
        pressed && (dark ? styles.pressedDark : styles.pressedLight),
        style,
      ]}
    >
      <Text style={[styles.label, dark ? styles.labelDark : styles.labelLight, compact && styles.labelCompact]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseLight: { borderColor: colors.borderStrong },
  baseDark: { borderColor: 'rgba(255,255,255,0.24)' },
  compact: { height: 48, borderRadius: 12 },
  pressedLight: { backgroundColor: colors.surfaceSubtle },
  pressedDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  label: { fontSize: 16, fontWeight: '600' },
  labelLight: { color: colors.textSecondary },
  labelDark: { color: colors.inverseText },
  labelCompact: { fontSize: 15 },
});
