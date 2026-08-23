import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { total?: number; completed: number; label: string };

/** Step Progress — N segments, height 4, radius 2; done #0066FF / not-done #E1E2E4 + right label 11/700. */
export function StepProgress({ total = 6, completed, label }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, { backgroundColor: i < completed ? colors.primary : colors.border }]}
        />
      ))}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', color: colors.primary, marginLeft: 4 },
});
