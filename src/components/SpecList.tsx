import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

export type SpecRow = { label: string; value: string };

type Props = { rows: SpecRow[]; boxed?: boolean };

/**
 * Spec List — justify-content: space-between, label 14px tertiary / value 14px/700,
 * 1px divider between rows. `boxed` wraps it in the bordered card used on S09.
 */
export function SpecList({ rows, boxed }: Props) {
  return (
    <View style={boxed ? styles.box : undefined}>
      {rows.map((row, i) => (
        <View
          key={row.label}
          style={[
            styles.row,
            boxed && styles.rowBoxed,
            boxed && i < rows.length - 1 && styles.rowDivider,
          ]}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 0 },
  rowBoxed: { paddingHorizontal: 15, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  label: { fontSize: 14, color: colors.textTertiary },
  value: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
});
