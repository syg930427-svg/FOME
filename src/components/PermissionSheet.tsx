import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  icon: React.ReactNode;
  title: string;
  body: string;
  checklist?: string[];
  noteTitle?: string;
  note?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  onDismiss: () => void;
};

/**
 * Contextual permission bottom sheet (01-05 / 01-06 / 01-07). Renders over
 * whatever screen requested it — the caller supplies that screen as normal
 * content behind this Modal, so the "background" is always the real,
 * already-implemented screen rather than a re-drawn copy of it.
 */
export function PermissionSheet({
  visible,
  icon,
  title,
  body,
  checklist,
  noteTitle,
  note,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.grabHandle} />
        <View style={styles.iconWrap}>{icon}</View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
        {checklist ? (
          <View style={styles.checklist}>
            {checklist.map((line) => (
              <View key={line} style={styles.checkRow}>
                <Text style={styles.checkGlyph}>✓</Text>
                <Text style={styles.checkText}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {note ? (
          <View style={styles.noteBox}>
            {noteTitle ? <Text style={styles.noteTitle}>{noteTitle}</Text> : null}
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable style={styles.primary} onPress={onPrimary}>
            <Text style={styles.primaryLabel}>{primaryLabel}</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={onSecondary} hitSlop={8}>
            <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(23,23,25,0.48)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  grabHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  textBlock: { gap: 8 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, color: colors.textPrimary },
  body: { fontSize: 15, lineHeight: 15 * 1.6, color: colors.textSecondaryAlt },
  checklist: { gap: 9 },
  checkRow: { flexDirection: 'row', gap: 9 },
  checkGlyph: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  checkText: { flex: 1, fontSize: 14, lineHeight: 14 * 1.45, color: colors.textSecondary },
  noteBox: { padding: 13, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 4 },
  noteTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  noteText: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  actions: { gap: 10 },
  primary: { height: 54, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { fontSize: 17, fontWeight: '700', color: colors.inverseText },
  secondary: { alignItems: 'center', justifyContent: 'center' },
  secondaryLabel: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
});
