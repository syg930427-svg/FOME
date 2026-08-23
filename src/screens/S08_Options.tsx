import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POLICIES } from '../api/mockData';
import { Chip, InfoBanner, PhotoPlaceholder, PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { Options, useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S08_Options'>;

const HAIR_LABEL: Record<Options['hair'], string> = {
  original: '원본 유지',
  tidy: '자연스러운 정돈',
  flyaway: '잔머리 정리',
};
const BACKGROUND_LABEL: Record<Options['background'], string> = {
  white: '흰색',
  lightGray: '밝은 회색',
  original: '원본 유지',
};

export default function S08_Options({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const options = useSession((s) => s.options);
  const setOption = useSession((s) => s.setOption);
  const policy = purposeId ? POLICIES[purposeId] : null;
  const lockedHair = new Set(policy?.lockedOptions.hair ?? []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="스타일 선택" onBack={navigation.goBack} right={<Text style={styles.progress}>4 / 6</Text>} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.summaryCard}>
          <PhotoPlaceholder width={66} height={86} radius={9} tone="subtle" />
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryLabel}>현재 선택</Text>
            <Text style={styles.summaryText}>
              {HAIR_LABEL[options.hair]} · 정면 표정 · {BACKGROUND_LABEL[options.background]} 배경
            </Text>
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>헤어</Text>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>원본 특성 유지</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {(['original', 'tidy', 'flyaway'] as const).map((value) => (
              <Chip
                key={value}
                label={HAIR_LABEL[value]}
                badge={value === 'tidy' ? '추천' : undefined}
                tone={lockedHair.has(value) ? 'locked' : options.hair === value ? 'selectedLight' : 'default'}
                onPress={() => setOption('hair', value)}
              />
            ))}
            <Chip label="완전히 다른 헤어" tone="locked" badge="고정" />
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>얼굴</Text>
            <View style={[styles.groupBadge, styles.groupBadgeNeutral]}>
              <Text style={[styles.groupBadgeText, styles.groupBadgeTextNeutral]}>Identity Lock</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            <Chip label="원본 얼굴" tone="default" />
            <Chip label="얼굴형 변경" tone="locked" badge="고정" />
            <Chip label="강한 피부 미화" tone="locked" badge="고정" />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>표정</Text>
          <View style={styles.chipRow}>
            <Chip label="자연스러운 정면" tone="selectedDark" />
            <Chip label="과도한 미소" tone="locked" badge="고정" />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>배경</Text>
          <View style={styles.chipRow}>
            {(['white', 'lightGray', 'original'] as const).map((value) => (
              <Chip
                key={value}
                label={BACKGROUND_LABEL[value]}
                tone={options.background === value ? 'selectedDark' : 'default'}
                onPress={() => setOption('background', value)}
              />
            ))}
          </View>
        </View>

        <InfoBanner tone="info" text="옵션을 고르는 동안에는 AI 생성을 하지 않아요. 최종 확인 후 1번만 생성해요." />
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="최종 설정 확인" onPress={() => navigation.navigate('S09_FinalConfirm')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  progress: { fontSize: 12, fontWeight: '700', color: colors.primary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 16, paddingBottom: 24 },
  summaryCard: { flexDirection: 'row', gap: 14, padding: 13, borderRadius: 14, backgroundColor: colors.surfaceSubtle },
  summaryTextCol: { flex: 1, gap: 4, justifyContent: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  summaryText: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  group: { gap: 9 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  groupTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  groupBadge: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: colors.warningBg },
  groupBadgeNeutral: { backgroundColor: colors.surfaceSubtleAlt },
  groupBadgeText: { fontSize: 11, fontWeight: '700', color: colors.warning },
  groupBadgeTextNeutral: { color: colors.textTertiary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
