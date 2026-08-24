import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar, LogoutSheet, PrimaryButton, TabKey } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const KRW = new Intl.NumberFormat('ko-KR');

const PROVIDER_LABEL: Record<string, string> = {
  kakao: '카카오 로그인',
  apple: 'Apple 로그인',
  google: 'Google 로그인',
  email: '이메일 로그인',
};

/**
 * 설정 탭 — doubles as 14-05 로그아웃의 base screen. Logged-out state shows a
 * login prompt instead of the account row (RULE: 로그인은 결제 직전에만, so
 * this is an invitation, not a gate).
 */
export default function Settings({ navigation }: Props) {
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const provider = useAuth((s) => s.provider);
  const maskedEmail = useAuth((s) => s.maskedEmail);
  const creditBalance = useAuth((s) => s.creditBalance);
  const logout = useAuth((s) => s.logout);
  const photo = useSession((s) => s.photo);

  const [logoutVisible, setLogoutVisible] = useState(false);

  function handleSelectTab(tab: TabKey) {
    if (tab === 'home') navigation.navigate('S01_Purpose');
    else if (tab === 'myPhotos') navigation.navigate('MyPhotos');
  }

  function handleConfirmLogout() {
    setLogoutVisible(false);
    logout();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoggedIn ? (
          <View style={styles.accountRow}>
            <View style={[styles.avatar, { backgroundColor: provider === 'kakao' ? '#FEE500' : colors.surfaceSubtleAlt }]} />
            <View style={styles.accountTextCol}>
              <Text style={styles.accountTitle}>{maskedEmail || '내 계정'}</Text>
              <Text style={styles.accountSubtitle}>
                {PROVIDER_LABEL[provider ?? 'email']} · 크레딧 {KRW.format(creditBalance)}원
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginPromptCard}>
            <View style={styles.loginPromptTextCol}>
              <Text style={styles.loginPromptTitle}>로그인이 필요해요</Text>
              <Text style={styles.loginPromptSubtitle}>사진을 30일간 보관하고, 결제 내역도 확인할 수 있어요.</Text>
            </View>
            <PrimaryButton label="로그인" onPress={() => navigation.navigate('Login')} style={styles.loginPromptButton} />
          </View>
        )}

        <View style={styles.menuBox}>
          <MenuRow label="알림 설정" />
          <MenuRow label="결제 내역" />
          <MenuRow label="약관 및 개인정보" last />
        </View>

        {isLoggedIn && (
          <View style={styles.menuBox}>
            <Pressable style={styles.menuRow} onPress={() => setLogoutVisible(true)}>
              <Text style={styles.menuRowTextStrong}>로그아웃</Text>
            </Pressable>
            <Pressable style={[styles.menuRow, styles.menuRowLast]} onPress={() => navigation.navigate('DeleteAccount')}>
              <Text style={styles.menuRowTextMuted}>회원 탈퇴</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomTabBar active="settings" onSelect={handleSelectTab} />

      <LogoutSheet
        visible={logoutVisible}
        onDismiss={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
        hasInProgressWork={photo !== null}
      />
    </SafeAreaView>
  );
}

function MenuRow({ label, last }: { label: string; last?: boolean }) {
  return (
    <View style={[styles.menuRow, last && styles.menuRowLast]}>
      <Text style={styles.menuRowText}>{label}</Text>
      <Text style={styles.menuRowChevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, gap: 11, paddingBottom: 24 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  accountTextCol: { flex: 1, gap: 3 },
  accountTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  accountSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  loginPromptCard: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: '#DDE9FB' },
  loginPromptTextCol: { gap: 4 },
  loginPromptTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  loginPromptSubtitle: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.infoText },
  loginPromptButton: { height: 44 },
  menuBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  menuRowLast: { borderBottomWidth: 0 },
  menuRowText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  menuRowChevron: { fontSize: 17, color: colors.textDisabledAlt },
  menuRowTextStrong: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  menuRowTextMuted: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textTertiary },
});
