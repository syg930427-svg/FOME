import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar, TabKey } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/**
 * 설정 탭 — not part of any handoff batch shipped so far (목차 13 only
 * details 홈/내 사진). Kept minimal so the tab bar has a real destination
 * rather than a dead link; expand when its own design lands.
 */
export default function Settings({ navigation }: Props) {
  function handleSelectTab(tab: TabKey) {
    if (tab === 'home') navigation.navigate('S01_Purpose');
    else if (tab === 'myPhotos') navigation.navigate('MyPhotos');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>준비 중이에요</Text>
      </View>
      <BottomTabBar active="settings" onSelect={handleSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontSize: 14, color: colors.textTertiary },
});
