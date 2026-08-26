import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

export type TabKey = 'home' | 'shoot' | 'myPhotos' | 'settings';

type Props = {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'shoot', label: '촬영' },
  { key: 'myPhotos', label: '내 사진' },
  { key: 'settings', label: 'MY' },
];

/**
 * Persistent bottom tab bar — only rendered on the three tab "root" screens
 * (S01_Purpose, MyPhotos, Settings). Every other screen is reached by
 * pushing on top within one of those tabs, so the bar isn't part of the
 * shared navigator chrome; each root screen renders it as its last child.
 *
 * "촬영" (02-01) has no root screen of its own — selecting it runs
 * `quickStartPurpose()` and pushes straight into PhotoInputMethod, so it
 * never becomes the `active` tab (always momentary). "MY" is 02-01's label
 * for the same 설정(16-01) destination as before — key stays `settings`.
 */
export function BottomTabBar({ active, onSelect }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onSelect(tab.key)}>
            <View style={[styles.icon, isActive && styles.iconActive]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 58,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  icon: { width: 20, height: 20, borderRadius: 6, backgroundColor: colors.borderStrong },
  iconActive: { backgroundColor: colors.primary },
  label: { fontSize: 10.5, fontWeight: '600', color: colors.textTertiary },
  labelActive: { fontWeight: '700', color: colors.primary },
});
