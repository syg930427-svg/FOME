import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGeneration, PRODUCTS_V2, PURPOSES } from '../api';
import { CompositionId, RetouchLevel } from '../api/types';
import {
  InfoBanner,
  PhotoPlaceholder,
  PolicyDetailModal,
  PrimaryButton,
  ProductCompareModal,
  ProductPicker,
  ScreenHeader,
  SecondaryButton,
  SpecList,
  TextButton,
} from '../components';
import { formatRetouchLevel } from '../components/ProductPicker';
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
const COMPOSITION_LABEL: Record<CompositionId, string> = {
  faceCenter: '얼굴 중심',
  faceShoulders: '어깨까지',
  chestUp: '가슴 위',
  upperBody: '상반신',
};
const RETOUCH_LABEL: Record<RetouchLevel, string> = { basic: '기본', premium: '고급' };

/**
 * S09(07-01) — 상품 선택 + 최종 설정. PhotoFlow 최종 스펙: 이 화면은 결제
 * 화면이 아니다 — [미리보기 만들기]는 Preview Credit만 소모하고 결제는
 * 발생하지 않는다("지금은 결제되지 않아요"). 1/4/8장 개념(GenerationPackagePicker/
 * GenerationConfirmSheet/payForGeneration)은 여기서 완전히 제거됐다 — 단
 * `session.generationCount`/`GENERATION_PACKAGES` 자체는 S10/S12가 아직
 * 참조하고 있어(이번 Phase 대상 아님) 삭제하지 않고, 여기선 결과 1장짜리
 * Preview라는 의미로 1을 고정 전달한다.
 */
