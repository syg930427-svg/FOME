import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  height: number;
  topPct: number;
  sidePct: number;
  faceScale: number;
  dashed?: boolean;
  badge?: string;
  tone?: 'neutral' | 'primary';
  style?: ViewStyle;
};

/**
 * Shared crop-frame preview used across 05-03~05-13/05-15 — a placeholder
 * figure with a blue frame outline (the eventual output crop) drawn at
 * `topPct`/`sidePct` insets, scaled by `faceScale` so tighter framings read
 * as "closer" without a real image pipeline.
 */
export function FramingPreview({ height, topPct, sidePct, faceScale, dashed, badge, tone = 'neutral', style }: Props) {
  const figureHeight = height * Math.min(faceScale, 1.08);
  const figureWidth = figureHeight * 0.58;

  return (
    <View
      style={[
        styles.base,
        { height, backgroundColor: tone === 'primary' ? '#E4EBF5' : colors.surfacePlaceholder },
        style,
      ]}
    >
      <View style={{ width: figureWidth, height: Math.min(figureHeight, height), borderTopLeftRadius: figureWidth / 2, borderTopRightRadius: figureWidth / 2, backgroundColor: tone === 'primary' ? '#C3D3EC' : colors.placeholderFigure }} />
      <View
        style={[
          styles.frame,
          dashed && styles.frameDashed,
          {
            top: height * topPct,
            left: sidePct * 100 + '%',
            right: sidePct * 100 + '%',
          } as ViewStyle,
        ]}
      />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  frame: { position: 'absolute', bottom: 0, borderWidth: 2, borderColor: colors.primary, borderBottomWidth: 0, borderRadius: 3 },
  frameDashed: { borderStyle: 'dashed' },
  badge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.inverseText },
});
