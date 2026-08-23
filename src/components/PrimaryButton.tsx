import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, type } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  /** White-bg/dark-text variant for dark surfaces (e.g. camera error 04-06). */
  inverse?: boolean;
  style?: ViewStyle;
};

/**
 * Primary CTA — height 54, radius 14, bg #0066FF, 17px/700 white text, full width.
 * Loading state keeps the label visible next to a spinner (e.g. "여권 기준을
 * 불러오는 중") on a darker #0052CC — press feedback shade doubling as the
 * busy state, per 02-03.
 */
export function PrimaryButton({ label, onPress, disabled, loading, danger, inverse, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        inverse && styles.inverse,
        danger && styles.danger,
        isDisabled && !danger && !inverse && !loading && styles.disabled,
        loading && !danger && !inverse && styles.loading,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={inverse ? colors.textPrimary : '#fff'} size="small" />
          <Text style={[styles.label, inverse && styles.labelInverse]}>{label}</Text>
        </View>
      ) : (
        <Text style={[styles.label, inverse && styles.labelInverse, isDisabled && !danger && !inverse && styles.labelDisabled]}>
          {label}
        </Text>
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
  inverse: { backgroundColor: colors.inverseText },
  label: { ...type.ctaLabel, color: colors.inverseText },
  labelInverse: { color: colors.textPrimary },
  labelDisabled: { color: colors.textDisabled },
});
