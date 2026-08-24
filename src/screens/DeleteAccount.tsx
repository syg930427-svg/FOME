import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeleteAccountConfirmModal, LogoutSheet, ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { useMyPhotos } from '../state/myPhotos';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'DeleteAccount'>;

const KRW = new Intl.NumberFormat('ko-KR');
const REASONS = ['결과가 아쉬워요', '가격이 부담돼요', '필요한 일이 끝났어요', '개인정보가 걱정돼요'];

/** 14-06 회원 탈퇴 (+ 14-07 확인 모달을 같은 화면에서 관리). */
export default function DeleteAccount({ navigation }: Props) {
  const orders = useMyPhotos((s) => s.orders);
  const clearAllPhotos = useMyPhotos((s) => s.clearAll);
  const creditBalance = useAuth((s) => s.creditBalance);
  const freeRetryUsed = useSession((s) => s.freeRetryUsed);
  const photo = useSession((s) => s.photo);
  const logout = useAuth((s) => s.logout);
  const deleteAccount = useAuth((s) => s.deleteAccount);
  const resetSession = useSession((s) => s.reset);
  const showToast = useToast((s) => s.show);

  const [reason, setReason] = useState<string | null>('필요한 일이 끝났어요');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const totalPhotos = useMemo(() => orders.reduce((sum, o) => sum + o.resultCount, 0), [orders]);
  const breakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.title, (counts.get(o.title) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([title, count]) => `${title.replace(' 사진', '')} ${count}`)
      .join(' · ');
  }, [orders]);

  function handleSaveFirst() {
    showToast('사진을 앨범에 저장했어요');
  }

  function handleLogoutInstead() {
    setLogoutVisible(true);
  }

  function handleConfirmLogout() {
    setLogoutVisible(false);
    logout();
    navigation.popToTop();
  }

  function handleConfirmDelete() {
    setConfirmVisible(false);
    clearAllPhotos();
    resetSession();
    deleteAccount();
    showToast('탈퇴가 완료됐어요');
    navigation.popToTop();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="회원 탈퇴" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>떠나기 전에 확인해 주세요</Text>
          <Text style={styles.subtitle}>탈퇴하면 얼굴 정보와 만든 사진이 모두 삭제되고 되돌릴 수 없어요.</Text>
        </View>

        <View style={styles.deletedBox}>
          <Text style={styles.deletedLabel}>삭제되는 것</Text>
          <Text style={styles.deletedRow}>– 업로드한 원본 얼굴 사진 전부</Text>
          <Text style={styles.deletedRow}>
            – 만든 사진 {totalPhotos}장{breakdown ? ` (${breakdown})` : ''}
          </Text>
          <Text style={styles.deletedRow}>– 남은 크레딧 {KRW.format(creditBalance)}원 (환불 불가)</Text>
          <Text style={styles.deletedRow}>– 무료 재생성 잔여 {freeRetryUsed ? 0 : 1}회</Text>
        </View>

        <View style={styles.keptBox}>
          <Text style={styles.keptLabel}>법령에 따라 보관되는 것</Text>
          <Text style={styles.keptRow}>· 결제·환불 기록 (5년)</Text>
          <Text style={styles.keptRow}>· 전자상거래 계약 기록 (5년)</Text>
          <Text style={styles.keptNote}>얼굴 정보는 여기에 포함되지 않고 즉시 삭제돼요.</Text>
        </View>

        <View style={styles.saveCard}>
          <View style={styles.saveTextCol}>
            <Text style={styles.saveTitle}>먼저 사진을 저장할까요?</Text>
            <Text style={styles.saveSubtitle}>탈퇴 후에는 다시 받을 수 없어요.</Text>
          </View>
          <Pressable style={styles.saveButton} onPress={handleSaveFirst}>
            <Text style={styles.saveButtonText}>저장</Text>
          </Pressable>
        </View>

        <View style={styles.reasonCol}>
          <Text style={styles.reasonLabel}>
            떠나는 이유 <Text style={styles.reasonOptional}>(선택)</Text>
          </Text>
          <View style={styles.reasonChips}>
            {REASONS.map((r) => {
              const active = reason === r;
              return (
                <Pressable key={r} style={[styles.reasonChip, active && styles.reasonChipActive]} onPress={() => setReason(active ? null : r)}>
                  <Text style={[styles.reasonChipText, active && styles.reasonChipTextActive]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="그냥 로그아웃할게요" onPress={handleLogoutInstead} />
        <Pressable style={styles.dangerButton} onPress={() => setConfirmVisible(true)}>
          <Text style={styles.dangerButtonText}>탈퇴 진행하기</Text>
        </Pressable>
      </View>

      <LogoutSheet
        visible={logoutVisible}
        onDismiss={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
        hasInProgressWork={photo !== null}
      />
      <DeleteAccountConfirmModal
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        onConfirm={handleConfirmDelete}
        photoCount={totalPhotos}
        creditBalance={creditBalance}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 11 },
  titleBlock: { gap: 8, paddingBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.32, letterSpacing: -0.02 * 22, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 14 * 1.55 },
  deletedBox: { gap: 9, padding: 15, borderRadius: 14, backgroundColor: '#FBF2F2', borderWidth: 1, borderColor: '#F0DCDC' },
  deletedLabel: { fontSize: 13, fontWeight: '700', color: '#A31515' },
  deletedRow: { fontSize: 13.5, lineHeight: 13.5 * 1.45, color: '#A33' },
  keptBox: { gap: 9, padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle },
  keptLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  keptRow: { fontSize: 13.5, lineHeight: 13.5 * 1.45, color: colors.textSecondaryAlt },
  keptNote: { fontSize: 12, lineHeight: 12 * 1.5, color: colors.textTertiary },
  saveCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#DDE9FB', backgroundColor: colors.primaryTint },
  saveTextCol: { flex: 1, gap: 3 },
  saveTitle: { fontSize: 14.5, fontWeight: '700', color: colors.primary },
  saveSubtitle: { fontSize: 12.5, color: colors.infoText, lineHeight: 12.5 * 1.45 },
  saveButton: { height: 36, paddingHorizontal: 13, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 13, fontWeight: '700', color: colors.inverseText },
  reasonCol: { gap: 8 },
  reasonLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  reasonOptional: { color: colors.textTertiary, fontWeight: '600' },
  reasonChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  reasonChip: { height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  reasonChipActive: { backgroundColor: colors.inverseBg, borderColor: colors.inverseBg },
  reasonChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondaryAlt },
  reasonChipTextActive: { fontWeight: '700', color: colors.inverseText },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  dangerButton: { height: 52, borderRadius: 14, backgroundColor: '#FBF2F2', borderWidth: 1, borderColor: '#F0DCDC', alignItems: 'center', justifyContent: 'center' },
  dangerButtonText: { fontSize: 16, fontWeight: '700', color: colors.error },
});
