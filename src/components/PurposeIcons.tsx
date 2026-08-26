import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * Simple line-shape glyphs for the 02-01 홈 목적 카드 그리드, matching
 * EntryIcons.tsx's minimalist stroke-shape convention — the design's own
 * icon set (`DesignSystem.Icon`) isn't a real asset we have access to.
 */

export function IdPhotoGlyph({ color = colors.primary }: { color?: string }) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <View style={{ width: 16, height: 9, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: color }} />
    </View>
  );
}

export function PassportGlyph({ color = colors.primary }: { color?: string }) {
  return (
    <View
      style={{
        width: 21,
        height: 24,
        borderRadius: 3,
        borderWidth: 2.2,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.6, borderColor: color }} />
    </View>
  );
}

export function LicenseGlyph({ color = colors.primary }: { color?: string }) {
  return (
    <View
      style={{
        width: 26,
        height: 18,
        borderRadius: 4,
        borderWidth: 2.2,
        borderColor: color,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 3,
        gap: 3,
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ height: 2, borderRadius: 1, backgroundColor: color }} />
        <View style={{ height: 2, borderRadius: 1, backgroundColor: color, width: '60%' }} />
      </View>
    </View>
  );
}

export function BriefcaseGlyph({ color = colors.primary }: { color?: string }) {
  return (
    <View style={{ width: 24, height: 20, alignItems: 'center' }}>
      <View
        style={{
          width: 10,
          height: 6,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderWidth: 2.2,
          borderColor: color,
          borderBottomWidth: 0,
          marginBottom: -1,
        }}
      />
      <View style={{ width: 24, height: 16, borderRadius: 4, borderWidth: 2.2, borderColor: color }} />
    </View>
  );
}
