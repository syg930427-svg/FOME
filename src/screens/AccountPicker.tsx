import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_CREDIT_BALANCE } from '../api';
import { PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useMyPhotos } from '../state/myPhotos';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountPicker'>;

const KRW = new Intl.NumberFormat('ko-KR');

/** 14-03 소셜 로그인 선택 — reached when the Kakao button on 14-01 detects a
 * device account (mocked: it always does, to make this screen reachable). */
export default function AccountPicker({ navigation }: Props) {
  const loginWithProvider = useAuth((s) => s.loginWithProvider);
  const orders = useMyPhotos((s) => s.orders);
  const [selected, setSelected] = useState<'kakao' | 'apple'>('kakao');

  const breakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.title, (counts.get(o.title) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([title, count]) => `${title.replace(' 사진', '')} ${count}`)
      .join(' · ');
  }, [orders]);

  function handleContinue() {
    if (selected === 'kakao') loginWithProvider('kakao', 'min•••@kakao.com');
    else loginWithProvider('apple', '비공개 이메일 사용 중');
    navigation.pop(2); // AccountPicker + Login → back to whoever asked for login
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="계정 선택" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>이 계정으로 이어서 할까요?</Text>
          <Text style={styles.subtitle}>이 기기에서 전에 사용한 계정이에요.</Text>
        </View>

        <Pressable style={[styles.accountCard, selected === 'kakao' && styles.accountCardSelected]} onPress={() => setSelected('kakao')}>
          <View style={[styles.avatar, { backgroundColor: '#FEE500' }]}>
            <View style={styles.kakaoGlyph} />
          </View>
          <View style={styles.accountTextCol}>
            <Text style={styles.accountTitle}>카카오 계정</Text>
            <Text style={styles.accountSubtitleSelected}>min•••@kakao.com · 마지막 사용 8월 24일</Text>
          </View>
          <View style={[styles.radio, selected === 'kakao' && styles.radioActive]}>
            {selected === 'kakao' && <Text style={styles.radioGlyph}>✓</Text>}
          </View>
        </Pressable>

        <Pressable style={[styles.accountCard, selected === 'apple' && styles.accountCardSelected]} onPress={() => setSelected('apple')}>
          <View style={[styles.avatar, { backgroundColor: colors.inverseBg }]}>
            <View style={styles.appleGlyph} />
          </View>
          <View style={styles.accountTextCol}>
            <Text style={styles.accountTitle}>Apple 계정</Text>
            <Text style={styles.accountSubtitle}>비공개 이메일 사용 중</Text>
          </View>
          <View style={[styles.radio, selected === 'apple' && styles.radioActive]}>
            {selected === 'apple' && <Text style={styles.radioGlyph}>✓</Text>}
          </View>
        </Pressable>

        <Pressable style={styles.otherRow} onPress={navigation.goBack}>
          <View style={styles.otherAvatar} />
          <View style={styles.accountTextCol}>
            <Text style={styles.accountTitle}>다른 계정으로 로그인</Text>
            <Text style={styles.accountSubtitle}>Google · 이메일</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>이 계정에 남아 있는 것</Text>
          <View style={styles.thumbRow}>
            {orders.slice(0, 3).map((o) => (
              <View key={o.id} style={styles.thumb} />
            ))}
            {orders.length > 3 && (
              <View style={[styles.thumb, styles.thumbMore]}>
                <Text style={styles.thumbMoreText}>+{orders.length - 3}</Text>
              </View>
            )}
          </View>
          <Text style={styles.summaryText}>
            {breakdown || '보관된 사진 없음'} · 크레딧 {KRW.format(MOCK_CREDIT_BALANCE)}원
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label={`${selected === 'kakao' ? '카카오' : 'Apple'} 계정으로 계속`} onPress={handleContinue} />
        <Text style={styles.caption}>계정을 바꾸면 이전 사진은 그 계정에 남아요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 11 },
  titleBlock: { gap: 7, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.32, letterSpacing: -0.02 * 22, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  accountCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  accountCardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  kakaoGlyph: { width: 18, height: 18, borderRadius: 5, backgroundColor: colors.textPrimary },
  appleGlyph: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.inverseText },
  accountTextCol: { flex: 1, gap: 3 },
  accountTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  accountSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  accountSubtitleSelected: { fontSize: 12.5, color: colors.infoText },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radioGlyph: { color: colors.inverseText, fontSize: 12 },
  otherRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  otherAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSubtleAlt },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  summaryBox: { gap: 9, padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, marginTop: 4 },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  thumbRow: { flexDirection: 'row', gap: 7 },
  thumb: { width: 38, height: 50, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  thumbMore: { alignItems: 'center', justifyContent: 'center' },
  thumbMoreText: { fontSize: 11, fontWeight: '700', color: colors.textTertiary },
  summaryText: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  caption: { textAlign: 'center', fontSize: 13, color: colors.textDisabled },
});
