import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_VERSION_BUILD_LABEL, OPEN_SOURCE_LIBRARIES } from '../api';
import { ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OpenSourceLicenses'>;

/**
 * 16-08 오픈소스 라이선스. 이 배치의 목록은 6개뿐이라(디자인 예시의 24개와
 * 달리) 검색창은 항상 노출한다 — 20개 이상일 때만 보이라는 주석은 실제
 * 목록 크기에 맞춰 단순화했다.
 */
export default function OpenSourceLicenses({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return OPEN_SOURCE_LIBRARIES;
    return OPEN_SOURCE_LIBRARIES.filter((lib) => lib.name.toLowerCase().includes(q));
  }, [query]);

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="오픈소스 라이선스" onBack={navigation.goBack} />

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="라이브러리 검색"
          placeholderTextColor={colors.textDisabled}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.countText}>이 앱은 아래 오픈소스를 사용해요. 총 {OPEN_SOURCE_LIBRARIES.length}개</Text>

        <View style={styles.box}>
          {filtered.map((lib, i) => {
            const expanded = expandedId === lib.id;
            return (
              <View key={lib.id}>
                <Pressable
                  style={[styles.row, i < filtered.length - 1 && !expanded && styles.rowDivider]}
                  onPress={() => toggleExpanded(lib.id)}
                >
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>{lib.name}</Text>
                    <Text style={styles.rowSubtitle}>{lib.license}</Text>
                  </View>
                  <Text style={[styles.chevron, expanded && styles.chevronExpanded]}>›</Text>
                </Pressable>
                {expanded && (
                  <View style={[styles.licenseBox, i < filtered.length - 1 && styles.rowDivider]}>
                    <Text style={styles.licenseText}>{lib.licenseText}</Text>
                  </View>
                )}
              </View>
            );
          })}
          {filtered.length === 0 && <Text style={styles.emptyText}>검색 결과가 없어요</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.versionText}>버전 {APP_VERSION_BUILD_LABEL}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  searchRow: { paddingHorizontal: spacing.screenPadding, paddingVertical: 10 },
  searchInput: { height: 40, borderRadius: 12, backgroundColor: colors.surfaceSubtleAlt, paddingHorizontal: 13, fontSize: 13.5, color: colors.textPrimary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 2, paddingBottom: 12, gap: 12 },
  countText: { fontSize: 12.5, color: colors.textTertiary },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14, gap: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowSubtitle: { fontSize: 11.5, color: colors.textTertiary },
  chevron: { fontSize: 17, color: colors.textDisabledAlt },
  chevronExpanded: { transform: [{ rotate: '90deg' }] },
  licenseBox: { padding: 14, backgroundColor: colors.surfaceSubtle },
  licenseText: { fontSize: 11.5, lineHeight: 11.5 * 1.65, color: colors.textTertiary, fontFamily: 'monospace' },
  emptyText: { textAlign: 'center', padding: 20, fontSize: 13, color: colors.textDisabled },
  footer: { alignItems: 'center', paddingVertical: 16 },
  versionText: { fontSize: 12.5, color: colors.textDisabled },
});