export default function S09_FinalConfirm({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const source = useSession((s) => s.source);
  const photo = useSession((s) => s.photo);
  const photoId = useSession((s) => s.photoId);
  const policyId = useSession((s) => s.policyId);
  const options = useSession((s) => s.options);
  const setOption = useSession((s) => s.setOption);
  const setGenerationCount = useSession((s) => s.setGenerationCount);
  const setGeneration = useSession((s) => s.setGeneration);
  const productId = useSession((s) => s.productId);
  const setProductId = useSession((s) => s.setProductId);
  const previewCreditRemaining = useSession((s) => s.previewCreditRemaining);
  const consumePreviewCredit = useSession((s) => s.consumePreviewCredit);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const purposeShort = purpose?.title.replace(' 사진', '') ?? '증명사진';

  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  // RULE-07: generation fires exactly once, from this screen only. The flag
  // guards against a double tap racing two /v1/generations calls.
  const [submitting, setSubmitting] = useState(false);

  // 첫 진입 시 상품 미선택 상태면 베이직을 기본 선택으로 명시(사용자가 항상 뭔가 고른 상태로 시작).
  useEffect(() => {
    if (!productId) setProductId('basic');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProduct = PRODUCTS_V2.find((p) => p.id === productId) ?? PRODUCTS_V2[0];
  // 상품이 지원하는 것보다 높은 보정을 골랐는지 검증 — S08이 아니라 여기서, 상품을 아는 시점에만 확인한다.
  const retouchIncompatible = options.retouch === 'premium' && selectedProduct.retouchLevel === 'basic';
  const canMakePreview = !retouchIncompatible && previewCreditRemaining > 0;

  async function handleMakePreview() {
    if (submitting || !photoId || !policyId || !canMakePreview) return;
    setSubmitting(true);
    try {
      setGenerationCount(1); // Preview = 결과 1장. S10/S12가 아직 쓰는 필드라 값만 맞춰 넘겨준다.
      // Phase 4 사전 확인 ②: createGeneration이 성공한 뒤에만 Credit을 차감한다 — 실패(reject)
      // 시엔 아래 catch로 빠져 consumePreviewCredit() 자체가 실행되지 않으므로 별도 롤백이 필요 없다.
      const { generationId, etaSeconds } = await createGeneration(
        photoId,
        policyId,
        { hair: options.hair, expression: options.expression, background: options.background },
        1
      );
      consumePreviewCredit();
      setGeneration({ id: generationId, status: 'queued', steps: null, etaSeconds });
      navigation.navigate('GenerationStarted', { generationId });
    } catch {
      Alert.alert('생성을 시작하지 못했어요', '잠시 후 다시 시도해 주세요. Preview Credit은 차감되지 않았어요.');
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
            <Text style={styles.originNote}>이 원본으로 생성해요</Text>
          </View>
        </View>

        <SpecList
          boxed
          rows={[
            { label: '목적', value: purposeShort },
            { label: '구도', value: COMPOSITION_LABEL[options.composition] },
            { label: '헤어', value: HAIR_LABEL[options.hair] },
            { label: '얼굴', value: 'Identity 유지' },
            { label: '표정', value: '자연스러운 정면' },
            { label: '배경', value: BACKGROUND_LABEL[options.background] },
            { label: '보정', value: RETOUCH_LABEL[options.retouch] },
          ]}
        />

        <View style={styles.policyBox}>
          <View style={styles.policyBoxHeader}>
            <Text style={styles.policyTitle}>적용되는 정책 · LEVEL {editLevel}</Text>
            <Text style={styles.policyLink} onPress={() => setPolicyModalVisible(true)}>
              자세히 보기
            </Text>
          </View>
          <Text style={styles.policyText}>
            얼굴 identity·형태·비율 변경 금지 · 원본 헤어 길이·질감·색상·방향 유지 · 눈·눈썹·얼굴 윤곽을 가리지 않는 범위의 정돈만 허용
          </Text>
        </View>

        <ProductPicker
          products={PRODUCTS_V2}
          selectedId={productId}
          onSelect={setProductId}
          onCompare={() => setCompareVisible(true)}
        />

        {retouchIncompatible && (
          <View style={styles.warnBlock}>
            <InfoBanner
              tone="warning"
              text={`${selectedProduct.name} 상품은 '${formatRetouchLevel('premium')}' 보정을 지원하지 않아요. 기본 보정으로 바꾸거나 더 높은 등급의 상품을 선택해 주세요.`}
            />
            <TextButton label="기본 보정으로 변경" onPress={() => setOption('retouch', 'basic')} />
          </View>
        )}

        <InfoBanner tone="info" text="지금은 결제되지 않아요. 미리보기 확인 후 구매를 결정할 수 있어요." />
      </ScrollView>

      <View style={styles.ctaArea}>
        <View style={styles.ctaButtonsRow}>
          <SecondaryButton label="수정하기" compact style={styles.editButton} onPress={() => navigation.navigate('S08_Options')} />
          <PrimaryButton
            label="미리보기 만들기"
            style={styles.generateButton}
            loading={submitting}
            disabled={!canMakePreview}
            onPress={handleMakePreview}
          />
        </View>
        <Text style={styles.creditCaption}>
          {previewCreditRemaining > 0 ? `미리보기 ${previewCreditRemaining}회 남음` : '미리보기 크레딧을 모두 사용했어요'}
        </Text>
      </View>

      <PolicyDetailModal
        visible={policyModalVisible}
        onClose={() => setPolicyModalVisible(false)}
        purposeId={purposeId}
        purposeShort={purposeShort}
      />

      <ProductCompareModal
        visible={compareVisible}
        onClose={() => setCompareVisible(false)}
        products={PRODUCTS_V2}
        selectedId={productId}
        onSelect={(id) => {
          setProductId(id);
          setCompareVisible(false);
        }}
      />
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
  policyBoxHeader: { flexDirection: 'row', alignItems: 'center' },
  policyTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  policyLink: { fontSize: 12.5, fontWeight: '600', color: colors.primary },
  policyText: { fontSize: 13, lineHeight: 13 * 1.6, color: colors.textSecondaryAlt },
  warnBlock: { gap: 4 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 8 },
  ctaButtonsRow: { flexDirection: 'row', gap: 10 },
  editButton: { width: 112 },
  generateButton: { flex: 1 },
  creditCaption: { textAlign: 'center', fontSize: 12, color: colors.textDisabled },
});
