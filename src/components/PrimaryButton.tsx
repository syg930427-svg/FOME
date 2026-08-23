import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, type } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  style?: ViewStyle;
};

/**
 * Primary CTA — height 54, radius 14, bg #0066FF, 17px/700 white text, full width.
 * Loading state keeps the label visible next to a spinner (e.g. "여권 기준을
 * 불러오는 중") on a darker #0052CC — press feedback shade doubling as the
 * busy state, per 02-03.
 */
export function PrimaryButton({ label, onPress, disabled, loading, danger, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        danger && styles.danger,
        isDisabled && !danger && !loading && styles.disabled,
        loading && !danger && styles.loading,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.label}>{label}</Text>
        </View>
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
  loading: { backgroundColor: '#0052CC' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  danger: { height: 42, borderRadius: 11, backgroundColor: colors.error },
  label: { ...type.ctaLabel, color: colors.inverseText },
  labelDisabled: { color: colors.textDisabled },
});
