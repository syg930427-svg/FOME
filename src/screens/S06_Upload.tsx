import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadPhoto } from '../api';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S06_Upload'>;

export default function S06_Upload({ navigation }: Props) {
  const setPhoto = useSession((s) => s.setPhoto);
  const setPhotoId = useSession((s) => s.setPhotoId);

  async function handlePick() {
    // Contextual permission — requested right before the gallery opens, not at app launch.
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPhoto({ uri: asset.uri, width: asset.width, height: asset.height }, 'gallery');
    const { photoId } = await uploadPhoto(asset.uri);
    setPhotoId(photoId);
    navigation.navigate('S07_PhotoConfirm');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="기존 사진 선택" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>여권용 사진을 골라주세요</Text>
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
        <TextButton label="샘플 다시 보기" onPress={() => navigation.navigate('S03_IdealSample')} />
        <PrimaryButton label="갤러리에서 선택" onPress={handlePick} />
      </View>
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
});
