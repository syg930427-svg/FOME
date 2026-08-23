import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPolicy, PURPOSES } from '../api';
import { PrimaryButton, SelectionCard } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S01_Purpose'>;

/**
 * S01 — 목적 선택 (home).
 * RULE-01: purpose comes before photo — no camera/gallery CTA may appear here,
 * only the purpose list and a single "start with <purpose>" CTA.
 */
export default function S01_Purpose({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const selectPurpose = useSession((s) => s.selectPurpose);

  const selected = PURPOSES.find((p) => p.id === purposeId) ?? null;

  async function handleSelect(id: (typeof PURPOSES)[number]['id']) {
    const policy = await getPolicy(id);
    selectPurpose(id, policy.policyId, policy.editLevel);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>AI PHOTO</Text>
        <View style={styles.avatar} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>어떤 사진이{'\n'}필요하세요?</Text>
        <Text style={styles.subtitle}>목적을 먼저 고르면 그 목적에 맞는 샘플과 촬영 가이드를 안내해요.</Text>
      </View>

      <View style={styles.list}>
        {PURPOSES.map((p) => (
          <SelectionCard
            key={p.id}
            title={p.title}
            description={p.description}
            levelLabel={p.levelLabel}
            selected={p.id === purposeId}
            onPress={() => handleSelect(p.id)}
          />
        ))}
        <Text style={styles.footnote}>
          목적 선택 전에는 카메라·갤러리 CTA를 노출하지 않아요. 선택 즉시 정책을 확인할게요.
        </Text>
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton
          label={selected ? `${selected.title}으로 시작하기` : '목적을 선택해 주세요'}
          disabled={!selected}
          onPress={() => navigation.navigate('S02_PurposeGuide')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 1.3, color: colors.primary },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceSubtleAlt },
  titleBlock: { paddingHorizontal: spacing.screenPadding, paddingTop: 8, paddingBottom: 20, gap: 6 },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 26 * 1.3, letterSpacing: -0.5, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  list: { flex: 1, paddingHorizontal: spacing.screenPadding, gap: 10 },
  footnote: { marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.textDisabled },
  ctaArea: { padding: spacing.ctaAreaPadding.top, paddingHorizontal: spacing.screenPadding, paddingBottom: 28 },
});
