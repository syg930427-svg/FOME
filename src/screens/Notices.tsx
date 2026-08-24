import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NOTICE_FILTERS, NoticeCategory } from '../api';
import { RootStackParamList } from '../navigation/types';
import { useNotices } from '../state/notices';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Notices'>;

/**
 * 19-04 공지사항 — 읽지 않은 공지에만 빨간 점, 읽은 공지는 투명도로 뒤로
 * 물린다. '규격 변경'을 최상위 필터로 둔 것이 이 서비스의 특성.
 */
export default function Notices({ navigation }: Props) {
  const notices = useNotices((s) => s.notices);
  const markRead = useNotices((s) => s.markRead);
  const markAllRead = useNotices((s) => s.markAllRead);

  const [filter, setFilter] = useState<NoticeCategory | 'all'>('all');

  const visibleNotices = useMemo(
    () => (filter === 'all' ? notices : notices.filter((n) => n.category === filter)),
    [notices, filter]
  );
  const hasUnread = notices.some((n) => !n.read);

  function handlePress(id: string) {
    markRead(id);
    navigation.navigate('NoticeDetail', { noticeId: id });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>공지사항</Text>
        {hasUnread && (
          <Text style={styles.markAllRead} onPress={markAllRead}>
            모두 읽음
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        {NOTICE_FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <Pressable key={f.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setFilter(f.id)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {visibleNotices.map((notice) => {
          const highlight = notice.important && !notice.read;
          return (
            <Pressable
              key={notice.id}
              style={[styles.card, highlight ? styles.cardHighlight : styles.cardDefault, notice.read && !highlight && styles.cardRead]}
              onPress={() => handlePress(notice.id)}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.categoryBadge, highlight ? styles.categoryBadgeHighlight : notice.category === 'maintenance' ? styles.categoryBadgeWarn : styles.categoryBadgeNeutral]}>
                  <Text style={[styles.categoryBadgeText, highlight ? styles.categoryBadgeTextHighlight : notice.category === 'maintenance' ? styles.categoryBadgeTextWarn : styles.categoryBadgeTextNeutral]}>
                    {notice.categoryLabel}
                  </Text>
                </View>
                {!notice.read && <View style={styles.unreadDot} />}
                <Text style={[styles.dateText, highlight && styles.dateTextHighlight]}>{notice.dateLabel}</Text>
              </View>
              <View style={styles.cardTextCol}>
                <Text style={[styles.cardTitle, notice.read && !highlight && styles.cardTitleMuted]}>{notice.title}</Text>
                <Text style={[styles.cardSummary, highlight ? styles.cardSummaryHighlight : notice.read && styles.cardSummaryMuted]} numberOfLines={2}>
                  {notice.summary}
                </Text>
              </View>
            </Pressable>
          );
        })}
        {visibleNotices.length === 0 && <Text style={styles.emptyText}>해당하는 공지가 없어요</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.screenPadding },
  back: { fontSize: 20, color: colors.textPrimary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  markAllRead: { marginLeft: 'auto', fontSize: 12.5, fontWeight: '700', color: colors.primary },
  chipsRow: { flexGrow: 0, paddingBottom: 14 },
  chipsContent: { paddingHorizontal: spacing.screenPadding, gap: 7 },
  chip: { height: 32, paddingHorizontal: 13, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.inverseBg, borderColor: colors.inverseBg },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { fontWeight: '700', color: colors.inverseText },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.screenPadding, gap: 11, paddingBottom: 24 },
  card: { padding: 15, borderRadius: 16, gap: 9 },
  cardDefault: { borderWidth: 1, borderColor: colors.border },
  cardHighlight: { borderWidth: 1.5, borderColor: '#DDE9FB', backgroundColor: colors.primaryTint },
  cardRead: { opacity: 0.72 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { height: 24, paddingHorizontal: 9, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  categoryBadgeHighlight: { backgroundColor: colors.primary },
  categoryBadgeWarn: { backgroundColor: colors.warningBg },
  categoryBadgeNeutral: { backgroundColor: colors.surfaceSubtleAlt },
  categoryBadgeText: { fontSize: 11.5, fontWeight: '700' },
  categoryBadgeTextHighlight: { color: colors.inverseText },
  categoryBadgeTextWarn: { color: colors.warning },
  categoryBadgeTextNeutral: { color: colors.textTertiary },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },
  dateText: { marginLeft: 'auto', fontSize: 11.5, color: colors.textDisabled },
  dateTextHighlight: { color: colors.infoText },
  cardTextCol: { gap: 5 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 15 * 1.45, color: colors.textPrimary },
  cardTitleMuted: { fontWeight: '600' },
  cardSummary: { fontSize: 12.5, lineHeight: 12.5 * 1.55, color: colors.textTertiary },
  cardSummaryHighlight: { color: colors.infoText },
  cardSummaryMuted: { color: colors.textDisabled },
  emptyText: { textAlign: 'center', padding: 24, fontSize: 13, color: colors.textDisabled },
});
