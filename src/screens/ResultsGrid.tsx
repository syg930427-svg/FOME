import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useMyPhotos } from '../state/myPhotos';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultsGrid'>;

/** 13-05 — 생성 결과 보기. Multi-select grid; save/share reuse the same mocked confirmation pattern as S12. */
export default function ResultsGrid({ navigation, route }: Props) {
  const order = useMyPhotos((s) => s.getOrder(route.params.orderId));
  const [selected, setSelected] = useState<Set<number>>(new Set(order ? [0, 1] : []));

  if (!order) {
    navigation.goBack();
    return null;
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="생성 결과" onBack={navigation.goBack} right={<Text style={styles.countBadge}>{selected.size}장 선택</Text>} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.grid}>
          {Array.from({ length: order.resultCount }).map((_, i) => {
            const active = selected.has(i);
            return (
              <Pressable key={i} style={[styles.cell, active && styles.cellSelected]} onPress={() => toggle(i)}>
                <PhotoPlaceholder width={88} height={146} radius={0} tone={active ? 'primary' : 'neutral'} />
                <View style={[styles.checkDot, active ? styles.checkDotActive : styles.checkDotInactive]}>
                  {active && <Text style={styles.checkDotGlyph}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.printRow}
          onPress={() => Alert.alert('인화용 시트', '4×6인치 시트에 6장을 배치해 준비했어요.')}
        >
          <View style={styles.printIconWrap}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={styles.printIconCell} />
            ))}
          </View>
          <View style={styles.printTextCol}>
            <Text style={styles.printTitle}>인화용 시트</Text>
            <Text style={styles.printSubtitle}>4×6인치 · 6장 배치</Text>
          </View>
          <Text style={styles.printLink}>받기</Text>
        </Pressable>

        <View style={styles.infoBox}>
          <Text style={styles.infoGlyph}>i</Text>
          <Text style={styles.infoText}>
            {order.originalDeleteLabel ? '보관 기한까지 몇 번이든 다시 받을 수 있어요.' : order.metaLabel} 추가 결제는 없어요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="공유" style={styles.shareButton} onPress={() => Alert.alert('공유', `${selected.size}장을 공유합니다.`)} />
        <PrimaryButton
          label={`${selected.size}장 저장`}
          disabled={selected.size === 0}
          style={styles.saveButton}
          onPress={() => Alert.alert('저장 완료', `${selected.size}장을 앨범에 저장했어요.`)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  countBadge: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 16, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47%', height: 196, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  cellSelected: { borderWidth: 2, borderColor: colors.primary },
  checkDot: { position: 'absolute', top: 9, left: 9, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkDotActive: { backgroundColor: colors.primary },
  checkDotInactive: { borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: 'rgba(255,255,255,0.8)' },
  checkDotGlyph: { color: colors.inverseText, fontSize: 12 },
  printRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  printIconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primaryTint, flexDirection: 'row', flexWrap: 'wrap', padding: 6, gap: 2 },
  printIconCell: { width: '28%', height: '28%', borderRadius: 1, backgroundColor: '#DDE9FB' },
  printTextCol: { flex: 1, gap: 2 },
  printTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  printSubtitle: { fontSize: 12, color: colors.textTertiary },
  printLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 28 },
  shareButton: { width: 110 },
  saveButton: { flex: 1 },
});
