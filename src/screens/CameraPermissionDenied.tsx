import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { getCameraPermission } from '../permissions';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraPermissionDenied'>;

/** 04-04 — 카메라 권한 거부 (04-01 → 04-02 차단). Dedicated to the photo-input funnel, distinct from the generic 01-08. */
export default function CameraPermissionDenied({ navigation }: Props) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const status = await getCameraPermission();
        if (status === 'granted' || status === 'limited') navigation.navigate('S05_Camera');
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 준비" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.illustration}>
          <View style={styles.cameraShape} />
          <View style={styles.crossLine} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>카메라 권한이{'\n'}꺼져 있어요</Text>
          <Text style={styles.text}>촬영으로 사진을 만들려면 카메라 접근이 필요해요. 사진은 사진 제작에만 사용되고 촬영 중 영상은 저장되지 않아요.</Text>
        </View>
        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>설정에서 켜는 방법</Text>
          <Text style={styles.stepLine}>1. 설정 열기</Text>
          <Text style={styles.stepLine}>2. AI PHOTO 선택</Text>
          <Text style={styles.stepLine}>3. 카메라 켜기</Text>
        </View>
      </ScrollView>
      <View style={styles.ctaArea}>
        <PrimaryButton label="설정으로 이동" onPress={() => Linking.openSettings()} />
        <SecondaryButton
          label="기존 사진으로 진행하기"
          compact
          onPress={() => navigation.navigate('PhotoInputMethod', { preselect: 'gallery' })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 24, gap: 22 },
  illustration: { width: '100%', height: 200, borderRadius: 18, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  cameraShape: { width: 74, height: 56, borderRadius: 12, borderWidth: 2.5, borderColor: colors.textDisabledAlt },
  crossLine: { position: 'absolute', width: 96, borderTopWidth: 2.5, borderTopColor: colors.textDisabledAlt, transform: [{ rotate: '-38deg' }] },
  titleBlock: { gap: 8 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.34, letterSpacing: -0.4, color: colors.textPrimary },
  text: { fontSize: 15, color: colors.textSecondaryAlt, lineHeight: 15 * 1.6 },
  stepsBox: { padding: 16, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 10 },
  stepsTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  stepLine: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
