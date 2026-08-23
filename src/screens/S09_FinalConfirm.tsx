import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGeneration, PURPOSES } from '../api';
import { InfoBanner, PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, SpecList } from '../components';
import { RootStackParamList } from '../navigation/types';
import { Options, useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S09_FinalConfirm'>;

const HAIR_LABEL: Record<Options['hair'], string> = {
  original: '원본 유지',
  tidy: '원본 특성 유지 + 정돈',
  flyaway: '잔머리 정리',
};
const BACKGROUND_LABEL: Record<Options['background'], string> = {
  white: '흰색',
  lightGray: '밝은 회색',
  original: '원본 유지',
};

export default function S09_FinalConfirm({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const source = useSession((s) => s.source);
  const photo = useSession((s) => s.photo);
  const photoId = useSession((s) => s.photoId);
  const policyId = useSession((s) => s.policyId);
  const options = useSession((s) => s.options);
  const setGeneration = useSession((s) => s.setGeneration);
  const purpose = PURPOSES.find((p) => p.id === purposeId);

  // RULE-07: generation fires exactly once, from this screen only. The flag
  // guards against a double tap racing two /v1/generations calls.
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate() {
    if (submitting || !photoId || !policyId) return;
    setSubmitting(true);
    try {
      const { generationId } = await createGeneration(photoId, policyId, {
        hair: options.hair,
        expression: options.expression,
        background: options.background,
      });
      setGeneration({ id: generationId, status: 'queued', progress: 0 });
      navigation.navigate('S10_Generating');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="최종 설정 확인" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.originRow}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.originImage} resizeMode="cover" />
          ) : (
            <PhotoPlaceholder width={96} height={126} radius={11} />
          )}
          <View style={styles.originTextCol}>
            <Text style={styles.originLabel}>원본</Text>
            <Text style={styles.originTitle}>
              {purpose?.title} · {source === 'gallery' ? '갤러리 선택' : '앱 촬영'}
            </Text>
            <Text style={styles.originNote}>이 원본으로 1회 생성해요</Text>
          </View>
        </View>

        <SpecList
          boxed
          rows={[
            { label: '목적', value: purpose?.title.replace(' 사진', '') ?? '-' },
            { label: '헤어', value: HAIR_LABEL[options.hair] },
            { label: '얼굴', value: 'Identity 유지' },
            { label: '표정', value: '자연스러운 정면' },
            { label: '배경', value: BACKGROUND_LABEL[options.background] },
          ]}
        />

        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>적용되는 정책 · LEVEL {editLevel}</Text>
          <Text style={styles.policyText}>
            얼굴 identity·형태·비율 변경 금지 · 원본 헤어 길이·질감·색상·방향 유지 · 눈·눈썹·얼굴 윤곽을 가리지 않는 범위의 정돈만 허용
          </Text>
        </View>

        <InfoBanner tone="warning" text="지금 생성하면 1회 생성이 사용돼요. 구매 후 1회 무료 재생성이 포함돼요." />
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="수정하기" compact style={styles.editButton} onPress={() => navigation.navigate('S08_Options')} />
        <PrimaryButton label="이 설정으로 생성" loading={submitting} onPress={handleGenerate} style={styles.generateButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 16, paddingBottom: 24 },
  originRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  originImage: { width: 96, height: 126, borderRadius: 11, backgroundColor: colors.surfacePlaceholder },
  originTextCol: { flex: 1, gap: 5 },
  originLabel: { fontSize: 12, fontWeight: '700', color: colors.textTertiary },
  originTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  originNote: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  policyBox: { padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, gap: 8 },
  policyTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  policyText: { fontSize: 13, lineHeight: 13 * 1.6, color: colors.textSecondaryAlt },
  ctaArea: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
  editButton: { width: 112 },
  generateButton: { flex: 1 },
});
