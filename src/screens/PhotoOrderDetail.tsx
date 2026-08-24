import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPolicy, PURPOSES } from '../api';
import { DeleteConfirmModal, OriginalPhotoModal, PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { DeleteScope, useMyPhotos } from '../state/myPhotos';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoOrderDetail'>;

/** 13-03 — 사진 상세. One order = one detail screen; primary CTA is always re-download. */
export default function PhotoOrderDetail({ navigation, route }: Props) {
  const order = useMyPhotos((s) => s.getOrder(route.params.orderId));
  const deleteOrder = useMyPhotos((s) => s.deleteOrder);
  const selectPurpose = useSession((s) => s.selectPurpose);
  const showToast = useToast((s) => s.show);
  const [originalVisible, setOriginalVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  if (!order) {
    navigation.goBack();
    return null;
  }

  const purpose = PURPOSES.find((p) => p.id === order.purposeId);

  function handleDelete(scope: DeleteScope) {
    deleteOrder(order!.id, scope);
    setDeleteVisible(false);
    setOriginalVisible(false);
    if (scope === 'both') {
      showToast(`사진을 삭제했어요 · 원본 1장 · 결과 ${order!.resultCount}장 · 인화용 시트`);
      navigation.goBack();
    } else {
      showToast('원본 사진을 삭제했어요');
    }
  }

  // Historical orders don't retain real pixel data in this mock, so re-selecting the
  // purpose/policy is real, but the photo itself falls back to S07's placeholder —
  // there's no stored URI to hand off, only the order's purpose/style.
  async function handleRemakeFromOriginal() {
    setOriginalVisible(false);
    const policy = await getPolicy(order!.purposeId);
    selectPurpose(order!.purposeId, policy.policyId, policy.editLevel);
    navigation.navigate('S04_ShootingGuide');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={order.title} onBack={navigation.goBack} right={<Text style={styles.overflow}>⋯</Text>} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.previewWrap}>
          <PhotoPlaceholder width={168} height={218} radius={12} tone={order.tone} />
        </View>

        <View style={styles.specBox}>
          <View style={[styles.specRow, styles.specRowDivider]}>
            <Text style={styles.specLabel}>목적</Text>
            <Text style={styles.specValue}>{purpose?.title.replace(' 사진', '')} · 35×45mm</Text>
          </View>
          <View style={[styles.specRow, styles.specRowDivider]}>
            <Text style={styles.specLabel}>만든 날짜</Text>
            <Text style={styles.specValue}>{order.createdFullLabel}</Text>
          </View>
          <View style={[styles.specRow, styles.specRowDivider]}>
            <Text style={styles.specLabel}>상품</Text>
            <Text style={styles.specValue}>{order.productFullLabel}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>보관 기한</Text>
            <Text style={styles.specValue}>{order.expiryDetailLabel}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionThumb} />
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle} onPress={() => setOriginalVisible(true)}>
              원본 사진 보기
            </Text>
            <Text style={styles.actionSubtitle}>{order.originalDeleteLabel ?? '원본이 이미 삭제됐어요'}</Text>
          </View>
          <Text style={styles.chevron} onPress={() => setOriginalVisible(true)}>
            ›
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View style={[styles.actionThumb, { backgroundColor: '#DDE9FB' }]} />
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle} onPress={() => navigation.navigate('ResultsGrid', { orderId: order.id })}>
              생성 결과 {order.resultCount}장 보기
            </Text>
            <Text style={styles.actionSubtitle}>{order.watermarked ? '워터마크 포함 미리보기' : '워터마크 없는 원본'}</Text>
          </View>
          <Text style={styles.chevron} onPress={() => navigation.navigate('ResultsGrid', { orderId: order.id })}>
            ›
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>이 사진 삭제</Text>
            <Text style={styles.actionSubtitle}>원본과 결과 모두 삭제돼요</Text>
          </View>
          <Text style={styles.deleteLink} onPress={() => setDeleteVisible(true)}>
            삭제
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="공유" style={styles.shareButton} onPress={() => Alert.alert('공유', '결과 파일을 공유합니다.')} />
        <PrimaryButton label="다시 받기" style={styles.redownloadButton} onPress={() => navigation.navigate('ResultsGrid', { orderId: order.id })} />
      </View>

      <OriginalPhotoModal
        visible={originalVisible}
        onClose={() => setOriginalVisible(false)}
        order={order}
        onDeleteNow={() => {
          setOriginalVisible(false);
          setDeleteVisible(true);
        }}
        onRemake={handleRemakeFromOriginal}
      />

      <DeleteConfirmModal
        visible={deleteVisible}
        onDismiss={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        resultCount={order.resultCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  overflow: { fontSize: 19, color: colors.textTertiary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 11, paddingBottom: 24 },
  previewWrap: { alignItems: 'center', paddingBottom: 5 },
  specBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden', marginBottom: 4 },
  specRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  specRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  specLabel: { fontSize: 13, color: colors.textTertiary, width: 80 },
  specValue: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  actionThumb: { width: 40, height: 52, borderRadius: 7, backgroundColor: colors.surfacePlaceholderAlt },
  actionTextCol: { flex: 1, gap: 2 },
  actionTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  actionSubtitle: { fontSize: 12, color: colors.textTertiary },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  deleteLink: { fontSize: 13, fontWeight: '700', color: colors.error },
  ctaArea: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 28 },
  shareButton: { width: 110 },
  redownloadButton: { flex: 1 },
});
