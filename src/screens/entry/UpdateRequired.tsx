import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { BackHandler, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components';
import { UpdateGlyph } from '../../components/EntryIcons';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateRequired'>;

/** 01-09 — 앱 업데이트 필요. Force-update: no dismiss, no back (hardware back blocked too). */
export default function UpdateRequired({}: Props) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconWrap}>
          <UpdateGlyph />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>업데이트가 필요해요</Text>
          <Text style={styles.text}>목적별 사진 규격이 업데이트되었어요. 현재 버전에서는 정확한 규격으로 사진을 만들 수 없어요.</Text>
        </View>

        <View style={styles.versionTable}>
          <View style={[styles.versionRow, styles.versionDivider]}>
            <Text style={styles.versionLabel}>현재 버전</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>최신 버전</Text>
            <Text style={styles.versionValueHighlight}>1.2.0</Text>
          </View>
        </View>

        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>이번 업데이트</Text>
          <Text style={styles.notesText}>여권·신분증 규격 기준 갱신 · 촬영 가이드 개선 · 결과 화질 개선</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="업데이트하기" onPress={() => Linking.openURL('https://apps.apple.com/')} />
        <Text style={styles.caption}>업데이트 후 이어서 사용할 수 있어요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 24, alignItems: 'center', gap: 22 },
  iconWrap: { width: 112, height: 112, borderRadius: 32, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4, color: colors.textPrimary },
  text: { fontSize: 15, lineHeight: 15 * 1.6, color: colors.textSecondaryAlt, textAlign: 'center' },
  versionTable: { width: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  versionDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 14 },
  versionLabel: { fontSize: 14, color: colors.textTertiary },
  versionValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  versionValueHighlight: { fontSize: 14, fontWeight: '700', color: colors.primary },
  notesBox: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 7, alignItems: 'flex-start' },
  notesTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  notesText: { fontSize: 13, lineHeight: 13 * 1.6, color: colors.textSecondaryAlt, textAlign: 'left' },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 8 },
  caption: { textAlign: 'center', fontSize: 12, color: colors.textDisabled },
});
