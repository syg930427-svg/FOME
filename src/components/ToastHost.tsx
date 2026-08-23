import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../state/toast';
import { colors } from '../theme/tokens';

/** Renders the current global toast (if any) above the navigator, bottom-anchored. */
export function ToastHost() {
  const message = useToast((s) => s.message);
  const insets = useSafeAreaInsets();
  if (!message) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
      <View style={styles.pill}>
        <View style={styles.check}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, zIndex: 1000 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inverseBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkGlyph: { color: colors.inverseText, fontSize: 11 },
  text: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.inverseText },
});
