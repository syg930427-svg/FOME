import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IDEAL_SAMPLE_CHECKLIST, PURPOSES } from '../api';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, StepProgress, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S02_PurposeGuide'>;

const POLICY_COPY: Record<number, string> = {
  0: '얼굴 identity와 원본 헤어 특성은 유지하고, 얼굴을 가리지 않는 범위의 헤어 정돈만 적용해요.',
  1: '얼굴 identity는 유지하고, 제한적인 범위의 정돈·보정만 적용해요.',
  2: '얼굴 identity는 유지하고, 제한적인 범위의 정돈·보정만 적용해요.',
  3: '얼굴 identity는 유지하면서, 전문적인 인상을 위한 스타일을 추천해요.',
};

export default function S02_PurposeGuide({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const purpose = PURPOSES.find((p) => p.id === purposeId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={purpose?.title ?? '목적별 안내'} onBack={navigation.goBack} />
      <View style={styles.progressRow}>
        <StepProgress total={6} completed={2} label="준비" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.title}>이 사진은{'\n'}이렇게 준비해 주세요</Text>

        <View style={styles.sampleWrap}>
          <PhotoPlaceholder width={216} height={270} radius={14} />
          <View style={styles.sampleBadge}>
            <Text style={styles.sampleBadgeText}>이상적인 샘플</Text>
          </View>
        </View>

        <View style={styles.checklist}>
          {IDEAL_SAMPLE_CHECKLIST.map((item) => (
            <View key={item} style={styles.checkRow}>
              <Text style={styles.checkGlyph}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>{purpose?.title.replace(' 사진', '')} 모드 정책</Text>
          <Text style={styles.policyText}>{POLICY_COPY[editLevel]}</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <TextButton label="자세히 보기" onPress={() => navigation.navigate('S03_IdealSample')} />
        <PrimaryButton label="사진 준비하기" onPress={() => navigation.navigate('S03_IdealSample')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  progressRow: { paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 18, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 24 * 1.35, letterSpacing: -0.4, color: colors.textPrimary },
  sampleWrap: { alignSelf: 'center' },
  sampleBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.surface,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sampleBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  checklist: { gap: 11 },
  checkRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  checkGlyph: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  checkText: { flex: 1, fontSize: 15, lineHeight: 15 * 1.4, color: colors.textPrimary },
  policyBox: { padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 4 },
  policyTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  policyText: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
