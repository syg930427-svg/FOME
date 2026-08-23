import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, SelectionCard } from '../../components';
import { RootStackParamList } from '../../navigation/types';
import { useAppEntry } from '../../state/appEntry';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const PAGE_COUNT = 3;

const ONBOARDING_PURPOSES = [
  { title: '여권 사진', description: '가장 엄격한 규격 · 정면 · 무표정' },
  { title: '신분증 · 면허증', description: '제출 기관 규격에 맞춘 정면 사진' },
  { title: '취업 · 면접 사진', description: '인상과 분위기를 함께 고려한 사진' },
];

export default function Onboarding({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const completeOnboarding = useAppEntry((s) => s.completeOnboarding);

  function goToPage(index: number) {
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    setPage(index);
  }

  function finish() {
    completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'S01_Purpose' }] });
  }

  function handleMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {page > 0 ? (
          <Pressable onPress={() => goToPage(page - 1)} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
        {page < PAGE_COUNT - 1 ? (
          <Pressable style={styles.skip} onPress={finish} hitSlop={8}>
            <Text style={styles.skipLabel}>건너뛰기</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.pager}
      >
        <View style={{ width }}>
          <PageIntro />
        </View>
        <View style={{ width }}>
          <PagePurpose />
        </View>
        <View style={{ width }}>
          <PageIdentity />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <PrimaryButton
          label={page === PAGE_COUNT - 1 ? '시작하기' : '다음'}
          onPress={() => (page === PAGE_COUNT - 1 ? finish() : goToPage(page + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

/** 01-02 — 온보딩 01 · 서비스 소개 */
function PageIntro() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.compareFrame}>
        <View style={styles.compareBadge}>
          <Text style={styles.compareBadgeText}>사진 1장 → 규격 사진</Text>
        </View>
        <PhotoPlaceholder width={104} height={140} radius={12} tone="primary" />
        <Text style={styles.arrow}>→</Text>
        <PhotoPlaceholder width={104} height={140} radius={12} style={styles.compareRightThumb} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>사진관에 가지 않고{'\n'}규격에 맞는 사진을</Text>
        <Text style={styles.body}>가지고 있는 사진이나 앱에서 촬영한 사진 1장으로, 제출 목적에 맞는 증명사진을 만들어요.</Text>
      </View>
      <View style={styles.checklist}>
        <CheckLine text="목적별 기준을 앱이 안내해요" />
        <CheckLine text="촬영 전에 이상적인 샘플을 볼 수 있어요" />
        <CheckLine text="결과를 확인한 다음 결제해요" />
      </View>
    </View>
  );
}

/** 01-03 — 온보딩 02 · 목적별 사진 (reuses SCREEN-01's SelectionCard, non-interactive) */
function PagePurpose() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>목적에 따라{'\n'}기준이 달라져요</Text>
        <Text style={styles.body}>여권과 면접 사진의 기준은 다릅니다. 목적을 먼저 고르면 그 목적의 샘플과 촬영 가이드를 안내해요.</Text>
      </View>
      <View style={styles.purposeList}>
        {ONBOARDING_PURPOSES.map((p) => (
          <SelectionCard key={p.title} title={p.title} description={p.description} interactive={false} />
        ))}
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>그래서 목적을 먼저 물어봐요</Text>
        <Text style={styles.infoBoxText}>선택한 목적에 따라 허용되는 편집 범위와 결과 규격이 정해져요.</Text>
      </View>
    </View>
  );
}

/** 01-04 — 온보딩 03 · AI 제작 안내 (RULE-08 communication) */
function PageIdentity() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.identityFrame}>
        <View style={styles.identityBadge}>
          <Text style={styles.identityBadgeText}>얼굴은 그대로</Text>
        </View>
        <View style={styles.identityCol}>
          <PhotoPlaceholder width={96} height={126} radius={11} />
          <Text style={styles.identityLabel}>원본</Text>
        </View>
        <Text style={styles.identityArrow}>→</Text>
        <View style={styles.identityCol}>
          <PhotoPlaceholder width={96} height={126} radius={11} style={styles.identityResultThumb} />
          <Text style={[styles.identityLabel, styles.identityLabelActive]}>결과</Text>
        </View>
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>내 얼굴 그대로,{'\n'}목적에 맞게 정리해요</Text>
        <Text style={styles.body}>AI는 얼굴을 다른 사람처럼 바꾸지 않아요. 원본 얼굴과 헤어 특성을 유지한 채 구도·조명·배경을 목적 기준에 맞춥니다.</Text>
      </View>
      <View style={styles.tradeoffCards}>
        <View style={[styles.tradeoffCard, styles.tradeoffKeep]}>
          <View style={styles.tradeoffBadge}>
            <Text style={[styles.tradeoffBadgeText, { color: colors.primary }]}>유지</Text>
          </View>
          <Text style={[styles.tradeoffText, { color: colors.infoText }]}>얼굴 identity · 얼굴형과 비율 · 헤어 길이와 질감</Text>
        </View>
        <View style={[styles.tradeoffCard, styles.tradeoffAdjust]}>
          <View style={styles.tradeoffBadge}>
            <Text style={[styles.tradeoffBadgeText, { color: colors.textSecondary }]}>조정</Text>
          </View>
          <Text style={[styles.tradeoffText, { color: colors.textSecondaryAlt }]}>구도와 크기 · 조명 균일화 · 배경 · 눈썹을 가리지 않는 헤어 정돈</Text>
        </View>
      </View>
    </View>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <Text style={styles.checkGlyph}>✓</Text>
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadding },
  back: { fontSize: 20, color: colors.textPrimary },
  skip: { marginLeft: 'auto' },
  skipLabel: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
  pager: { flex: 1 },
  pageContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 24 },
  titleBlock: { gap: 10 },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 26 * 1.3, letterSpacing: -0.5, color: colors.textPrimary },
  body: { fontSize: 15, lineHeight: 15 * 1.6, color: colors.textSecondaryAlt },
  checklist: { gap: 11 },
  checkRow: { flexDirection: 'row', gap: 9 },
  checkGlyph: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  checkText: { fontSize: 15, lineHeight: 15 * 1.4, color: colors.textPrimary },

  compareFrame: {
    width: '100%',
    height: 326,
    borderRadius: 18,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: '#DDE9FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  compareBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  compareBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  arrow: { fontSize: 22, fontWeight: '700', color: colors.primary },
  compareRightThumb: { backgroundColor: colors.surface, borderColor: '#CFDCF0' },

  purposeList: { gap: 10 },
  infoBox: { padding: 14, borderRadius: 12, backgroundColor: colors.surfaceSubtle, gap: 4 },
  infoBoxTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  infoBoxText: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },

  identityFrame: {
    width: '100%',
    height: 250,
    borderRadius: 18,
    backgroundColor: colors.surfacePlaceholderAlt,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  identityBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  identityBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  identityCol: { alignItems: 'center', gap: 7 },
  identityResultThumb: { borderColor: colors.primary, borderWidth: 1.5 },
  identityLabel: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  identityLabelActive: { fontWeight: '700', color: colors.primary },
  identityArrow: { fontSize: 20, fontWeight: '700', color: colors.textDisabledAlt },

  tradeoffCards: { gap: 10 },
  tradeoffCard: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: 14, borderRadius: 12 },
  tradeoffKeep: { backgroundColor: colors.primaryTint },
  tradeoffAdjust: { backgroundColor: colors.surfaceSubtle },
  tradeoffBadge: { backgroundColor: colors.surface, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  tradeoffBadgeText: { fontSize: 11, fontWeight: '700' },
  tradeoffText: { flex: 1, fontSize: 13.5, lineHeight: 13.5 * 1.5 },

  footer: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 16 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 20, backgroundColor: colors.primary },
});
