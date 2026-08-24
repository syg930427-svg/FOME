import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIVACY_POLICY_DETAIL, PRIVACY_POLICY_PREVIOUS_VERSION, PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_SUMMARY, PRIVACY_POLICY_VERSION } from '../api';
import { ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

/**
 * 16-06 개인정보 처리방침. 법적 전문은 접힌 목차로 두고 "한 줄 요약" 카드를
 * 먼저 읽게 한다. 이 배치엔 3조("보관 및 파기")만 실제 본문이 있어, 다른
 * 조항 행은 탭해도 안내만 뜬다 — 목차만 먼저 보여주는 실제 서비스도 흔하다.
 */
export default function PrivacyPolicy({ navigation }: Props) {
  const showToast = useToast((s) => s.show);

  function handleSectionPress(title: string) {
    Alert.alert(title, '본문은 준비 중이에요.');
  }

  function handleDownload() {
    showToast('전체 문서를 다운로드하고 있어요');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="개인정보 처리방침" onBack={navigation.goBack} right={<Text style={styles.versionText}>{PRIVACY_POLICY_VERSION}</Text>} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>한 줄 요약</Text>
          <View style={styles.summaryList}>
            {PRIVACY_POLICY_SUMMARY.map((line) => (
              <Text key={line} style={styles.summaryLine}>
                · {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.box}>
          {PRIVACY_POLICY_SECTIONS.map((section, i) => (
            <Pressable
              key={section.n}
              style={[styles.sectionRow, i < PRIVACY_POLICY_SECTIONS.length - 1 && styles.sectionRowDivider]}
              onPress={() => handleSectionPress(section.title)}
            >
              <Text style={styles.sectionNumber}>{section.n}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.detailCol}>
          <Text style={styles.detailTitle}>
            {PRIVACY_POLICY_DETAIL.sectionLabel} {PRIVACY_POLICY_DETAIL.title}
          </Text>
          <Text style={styles.detailBody}>{PRIVACY_POLICY_DETAIL.body}</Text>
        </View>

        <Pressable style={styles.prevVersionRow} onPress={() => Alert.alert('이전 버전', '이전 버전은 준비 중이에요.')}>
          <Text style={styles.prevVersionLabel}>이전 버전 보기</Text>
          <Text style={styles.prevVersionValue}>{PRIVACY_POLICY_PREVIOUS_VERSION}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="전체 문서 내려받기" onPress={handleDownload} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  versionText: { fontSize: 12.5, fontWeight: '600', color: colors.textTertiary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, paddingBottom: 24, gap: 16 },
  summaryBox: { gap: 10, padding: 15, borderRadius: 14, backgroundColor: colors.primaryTint },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  summaryList: { gap: 7 },
  summaryLine: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.infoText },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14, gap: 8 },
  sectionRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  sectionNumber: { fontSize: 12, fontWeight: '700', color: colors.textTertiary, width: 22 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  chevron: { fontSize: 17, color: colors.textDisabledAlt },
  detailCol: { gap: 7 },
  detailTitle: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  detailBody: { fontSize: 12.5, lineHeight: 12.5 * 1.7, color: colors.textSecondaryAlt },
  prevVersionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  prevVersionLabel: { fontSize: 12.5, color: colors.textTertiary },
  prevVersionValue: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
