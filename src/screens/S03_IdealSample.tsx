import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoBanner, PhotoPlaceholder, PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S03_IdealSample'>;

const GOOD_CHECKS = [
  '정면 · 고개 기울임 없음',
  '눈과 시선이 카메라를 향함',
  '얼굴 윤곽이 명확하게 드러남',
  '머리카락이 눈·눈썹을 가리지 않음',
];

const DETAIL_ZOOM = ['머리', '눈·눈썹', '입·표정', '어깨'];

export default function S03_IdealSample({ navigation }: Props) {
  const [tab, setTab] = useState<'good' | 'bad'>('good');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="이상적인 샘플" onBack={navigation.goBack} />

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'good' && styles.tabActive]} onPress={() => setTab('good')}>
          <Text style={[styles.tabText, tab === 'good' && styles.tabTextActive]}>좋은 예시</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'bad' && styles.tabActive]} onPress={() => setTab('bad')}>
          <Text style={[styles.tabText, tab === 'bad' && styles.tabTextActive]}>피해야 할 예시</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.sampleWrap}>
          <PhotoPlaceholder width="100%" height={300} radius={16} />
          <View style={styles.zoomHint}>
            <Text style={styles.zoomHintText}>탭하면 확대</Text>
          </View>
        </View>

        {tab === 'good' ? (
          <View style={styles.checklist}>
            {GOOD_CHECKS.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Text style={styles.checkGlyph}>✓</Text>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <InfoBanner
            tone="error"
            text="고개 기울임 · 얼굴을 가린 머리카락 · 강한 그림자 · 과도한 미소 · 지나치게 가까운 촬영"
          />
        )}

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>세부 확대</Text>
          <View style={styles.detailGrid}>
            {DETAIL_ZOOM.map((label) => (
              <View key={label} style={styles.detailCell}>
                <PhotoPlaceholder width="100%" height={66} radius={9} />
                <Text style={styles.detailCellLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {tab === 'good' && (
          <InfoBanner
            tone="error"
            text="고개 기울임 · 얼굴을 가린 머리카락 · 강한 그림자 · 과도한 미소 · 지나치게 가까운 촬영"
          />
        )}
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="촬영 가이드 보기" onPress={() => navigation.navigate('S04_ShootingGuide')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  tab: { flex: 1, height: 40, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.inverseBg },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.inverseText, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, gap: 16, paddingBottom: 24 },
  sampleWrap: { width: '100%' },
  zoomHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  zoomHintText: { fontSize: 11, fontWeight: '600', color: colors.textSecondaryAlt },
  checklist: { gap: 9 },
  checkRow: { flexDirection: 'row', gap: 9 },
  checkGlyph: { color: colors.success, fontWeight: '700', fontSize: 14 },
  checkText: { fontSize: 14, lineHeight: 14 * 1.4, color: colors.textPrimary },
  detailSection: { gap: 9 },
  detailLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  detailGrid: { flexDirection: 'row', gap: 8 },
  detailCell: { flex: 1, gap: 5 },
  detailCellLabel: { fontSize: 11, textAlign: 'center', color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
