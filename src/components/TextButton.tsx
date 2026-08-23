import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { label: string; onPress?: () => void; style?: ViewStyle };

/** Text CTA — 14px/600 #0066FF, centered. */
export function TextButton({ label, onPress, style }: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.base, style]} hitSlop={8}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  label: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
