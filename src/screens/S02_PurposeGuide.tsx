import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IDEAL_SAMPLE_CHECKLIST, POLICY_DETAILS, PURPOSES } from '../api';
import { getGuidesForPurpose } from '../api/mockData';
import { InfoBanner, PhotoPlaceholder, PrimaryButton, ScreenHeader, SpecList, StepProgress } from '../components';
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

const BAD_REASONS = [
  '고개가 한쪽으로 기울어졌어요',
  '머리카락이 눈·눈썹을 가렸어요',
  '한쪽 얼굴에 강한 그림자가 있어요',
  '웃는 표정으로 얼굴 형태가 달라졌어요',
  '카메라와 너무 가까워 얼굴이 왜곡됐어요',
];

const BAD_EXAMPLE_IDS = ['tilt', 'hair', 'shadow', 'smile'];

/**
 * 「사진 준비 기준」— S01 목적 선택 직후 한 번만 보여주는 단일 화면. 이상적인
 * 샘플·핵심 체크리스트·목적별 규격/정책은 항상 펼쳐져 있고, "피해야 할 사진
 * 예시"/"촬영 기준"은 기본 접힘(아코디언)으로 눌러야 펼쳐진다. 구
 * S03_IdealSample의 3탭 내용(좋은 예시/피해야 할 예시/촬영 기준)을 전부
 * 흡수했고 그 화면은 삭제됐다 — "자세히 보기"라는 별도 라우트는 없다.
 * S06/S07의 "다시 보기"는 이 화면을 `push`로 재방문한다(뒤로가기 시 원래
 * 있던 화면으로 정상 복귀 — navigation.navigate를 쓰면 스택에 이미 있는 이
 * 화면으로 점프하며 그 사이 화면들이 스택에서 사라지므로 반드시 push).
 */
export default function S02_PurposeGuide({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const detail = purposeId ? POLICY_DETAILS[purposeId] : null;
  const guides = purposeId ? getGuidesForPurpose(purposeId) : [];

  const [badExpanded, setBadExpanded] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

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

        {detail ? <SpecList boxed rows={detail.rows} /> : null}

        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>{purpose?.title.replace(' 사진', '')} 모드 정책</Text>
          <Text style={styles.policyText}>{POLICY_COPY[editLevel]}</Text>
        </View>

        <View style={styles.accordionBox}>
          <Pressable style={styles.accordionHeader} onPress={() => setBadExpanded((v) => !v)}>
            <Text style={styles.accordionTitle}>피해야 할 사진 예시</Text>
            <Text style={styles.accordionToggle}>{badExpanded ? '－' : '＋'}</Text>
          </Pressable>
          {badExpanded && (
            <View style={styles.accordionBody}>
              <View style={styles.badThumbRow}>
                {BAD_EXAMPLE_IDS.map((id) => (
                  <View key={id} style={styles.badThumb} />
                ))}
              </View>
              <View style={styles.checklist}>
                {BAD_REASONS.map((item) => (
                  <View key={item} style={styles.checkRow}>
                    <Text style={styles.badGlyph}>✕</Text>
                    <Text style={styles.checkText}>{item}</Text>
                  </View>
                ))}
              </View>
              <InfoBanner tone="info" text="이 기준은 참고용 안내예요. 앱이 사진을 자동으로 합격·불합격 판정하지 않아요." />
            </View>
          )}
        </View>

        <View style={styles.accordionBox}>
          <Pressable style={styles.accordionHeader} onPress={() => setGuideExpanded((v) => !v)}>
            <Text style={styles.accordionTitle}>촬영 기준 자세히 보기</Text>
            <Text style={styles.accordionToggle}>{guideExpanded ? '－' : '＋'}</Text>
          </Pressable>
          {guideExpanded && (
            <View style={styles.accordionBody}>
              {guides.map((item, i) => (
                <View key={item.id} style={[styles.guideRow, i === guides.length - 1 && styles.guideRowLast]}>
                  <Text style={styles.guideTitle}>{item.title}</Text>
                  <View style={styles.bulletList}>
                    {item.description.split(' · ').map((line) => (
                      <Text key={line} style={styles.bullet}>
                        · {line}
                      </Text>
                    ))}
                  </View>
                  {item.warning ? <InfoBanner tone="warning" text={item.warning} /> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="사진 준비하기" onPress={() => navigation.navigate('PhotoInputMethod', {})} />
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
  badGlyph: { color: colors.error, fontWeight: '700', fontSize: 14 },
  checkText: { flex: 1, fontSize: 15, lineHeight: 15 * 1.4, color: colors.textPrimary },
  policyBox: { padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 4 },
  policyTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  policyText: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  accordionBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 14 },
  accordionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  accordionToggle: { fontSize: 16, color: colors.textTertiary },
  accordionBody: { paddingHorizontal: 15, paddingBottom: 16, gap: 14, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 14 },
  badThumbRow: { flexDirection: 'row', gap: 8 },
  badThumb: { flex: 1, height: 84, borderRadius: 10, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder },
  guideRow: { gap: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  guideRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  guideTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  bulletList: { gap: 5 },
  bullet: { fontSize: 13.5, lineHeight: 13.5 * 1.5, color: '#3B4A63' },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
