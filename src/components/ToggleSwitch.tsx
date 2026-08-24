import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { value: boolean; onValueChange: () => void; disabled?: boolean };

/**
 * iOS-style pill toggle — 44×26 track, 20×20 thumb. RN's built-in `Switch`
 * doesn't give pixel control over the design's exact track/thumb sizing and
 * color, so this small custom component is reused across every 16-03 row.
 */
export function ToggleSwitch({ value, onValueChange, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={disabled ? undefined : onValueChange}
      hitSlop={6}
      style={[styles.track, value ? styles.trackOn : styles.trackOff, disabled && styles.trackDisabled]}
    >
      <View style={styles.thumb} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  trackOn: { backgroundColor: colors.primary, alignItems: 'flex-end' },
  trackOff: { backgroundColor: colors.border, alignItems: 'flex-start' },
  trackDisabled: { opacity: 0.5 },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});
