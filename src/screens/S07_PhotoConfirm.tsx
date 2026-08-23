import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, SpecList, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S07_PhotoConfirm'>;

const LEVEL_PERMISSION: Record<number, string> = {
  0: 'LEVEL 0 · PASSPORT_STYLE_LIMIT',
  1: 'LEVEL 1 · LIMITED_AI_EDIT',
  2: 'LEVEL 2 · LIMITED_AI_EDIT',
  3: 'LEVEL 3 · AI_STYLE_RECOMMEND',
};

export default function S07_PhotoConfirm({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const source = useSession((s) => s.source);
  const photo = useSession((s) => s.photo);
  const purpose = PURPOSES.find((p) => p.id === purposeId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 확인" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.previewWrap}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <PhotoPlaceholder width="100%" height={406} radius={16} />
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{source === 'gallery' ? '원본 · 갤러리에서 선택' : '원본 · 방금 촬영'}</Text>
          </View>
        </View>

        <SpecList
          rows={[
            { label: '목적', value: purpose?.title ?? '-' },
            { label: 'AI 권한', value: LEVEL_PERMISSION[editLevel] },
            { label: '입력 방식', value: source === 'gallery' ? '갤러리에서 선택' : '앱 카메라 촬영' },
          ]}
        />

        <Text style={styles.footnote}>자동 PASS/FAIL을 표시하지 않아요. 샘플과 비교해 직접 판단해 주세요.</Text>
        <TextButton label="촬영 가이드 다시 보기" onPress={() => navigation.navigate('S04_ShootingGuide')} />
      </ScrollView>

      <View style={styles.ctaArea}>
        <View style={styles.retakeRow}>
          <SecondaryButton label="다시 촬영" compact style={styles.retakeButton} onPress={() => navigation.navigate('S05_Camera')} />
          <SecondaryButton label="다른 사진" compact style={styles.retakeButton} onPress={() => navigation.navigate('S06_Upload')} />
        </View>
        <PrimaryButton label="이 사진 사용하기" onPress={() => navigation.navigate('S08_Options')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 16, paddingBottom: 24 },
  previewWrap: { width: '100%', height: 406, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfacePlaceholder },
  previewImage: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  footnote: { fontSize: 12, lineHeight: 12 * 1.55, color: colors.textDisabled },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  retakeRow: { flexDirection: 'row', gap: 10 },
  retakeButton: { flex: 1 },
});
