import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPolicy, PURPOSES } from '../api';
import { PurposeId } from '../api/types';
import { BottomTabBar, TabKey } from '../components';
import { BellGlyph, CameraGlyph } from '../components/EntryIcons';
import { BriefcaseGlyph, IdPhotoGlyph, LicenseGlyph, PassportGlyph } from '../components/PurposeIcons';
import { RootStackParamList } from '../navigation/types';
import { quickStartPurpose } from '../quickStart';
import { useMyPhotos } from '../state/myPhotos';
import { useNotices } from '../state/notices';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S01_Purpose'>;

const POLICY_LOAD_TIMEOUT_MS = 3000;

const HOME_CARDS: {
  id: PurposeId;
  specLabel: string;
  specColor: string;
  featured?: boolean;
  Icon: (props: { color?: string }) => React.ReactElement;
}[] = [
  { id: 'idPhoto', specLabel: '35×45mm · 흰 배경', specColor: '#5B85C4', featured: true, Icon: IdPhotoGlyph },
  { id: 'passport', specLabel: '35×45mm · 머리 32–36mm', specColor: colors.textTertiary, Icon: PassportGlyph },
  { id: 'driverLicense', specLabel: '30×40mm · 상반신', specColor: colors.textTertiary, Icon: LicenseGlyph },
  { id: 'job', specLabel: '자유 규격 · 정장 보정', specColor: colors.textTertiary, Icon: BriefcaseGlyph },
];

const STATUS_BADGE: Record<string, string> = { purchased: '완성', unpaid: '미결제', expired: '만료' };

/**
 * 02-01 홈 — 목적 선택 홈 (다른 디자인 프로젝트의 새 핸드오프로 기존 S01을
 * 대체). "POME" 브랜드, 2×2 목적 카드 그리드(한 탭이면 바로 진행 — 이전의
 * 선택→CTA 2단계 대신), "이미 가진 사진" 단축 경로, 최근 작업 미리보기,
 * 4번째 탭 "촬영"이 새로 생겼다. RULE-01은 그대로 지켜진다 — 카드 그리드
 * 자체가 목적을 먼저 정하게 만들고, 카메라/갤러리 단축 경로도 목적을
 * 먼저(idPhoto로) 확정한 뒤에만 진행한다.
 */
