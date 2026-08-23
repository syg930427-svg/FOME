import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { PhotoPlaceholder } from './PhotoPlaceholder';

type Props = {
  title: string;
  description: string;
  levelLabel: string;
  selected: boolean;
  onPress?: () => void;
};

/**
 * S01 purpose selection card.
 * padding 14, radius 16; unselected border 1px #E1E2E4, selected border 2px #0066FF + bg #F5F9FF.
 * Right side: 22px circular check when selected, otherwise a chevron.
 */
export function SelectionCard({ title, description, levelLabel, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      <PhotoPlaceholder width={56} height={72} radius={8} tone={selected ? 'primary' : 'neutral'} />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={[styles.level, selected && styles.levelSelected]}>{levelLabel}</Text>
      </View>
      {selected ? (
        <View style={styles.check}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
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
  selected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  textCol: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondaryAlt },
  level: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  levelSelected: { color: colors.primary },
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
