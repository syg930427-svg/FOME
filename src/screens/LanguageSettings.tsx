import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LANGUAGE_OPTIONS } from '../api';
import { PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { LanguageCode, useSettings } from '../state/settings';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSettings'>;

/**
 * 16-04 언어 설정. 언어와 "사진 규격 기준 국가"를 분리해두는 게 이 화면의 핵심 —
 * 두 값을 묶으면 해외 거주자가 잘못된 규격으로 신청하게 된다.
 */
export default function LanguageSettings({ navigation }: Props) {
  const currentLanguage = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);
  const showToast = useToast((s) => s.show);

  const [selected, setSelected] = useState<LanguageCode>(currentLanguage);

  const changed = selected !== currentLanguage;
  const selectedLabel = LANGUAGE_OPTIONS.find((l) => l.code === selected)?.label ?? '';

  function handleApply() {
    if (!changed) return;
    setLanguage(selected);
    // Mock: no real i18n runtime in this build, so the app doesn't actually
    // restart — the info banner's promise is aspirational, documented in README.
    showToast(`${selectedLabel}로 변경했어요`);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="언어" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.box}>
          {LANGUAGE_OPTIONS.map((lang, i) => {
            const active = lang.code === selected;
            return (
              <Pressable
                key={lang.code}
                style={[styles.row, i < LANGUAGE_OPTIONS.length - 1 && styles.rowDivider, active && styles.rowActive]}
                onPress={() => setSelected(lang.code)}
              >
                <View style={styles.rowTextCol}>
                  <Text style={[styles.rowTitle, active && styles.rowTitleActive]}>{lang.label}</Text>
                  <Text style={active ? styles.rowSubtitleActive : styles.rowSubtitle}>{lang.subtitle}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>{active && <Text style={styles.radioGlyph}>✓</Text>}</View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>사진 규격 기준 국가</Text>
          <Pressable
            style={styles.countryRow}
            onPress={() => Alert.alert('사진 규격 기준 국가', '이 배치엔 아직 연결되지 않았어요.')}
          >
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>대한민국</Text>
              <Text style={styles.rowSubtitle}>여권·비자 규격이 이 기준으로 적용돼요</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningGlyph}>!</Text>
          <Text style={styles.warningText}>언어를 바꿔도 사진 규격 기준 국가는 바뀌지 않아요. 규격은 따로 선택해 주세요.</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoGlyph}>i</Text>
          <Text style={styles.infoText}>언어를 바꾸면 앱이 다시 시작돼요.</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label={changed ? `${selectedLabel}로 변경` : '변경 사항 없음'} disabled={!changed} onPress={handleApply} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 16 },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingHorizontal: 14, gap: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowActive: { backgroundColor: colors.primaryTint },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rowTitleActive: { fontWeight: '700' },
  rowSubtitle: { fontSize: 12, color: colors.textTertiary },
  rowSubtitleActive: { fontSize: 12, color: colors.infoText },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radioGlyph: { color: colors.inverseText, fontSize: 11 },
  section: { gap: 9 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  countryRow: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 10 },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  warningBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.warningBg },
  warningGlyph: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  warningText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.warningStrong },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
