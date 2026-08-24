import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OPTIONAL_UPDATE_INFO } from '../api';
import { PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateAvailable'>;

/**
 * 19-02 새 버전 안내 — 선택 업데이트, 건너뛸 수 있다(19-01과 대비). "지금
 * 업데이트"는 실제 앱스토어 왕복을 흉내 낼 수 없어, 이 mock에서는 바로
 * 19-03(업데이트 완료)으로 넘어간다 — S12 결제처럼 실제 왕복을 생략한다.
 */
export default function UpdateAvailable({ navigation }: Props) {
  const info = OPTIONAL_UPDATE_INFO;

  function handleUpdateNow() {
    navigation.replace('UpdateComplete');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>새 버전 안내</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBlock}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>버전 {info.newVersion}</Text>
          </View>
          <Text style={styles.headline}>{info.headline}</Text>
          <Text style={styles.meta}>
            {info.releaseDateLabel} · {info.sizeLabel}
          </Text>
        </View>

        <View style={styles.heroBox}>
          <Text style={styles.heroText}>업데이트 소개 이미지</Text>
        </View>

        <View style={styles.highlightsCol}>
          {info.highlights.map((h) => (
            <View key={h.title} style={styles.highlightRow}>
              <View style={styles.highlightIconWrap}>
                <Text style={styles.highlightIcon}>{h.icon}</Text>
              </View>
              <View style={styles.highlightTextCol}>
                <Text style={styles.highlightTitle}>{h.title}</Text>
                <Text style={styles.highlightSubtitle}>{h.subtitle}</Text>
              </View>
            </View>
          ))}
          <View style={styles.highlightRow}>
            <View style={[styles.highlightIconWrap, styles.highlightIconWrapNeutral]}>
              <Text style={[styles.highlightIcon, styles.highlightIconNeutral]}>✓</Text>
            </View>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightTitle}>고친 문제</Text>
              <Text style={styles.highlightSubtitle}>{info.fixedIssuesLabel}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.changelogLink} onPress={() => Alert.alert('전체 변경 내역', '이 배치엔 아직 연결되지 않았어요.')}>
          전체 변경 내역 보기
        </Text>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="지금 업데이트" onPress={handleUpdateNow} />
        <Pressable style={styles.skipButton} onPress={navigation.goBack}>
          <Text style={styles.skipButtonText}>이 버전 건너뛰기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding },
  close: { fontSize: 20, color: colors.textPrimary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 18 },
  titleBlock: { gap: 8 },
  versionBadge: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 10, borderRadius: 6, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  versionBadgeText: { fontSize: 11.5, fontWeight: '700', color: colors.primary },
  headline: { fontSize: 21, fontWeight: '700', letterSpacing: -0.2, lineHeight: 21 * 1.35, color: colors.textPrimary },
  meta: { fontSize: 12.5, color: colors.textDisabled },
  heroBox: { height: 196, borderRadius: 18, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  heroText: { fontSize: 12.5, color: colors.textDisabled },
  highlightsCol: { gap: 13 },
  highlightRow: { flexDirection: 'row', gap: 12 },
  highlightIconWrap: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  highlightIconWrapNeutral: { backgroundColor: colors.surfaceSubtle },
  highlightIcon: { fontSize: 14, fontWeight: '700', color: colors.primary },
  highlightIconNeutral: { color: colors.textTertiary },
  highlightTextCol: { flex: 1, gap: 3 },
  highlightTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  highlightSubtitle: { fontSize: 12.5, lineHeight: 12.5 * 1.55, color: colors.textTertiary },
  changelogLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  skipButton: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  skipButtonText: { fontSize: 15.5, fontWeight: '700', color: colors.textTertiary },
});
