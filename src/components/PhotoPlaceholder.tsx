import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  tone?: 'neutral' | 'primary' | 'subtle';
  style?: ViewStyle;
};

/**
 * Stand-in for a real photo/sample image. The handoff ships no photo assets —
 * real screens render `sampleImageUrl` / `guideImageUrls` from the policy API,
 * or the user's own captured/selected photo. This renders a grey card with a
 * simple head-and-shoulders silhouette in its place, matching the design's
 * placeholder convention.
 */
export function PhotoPlaceholder({ width, height, radius = 12, tone = 'neutral', style }: Props) {
  const bg = tone === 'primary' ? '#DDE9FB' : tone === 'subtle' ? colors.surfacePlaceholderAlt : colors.surfacePlaceholder;
  const figure = tone === 'primary' ? '#B8CFF0' : colors.placeholderFigure;
  const figureWidth = typeof width === 'number' ? width * 0.54 : ('54%' as const);
  const figureHeight = height * 0.64;
  const figureRadius = typeof figureWidth === 'number' ? figureWidth / 2 : height * 0.27;

  return (
    <View
      style={[
        styles.base,
        { width, height, borderRadius: radius, backgroundColor: bg, borderColor: colors.border },
        style,
      ]}
    >
      <View
        style={{
          width: figureWidth,
          height: figureHeight,
          borderTopLeftRadius: figureRadius,
          borderTopRightRadius: figureRadius,
          backgroundColor: figure,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
});
