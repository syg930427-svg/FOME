import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES, uploadPhoto } from '../api';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton, TextButton } from '../components';
import { PhotoGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getPhotosPermission, requestPhotosPermission } from '../permissions';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S06_Upload'>;

export default function S06_Upload({ navigation }: Props) {
  const setPhoto = useSession((s) => s.setPhoto);
  const setPhotoId = useSession((s) => s.setPhotoId);
  const purposeId = useSession((s) => s.purposeId);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const purposeShort = purpose?.title.replace(' 사진', '') ?? '증명사진';
  // "에 사용할"은 목적명 끝음절과 무관하게(받침 유무 상관없이) 조사 없이 항상 자연스러워
  // idPhoto/passport/residentId/driverLicense/job 5종 전부에서 그대로 맞는다.
  const pickTitle = `${purposeShort}에 사용할 사진을 골라주세요`;
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="기존 사진 선택" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{pickTitle}</Text>
          <Text style={styles.subtitle}>자동 규격 판정은 하지 않아요. 아래 기준으로 직접 고르면 돼요.</Text>
        </View>

        <View style={[styles.card, styles.goodCard]}>
          <Text style={[styles.cardTitle, styles.goodTitle]}>좋은 사진</Text>
          <View style={styles.thumbRow}>
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.goodThumb} />
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.goodThumb} />
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.goodThumb} />
          </View>
          <Text style={[styles.cardText, styles.goodText]}>
            정면 · 눈과 눈썹이 잘 보임 · 얼굴 윤곽 명확 · 자연스럽게 다문 입 · 균일한 조명 · 깔끔한 배경
          </Text>
        </View>

        <View style={[styles.card, styles.badCard]}>
          <Text style={[styles.cardTitle, styles.badTitle]}>피해야 할 사진</Text>
          <View style={styles.thumbRow}>
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.badThumb} />
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.badThumb} />
            <PhotoPlaceholder width="100%" height={92} radius={9} tone="subtle" style={styles.badThumb} />
          </View>
          <Text style={[styles.cardText, styles.badText]}>
            옆으로 돌아간 얼굴 · 얼굴을 가리는 머리카락 · 강한 그림자 · 과도한 미소 · 지나치게 가까운 촬영
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        {/* push 사용: navigate는 스택에 이미 있는 S02로 점프하며 이 화면을
            스택에서 지워버려, 뒤로가기 시 PhotoInputMethod로 못 돌아간다. */}
        <TextButton label="샘플 다시 보기" onPress={() => navigation.push('S02_PurposeGuide')} />
        <PrimaryButton label="갤러리에서 선택" onPress={handlePick} />
      </View>

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
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 6, gap: 18, paddingBottom: 24 },
  titleBlock: { gap: 5 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.35, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  card: { padding: 15, borderRadius: 16, borderWidth: 1, gap: 11 },
  goodCard: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  badCard: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  goodTitle: { color: colors.successStrong },
  badTitle: { color: colors.errorStrong },
  thumbRow: { flexDirection: 'row', gap: 8 },
  goodThumb: { flex: 1, borderColor: 'transparent', backgroundColor: '#DFEDE4' },
  badThumb: { flex: 1, borderColor: 'transparent', backgroundColor: '#F2DEDE' },
  cardText: { fontSize: 13, lineHeight: 13 * 1.55 },
  goodText: { color: colors.successText },
  badText: { color: colors.errorStrongAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
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
