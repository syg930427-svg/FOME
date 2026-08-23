import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Tone = 'default' | 'selectedLight' | 'selectedDark' | 'locked';

type Props = {
  label: string;
  tone: Tone;
  badge?: string;
  onPress?: () => void;
};

/**
 * Chip — height 40, padding 0 14, radius 20.
 * default: border 1px #DBDCDF. selectedLight: bg #0066FF white text (with optional "추천" badge).
 * selectedDark: bg #171719 white text. locked: bg #F4F4F5, text #AEB0B6, disabled, "고정" badge.
 */
export function Chip({ label, tone, badge, onPress }: Props) {
  const disabled = tone === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: tone === 'selectedLight' || tone === 'selectedDark' }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, toneStyle[tone]]}
    >
      <Text style={[styles.label, toneLabelStyle[tone]]}>{label}</Text>
      {badge ? (
        <View style={[styles.badge, tone === 'locked' ? styles.badgeLocked : styles.badgeOnDark]}>
          <Text style={[styles.badgeText, tone === 'locked' && styles.badgeTextLocked]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: { fontSize: 14, fontWeight: '600' },
  badge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  badgeOnDark: { backgroundColor: 'rgba(255,255,255,0.24)' },
  badgeLocked: { backgroundColor: '#E4E6EA' },
  badgeText: { fontSize: 11, color: colors.inverseText },
  badgeTextLocked: { color: colors.textTertiary },
});

const toneStyle = StyleSheet.create({
  default: { borderWidth: 1, borderColor: colors.borderStrong },
  selectedLight: { backgroundColor: colors.primary },
  selectedDark: { backgroundColor: colors.inverseBg },
  locked: { backgroundColor: colors.surfaceSubtleAlt },
});

const toneLabelStyle = StyleSheet.create({
  default: { color: colors.textSecondary, fontWeight: '600' },
  selectedLight: { color: colors.inverseText, fontWeight: '700' },
  selectedDark: { color: colors.inverseText, fontWeight: '700' },
  locked: { color: colors.textDisabled, fontWeight: '600' },
});
