import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TERMS_DETAIL, TERMS_SECTIONS, TERMS_SUMMARY, TERMS_VERSION } from '../api';
import { ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfService'>;

/** 16-07 이용약관 — 16-06과 같은 레이아웃 패턴을 공유한다. */
export default function TermsOfService({ navigation }: Props) {
  const showToast = useToast((s) => s.show);

  function handleSectionPress(title: string) {
    Alert.alert(title, '본문은 준비 중이에요.');
  }

  function handleDownload() {
    showToast('전체 문서를 다운로드하고 있어요');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="이용약관" onBack={navigation.goBack} right={<Text style={styles.versionText}>{TERMS_VERSION}</Text>} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>알아두면 좋은 것</Text>
          <View style={styles.summaryList}>
            {TERMS_SUMMARY.map((line) => (
              <Text key={line} style={styles.summaryLine}>
                · {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.box}>
          {TERMS_SECTIONS.map((section, i) => (
            <Pressable
              key={section.n}
              style={[styles.sectionRow, i < TERMS_SECTIONS.length - 1 && styles.sectionRowDivider]}
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
            {TERMS_DETAIL.sectionLabel} {TERMS_DETAIL.title}
          </Text>
          <Text style={styles.detailBody}>{TERMS_DETAIL.body}</Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningGlyph}>!</Text>
          <Text style={styles.warningText}>{TERMS_DETAIL.warning}</Text>
        </View>
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
  summaryBox: { gap: 10, padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  summaryList: { gap: 7 },
  summaryLine: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14, gap: 8 },
  sectionRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  sectionNumber: { fontSize: 12, fontWeight: '700', color: colors.textTertiary, width: 32 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  chevron: { fontSize: 17, color: colors.textDisabledAlt },
  detailCol: { gap: 7 },
  detailTitle: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  detailBody: { fontSize: 12.5, lineHeight: 12.5 * 1.7, color: colors.textSecondaryAlt },
  warningBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.warningBg },
  warningGlyph: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  warningText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.warningStrong },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
