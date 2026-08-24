import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPolicy, PASSPORT_SPEC_NOTICE_DETAIL } from '../api';
import { PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useNotices } from '../state/notices';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'NoticeDetail'>;

/**
 * 19-05 공지사항 상세. 본문보다 중요한 건 '나에게 해당되나'와 '그래서 뭘
 * 하나' — 영향 범위 카드를 본문 앞에, 실행 CTA를 하단 고정으로 둔다.
 * 이 배치엔 여권 규격 변경 공지(`PASSPORT_SPEC_NOTICE_DETAIL`)만 실제
 * 상세 본문이 있어, 다른 공지는 목록의 summary를 본문으로 재사용한다.
 */
export default function NoticeDetail({ navigation, route }: Props) {
  const notice = useNotices((s) => s.getNotice(route.params.noticeId));
  const selectPurpose = useSession((s) => s.selectPurpose);

  if (!notice) {
    navigation.goBack();
    return null;
  }

  const detail = notice.id === PASSPORT_SPEC_NOTICE_DETAIL.noticeId ? PASSPORT_SPEC_NOTICE_DETAIL : null;

  async function handleRemakeForNewSpec() {
    const policy = await getPolicy('passport');
    selectPurpose('passport', policy.policyId, policy.editLevel);
    navigation.navigate('S04_ShootingGuide');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>공지사항</Text>
        <Text style={styles.share}>↗</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBlock}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{notice.categoryLabel}</Text>
          </View>
          <Text style={styles.title}>{notice.title}</Text>
          <Text style={styles.dateText}>{notice.dateLabel}</Text>
        </View>

        {detail ? (
          <>
            <View style={styles.audienceBox}>
              <Text style={styles.audienceLabel}>이 공지가 영향을 주는 사람</Text>
              {detail.audience.map((line) => (
                <Text key={line} style={styles.audienceLine}>
                  · {line}
                </Text>
              ))}
            </View>

            <Text style={styles.body}>{detail.body}</Text>

            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonLabel}>달라지는 점</Text>
              <View style={styles.comparisonBox}>
                <View style={[styles.comparisonRow, styles.comparisonHeaderRow]}>
                  <Text style={styles.comparisonHeaderCell}>항목</Text>
                  <Text style={styles.comparisonHeaderCellBefore}>기존</Text>
                  <Text style={styles.comparisonHeaderCellAfter}>변경</Text>
                </View>
                {detail.comparisonRows.map((row, i) => (
                  <View key={row.label} style={[styles.comparisonRow, i < detail.comparisonRows.length - 1 && styles.comparisonRowDivider]}>
                    <Text style={styles.comparisonLabelCell}>{row.label}</Text>
                    <Text style={styles.comparisonBeforeCell}>{row.before}</Text>
                    <Text style={styles.comparisonAfterCell}>{row.after}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.reworkBox}>
              <Text style={styles.reworkLabel}>이미 만든 사진이 있다면</Text>
              <Text style={styles.reworkText}>{detail.reworkNote}</Text>
            </View>

            <Pressable style={styles.externalRow} onPress={() => Linking.openURL(detail.externalUrl)}>
              <Text style={styles.externalLabel}>{detail.externalLinkLabel}</Text>
              <Text style={styles.externalGlyph}>↗</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.body}>{notice.summary}</Text>
        )}
      </ScrollView>

      {detail && (
        <View style={styles.ctaArea}>
          <PrimaryButton label="내 사진 새 규격으로 다시 만들기" onPress={handleRemakeForNewSpec} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  back: { fontSize: 20, color: colors.textPrimary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  share: { marginLeft: 'auto', fontSize: 18, color: colors.textTertiary },
  scrollContent: { padding: spacing.screenPadding, gap: 18 },
  titleBlock: { gap: 9 },
  categoryBadge: { alignSelf: 'flex-start', height: 26, paddingHorizontal: 10, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  categoryBadgeText: { fontSize: 11.5, fontWeight: '700', color: colors.inverseText },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 20 * 1.4, letterSpacing: -0.2, color: colors.textPrimary },
  dateText: { fontSize: 12, color: colors.textDisabled },
  audienceBox: { gap: 8, padding: 15, borderRadius: 14, backgroundColor: colors.primaryTint },
  audienceLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  audienceLine: { fontSize: 13, lineHeight: 13 * 1.55, color: colors.infoText },
  body: { fontSize: 14, lineHeight: 14 * 1.75, color: colors.textSecondary },
  comparisonCol: { gap: 9 },
  comparisonLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  comparisonBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 13 },
  comparisonRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  comparisonHeaderRow: { backgroundColor: colors.surfacePlaceholderAlt, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  comparisonHeaderCell: { flex: 1, fontSize: 11.5, fontWeight: '700', color: colors.textTertiary },
  comparisonHeaderCellBefore: { width: 72, fontSize: 11.5, fontWeight: '700', color: colors.textTertiary },
  comparisonHeaderCellAfter: { width: 72, fontSize: 11.5, fontWeight: '700', color: colors.primary },
  comparisonLabelCell: { flex: 1, fontSize: 12.5, color: colors.textSecondaryAlt },
  comparisonBeforeCell: { width: 72, fontSize: 12.5, color: colors.textDisabled },
  comparisonAfterCell: { width: 72, fontSize: 12.5, fontWeight: '700', color: colors.textPrimary },
  reworkBox: { gap: 10, padding: 15, borderRadius: 14, backgroundColor: colors.warningBg },
  reworkLabel: { fontSize: 13, fontWeight: '700', color: colors.warningStrong },
  reworkText: { fontSize: 12.5, lineHeight: 12.5 * 1.6, color: colors.warningStrong },
  externalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  externalLabel: { fontSize: 12.5, color: colors.textSecondaryAlt },
  externalGlyph: { fontSize: 16, color: colors.textDisabledAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