export default function S01_Purpose({ navigation }: Props) {
  const selectPurpose = useSession((s) => s.selectPurpose);
  const generation = useSession((s) => s.getActiveGeneration());
  const orders = useMyPhotos((s) => s.orders);
  const unreadNoticeCount = useNotices((s) => s.notices.filter((n) => !n.read).length);
  // Phase 4 — S10에서 홈으로 나가도 generation은 세션에 그대로 남는다("사라지면
  // 안 됨"). 완성/실패까지 다룬 상태 카드(My Photos 연동)는 다음 Phase 과제이고,
  // 지금은 "다시 이어 보기" 연결 지점만 최소로 유지한다.
  const generationInProgress = generation && (generation.status === 'queued' || generation.status === 'running');

  const [submittingId, setSubmittingId] = useState<PurposeId | null>(null);

  const recentOrder = orders[0] ?? null;

  function handleSelectTab(tab: TabKey) {
    if (tab === 'shoot') void handleQuickCamera();
    else if (tab === 'myPhotos') navigation.navigate('MyPhotos');
    else if (tab === 'settings') navigation.navigate('Settings');
  }

  async function handleSelectPurpose(id: PurposeId) {
    if (submittingId) return;
    setSubmittingId(id);
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), POLICY_LOAD_TIMEOUT_MS));
      const policy = await Promise.race([getPolicy(id), timeout]);
      if (!policy) {
        navigation.navigate('ServerError');
        return;
      }
      selectPurpose(id, policy.policyId, policy.editLevel);
      // 목적 선택 직후 곧장 "사진을 어떻게 준비할까요?"로 이동한다 — 촬영/기존
      // 사진 중 뭘 고르느냐에 따라 준비 안내(S02_PurposeGuide)를 볼지 말지가
      // 갈린다(촬영일 때만 그 화면을 거침, PhotoInputMethod 참고).
      navigation.navigate('PhotoInputMethod', {});
    } catch {
      navigation.navigate('ServerError');
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleQuickCamera() {
    await quickStartPurpose();
    navigation.navigate('PhotoInputMethod', { preselect: 'camera' });
  }

  async function handleQuickGallery() {
    await quickStartPurpose();
    navigation.navigate('PhotoInputMethod', { preselect: 'gallery' });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>POME</Text>
        <Pressable style={styles.bellWrap} onPress={() => navigation.navigate('Notices')} hitSlop={8}>
          <BellGlyph />
          {unreadNoticeCount > 0 && <View style={styles.bellDot} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {generationInProgress && (
          <Pressable
            style={styles.generationCard}
            onPress={() => navigation.navigate('S10_Generating', { generationId: generation.id })}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.generationCardText}>사진을 만들고 있어요</Text>
            <Text style={styles.generationCardLink}>확인하기</Text>
          </Pressable>
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title}>어떤 사진이{'\n'}필요하세요?</Text>
          <Text style={styles.subtitle}>목적만 고르면 규격·배경·보정까지 알아서 맞춰드려요.</Text>
        </View>

        <View style={styles.grid}>
          {HOME_CARDS.map(({ id, specLabel, specColor, featured, Icon }) => {
            const purpose = PURPOSES.find((p) => p.id === id);
            const dimmed = submittingId !== null && submittingId !== id;
            return (
              <Pressable
                key={id}
                style={[styles.card, featured ? styles.cardFeatured : styles.cardDefault, dimmed && styles.cardDimmed]}
                onPress={() => handleSelectPurpose(id)}
                disabled={submittingId !== null}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: featured ? colors.surface : colors.primaryTint }]}>
                  <Icon color={colors.primary} />
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>{submittingId === id ? '불러오는 중…' : purpose?.title}</Text>
                  <Text style={[styles.cardSpec, { color: specColor }]}>{specLabel}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.uploadRow} onPress={handleQuickGallery} disabled={submittingId !== null}>
          <View style={styles.uploadIconWrap}>
            <CameraGlyph color={colors.textSecondary} />
          </View>
          <View style={styles.uploadTextCol}>
            <Text style={styles.uploadTitle}>사진을 이미 가지고 있어요</Text>
            <Text style={styles.uploadSubtitle}>가진 사진을 규격에 맞게 다듬어 드려요</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {recentOrder && (
          <View style={styles.recentCol}>
            <View style={styles.recentHeaderRow}>
              <Text style={styles.recentLabel}>최근 작업</Text>
              <Text style={styles.recentAllLink} onPress={() => navigation.navigate('MyPhotos')}>
                전체 보기
              </Text>
            </View>
            <Pressable
              style={styles.recentCard}
              onPress={() => navigation.navigate('PhotoOrderDetail', { orderId: recentOrder.id })}
            >
              <View style={styles.recentThumb} />
              <View style={styles.recentTextCol}>
                <Text style={styles.recentTitle}>{recentOrder.title}</Text>
                <Text style={styles.recentMeta}>
                  {recentOrder.createdLabel} · {recentOrder.resultCount}장 저장됨
                </Text>
              </View>
              <View style={styles.recentBadge}>
                <Text style={styles.recentBadgeText}>{STATUS_BADGE[recentOrder.status]}</Text>
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomTabBar active="home" onSelect={handleSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  brand: { fontSize: 21, fontWeight: '800', letterSpacing: -0.6, color: colors.textPrimary },
  bellWrap: { marginLeft: 'auto', width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 10, paddingBottom: 24, gap: 26 },
  generationCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 14, backgroundColor: colors.primaryTint },
  generationCardText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  generationCardLink: { fontSize: 13, fontWeight: '700', color: colors.primary },
  titleBlock: { gap: 9 },
  title: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5, lineHeight: 25 * 1.35, color: colors.textPrimary },
  subtitle: { fontSize: 14, lineHeight: 14 * 1.6, color: colors.textTertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  card: { width: '47%', flexGrow: 1, gap: 12, padding: 16, borderRadius: 18 },
  cardDefault: { borderWidth: 1, borderColor: colors.border },
  cardFeatured: { borderWidth: 1.5, borderColor: '#DDE9FB', backgroundColor: colors.primaryTint },
  cardDimmed: { opacity: 0.45 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTextCol: { gap: 3 },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary },
  cardSpec: { fontSize: 11.5 },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surfaceSubtle },
  uploadIconWrap: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  uploadTextCol: { flex: 1, gap: 2 },
  uploadTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  uploadSubtitle: { fontSize: 12, color: colors.textTertiary },
  chevron: { fontSize: 17, color: colors.textDisabledAlt },
  recentCol: { gap: 11 },
  recentHeaderRow: { flexDirection: 'row', alignItems: 'baseline' },
  recentLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  recentAllLink: { marginLeft: 'auto', fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  recentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  recentThumb: { width: 42, height: 54, borderRadius: 6, backgroundColor: colors.surfaceSubtleAlt },
  recentTextCol: { flex: 1, gap: 4 },
  recentTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  recentMeta: { fontSize: 12, color: colors.textTertiary },
  recentBadge: { height: 26, paddingHorizontal: 10, borderRadius: 6, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  recentBadgeText: { fontSize: 11.5, fontWeight: '700', color: colors.primary },
});
