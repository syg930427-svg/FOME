import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPOSITION_OPTIONS, POLICIES } from '../api/mockData';
import { CompositionId, RetouchLevel } from '../api/types';
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
const RETOUCH_LABEL: Record<RetouchLevel, string> = { basic: '기본', premium: '고급' };
const COMPOSITION_LABEL: Record<CompositionId, string> = Object.fromEntries(
  COMPOSITION_OPTIONS.map((o) => [o.id, o.title])
) as Record<CompositionId, string>;

export default function S08_Options({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const options = useSession((s) => s.options);
  const setOption = useSession((s) => s.setOption);
  const policy = purposeId ? POLICIES[purposeId] : null;
  const lockedHair = new Set(policy?.lockedOptions.hair ?? []);

  // 구도(composition) — 목적 정책의 optionGroups[key='composition']만 읽는다. 하드코딩 금지.
  const compositionGroup = policy?.optionGroups.find((g) => g.key === 'composition');
  const allowedCompositions = new Set<CompositionId>(
    (compositionGroup?.allowed as CompositionId[] | undefined) ?? COMPOSITION_OPTIONS.map((o) => o.id)
  );

  // 현재 선택된 구도가 이 목적에서 비허용이면(예: 다른 목적에서 넘어온 기본값) 허용되는 첫 값으로 자동 보정.
  useEffect(() => {
    if (!allowedCompositions.has(options.composition)) {
      const firstAllowed = COMPOSITION_OPTIONS.find((o) => allowedCompositions.has(o.id))?.id;
      if (firstAllowed) setOption('composition', firstAllowed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purposeId]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="스타일 선택" onBack={navigation.goBack} right={<Text style={styles.progress}>4 / 6</Text>} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.summaryCard}>
          <PhotoPlaceholder width={66} height={86} radius={9} tone="subtle" />
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryLabel}>현재 선택</Text>
            <Text style={styles.summaryText}>
              {COMPOSITION_LABEL[options.composition]} · {HAIR_LABEL[options.hair]} · 정면 표정 · {BACKGROUND_LABEL[options.background]} 배경 · {RETOUCH_LABEL[options.retouch]} 보정
            </Text>
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>구도</Text>
          </View>
          <View style={styles.chipRow}>
            {COMPOSITION_OPTIONS.map((opt) => {
              const allowed = allowedCompositions.has(opt.id);
              return (
                <Chip
                  key={opt.id}
                  label={opt.title}
                  badge={!allowed ? '비활성' : undefined}
                  tone={!allowed ? 'locked' : options.composition === opt.id ? 'selectedDark' : 'default'}
                  onPress={allowed ? () => setOption('composition', opt.id) : undefined}
                />
              );
            })}
          </View>
          {compositionGroup?.lockReason && allowedCompositions.size < COMPOSITION_OPTIONS.length ? (
            <Text style={styles.lockReasonText}>{compositionGroup.lockReason}</Text>
          ) : null}
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

        <View style={styles.group}>
          <Text style={styles.groupTitle}>보정</Text>
          <View style={styles.chipRow}>
            {(['basic', 'premium'] as const).map((value) => (
              <Chip
                key={value}
                label={RETOUCH_LABEL[value]}
                tone={options.retouch === value ? 'selectedDark' : 'default'}
                onPress={() => setOption('retouch', value)}
              />
            ))}
          </View>
          {/* 상품 등급별 '고급' 보정 활성/비활성 연동은 S09 상품 선택(Phase 3) 이후 배선 — 지금은 둘 다 선택 가능. */}
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
  lockReasonText: { fontSize: 12, lineHeight: 12 * 1.5, color: colors.textDisabled },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
