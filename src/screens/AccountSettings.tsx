import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoutSheet, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useMyPhotos } from '../state/myPhotos';
import { useSession } from '../state/session';
import { useSettings } from '../state/settings';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountSettings'>;

const PROVIDER_LOGIN_LABEL: Record<string, string> = {
  kakao: '카카오 연결됨',
  apple: 'Apple 연결됨',
  google: 'Google 연결됨',
  email: '이메일 로그인',
};

/** 16-02 계정 설정 — 로그아웃/회원 탈퇴가 여기로 옮겨왔다(예전엔 Settings 홈에 있었음). */
export default function AccountSettings({ navigation }: Props) {
  const displayName = useAuth((s) => s.displayName);
  const maskedEmail = useAuth((s) => s.maskedEmail);
  const provider = useAuth((s) => s.provider);
  const logout = useAuth((s) => s.logout);
  const photo = useSession((s) => s.photo);
  const linkedAccounts = useSettings((s) => s.linkedAccounts);
  const toggleLinkedAccount = useSettings((s) => s.toggleLinkedAccount);
  const clearAllPhotos = useMyPhotos((s) => s.clearAll);
  const showToast = useToast((s) => s.show);

  const [logoutVisible, setLogoutVisible] = useState(false);

  function handleChangeProfilePhoto() {
    Alert.alert('프로필 사진 변경', '이 배치엔 아직 연결되지 않았어요.');
  }

  function handleEditName() {
    Alert.alert('이름 변경', '이 배치엔 아직 연결되지 않았어요.');
  }

  function handleDownloadData() {
    showToast('다운로드를 준비하고 있어요. 완료되면 이메일로 보내드려요.');
  }

  function handleDeleteAllPhotos() {
    Alert.alert('사진 전체 삭제', '계정은 유지되고 사진만 모두 삭제돼요. 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          clearAllPhotos();
          showToast('사진을 모두 삭제했어요');
        },
      },
    ]);
  }

  function handleConfirmLogout() {
    setLogoutVisible(false);
    logout();
    navigation.popToTop();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="계정 설정" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.profileCol} onPress={handleChangeProfilePhoto}>
          <View style={[styles.avatarLg, { backgroundColor: provider === 'kakao' ? '#FEE500' : colors.primaryTintStrong }]} />
          <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>계정 정보</Text>
          <View style={styles.box}>
            <Pressable style={styles.infoRow} onPress={handleEditName}>
              <Text style={styles.infoRowKey}>이름</Text>
              <Text style={styles.infoRowValue}>{displayName || '이름 없음'}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowKey}>이메일</Text>
              <Text style={styles.infoRowValue}>{maskedEmail || '—'}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoRowKey}>로그인</Text>
              <View style={styles.loginBadgeRow}>
                <View style={styles.loginBadgeDot} />
                <Text style={styles.infoRowValue}>{PROVIDER_LOGIN_LABEL[provider ?? 'email']}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>연결된 계정</Text>
          <View style={styles.box}>
            <Pressable style={styles.linkRow} onPress={() => toggleLinkedAccount('apple')}>
              <View style={styles.linkDot} />
              <Text style={styles.linkRowText}>Apple</Text>
              <Text style={styles.linkAction}>{linkedAccounts.apple ? '연결됨' : '연결'}</Text>
            </Pressable>
            <Pressable style={[styles.linkRow, styles.linkRowLast]} onPress={() => toggleLinkedAccount('google')}>
              <View style={styles.linkDot} />
              <Text style={styles.linkRowText}>Google</Text>
              <Text style={styles.linkAction}>{linkedAccounts.google ? '연결됨' : '연결'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>내 데이터</Text>
          <View style={styles.box}>
            <Pressable style={styles.infoRow} onPress={handleDownloadData}>
              <View style={styles.infoTextCol}>
                <Text style={styles.infoRowTitle}>내 데이터 내려받기</Text>
                <Text style={styles.infoRowSubtitle}>사진·주문 내역 zip</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={[styles.infoRow, styles.infoRowLast]} onPress={handleDeleteAllPhotos}>
              <View style={styles.infoTextCol}>
                <Text style={styles.infoRowTitleDanger}>사진 전체 삭제</Text>
                <Text style={styles.infoRowSubtitle}>계정은 유지돼요</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <Pressable style={styles.logoutButton} onPress={() => setLogoutVisible(true)}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
        </Pressable>
      </View>

      <LogoutSheet
        visible={logoutVisible}
        onDismiss={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
        hasInProgressWork={photo !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 18 },
  profileCol: { alignItems: 'center', gap: 12, paddingVertical: 6 },
  avatarLg: { width: 76, height: 76, borderRadius: 38 },
  changePhotoText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  section: { gap: 9 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: 4 },
  infoRowLast: { borderBottomWidth: 0 },
  infoRowKey: { fontSize: 13, color: colors.textTertiary, width: 72 },
  infoRowValue: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  loginBadgeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  loginBadgeDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt },
  infoTextCol: { flex: 1, gap: 2 },
  infoRowTitle: { fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  infoRowTitleDanger: { fontSize: 14.5, fontWeight: '600', color: colors.error },
  infoRowSubtitle: { fontSize: 12, color: colors.textTertiary },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: 11 },
  linkRowLast: { borderBottomWidth: 0 },
  linkDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surfaceSubtleAlt },
  linkRowText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  linkAction: { fontSize: 13, fontWeight: '700', color: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  logoutButton: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  logoutButtonText: { fontSize: 15.5, fontWeight: '700', color: colors.textSecondary },
  deleteAccountText: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.textDisabled },
});
