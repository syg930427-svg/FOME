import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar, DeleteConfirmModal, PhotoListItem, PrimaryButton, TabKey } from '../components';
import { RootStackParamList } from '../navigation/types';
import { quickStartPurpose } from '../quickStart';
import { DeleteScope, useMyPhotos } from '../state/myPhotos';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPhotos'>;

/** 13-01 — 내 사진. Also renders the 13-07 "삭제 완료" state — same screen, the deletion just updates the list + fires a toast. */
export default function MyPhotos({ navigation }: Props) {
  const orders = useMyPhotos((s) => s.orders);
  const deleteOrder = useMyPhotos((s) => s.deleteOrder);
  const showToast = useToast((s) => s.show);

  const [filter, setFilter] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.title, (counts.get(o.title) ?? 0) + 1);
    return Array.from(counts.entries()).map(([title, count]) => ({ title, count }));
  }, [orders]);

  const visibleOrders = filter ? orders.filter((o) => o.title === filter) : orders;

  function handleSelectTab(tab: TabKey) {
    if (tab === 'home') navigation.navigate('S01_Purpose');
    else if (tab === 'settings') navigation.navigate('Settings');
    else if (tab === 'shoot') void handleQuickCamera();
  }

  async function handleQuickCamera() {
    await quickStartPurpose();
    navigation.navigate('PhotoInputMethod', { preselect: 'camera' });
  }

  function handleRowPress(orderId: string) {
    if (editMode) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);
        return next;
      });
    } else {
      navigation.navigate('PhotoOrderDetail', { orderId });
    }
  }

  function handleBulkDelete(scope: DeleteScope) {
    const count = selected.size;
    for (const id of selected) deleteOrder(id, scope);
    setBulkDeleteVisible(false);
    setSelected(new Set());
    setEditMode(false);
    showToast(scope === 'both' ? `사진 ${count}개를 삭제했어요` : `원본 ${count}개를 삭제했어요`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>내 사진</Text>
        <Text
          style={styles.editLink}
          onPress={() => {
            setEditMode((v) => !v);
            setSelected(new Set());
          }}
        >
          {editMode ? '완료' : '편집'}
        </Text>
      </View>

      {editMode && (
        <View style={styles.editBar}>
          <Text style={styles.editBarText}>{selected.size}개 선택됨</Text>
          <Text
            style={[styles.editBarDelete, selected.size === 0 && styles.editBarDeleteDisabled]}
            onPress={() => selected.size > 0 && setBulkDeleteVisible(true)}
          >
            삭제
          </Text>
        </View>
      )}

      {orders.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
          <Pressable style={[styles.chip, filter === null && styles.chipActive]} onPress={() => setFilter(null)}>
            <Text style={[styles.chipText, filter === null && styles.chipTextActive]}>전체 {orders.length}</Text>
          </Pressable>
          {filters.map((f) => (
            <Pressable key={f.title} style={[styles.chip, filter === f.title && styles.chipActive]} onPress={() => setFilter(f.title)}>
              <Text style={[styles.chipText, filter === f.title && styles.chipTextActive]}>
                {f.title.replace(' 사진', '')} {f.count}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon} />
            <View style={styles.emptyTextCol}>
              <Text style={styles.emptyTitle}>아직 만든 사진이 없어요</Text>
              <Text style={styles.emptySubtitle}>목적을 고르면 3분 안에 완성돼요</Text>
            </View>
            <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('S01_Purpose')}>
              <Text style={styles.emptyButtonText}>사진 만들기</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {visibleOrders.map((order) => (
            <PhotoListItem
              key={order.id}
              order={order}
              editMode={editMode}
              selected={selected.has(order.id)}
              onPress={() => handleRowPress(order.id)}
            />
          ))}
          <View style={styles.infoBox}>
            <Text style={styles.infoGlyph}>i</Text>
            <Text style={styles.infoText}>원본 얼굴 사진은 결과 생성 후 7일 뒤 자동으로 삭제돼요.</Text>
          </View>
        </ScrollView>
      )}

      {orders.length > 0 && (
        <View style={styles.ctaArea}>
          <PrimaryButton label="새 사진 만들기" onPress={() => navigation.navigate('S01_Purpose')} />
        </View>
      )}

      <BottomTabBar active="myPhotos" onSelect={handleSelectTab} />

      <DeleteConfirmModal
        visible={bulkDeleteVisible}
        onDismiss={() => setBulkDeleteVisible(false)}
        onConfirm={handleBulkDelete}
        resultCount={visibleOrders.find((o) => selected.has(o.id))?.resultCount ?? 4}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  editLink: { marginLeft: 'auto', fontSize: 13, fontWeight: '700', color: colors.primary },
  editBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadding, paddingBottom: 10 },
  editBarText: { fontSize: 13, color: colors.textSecondaryAlt },
  editBarDelete: { marginLeft: 'auto', fontSize: 13, fontWeight: '700', color: colors.error },
  editBarDeleteDisabled: { color: colors.textDisabled },
  chipsRow: { flexGrow: 0, paddingBottom: 14 },
  chipsContent: { paddingHorizontal: spacing.screenPadding, gap: 7 },
  chip: { height: 34, paddingHorizontal: 13, borderRadius: 17, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.inverseBg },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondaryAlt },
  chipTextActive: { fontWeight: '700', color: colors.inverseText },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.screenPadding, gap: 11, paddingBottom: 12 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceSubtle, marginTop: 2 },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 10 },
  emptyWrap: { flex: 1, paddingHorizontal: spacing.screenPadding },
  emptyBox: { padding: 26, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surfaceSubtle, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 48, height: 60, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderStrong, borderStyle: 'dashed' },
  emptyTextCol: { alignItems: 'center', gap: 4 },
  emptyTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { fontSize: 12.5, color: colors.textTertiary, textAlign: 'center', lineHeight: 12.5 * 1.5 },
  emptyButton: { height: 40, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  emptyButtonText: { fontSize: 13.5, fontWeight: '700', color: colors.inverseText },
});
