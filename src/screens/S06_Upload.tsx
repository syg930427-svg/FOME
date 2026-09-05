import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadPhoto } from '../api';
import { PrepExampleBlock, PrepHeader, PrepRuleCard, PrimaryButton, SecondaryButton } from '../components';
import { PhotoGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getPhotosPermission, requestPhotosPermission } from '../permissions';
import { useSession } from '../state/session';
import { colors, radius, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S06_Upload'>;

const RULES = [
  { index: '01', title: '얼굴 방향', description: '정면에 가깝고, 심하게 기울어지지 않은 사진' },
  { index: '02', title: '얼굴 크기', description: '얼굴이 사진에서 충분히 크게 나온 사진' },
  { index: '03', title: '선명도', description: '흔들리거나 흐리지 않고 얼굴이 선명한 사진' },
  { index: '04', title: '가림 없음', description: '모자·마스크·머리카락에 얼굴이 가려지지 않은 사진' },
  { index: '05', title: '인물 수', description: '한 사람만 나온 사진을 골라주세요' },
  { index: '06', title: '밝기', description: '지나치게 어둡지 않고 얼굴이 잘 보이는 사진' },
];

const TIPS = ['최근에 찍은 사진일수록 좋아요', '여러 명이 나온 사진은 잘라도 사용하기 어려워요', '안경에 반사광이 심한 사진은 피해주세요'];

/** 실루엣 도형 — width/height/top-radius만 다르고 구조는 동일해서 헬퍼로 뺌(CameraPrep과 동일 패턴). */
function silhouetteStyle(width: number, height: number, topRadius: number, bg: string): ViewStyle {
  return { width, height, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius, backgroundColor: bg };
}

/**
 * S06 — "사진 선택 기준"(Claude Design 핸드오프 "사진 준비 안내 2화면" 중
 * Album Selection Guidance). `PhotoInputMethod`에서 "기존 사진 사용"을 고른
 * 뒤 이 화면을 거쳐 실제 갤러리 피커로 들어간다. 화면 상단(헤더/규칙/예시/팁)
 * 은 핸드오프 hifi 스펙 그대로 재구현한 정적 안내 UI이고, 실제 사진 선택
 * 로직(권한 확인 → 피커 오픈 → 업로드 → 오류 처리)은 기존 구현을 전혀 건드리지
 * 않았다 — 핸드오프 자체가 "화면은 상태 없음, 상위 플로우가 소유"라고 명시함.
 * 촬영 시작/카메라 진입 요소는 의도적으로 전혀 없다(핸드오프 핵심 제약).
 */
export default function S06_Upload({ navigation }: Props) {
  const setPhoto = useSession((s) => s.setPhoto);
  const setPhotoId = useSession((s) => s.setPhotoId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loadErrorVisible, setLoadErrorVisible] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<{ uri: string; width: number; height: number } | null>(null);

  async function finishUpload(asset: { uri: string; width: number; height: number }) {
    try {
      setPhoto(asset, 'gallery');
      const { photoId } = await uploadPhoto(asset.uri);
      setPhotoId(photoId);
      navigation.navigate('S07_PhotoConfirm');
    } catch {
      // 04-07 — HEIC/iCloud/format failures surface here, not silently.
      setPendingAsset(asset);
      setLoadErrorVisible(true);
    }
  }

  async function openPicker() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await finishUpload({ uri: asset.uri, width: asset.width, height: asset.height });
  }

  // Contextual permission (01-06): requested right before the gallery opens, not at app launch.
  async function handlePick() {
    const status = await getPhotosPermission();
    if (status === 'granted' || status === 'limited') {
      openPicker();
    } else if (status === 'denied') {
      navigation.navigate('PermissionDenied', { variant: 'photos' });
    } else {
      setSheetVisible(true);
    }
  }

  async function handleAllowPhotos() {
    const status = await requestPhotosPermission();
    setSheetVisible(false);
    if (status === 'granted' || status === 'limited') {
      openPicker();
    } else {
      navigation.navigate('PermissionDenied', { variant: 'photos' });
    }
  }

  return (
    // outer의 색은 상단 안전영역(노치/상태바 부분) 배경으로만 쓰인다 — 실제
    // 헤더는 스크롤 콘텐츠의 첫 항목이라 핸드오프 README대로 "스크롤과 함께
    // 올라가고(고정 아님)" 동작한다. 하단 CTA만 별도 SafeAreaView로 고정.
    <SafeAreaView style={styles.outer} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <PrepHeader
          bg={colors.inverseBg}
          title="사진 선택 기준"
          badge="ALBUM"
          heading={'좋은 사진을\n골라주세요'}
          subtitle="앨범에 있는 사진 중 아래 조건에 가까운 사진이 좋아요."
          subtitleColor="rgba(255,255,255,0.82)"
          onBack={navigation.goBack}
        />

        <View style={styles.body}>
          {RULES.map((rule) => (
            <PrepRuleCard key={rule.index} index={rule.index} title={rule.title} description={rule.description} tone="neutral" />
          ))}

          <PrepExampleBlock tone="good" label="좋은 사진 예시" caption="정면 · 큰 얼굴 · 선명함 · 한 사람 · 밝은 조명">
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(38, 60, 19, '#BFDDCA')} />
            </View>
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(38, 60, 19, '#BFDDCA')} />
            </View>
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(38, 60, 19, '#BFDDCA')} />
            </View>
          </PrepExampleBlock>

          <PrepExampleBlock tone="bad" label="피해야 할 사진 예시" caption="옆모습 · 작은 얼굴 · 흐린 사진 · 여러 명 · 어두운 사진">
            <View style={[styles.cell, styles.badCell]}>
              <View style={silhouetteStyle(22, 34, 11, '#E5C6C6')} />
            </View>
            <View style={[styles.cell, styles.badCell, styles.twoUpCell]}>
              <View style={silhouetteStyle(24, 38, 12, '#E5C6C6')} />
              <View style={silhouetteStyle(24, 38, 12, '#E5C6C6')} />
            </View>
            <View style={[styles.cell, styles.darkCell]}>
              <View style={silhouetteStyle(34, 52, 17, '#6B5A5A')} />
            </View>
          </PrepExampleBlock>

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>고를 때 팁</Text>
            <Text style={styles.tipText}>{TIPS.map((t) => `· ${t}`).join('\n')}</Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.ctaArea}>
          <PrimaryButton label="앨범에서 사진 선택" onPress={handlePick} />
        </View>
      </SafeAreaView>

      <PermissionSheet
        visible={sheetVisible}
        icon={<PhotoGlyph />}
        title="사진 접근 권한이 필요해요"
        body="이미 가지고 있는 사진으로 만들려면 사진 접근 권한이 필요해요. 선택한 사진만 앱으로 가져와요."
        noteTitle="전체 접근이 부담되면"
        note="'선택한 사진만 허용'으로도 사용할 수 있어요."
        primaryLabel="사진 접근 허용"
        onPrimary={handleAllowPhotos}
        secondaryLabel="앱에서 새로 촬영하기"
        onSecondary={() => {
          setSheetVisible(false);
          navigation.navigate('PhotoInputMethod', { preselect: 'camera' });
        }}
        onDismiss={() => setSheetVisible(false)}
      />

      <Modal visible={loadErrorVisible} transparent animationType="fade" onRequestClose={() => setLoadErrorVisible(false)}>
        <Pressable style={styles.errorBackdrop} onPress={() => setLoadErrorVisible(false)} />
        <View style={styles.errorSheet}>
          <View style={styles.errorGrabHandle} />
          <View style={styles.errorRow}>
            <View style={styles.errorIconWrap}>
              <Text style={styles.errorIconGlyph}>!</Text>
            </View>
            <View style={styles.errorTextCol}>
              <Text style={styles.errorTitle}>사진을 불러오지 못했어요</Text>
              <Text style={styles.errorText}>iCloud에서 원본을 내려받는 중이거나 지원하지 않는 형식일 수 있어요. HEIC·JPG·PNG 사진을 사용해 주세요.</Text>
            </View>
          </View>
          <View style={styles.errorButtons}>
            <SecondaryButton
              label="다른 사진 선택"
              compact
              style={styles.errorButton}
              onPress={() => {
                setLoadErrorVisible(false);
                openPicker();
              }}
            />
            <PrimaryButton
              label="다시 시도"
              style={styles.errorButton}
              onPress={() => {
                setLoadErrorVisible(false);
                if (pendingAsset) finishUpload(pendingAsset);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.inverseBg },
  scroll: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 8 },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, gap: 12 },
  cell: { flex: 1, height: 92, borderRadius: 9, alignItems: 'center', justifyContent: 'flex-end' },
  goodCell: { backgroundColor: '#DFEDE4' },
  badCell: { backgroundColor: '#F2DEDE' },
  twoUpCell: { flexDirection: 'row', gap: 4 },
  darkCell: { backgroundColor: '#7E6A6A' },
  tipBox: { padding: 14, borderRadius: radius.cardList, backgroundColor: colors.surfaceSubtle, gap: 7 },
  tipLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tipText: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.textSecondaryAlt },
  footerSafe: { backgroundColor: colors.surface },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  errorBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(23,23,25,0.45)' },
  errorSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 16,
  },
  errorGrabHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  errorRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  errorIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  errorIconGlyph: { fontSize: 19, fontWeight: '700', color: colors.error },
  errorTextCol: { flex: 1, gap: 6 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  errorText: { fontSize: 14, lineHeight: 14 * 1.55, color: colors.textSecondaryAlt },
  errorButtons: { flexDirection: 'row', gap: 10 },
  errorButton: { flex: 1 },
});
