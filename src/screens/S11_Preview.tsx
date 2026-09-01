import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, SpecList, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { Options, useSession } from '../state/session';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S11_Preview'>;

const HAIR_LABEL: Record<Options['hair'], string> = {
  original: '원본 유지',
  tidy: '원본 헤어 특성 유지 + 정돈',
  flyaway: '잔머리 정리',
};
const BACKGROUND_LABEL: Record<Options['background'], string> = {
  white: '흰색',
  lightGray: '밝은 회색',
  original: '원본 유지',
};

type Tab = 'result' | 'compare' | 'settings';

/**
 * S11 — Preview/Paid 결과. Phase 5 전에는 이 화면이 `session.generation`을
 * 전혀 읽지 않고 고정 PhotoPlaceholder만 보여주고 있었다(사전 조사에서 확인한
 * 핵심 문제). 이제 `activeGenerationId`로 실제 Generation 이력을 조회해서
 * 읽고, `generation.isPaid`로 PREVIEW/PAID 두 렌더를 하나의 화면 안에서
 * 전환한다 — 별도 결과 화면을 두 개 만들지 않는다(PhotoFlow 최종 스펙 §3).
 * 결제 자체(Phase 6)가 아직 없어 오늘은 `isPaid`가 늘 false로 보이는 게
 * 정상이다 — S12가 아직 `markGenerationPaid()`를 호출하지 않기 때문.
 */
export default function S11_Preview({ navigation, route }: Props) {
  const [tab, setTab] = useState<Tab>('result');
  const photo = useSession((s) => s.photo);
  const options = useSession((s) => s.options);
  const purposeId = useSession((s) => s.purposeId);
  const activeGenerationId = useSession((s) => s.activeGenerationId);
  const setActiveGenerationId = useSession((s) => s.setActiveGenerationId);
  const generation = useSession((s) => s.getActiveGeneration());
  const previewCreditRemaining = useSession((s) => s.previewCreditRemaining);
  const paidRegenCreditRemaining = useSession((s) => s.paidRegenCreditRemaining);
  const showToast = useToast((s) => s.show);

  // route param(딥링크/My Photos에서 특정 결과를 지정하는 경우)이 있고 지금
  // active와 다르면 그쪽으로 옮긴다. 정상 흐름(S10 "결과 확인하기")은 이미
  // 같은 id를 넘기므로 이 분기는 보통 아무 일도 안 한다.
  useEffect(() => {
    const paramId = route.params?.generationId;
    if (paramId && paramId !== activeGenerationId) {
      setActiveGenerationId(paramId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.generationId]);

  const isPaid = generation?.isPaid ?? false;

  function handleDownload() {
    // 실제 다운로드는 이번 Phase 범위 밖(getDownloadUrl 미연결) — 눌러도 안전하게 안내만.
    showToast('고화질 다운로드는 다음 업데이트에서 제공돼요');
  }

  if (!generation || generation.status !== 'done') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <ScreenHeader title="결과 확인" onBack={navigation.goBack} />
        <View style={styles.emptyBody}>
          <Text style={styles.emptyText}>표시할 결과를 찾을 수 없어요.</Text>
          <SecondaryButton label="홈으로" onPress={() => navigation.popToTop()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="결과 확인"
        onBack={navigation.goBack}
        right={<Text style={[styles.badge, isPaid && styles.badgePaid]}>{isPaid ? '구매 완료' : 'Preview'}</Text>}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {tab === 'settings' ? (
          <SpecList
            boxed
            rows={[
              { label: '목적', value: purposeId ?? '-' },
              { label: '헤어', value: HAIR_LABEL[options.hair] },
              { label: '배경', value: BACKGROUND_LABEL[options.background] },
            ]}
          />
        ) : tab === 'compare' && photo ? (
          <Image source={{ uri: photo.uri }} style={styles.resultImage} resizeMode="cover" />
        ) : (
          <View style={styles.resultWrap}>
            <PhotoPlaceholder width="100%" height={352} radius={16} tone={isPaid ? 'primary' : 'subtle'} />
            <View style={[styles.resultBadge, isPaid && styles.resultBadgePaid]}>
              <Text style={[styles.resultBadgeText, isPaid && styles.resultBadgeTextPaid]}>
                {isPaid ? '고화질 · 워터마크 없음' : '워터마크 미리보기'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === 'result' && styles.tabActive]} onPress={() => setTab('result')}>
            <Text style={[styles.tabText, tab === 'result' && styles.tabTextActive]}>결과</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === 'compare' && styles.tabActive]} onPress={() => setTab('compare')}>
            <Text style={[styles.tabText, tab === 'compare' && styles.tabTextActive]}>원본 비교</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === 'settings' && styles.tabActive]} onPress={() => setTab('settings')}>
            <Text style={[styles.tabText, tab === 'settings' && styles.tabTextActive]}>설정 보기</Text>
          </Pressable>
        </View>

        <View style={styles.appliedBox}>
          <Text style={styles.appliedLabel}>이번 생성에 적용된 설정</Text>
          <Text style={styles.appliedText}>
            {HAIR_LABEL[options.hair]} · Identity 유지 · 자연스러운 정면 · {BACKGROUND_LABEL[options.background]} 배경
          </Text>
        </View>

        <View style={styles.creditBox}>
          <Text style={styles.creditLabel}>{isPaid ? '무료 재생성 남음' : 'Preview 남음'}</Text>
          <Text style={styles.creditValue}>{isPaid ? paidRegenCreditRemaining : previewCreditRemaining}회</Text>
        </View>

        {!isPaid && (
          <View style={styles.satisfyBlock}>
            <Text style={styles.satisfyTitle}>만족하시나요?</Text>
            <Text style={styles.satisfySubtitle}>얼굴과 헤어 디테일을 확대해서 확인해 보세요.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.ctaArea}>
        {isPaid ? (
          <>
            <PrimaryButton label="고화질 다운로드" onPress={handleDownload} />
            <SecondaryButton label="옵션 수정하고 다시 생성" onPress={() => navigation.navigate('S08_Options')} />
            <View style={styles.linkRow}>
              <TextButton label="내 사진" onPress={() => navigation.navigate('MyPhotos')} />
              <TextButton label="홈으로" onPress={() => navigation.popToTop()} />
            </View>
          </>
        ) : (
          <>
            <PrimaryButton label="이 결과로 구매하기" onPress={() => navigation.navigate('S12_Payment')} />
            <SecondaryButton label="옵션 수정하고 다시 생성" onPress={() => navigation.navigate('S08_Options')} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  badge: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  badgePaid: { color: colors.primary, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 14, paddingBottom: 24 },
  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 },
  emptyText: { fontSize: 14, color: colors.textTertiary, textAlign: 'center' },
  resultWrap: { width: '100%' },
  resultImage: { width: '100%', height: 352, borderRadius: 16, backgroundColor: colors.surfacePlaceholder },
  resultBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  resultBadgePaid: { backgroundColor: colors.primaryTint },
  resultBadgeText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  resultBadgeTextPaid: { color: colors.primary, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, height: 42, borderRadius: 11, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.inverseBg },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.inverseText, fontWeight: '700' },
  appliedBox: { padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 6 },
  appliedLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  appliedText: { fontSize: 13, lineHeight: 13 * 1.55, color: colors.textSecondaryAlt },
  creditBox: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  creditLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  creditValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
  satisfyBlock: { gap: 4 },
  satisfyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  satisfySubtitle: { fontSize: 13, color: colors.textTertiary, lineHeight: 13 * 1.5 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 2 },
});
