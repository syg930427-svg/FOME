import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, ToggleSwitch } from '../components';
import { RootStackParamList } from '../navigation/types';
import { getNotificationsPermission } from '../permissions';
import { PermissionStatus } from '../state/appEntry';
import { useSettings } from '../state/settings';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;

const REQUIRED_ROWS = [
  { key: 'photoComplete' as const, title: '사진 만들기 완료', subtitle: '앱을 닫아도 알려줘요' },
  { key: 'paymentRefund' as const, title: '결제·환불 안내', subtitle: '결제 결과와 환불 진행' },
  { key: 'deletionWarning' as const, title: '사진 삭제 예정 안내', subtitle: '자동 삭제 3일 전' },
];

const OPTIONAL_ROWS = [
  { key: 'promo' as const, title: '할인·이벤트', subtitle: '한 달에 2회 이내' },
  { key: 'newFeature' as const, title: '새 기능 소식', subtitle: '새 목적·규격 추가 시' },
];

/** 16-03 알림 설정. 상단 배너는 실제 OS 알림 권한 상태를 조회해 보여준다(01-07과 동일한 조회 방식). */
export default function NotificationSettings({ navigation }: Props) {
  const notifications = useSettings((s) => s.notifications);
  const doNotDisturb = useSettings((s) => s.doNotDisturb);
  const toggleNotification = useSettings((s) => s.toggleNotification);
  const toggleDoNotDisturb = useSettings((s) => s.toggleDoNotDisturb);

  const [osStatus, setOsStatus] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    getNotificationsPermission().then((status) => {
      if (mounted) setOsStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const osAllowed = osStatus === 'granted' || osStatus === 'limited';
  const anyRequiredOff = !notifications.photoComplete || !notifications.paymentRefund || !notifications.deletionWarning;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="알림" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.banner, !osAllowed && styles.bannerOff]}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>{osAllowed ? '기기 알림 허용됨' : '기기 알림이 꺼져 있어요'}</Text>
            <Text style={styles.bannerSubtitle}>
              {osStatus === null ? '확인하는 중…' : osAllowed ? '이 앱의 알림이 켜져 있어요' : 'iOS 설정에서 이 앱의 알림을 켜주세요'}
            </Text>
          </View>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={styles.bannerLink}>시스템 설정</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>꼭 필요한 알림</Text>
          <View style={styles.box}>
            {REQUIRED_ROWS.map((row, i) => (
              <View key={row.key} style={[styles.row, i < REQUIRED_ROWS.length - 1 && styles.rowDivider]}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
                </View>
                <ToggleSwitch value={notifications[row.key]} onValueChange={() => toggleNotification(row.key)} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>선택 알림</Text>
          <View style={styles.box}>
            {OPTIONAL_ROWS.map((row, i) => (
              <View key={row.key} style={[styles.row, i < OPTIONAL_ROWS.length - 1 && styles.rowDivider]}>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
                </View>
                <ToggleSwitch value={notifications[row.key]} onValueChange={() => toggleNotification(row.key)} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.dndRow}>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowTitle}>방해 금지 시간</Text>
            <Text style={styles.rowSubtitle}>22:00 – 08:00</Text>
          </View>
          <ToggleSwitch value={doNotDisturb} onValueChange={toggleDoNotDisturb} />
        </View>

        {anyRequiredOff && (
          <View style={styles.infoBox}>
            <Text style={styles.infoGlyph}>i</Text>
            <Text style={styles.infoText}>꼭 필요한 알림을 끄면 사진이 완성돼도 알려드릴 수 없어요.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 18 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 14, backgroundColor: colors.primaryTint },
  bannerOff: { backgroundColor: colors.warningBg },
  bannerTextCol: { flex: 1, gap: 3 },
  bannerTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  bannerSubtitle: { fontSize: 12.5, color: colors.infoText, lineHeight: 12.5 * 1.45 },
  bannerLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  section: { gap: 9 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  rowTextCol: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  rowSubtitle: { fontSize: 12, color: colors.textTertiary },
  dndRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 10 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
});
