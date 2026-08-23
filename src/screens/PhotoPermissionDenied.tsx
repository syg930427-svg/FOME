import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { getPhotosPermission } from '../permissions';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoPermissionDenied'>;

/** 04-05 — 사진 접근 권한 거부 (04-01 → 04-03 차단). Dedicated to the photo-input funnel, distinct from the generic 01-08. */
export default function PhotoPermissionDenied({ navigation }: Props) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const status = await getPhotosPermission();
        if (status === 'granted' || status === 'limited') navigation.navigate('S06_Upload');
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 선택" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.cell, i === 4 && styles.cellBlocked]}>
              {i === 4 && <Text style={styles.cellBlockedGlyph}>×</Text>}
            </View>
          ))}
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>사진 접근 권한이{'\n'}필요해요</Text>
          <Text style={styles.text}>앨범에서 사진을 고르려면 사진 접근을 허용해야 해요. 선택한 사진 한 장만 읽고, 앨범 전체를 열람하거나 업로드하지 않아요.</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>'선택한 사진만 허용'도 가능해요</Text>
          <Text style={styles.infoText}>전체 접근이 부담스러우면 사용할 사진 한 장만 골라 허용하세요. 제작에는 문제가 없어요.</Text>
        </View>
      </ScrollView>
      <View style={styles.ctaArea}>
        <PrimaryButton label="설정으로 이동" onPress={() => Linking.openSettings()} />
        <SecondaryButton
          label="지금 촬영해서 진행하기"
          compact
          onPress={() => navigation.navigate('PhotoInputMethod', { preselect: 'camera' })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 24, gap: 22 },
  grid: { width: '100%', height: 200, borderRadius: 18, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.borderSubtle, padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: '31.5%', height: '47%', borderRadius: 8, backgroundColor: colors.surfacePlaceholder, alignItems: 'center', justifyContent: 'center' },
  cellBlocked: { backgroundColor: colors.border },
  cellBlockedGlyph: { fontSize: 18, color: colors.textDisabled },
  titleBlock: { gap: 8 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.34, letterSpacing: -0.4, color: colors.textPrimary },
  text: { fontSize: 15, color: colors.textSecondaryAlt, lineHeight: 15 * 1.6 },
  infoBox: { padding: 16, borderRadius: 14, backgroundColor: colors.primaryTint, gap: 8 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  infoText: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.infoText },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
