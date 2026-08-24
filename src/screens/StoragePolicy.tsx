import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RETENTION_OPTIONS } from '../api';
import { PrimaryButton, ScreenHeader, SpecList } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useMyPhotos } from '../state/myPhotos';
import { RetentionPolicyId, useSettings } from '../state/settings';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'StoragePolicy'>;

/** 16-05 사진 보관 정책 — 이 서비스의 신뢰를 결정하는 화면. */
export default function StoragePolicy({ navigation }: Props) {
  const orders = useMyPhotos((s) => s.orders);
  const currentPolicy = useSettings((s) => s.retentionPolicy);
  const setRetentionPolicy = useSettings((s) => s.setRetentionPolicy);
  const clearAllPhotos = useMyPhotos((s) => s.clearAll);
  const showToast = useToast((s) => s.show);

  const [selected, setSelected] = useState<RetentionPolicyId>(currentPolicy);

  const stats = useMemo(() => {
    const originalCount = orders.filter((o) => o.originalDeleteLabel !== null).length;
    const resultCount = orders.reduce((sum, o) => sum + o.resultCount, 0);

    // "가장 빠른 자동 삭제" — computed from each active order's expiryDetailLabel
    // (e.g. "9월 20일 (27일 남음)"), not copied from the design's example number.
    let earliestLabel = '없음';
    let minDays = Infinity;
    for (const o of orders) {
      if (o.status === 'expired') continue;
      const match = o.expiryDetailLabel.match(/(\d+)일\s*남음/);
      if (!match) continue;
      const days = parseInt(match[1], 10);
      if (days < minDays) {
        minDays = days;
        earliestLabel = o.expiryDetailLabel.split(' (')[0];
      }
    }

    return { originalCount, resultCount, earliestLabel };
  }, [orders]);

  function handleSave() {
    setRetentionPolicy(selected);
    showToast('보관 정책을 저장했어요');
    navigation.goBack();
  }

  function handleDeleteAll() {
    Alert.alert('지금 모든 사진 삭제', '원본과 결과가 모두 즉시 삭제되고 되돌릴 수 없어요. 계정은 유지돼요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          clearAllPhotos();
          showToast('사진을 모두 삭제했어요');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 보관 정책" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pledgeBox}>
          <Text style={styles.pledgeTitle}>사진은 AI 학습에 쓰지 않아요</Text>
          <Text style={styles.pledgeBody}>
            올린 사진과 만든 사진은 사용자의 주문을 처리하는 데만 쓰이고, 모델 학습이나 다른 사람의 사진 생성에 사용되지 않아요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>보관 기간</Text>
          <View style={styles.box}>
            {RETENTION_OPTIONS.map((opt, i) => {
              const active = opt.id === selected;
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.row, i < RETENTION_OPTIONS.length - 1 && styles.rowDivider, active && styles.rowActive]}
                  onPress={() => setSelected(opt.id)}
                >
                  <View style={styles.rowTextCol}>
                    <Text style={[styles.rowTitle, active && styles.rowTitleActive]}>{opt.label}</Text>
                    <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>{active && <Text style={styles.radioGlyph}>✓</Text>}</View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>지금 저장된 것</Text>
          <SpecList
            boxed
            rows={[
              { label: '올린 원본 사진', value: `${stats.originalCount}장` },
              { label: '만든 사진', value: `${stats.resultCount}장` },
              { label: '가장 빠른 자동 삭제', value: stats.earliestLabel },
            ]}
          />
        </View>

        <View style={styles.keepBox}>
          <Text style={styles.keepLabel}>이렇게 지켜요</Text>
          <Text style={styles.keepRow}>✓ 전송·저장 구간 모두 암호화</Text>
          <Text style={styles.keepRow}>✓ 담당자 열람 기록 남김</Text>
          <Text style={styles.keepRow}>✓ 제3자에게 제공하지 않음</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="이 설정으로 저장" onPress={handleSave} />
        <Text style={styles.deleteAllText} onPress={handleDeleteAll}>
          지금 모든 사진 삭제
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 16 },
  pledgeBox: { gap: 10, padding: 16, borderRadius: 16, backgroundColor: colors.primaryTint },
  pledgeTitle: { fontSize: 15.5, fontWeight: '700', color: colors.primary },
  pledgeBody: { fontSize: 13, lineHeight: 13 * 1.6, color: colors.infoText },
  section: { gap: 9 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowActive: { backgroundColor: colors.primaryTint },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  rowTitleActive: { fontWeight: '700' },
  rowSubtitle: { fontSize: 12, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12, color: colors.infoText },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radioGlyph: { color: colors.inverseText, fontSize: 11 },
  keepBox: { gap: 8, padding: 14, borderRadius: 14, backgroundColor: colors.surfaceSubtle },
  keepLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  keepRow: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  deleteAllText: { textAlign: 'center', fontSize: 13.5, fontWeight: '700', color: colors.error },
});
