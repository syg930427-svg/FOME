import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { prefetchBootstrap } from '../../api';
import { PrimaryButton, ScreenHeader, SecondaryButton } from '../../components';
import { ErrorGlyph } from '../../components/EntryIcons';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ServerError'>;

const BACKOFF_MS = [1000, 2000, 4000];
const nowLabel = () => new Date().toTimeString().slice(0, 8);

/** 01-10 — 서버 연결 오류. Retries with exponential backoff (1s/2s/4s, max 3 tries). */
export default function ServerError({ navigation }: Props) {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorAt] = useState(nowLabel());

  async function retry() {
    if (retrying) return;
    setRetrying(true);
    const delay = BACKOFF_MS[Math.min(retryCount, BACKOFF_MS.length - 1)];
    await new Promise((r) => setTimeout(r, delay));
    const result = await prefetchBootstrap();
    setRetrying(false);
    if (result.ok) {
      navigation.reset({ index: 0, routes: [{ name: 'S01_Purpose' }] });
    } else {
      setRetryCount((c) => Math.min(c + 1, BACKOFF_MS.length));
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="연결 오류" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconWrap}>
          <ErrorGlyph />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>서버에 연결할 수{'\n'}없어요</Text>
          <Text style={styles.text}>일시적인 문제일 수 있어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.</Text>
        </View>

        <View style={styles.checklistBox}>
          <Text style={styles.checklistTitle}>이렇게 확인해 보세요</Text>
          <Text style={styles.checklistLine}>· Wi-Fi 또는 데이터 연결 상태</Text>
          <Text style={styles.checklistLine}>· 기내 모드 해제 여부</Text>
          <Text style={styles.checklistLine}>· 잠시 후 다시 시도</Text>
        </View>

        <Text style={styles.errorCode}>오류 코드 NET-503 · {errorAt}</Text>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="다시 시도" loading={retrying} onPress={retry} />
        <SecondaryButton label="홈으로 이동" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'S01_Purpose' }] })} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 24, alignItems: 'center', gap: 22 },
  iconWrap: { width: 112, height: 112, borderRadius: 32, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.35, letterSpacing: -0.4, color: colors.textPrimary, textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 15 * 1.6, color: colors.textSecondaryAlt, textAlign: 'center' },
  checklistBox: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 8, alignItems: 'flex-start' },
  checklistTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  checklistLine: { fontSize: 13, lineHeight: 13 * 1.55, color: colors.textSecondaryAlt },
  errorCode: { fontSize: 12, color: colors.textDisabled },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
