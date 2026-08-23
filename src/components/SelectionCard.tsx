import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { PhotoPlaceholder } from './PhotoPlaceholder';

type Props = {
  title: string;
  description: string;
  levelLabel?: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * false renders the 01-03 onboarding variant: no LEVEL badge, no trailing
   * check/chevron, not pressable. Same card, non-interactive read-only mode —
   * reused rather than re-implemented per the app-entry handoff.
   */
  interactive?: boolean;
  /**
   * false renders the 02-02 "준비 중" (coming soon) state: 50% opacity, a
   * muted badge instead of the LEVEL label, and the card stops responding to
   * taps. Driven by the policy API's own availability flag, not hardcoded.
   */
  available?: boolean;
};

/**
 * S01 purpose selection card.
 * padding 14, radius 16; unselected border 1px #E1E2E4, selected border 2px #0066FF + bg #F5F9FF.
 * pressed: border #DBDCDF + bg #F7F7F8. Right side: 22px circular check when
 * selected, otherwise a chevron.
 */
export function SelectionCard({ title, description, levelLabel, selected, onPress, interactive = true, available = true }: Props) {
  const content = (pressed?: boolean) => (
    <>
      <PhotoPlaceholder
        width={56}
        height={72}
        radius={8}
        tone={selected ? 'primary' : pressed ? 'subtle' : 'neutral'}
      />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {!available ? (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>준비 중</Text>
          </View>
        ) : levelLabel ? (
          <Text style={[styles.level, selected && styles.levelSelected]}>{levelLabel}</Text>
        ) : null}
      </View>
      {!interactive || !available ? null : selected ? (
        <View style={styles.check}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </>
  );

  if (!interactive) {
    return <View style={[styles.base, styles.unselected]}>{content()}</View>;
  }

  if (!available) {
    return <View style={[styles.base, styles.unselected, styles.unavailable]}>{content()}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : pressed ? styles.pressed : styles.unselected]}
    >
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  unselected: { borderWidth: 1, borderColor: colors.border },
  pressed: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSubtle },
  selected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  unavailable: { opacity: 0.5 },
  textCol: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondaryAlt },
  level: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  levelSelected: { color: colors.primary },
  unavailableBadge: { alignSelf: 'flex-start', backgroundColor: colors.surfaceSubtleAlt, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, marginTop: 1 },
  unavailableBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textTertiary },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: { color: colors.inverseText, fontSize: 13 },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
});
