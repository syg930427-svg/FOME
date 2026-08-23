import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmOrder, createOrder, PRODUCTS } from '../api';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, TextButton, SpecList } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S12_Payment'>;

const KRW = new Intl.NumberFormat('ko-KR');

export default function S12_Payment({ navigation }: Props) {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [paying, setPaying] = useState(false);
  const photo = useSession((s) => s.photo);
  const markPaid = useSession((s) => s.markPaid);
  const reset = useSession((s) => s.reset);
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  async function handlePay() {
    if (paying) return;
    setPaying(true);
    try {
      const order = await createOrder(product.id);
      await confirmOrder(order.orderId);
      markPaid(order.orderId);
      Alert.alert('결제가 완료됐어요', '고화질 다운로드가 준비됐어요.', [
        {
          text: '확인',
          onPress: () => {
            // README: after payment, back must go home with the payment
            // screen popped from the stack, not sit re-enterable in history.
            reset();
            navigation.popToTop();
          },
        },
      ]);
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

        <View style={styles.products}>
          {PRODUCTS.map((p) => {
            const selected = p.id === productId;
            return (
              <Pressable
                key={p.id}
                style={[styles.productCard, selected && styles.productCardSelected]}
                onPress={() => setProductId(p.id)}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <Text style={styles.radioGlyph}>✓</Text>}
                </View>
                <View style={styles.productTextCol}>
                  <Text style={styles.productTitle}>{p.title}</Text>
                  <Text style={styles.productDescription}>{p.description}</Text>
                </View>
                <Text style={[styles.productPrice, selected && styles.productPriceSelected]}>
                  {KRW.format(p.price)}원
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SpecList
          boxed
          rows={[
            { label: '파일 형식', value: 'JPG · 300dpi' },
            { label: '규격', value: '여권 35×45mm' },
            { label: '추가 재생성', value: '건당 500원' },
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
  products: { gap: 10 },
  productCard: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  productCardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  radioGlyph: { color: colors.inverseText, fontSize: 12 },
  productTextCol: { flex: 1, gap: 3 },
  productTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  productDescription: { fontSize: 13, color: colors.textSecondaryAlt },
  productPrice: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  productPriceSelected: { color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 8 },
  caption: { textAlign: 'center', fontSize: 12, color: colors.textDisabled },
});
