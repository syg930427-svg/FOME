import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, type } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  style?: ViewStyle;
};

/** Primary CTA — height 54, radius 14, bg #0066FF, 17px/700 white text, full width. */
export function PrimaryButton({ label, onPress, disabled, loading, danger, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        danger && styles.danger,
        isDisabled && !danger && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={danger || !isDisabled ? '#fff' : colors.textDisabled} />
      ) : (
        <Text style={[styles.label, isDisabled && !danger && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.ctaPrimary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: { opacity: 0.85 },
  disabled: { backgroundColor: colors.surfaceSubtleAlt },
  danger: { height: 42, borderRadius: 11, backgroundColor: colors.error },
  label: { ...type.ctaLabel, color: colors.inverseText },
  labelDisabled: { color: colors.textDisabled },
});
