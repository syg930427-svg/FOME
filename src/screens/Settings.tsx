import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_VERSION_LABEL, LANGUAGE_OPTIONS, RETENTION_OPTIONS, SUPPORT_EMAIL } from '../api';
import { BottomTabBar, PrimaryButton, TabKey } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useMyPhotos } from '../state/myPhotos';
import { useNotices } from '../state/notices';
import { useSettings } from '../state/settings';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/**
 * 16-01 설정 (홈) — doubles as the tab-bar root. 로그아웃/회원 탈퇴는 여기서
 * 빠지고 계정 설정(16-02)으로 옮겨갔다 — 프로필 행을 누르면 그리로 간다.
 * Logged-out state keeps the 목차 14 login-prompt card (RULE: 로그인은
 * 결제 직전에만) but still shows 앱 설정/개인정보 — 그건 계정과 무관하다.
 */
export default function Settings({ navigation }: Props) {
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const provider = useAuth((s) => s.provider);
  const displayName = useAuth((s) => s.displayName);
  const maskedEmail = useAuth((s) => s.maskedEmail);
  const orders = useMyPhotos((s) => s.orders);
  const notices = useNotices((s) => s.notices);
  const notifications = useSettings((s) => s.notifications);
  const language = useSettings((s) => s.language);
  const retentionPolicy = useSettings((s) => s.retentionPolicy);

  const photoCount = useMemo(() => orders.reduce((sum, o) => sum + o.resultCount, 0), [orders]);
  const orderCount = orders.length;
  const unreadNoticeCount = useMemo(() => notices.filter((n) => !n.read).length, [notices]);
  const notifOn = notifications.photoComplete || notifications.paymentRefund || notifications.deletionWarning;
  const languageLabel = LANGUAGE_OPTIONS.find((l) => l.code === language)?.label ?? '한국어';
  const retentionLabel = RETENTION_OPTIONS.find((r) => r.id === retentionPolicy)?.shortLabel ?? '30일 후 자동 삭제';

  function handleSelectTab(tab: TabKey) {
    if (tab === 'home') navigation.navigate('S01_Purpose');
    else if (tab === 'myPhotos') navigation.navigate('MyPhotos');
  }

  function handleContact() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('AI 증명사진 문의')}`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoggedIn ? (
          <Pressable style={styles.accountRow} onPress={() => navigation.navigate('AccountSettings')}>
            <View style={[styles.avatar, { backgroundColor: provider === 'kakao' ? '#FEE500' : colors.primaryTintStrong }]} />
            <View style={styles.accountTextCol}>
              <Text style={styles.accountTitle}>{displayName || '내 계정'}</Text>
              <Text style={styles.accountSubtitle}>{maskedEmail}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ) : (
          <View style={styles.loginPromptCard}>
            <View style={styles.loginPromptTextCol}>
              <Text style={styles.loginPromptTitle}>로그인이 필요해요</Text>
              <Text style={styles.loginPromptSubtitle}>사진을 30일간 보관하고, 결제 내역도 확인할 수 있어요.</Text>
            </View>
            <PrimaryButton label="로그인" onPress={() => navigation.navigate('Login')} style={styles.loginPromptButton} />
          </View>
        )}

        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>내 정보</Text>
            <View style={styles.box}>
              <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('AccountSettings')}>
                <Text style={styles.rowText}>계정 설정</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <View style={[styles.row, styles.rowDivider]}>
                <Text style={styles.rowText}>결제 내역</Text>
                <Text style={styles.rowBadge}>{orderCount}건</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <Pressable style={styles.row} onPress={() => navigation.navigate('MyPhotos')}>
                <Text style={styles.rowText}>내 사진</Text>
                <Text style={styles.rowBadge}>{photoCount}장</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>앱 설정</Text>
          <View style={styles.box}>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('NotificationSettings')}>
              <Text style={styles.rowText}>알림</Text>
              <Text style={styles.rowBadge}>{notifOn ? '켜짐' : '꺼짐'}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('LanguageSettings')}>
              <Text style={styles.rowText}>언어</Text>
              <Text style={styles.rowBadge}>{languageLabel}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('UpdateAvailable')}>
              <Text style={styles.rowText}>업데이트</Text>
              <Text style={styles.rowBadgeAccent}>새 버전 있음</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={styles.row} onPress={() => navigation.navigate('Notices')}>
              <Text style={styles.rowText}>공지사항</Text>
              {unreadNoticeCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadNoticeCount}</Text>
                </View>
              )}
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>개인정보</Text>
          <View style={styles.box}>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('StoragePolicy')}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowText}>사진 보관 정책</Text>
                <Text style={styles.rowBadgeInline}>{retentionLabel}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={styles.rowText}>개인정보 처리방침</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={styles.rowText}>이용약관</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={styles.row} onPress={() => navigation.navigate('OpenSourceLicenses')}>
              <Text style={styles.rowText}>오픈소스 라이선스</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>버전 {APP_VERSION_LABEL}</Text>
          <Text style={styles.footerLink} onPress={handleContact}>
            문의하기
          </Text>
        </View>
      </ScrollView>

      <BottomTabBar active="settings" onSelect={handleSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, gap: 18, paddingBottom: 24 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, backgroundColor: colors.surfaceSubtle },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  accountTextCol: { flex: 1, gap: 3 },
  accountTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  accountSubtitle: { fontSize: 12.5, color: colors.textTertiary },
  loginPromptCard: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: '#DDE9FB' },
  loginPromptTextCol: { gap: 4 },
  loginPromptTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  loginPromptSubtitle: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.infoText },
  loginPromptButton: { height: 44 },
  section: { gap: 9 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 6 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowTextCol: { flex: 1, gap: 2 },
  rowText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  rowBadge: { fontSize: 13, color: colors.textTertiary, marginRight: 2 },
  rowBadgeInline: { fontSize: 12, color: colors.primary },
  rowBadgeAccent: { fontSize: 13, fontWeight: '700', color: colors.primary, marginRight: 2 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  unreadBadgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 4 },
  footerText: { fontSize: 12.5, color: colors.textDisabled },
  footerLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
});
