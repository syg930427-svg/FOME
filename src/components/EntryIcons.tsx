import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

/** Simple line-shape glyphs matching the design's 2.5px-stroke placeholder icons. */

export function CameraGlyph({ color = colors.primary }: { color?: string }) {
  return <View style={[styles.cameraBody, { borderColor: color }]} />;
}

export function PhotoGlyph({ color = colors.primary }: { color?: string }) {
  return <View style={[styles.photoBody, { borderColor: color }]} />;
}

export function BellGlyph() {
  return <View style={styles.bellBody} />;
}

export function WarningGlyph() {
  return <Text style={styles.warningGlyph}>!</Text>;
}

export function UpdateGlyph() {
  return <Text style={styles.updateGlyph}>↑</Text>;
}

export function ErrorGlyph() {
  return <Text style={styles.errorGlyph}>×</Text>;
}

const styles = StyleSheet.create({
  cameraBody: { width: 26, height: 20, borderRadius: 5, borderWidth: 2.5 },
  photoBody: { width: 24, height: 24, borderRadius: 5, borderWidth: 2.5 },
  bellBody: { width: 22, height: 24, borderTopLeftRadius: 11, borderTopRightRadius: 11, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderWidth: 2.5, borderColor: colors.primary },
  warningGlyph: { fontSize: 30, fontWeight: '700', color: colors.warning },
  updateGlyph: { fontSize: 34, fontWeight: '700', color: colors.primary },
  errorGlyph: { fontSize: 32, fontWeight: '700', color: colors.error },
});
