import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  title: string;
  onBack?: () => void;
  /** Use "×" instead of "←" for full-screen modal-like flows (S05 camera). */
  closeIcon?: boolean;
  right?: React.ReactNode;
  dark?: boolean;
};

/** Header (nav bar) — height 52, back/close 20px glyph + 16/700 title. */
export function ScreenHeader({ title, onBack, closeIcon, right, dark }: Props) {
  const fg = dark ? colors.inverseText : colors.textPrimary;
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel={closeIcon ? '닫기' : '뒤로'}>
          <Text style={[styles.icon, { color: fg }]}>{closeIcon ? '×' : '←'}</Text>
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
      <Text style={[styles.title, { color: fg }]}>{title}</Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  icon: { fontSize: 20 },
  iconSpacer: { width: 20 },
  title: { fontSize: 16, fontWeight: '700' },
  right: { marginLeft: 'auto' },
});
