import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { FRAMING_OPTIONS } from '../api/mockData';
import { PhotoAdjustSheet } from '../components/PhotoAdjustSheet';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, TextButton } from '../components';
import { PhotoZoomModal } from '../components/PhotoZoomModal';
import { ReplacePhotoSheet } from '../components/ReplacePhotoSheet';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S07_PhotoConfirm'>;

const LEVEL_PERMISSION: Record<number, string> = {
  0: 'LEVEL 0 · PASSPORT_STYLE_LIMIT',
  1: 'LEVEL 1 · LIMITED_AI_EDIT',
  2: 'LEVEL 2 · LIMITED_AI_EDIT',
  3: 'LEVEL 3 · AI_STYLE_RECOMMEND',
};

/**
 * 05-02~05-15 통합본 — 옛 S07_PhotoConfirm(사진 확인) → PhotoCrop(범위) →
 * FacePosition(위치) → FramingSelect(상체 범위) → PhotoConfirmFinal(확정)로
 * 이어지던 5단계 체인을 화면 1개 + PhotoAdjustSheet(범위·위치 조정 Bottom
 * Sheet) 1개로 통합. 촬영(source='camera')·기존 사진(source='gallery') 두
 * 진입 경로가 이 화면 하나를 공유하며 헤더 타이틀만 갈라진다. CTA는 바로
 * S08_Options로 이동 — 중간 확정 단계 없이 session.framing이 즉시 반영된다.
 */
export default function S07_PhotoConfirm({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const editLevel = useSession((s) => s.editLevel);
  const source = useSession((s) => s.source);
  const photo = useSession((s) => s.photo);
  const framing = useSession((s) => s.framing);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const selectedFraming = FRAMING_OPTIONS.find((o) => o.id === framing.framingId) ?? FRAMING_OPTIONS[2];
  const [zoomVisible, setZoomVisible] = useState(false);
  const [replaceVisible, setReplaceVisible] = useState(false);
  const [adjustVisible, setAdjustVisible] = useState(false);
  const showToast = useToast((s) => s.show);

  const screenTitle = source === 'camera' ? '촬영 완료' : source === 'gallery' ? '사진 선택 완료' : '사진 확인';

  useEffect(() => {
    showToast('사진과 범위를 저장했어요');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={screenTitle} onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Pressable style={styles.previewWrap} onPress={() => setZoomVisible(true)}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <PhotoPlaceholder width="100%" height={330} radius={16} />
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{source === 'gallery' ? '원본 · 갤러리에서 선택' : '원본 · 방금 촬영'}</Text>
          </View>
        </Pressable>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>목적</Text>
            <Text style={styles.summaryValue}>{purpose?.title ?? '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>AI 권한</Text>
            <Text style={styles.summaryValue}>{LEVEL_PERMISSION[editLevel]}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>범위</Text>
            <Text style={styles.summaryValue}>{selectedFraming.title}</Text>
            <Text style={styles.summaryAction} onPress={() => setAdjustVisible(true)}>
              변경
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>사진</Text>
            <Text style={styles.summaryValue}>{source === 'gallery' ? '갤러리에서 선택' : '촬영한 사진'}</Text>
            <Text style={styles.summaryAction} onPress={() => setReplaceVisible(true)}>
              교체
            </Text>
          </View>
        </View>

        <Text style={styles.footnote}>자동 PASS/FAIL을 표시하지 않아요. 샘플과 비교해 직접 판단해 주세요.</Text>
        {/* push 사용: navigate는 스택에 이미 있는 S02로 점프하며 그 사이 화면들을
            스택에서 지워버려, 뒤로가기 시 이 확인 화면으로 못 돌아간다. */}
        <TextButton label="사진 준비 기준 다시 보기" onPress={() => navigation.push('S02_PurposeGuide')} />
      </ScrollView>

      <View style={styles.ctaArea}>
        <View style={styles.retakeRow}>
          <SecondaryButton label="다시 촬영" compact style={styles.retakeButton} onPress={() => navigation.navigate('S05_Camera')} />
          <SecondaryButton label="다른 사진" compact style={styles.retakeButton} onPress={() => navigation.navigate('S06_Upload')} />
        </View>
        <PrimaryButton label="이 사진으로 계속하기" onPress={() => navigation.navigate('S08_Options')} />
      </View>

      <PhotoZoomModal
        visible={zoomVisible}
        onClose={() => setZoomVisible(false)}
        photoUri={photo?.uri}
        purposeLabel={purpose?.title.replace(' 사진', '') ?? '증명사진'}
        onReplace={() => {
          setZoomVisible(false);
          setReplaceVisible(true);
        }}
        onUse={() => setZoomVisible(false)}
      />

      <ReplacePhotoSheet
        visible={replaceVisible}
        onDismiss={() => setReplaceVisible(false)}
        onRetake={() => {
          setReplaceVisible(false);
          navigation.navigate('S05_Camera');
        }}
        onReselect={() => {
          setReplaceVisible(false);
          navigation.navigate('S06_Upload');
        }}
      />

      <PhotoAdjustSheet visible={adjustVisible} onDismiss={() => setAdjustVisible(false)} purposeId={purposeId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 16, paddingBottom: 24 },
  previewWrap: { width: '100%', height: 330, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfacePlaceholder },
  previewImage: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  summaryBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: 8 },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 13.5, color: colors.textTertiary, width: 56 },
  summaryValue: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  summaryAction: { fontSize: 13, fontWeight: '600', color: colors.primary },
  footnote: { fontSize: 12, lineHeight: 12 * 1.55, color: colors.textDisabled },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  retakeRow: { flexDirection: 'row', gap: 10 },
  retakeButton: { flex: 1 },
});
