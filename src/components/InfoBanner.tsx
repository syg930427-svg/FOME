import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Tone = 'info' | 'warning' | 'error' | 'success';

type Props = { tone: Tone; text: string; icon?: string };

const TONE = {
  info: { bg: colors.primaryTint, fg: colors.infoText, iconBg: colors.infoText, icon: 'i' },
  warning: { bg: colors.warningBg, fg: colors.warningStrong, iconBg: colors.warning, icon: '!' },
  error: { bg: colors.errorBgAlt, fg: colors.errorStrongAlt, iconBg: colors.error, icon: '✕' },
  success: { bg: colors.successBg, fg: colors.successStrong, iconBg: colors.success, icon: '✓' },
} as const;

/** Info Banner — padding 12–13, radius 12, icon+text gap 8, toned bg per README. */
export function InfoBanner({ tone, text, icon }: Props) {
  const t = TONE[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text style={[styles.icon, { color: t.iconBg }]}>{icon ?? t.icon}</Text>
      <Text style={[styles.text, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 12, alignItems: 'flex-start' },
  icon: { fontWeight: '700', fontSize: 13, lineHeight: 18 },
  text: { flex: 1, fontSize: 13, lineHeight: 13 * 1.5 },
});
