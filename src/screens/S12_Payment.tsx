import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmOrder, createOrder, PRODUCTS_V2, PURPOSES } from '../api';
import { PhotoOrder } from '../api/mockData';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, TextButton, SpecList } from '../components';
import { formatAddonPrice, formatRetouchLevel, formatSpecCount } from '../components/ProductPicker';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useMyPhotos } from '../state/myPhotos';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S12_Payment'>;

const KRW = new Intl.NumberFormat('ko-KR');

function formatMD(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function formatYMD(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * S12 — 결제. Phase 6: 이 화면은 더 이상 상품을 직접 고르지 않는다. 상품은
 * 이미 S09_FinalConfirm에서 `session.productId`로 확정됐고, 여기서는
 * PRODUCTS_V2에서 그 값을 읽기 전용으로 보여주기만 한다(옛 2-tier `PRODUCTS`
 * 기반 선택 UI는 제거). 결제 성공 시 "새 Generation을 만드는" 게 아니라
 * 지금 보고 있던(activeGenerationId) Generation을 그대로 Paid로 전환한다
 * (안 A) — `markGenerationPaid()`가 이미 Phase 5에 준비돼 있던 액션이다.
 * 성공 후에는 `reset()`/`popToTop()`을 호출하지 않고 `goBack()`만 호출해서,
 * 이 화면 아래 이미 push돼 있던 S11이 같은 generationId를 그대로 구독한 채
 * Paid 렌더로 자동 전환되도록 한다.
 */
export default function S12_Payment({ navigation }: Props) {
  const [paying, setPaying] = useState(false);
  const photo = useSession((s) => s.photo);
  const purposeId = useSession((s) => s.purposeId);
  const productId = useSession((s) => s.productId);
  const activeGenerationId = useSession((s) => s.activeGenerationId);
  const generation = useSession((s) => s.getActiveGeneration());
  const markGenerationPaid = useSession((s) => s.markGenerationPaid);
  const grantPaidRegenCredits = useSession((s) => s.grantPaidRegenCredits);
  const addMyPhotoOrder = useMyPhotos((s) => s.addOrder);
  const isLoggedIn = useAuth((s) => s.isLoggedIn);

  const product = PRODUCTS_V2.find((p) => p.id === productId) ?? PRODUCTS_V2[0];
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const purposeShort = purpose?.title.replace(' 사진', '') ?? '증명사진';

  async function handlePay() {
    if (paying || !activeGenerationId || !productId || !purposeId) return;
    // 목차 14: 로그인은 결제 직전에만 요구한다. Login always pops back here.
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    setPaying(true);
    try {
      const order = await createOrder(productId, activeGenerationId);
      await confirmOrder(order.orderId);

      // 아래 세 상태 변경은 navigation보다 먼저 전부 끝낸다 — goBack() 이후에도
      // S11이 곧바로 최신 값을 반영해야 하기 때문.
      markGenerationPaid(activeGenerationId); // 안 A: 기존 Generation을 그대로 Paid로 전환(새 Generation 생성 아님)
      grantPaidRegenCredits(product.freeRegenCount); // Paid Regen Credit만 지급 — Preview Credit은 손대지 않음

      const paidAt = new Date();
      const expiresAt = new Date(order.expiresAt);
      const myPhotoOrder: PhotoOrder = {
        id: order.orderId,
        purposeId,
        title: purpose?.title ?? purposeShort,
        createdLabel: formatMD(paidAt),
        createdFullLabel: formatYMD(paidAt),
        resultCount: generation?.results?.length ?? 1,
        productShort: product.name,
        productFullLabel: `${product.name} · ${KRW.format(product.price)}원`,
        status: 'purchased',
        metaLabel: `${formatMD(expiresAt)}까지 다시 받기 가능`,
        expiryDetailLabel: `${formatMD(expiresAt)} (${product.retentionDays}일 남음)`,
        // 원본 자동 삭제 시점은 이 mock에 정의된 정책이 없어(고정 상수를 임의로
        // 만들지 않음) 비워둔다 — PhotoOrderDetail은 null을 "이미 삭제됨/해당
        // 없음"으로 이미 처리하고 있다(order_passport_0702 mock 참고).
        originalDeleteLabel: null,
        originalDeleteDetailLabel: null,
        tone: 'primary',
        watermarked: false,
      };
      addMyPhotoOrder(myPhotoOrder);

      navigation.goBack(); // S12만 닫는다 — 아래 S11이 같은 generationId로 Paid 렌더 표시
    } catch {
      Alert.alert('결제에 실패했어요', '다시 시도해 주세요.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="결과 다운로드" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.thumbWrap}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <PhotoPlaceholder width={150} height={196} radius={12} tone="subtle" />
          )}
        </View>

        <View style={styles.productSummary}>
          <Text style={styles.productSummaryLabel}>선택한 상품</Text>
          <View style={styles.productSummaryRow}>
            <Text style={styles.productSummaryName}>{product.name}</Text>
            <Text style={styles.productSummaryPrice}>{KRW.format(product.price)}원</Text>
          </View>
          <Text style={styles.productSummarySubtitle}>
            목적/규격 {formatSpecCount(product.specCount)} · {formatRetouchLevel(product.retouchLevel)} 보정 · 무료 재생성{' '}
            {product.freeRegenCount}회
          </Text>
        </View>

        <SpecList
          boxed
          rows={[
            { label: '파일 형식', value: 'JPG · 300dpi' },
            { label: '규격', value: `${purposeShort} 35×45mm` },
            { label: '추가 재생성', value: formatAddonPrice(product.addonRegenPrice) },
          ]}
        />

        <TextButton label="다른 파일 형식 선택" />
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label={`${KRW.format(product.price)}원 결제하고 다운로드`} loading={paying} onPress={handlePay} />
        <Text style={styles.caption}>결제 완료 후 즉시 다운로드가 준비돼요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 16, paddingBottom: 24 },
  thumbWrap: { alignSelf: 'center' },
  thumbImage: { width: 150, height: 196, borderRadius: 12, backgroundColor: colors.surfacePlaceholder },
  productSummary: { padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.primaryTint, gap: 6 },
  productSummaryLabel: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  productSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productSummaryName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  productSummaryPrice: { fontSize: 17, fontWeight: '700', color: colors.primary },
  productSummarySubtitle: { fontSize: 12.5, color: colors.textSecondaryAlt, lineHeight: 12.5 * 1.4 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 8 },
  caption: { textAlign: 'center', fontSize: 12, color: colors.textDisabled },
});
