import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  /** Height 48–54; list-row secondary CTAs in a row (e.g. S07, S12 sizing) use 48. */
  compact?: boolean;
};

/** Secondary CTA — height 48–54, radius 12–14, border 1px #DBDCDF, text 15–16/600 #46474C. */
export function SecondaryButton({ label, onPress, style, compact }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { height: 48, borderRadius: 12 },
  pressed: { backgroundColor: colors.surfaceSubtle },
  label: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  labelCompact: { fontSize: 15 },
});
