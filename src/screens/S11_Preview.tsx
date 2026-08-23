import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, SpecList } from '../components';
import { RootStackParamList } from '../navigation/types';
import { Options, useSession } from '../state/session';
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

export default function S11_Preview({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('result');
  const photo = useSession((s) => s.photo);
  const options = useSession((s) => s.options);
  const purposeId = useSession((s) => s.purposeId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="결과 확인" onBack={navigation.goBack} right={<Text style={styles.badge}>1차 생성</Text>} />

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
            <PhotoPlaceholder width="100%" height={352} radius={16} tone="subtle" />
            <View style={styles.zoomHint}>
              <Text style={styles.zoomHintText}>확대해서 확인</Text>
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

        <View style={styles.satisfyBlock}>
          <Text style={styles.satisfyTitle}>만족하시나요?</Text>
          <Text style={styles.satisfySubtitle}>얼굴과 헤어 디테일을 확대해서 확인해 보세요.</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="고화질 다운로드 구매" onPress={() => navigation.navigate('S12_Payment')} />
        <SecondaryButton label="옵션 수정 후 재생성" onPress={() => navigation.navigate('S08_Options')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  badge: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 14, paddingBottom: 24 },
  resultWrap: { width: '100%' },
  resultImage: { width: '100%', height: 352, borderRadius: 16, backgroundColor: colors.surfacePlaceholder },
  zoomHint: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  zoomHintText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, height: 42, borderRadius: 11, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.inverseBg },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.inverseText, fontWeight: '700' },
  appliedBox: { padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 6 },
  appliedLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  appliedText: { fontSize: 13, lineHeight: 13 * 1.55, color: colors.textSecondaryAlt },
  satisfyBlock: { gap: 4 },
  satisfyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  satisfySubtitle: { fontSize: 13, color: colors.textTertiary, lineHeight: 13 * 1.5 },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
