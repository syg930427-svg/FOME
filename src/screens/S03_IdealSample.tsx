import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GUIDES } from '../api/mockData';
import { PURPOSES } from '../api';
import { InfoBanner, PhotoPlaceholder, PrimaryButton, ScreenHeader, TextButton } from '../components';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S03_IdealSample'>;

const GOOD_CHECKS = [
  '정면 · 고개 기울임 없음',
  '눈과 시선이 카메라를 향함',
  '얼굴 윤곽이 명확하게 드러남',
  '머리카락이 눈·눈썹을 가리지 않음',
];

const BAD_REASONS = [
  '고개가 한쪽으로 기울어졌어요',
  '머리카락이 눈·눈썹을 가렸어요',
  '한쪽 얼굴에 강한 그림자가 있어요',
  '웃는 표정으로 얼굴 형태가 달라졌어요',
  '카메라와 너무 가까워 얼굴이 왜곡됐어요',
];

const BAD_EXAMPLES = [
  { id: 'tilt', badge: '고개 기울임', rotate: true },
  { id: 'hair', badge: '가려진 눈·눈썹', rotate: false },
  { id: 'shadow', badge: '강한 그림자', rotate: false },
  { id: 'smile', badge: '과도한 표정', rotate: false },
];

const DETAIL_ZOOM = ['머리', '눈·눈썹', '입·표정', '어깨'];

type Tab = 'good' | 'bad' | 'detail';

/**
 * 「사진 준비 기준」 자세히 보기 — S02(메인 화면)의 "자세히 보기"에서만 진입하는
 * 순수 정보 화면. 사진 제작을 시작하는 화면이 아니라서 하단 CTA는 다음 단계로
 * 보내지 않고 그대로 S02로 돌아간다(`goBack`). "촬영 기준" 탭은 구 S04_
 * ShootingGuide의 6개 항목(GUIDES)을 흡수한 것 — 별도 화면 없이 여기 한 곳에서
 * 좋은 예시·피해야 할 예시·세부 기준을 모두 확인할 수 있다.
 */
export default function S03_IdealSample({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('good');
  const [badIndex, setBadIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const purposeId = useSession((s) => s.purposeId);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const purposeShort = purpose?.title.replace(' 사진', '') ?? '증명사진';
  const selectedBad = BAD_EXAMPLES[badIndex];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 준비 기준" onBack={navigation.goBack} />

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'good' && styles.tabActive]} onPress={() => setTab('good')}>
          <Text style={[styles.tabText, tab === 'good' && styles.tabTextActive]}>좋은 예시</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'bad' && styles.tabActive]} onPress={() => setTab('bad')}>
          <Text style={[styles.tabText, tab === 'bad' && styles.tabTextActive]}>피해야 할 예시</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'detail' && styles.tabActive]} onPress={() => setTab('detail')}>
          <Text style={[styles.tabText, tab === 'detail' && styles.tabTextActive]}>촬영 기준</Text>
        </Pressable>
      </View>

      {tab === 'good' ? (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.sampleWrap}>
            <PhotoPlaceholder width="100%" height={300} radius={16} />
            <Pressable style={styles.zoomHint} onPress={() => setZoomVisible(true)}>
              <Text style={styles.zoomHintText}>탭하면 확대</Text>
            </Pressable>
          </View>

          <View style={styles.checklist}>
            {GOOD_CHECKS.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Text style={styles.checkGlyph}>✓</Text>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>

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

          <InfoBanner
            tone="error"
            text="고개 기울임 · 얼굴을 가린 머리카락 · 강한 그림자 · 과도한 미소 · 지나치게 가까운 촬영"
          />
        </ScrollView>
      ) : tab === 'bad' ? (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.sampleWrap}>
            <PhotoPlaceholder
              width="100%"
              height={300}
              radius={16}
              tone="subtle"
              style={selectedBad.rotate ? styles.badImageTilt : undefined}
            />
            <View style={styles.badBadge}>
              <Text style={styles.badBadgeText}>{selectedBad.badge}</Text>
            </View>
            <Pressable style={styles.zoomHintDanger} onPress={() => setZoomVisible(true)}>
              <Text style={styles.zoomHintDangerText}>탭하면 확대</Text>
            </Pressable>
          </View>

          <View style={styles.badThumbRow}>
            {BAD_EXAMPLES.map((ex, i) => (
              <Pressable
                key={ex.id}
                style={[styles.badThumb, i === badIndex && styles.badThumbSelected]}
                onPress={() => setBadIndex(i)}
              />
            ))}
          </View>

          <View style={styles.checklist}>
            {BAD_REASONS.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Text style={styles.badGlyph}>✕</Text>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>

          <InfoBanner tone="info" text="이 기준은 참고용 안내예요. 앱이 사진을 자동으로 합격·불합격 판정하지 않아요." />
        </ScrollView>
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {GUIDES.map((item) => (
            <View key={item.id} style={styles.guideRow}>
              <Text style={styles.guideTitle}>{item.title}</Text>
              <View style={styles.bulletList}>
                {item.description.split(' · ').map((line) => (
                  <Text key={line} style={styles.bullet}>
                    · {line}
                  </Text>
                ))}
              </View>
              {item.warning ? <InfoBanner tone="warning" text={item.warning} /> : null}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.ctaArea}>
        {tab === 'bad' && <TextButton label="좋은 예시와 비교하기" onPress={() => setTab('good')} />}
        <PrimaryButton label="확인했어요" onPress={navigation.goBack} />
      </View>

      <ImageZoomModal
        visible={zoomVisible}
        onClose={() => setZoomVisible(false)}
        title="이상적인 샘플"
        badge={`${purposeShort} · ${tab === 'good' ? '이상적인 샘플' : selectedBad.badge}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.screenPadding, paddingBottom: 14 },
  tab: { flex: 1, height: 40, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.inverseBg },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.inverseText, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, gap: 16, paddingBottom: 24 },
  sampleWrap: { width: '100%' },
  badImageTilt: { transform: [{ rotate: '-7deg' }] },
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
  zoomHintDanger: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  zoomHintDangerText: { fontSize: 11, fontWeight: '600', color: colors.errorStrongAlt },
  badBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  badBadgeText: { fontSize: 11, fontWeight: '700', color: colors.errorStrong },
  badThumbRow: { flexDirection: 'row', gap: 8 },
  badThumb: { flex: 1, height: 84, borderRadius: 10, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder },
  badThumbSelected: { borderWidth: 1.5, borderColor: colors.error },
  checklist: { gap: 9 },
  checkRow: { flexDirection: 'row', gap: 9 },
  checkGlyph: { color: colors.success, fontWeight: '700', fontSize: 14 },
  badGlyph: { color: colors.error, fontWeight: '700', fontSize: 14 },
  checkText: { flex: 1, fontSize: 14, lineHeight: 14 * 1.4, color: colors.textPrimary },
  detailSection: { gap: 9 },
  detailLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  detailGrid: { flexDirection: 'row', gap: 8 },
  detailCell: { flex: 1, gap: 5 },
  detailCellLabel: { fontSize: 11, textAlign: 'center', color: colors.textSecondaryAlt },
  guideRow: { gap: 8, paddingBottom: 14, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  guideTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  bulletList: { gap: 5 },
  bullet: { fontSize: 13.5, lineHeight: 13.5 * 1.5, color: '#3B4A63' },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
});
