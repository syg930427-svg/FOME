import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenHeader, SecondaryButton } from '../../components';
import { WarningGlyph } from '../../components/EntryIcons';
import { getCameraPermission, getNotificationsPermission, getPhotosPermission } from '../../permissions';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PermissionDenied'>;

const COPY = {
  camera: {
    header: '카메라 권한',
    title: '카메라 권한이\n꺼져 있어요',
    body: '권한이 꺼져 있어 앱에서 촬영할 수 없어요. 설정에서 카메라 권한을 켜면 바로 이어서 촬영할 수 있어요.',
    lastStep: '카메라 항목 켜기',
    altLabel: '기존 사진으로 계속하기',
    altTarget: 'S06_Upload' as const,
  },
  photos: {
    header: '사진 권한',
    title: '사진 접근 권한이\n꺼져 있어요',
    body: '권한이 꺼져 있어 갤러리에서 사진을 가져올 수 없어요. 설정에서 사진 권한을 켜면 바로 이어서 선택할 수 있어요.',
    lastStep: '사진 항목 켜기',
    altLabel: '앱에서 새로 촬영하기',
    altTarget: 'PhotoInputMethod' as const,
  },
  notifications: {
    header: '알림 권한',
    title: '알림이\n꺼져 있어요',
    body: '알림이 꺼져 있어 생성 완료를 바로 알려드릴 수 없어요. 설정에서 알림을 켜면 완료 시점에 알려드려요.',
    lastStep: '알림 항목 켜기',
    altLabel: '앱에서 직접 확인하기',
    altTarget: null,
  },
} as const;

/** 01-08 — 권한 거부 상태. Single component reused for camera / photos / notifications. */
export default function PermissionDenied({ navigation, route }: Props) {
  const { variant } = route.params;
  const copy = COPY[variant];
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        // README: re-check on foreground return; if now granted, resume automatically.
        const status =
          variant === 'camera' ? await getCameraPermission() : variant === 'photos' ? await getPhotosPermission() : await getNotificationsPermission();
        if (status === 'granted' || status === 'limited') {
          navigation.goBack();
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [navigation, variant]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={navigation.goBack} />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.iconWrap}>
          <WarningGlyph />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.text}>{copy.body}</Text>
        </View>

        <View style={styles.steps}>
          <StepRow n={1} text="설정 열기" />
          <StepRow n={2} text="AI PHOTO 선택" />
          <StepRow n={3} text={copy.lastStep} last />
        </View>

        <View style={styles.altBox}>
          <Text style={styles.altBoxTitle}>권한 없이도 계속할 수 있어요</Text>
          <Text style={styles.altBoxText}>이미 가지고 있는 사진을 선택하면 촬영 없이 사진을 만들 수 있어요.</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="설정으로 이동" onPress={() => Linking.openSettings()} />
        <SecondaryButton
          label={copy.altLabel}
          onPress={() => {
            if (copy.altTarget === 'PhotoInputMethod') navigation.navigate('PhotoInputMethod', { preselect: 'camera' });
            else if (copy.altTarget) navigation.navigate(copy.altTarget);
            else navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function StepRow({ n, text, last }: { n: number; text: string; last?: boolean }) {
  return (
    <View style={[styles.stepRow, !last && styles.stepRowDivider]}>
      <Text style={styles.stepNumber}>{n}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, gap: 20, paddingBottom: 24 },
  iconWrap: { width: 76, height: 76, borderRadius: 22, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { gap: 10 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.35, letterSpacing: -0.4, color: colors.textPrimary },
  text: { fontSize: 15, lineHeight: 15 * 1.6, color: colors.textSecondaryAlt },
  steps: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  stepRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 15, paddingVertical: 14 },
  stepRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  stepNumber: { fontSize: 13, fontWeight: '700', color: colors.primary },
  stepText: { fontSize: 14, lineHeight: 14 * 1.45, color: colors.textSecondary },
  altBox: { padding: 14, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 6 },
  altBoxTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  altBoxText: { fontSize: 13, lineHeight: 13 * 1.55, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
