import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'GenerationStarted'>;

/** 07-05 — 생성 시작 (transition). Payment already confirmed; the job is queued and keeps running even if the user leaves. */
export default function GenerationStarted({ navigation, route }: Props) {
  const amount = route.params?.amount ?? 0;
  const KRW = new Intl.NumberFormat('ko-KR').format(amount);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {amount > 0 && (
        <View style={styles.paidToast}>
          <View style={styles.paidToastCheck}>
            <Text style={styles.paidToastCheckGlyph}>✓</Text>
          </View>
          <Text style={styles.paidToastText}>결제가 완료되었어요 · {KRW}원</Text>
        </View>
      )}

      <View style={styles.body}>
        <PhotoPlaceholder width={150} height={196} radius={14} tone="primary" />
        <View style={styles.textBlock}>
          <Text style={styles.title}>사진 만들기를{'\n'}시작했어요</Text>
          <Text style={styles.subtitle}>완료되면 알림으로 알려드려요. 이 화면을 닫아도 계속 진행돼요.</Text>
        </View>
        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>준비 중</Text>
            <Text style={styles.progressPercent}>12%</Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton label="진행 상황 보기" onPress={() => navigation.replace('S10_Generating')} />
        <TextButton label="홈으로 돌아가기" onPress={() => navigation.popToTop()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  paidToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inverseBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    zIndex: 10,
  },
  paidToastCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  paidToastCheckGlyph: { color: colors.inverseText, fontSize: 11 },
  paidToastText: { fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.inverseText },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 36 },
  textBlock: { alignItems: 'center', gap: 9 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.35, textAlign: 'center', color: colors.textPrimary },
  subtitle: { fontSize: 14.5, color: colors.textTertiary, lineHeight: 14.5 * 1.6, textAlign: 'center' },
  progressBlock: { width: '100%', gap: 8 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle, overflow: 'hidden' },
  progressFill: { width: '12%', height: 6, borderRadius: 3, backgroundColor: colors.primary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12.5, color: colors.textTertiary },
  progressPercent: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingBottom: 28, gap: 10 },
});
