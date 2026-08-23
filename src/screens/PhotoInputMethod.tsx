import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { InfoBanner, PrimaryButton, ScreenHeader } from '../components';
import { CameraGlyph, PhotoGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { InputMethod, RootStackParamList } from '../navigation/types';
import { getCameraPermission, getPhotosPermission, requestCameraPermission, requestPhotosPermission } from '../permissions';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoInputMethod'>;

/** 04-01 — 사진 입력 방식 선택. Funnel point for both camera and gallery input; owns the contextual permission gate for both. */
export default function PhotoInputMethod({ navigation, route }: Props) {
  const [method, setMethod] = useState<InputMethod>(route.params?.preselect ?? 'camera');
  const [sheetVisible, setSheetVisible] = useState(false);
  const purposeId = useSession((s) => s.purposeId);
  const purpose = PURPOSES.find((p) => p.id === purposeId);

  async function handleSubmit() {
    if (method === 'camera') {
      const status = await getCameraPermission();
      if (status === 'granted' || status === 'limited') navigation.navigate('S05_Camera');
      else if (status === 'denied') navigation.navigate('CameraPermissionDenied');
      else setSheetVisible(true);
    } else {
      const status = await getPhotosPermission();
      if (status === 'granted' || status === 'limited') navigation.navigate('S06_Upload');
      else if (status === 'denied') navigation.navigate('PhotoPermissionDenied');
      else setSheetVisible(true);
    }
  }

  async function handleAllow() {
    if (method === 'camera') {
      const status = await requestCameraPermission();
      setSheetVisible(false);
      if (status === 'granted' || status === 'limited') navigation.navigate('S05_Camera');
      else navigation.navigate('CameraPermissionDenied');
    } else {
      const status = await requestPhotosPermission();
      setSheetVisible(false);
      if (status === 'granted' || status === 'limited') navigation.navigate('S06_Upload');
      else navigation.navigate('PhotoPermissionDenied');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="사진 준비"
        onBack={navigation.goBack}
        right={
          purpose ? (
            <View style={styles.policyBadge}>
              <Text style={styles.policyBadgeText}>{purpose.title.replace(' 사진', '')} 기준</Text>
            </View>
          ) : undefined
        }
      />

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>사진을 어떻게{'\n'}준비할까요?</Text>
          <Text style={styles.subtitle}>지금 촬영하거나, 이미 가지고 있는 사진을 사용할 수 있어요.</Text>
        </View>

        <Pressable
          style={[styles.card, method === 'camera' ? styles.cardSelected : styles.cardUnselected]}
          onPress={() => setMethod('camera')}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, method === 'camera' && styles.iconWrapSelected]}>
              <CameraGlyph color={method === 'camera' ? colors.inverseText : colors.textTertiary} />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>지금 촬영하기</Text>
              <Text style={method === 'camera' ? styles.cardSubtitleSelected : styles.cardSubtitle}>가이드에 맞춰 바로 찍기</Text>
            </View>
            {method === 'camera' && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>추천</Text>
              </View>
            )}
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>· 화면의 얼굴 가이드에 맞춰 촬영</Text>
            <Text style={styles.bullet}>· 조명·거리 안내를 실시간으로 확인</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, method === 'gallery' ? styles.cardSelected : styles.cardUnselected]}
          onPress={() => setMethod('gallery')}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, method === 'gallery' && styles.iconWrapSelected]}>
              <PhotoGlyph color={method === 'gallery' ? colors.inverseText : colors.textTertiary} />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>기존 사진 사용</Text>
              <Text style={method === 'gallery' ? styles.cardSubtitleSelected : styles.cardSubtitle}>앨범에서 사진 선택</Text>
            </View>
            {method !== 'gallery' && <Text style={styles.chevron}>›</Text>}
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletMuted}>· 정면·단색 배경 사진일 때 결과가 좋아요</Text>
            <Text style={styles.bulletMuted}>· 선택 후 범위를 다시 조정할 수 있어요</Text>
          </View>
        </Pressable>

        <InfoBanner tone="info" text="어떤 방식이든 원본 얼굴은 그대로 유지되고, 목적 기준에 맞게 사진만 다시 만들어져요." />
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton label={method === 'camera' ? '촬영 시작' : '사진 선택하기'} onPress={handleSubmit} />
      </View>

      <PermissionSheet
        visible={sheetVisible}
        icon={method === 'camera' ? <CameraGlyph /> : <PhotoGlyph />}
        title={method === 'camera' ? '카메라 권한이 필요해요' : '사진 접근 권한이 필요해요'}
        body={
          method === 'camera'
            ? '앱에서 바로 촬영하려면 카메라 접근이 필요해요. 가이드에 맞춰 촬영할 때만 사용해요.'
            : '이미 가지고 있는 사진으로 만들려면 사진 접근 권한이 필요해요. 선택한 사진만 앱으로 가져와요.'
        }
        checklist={method === 'camera' ? ['촬영 화면에서만 카메라를 켜요', '촬영한 사진은 사진 제작에만 사용해요'] : undefined}
        noteTitle={method === 'gallery' ? "전체 접근이 부담되면" : undefined}
        note={method === 'gallery' ? "'선택한 사진만 허용'으로도 사용할 수 있어요." : undefined}
        primaryLabel={method === 'camera' ? '카메라 권한 허용' : '사진 접근 허용'}
        onPrimary={handleAllow}
        secondaryLabel={method === 'camera' ? '기존 사진 선택하기' : '앱에서 새로 촬영하기'}
        onSecondary={() => {
          setSheetVisible(false);
          setMethod(method === 'camera' ? 'gallery' : 'camera');
        }}
        onDismiss={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  policyBadge: { backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  policyBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  body: { flex: 1, paddingHorizontal: spacing.screenPadding, paddingTop: 8, gap: 12 },
  titleBlock: { gap: 6, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 26 * 1.3, letterSpacing: -0.5, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  card: { padding: 18, borderRadius: 18, gap: 12 },
  cardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  cardUnselected: { borderWidth: 1, borderColor: colors.border },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surfaceSubtleAlt, alignItems: 'center', justifyContent: 'center' },
  iconWrapSelected: { backgroundColor: colors.primary },
  cardTextCol: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  cardSubtitle: { fontSize: 13, color: colors.textTertiary },
  cardSubtitleSelected: { fontSize: 13, color: colors.infoText },
  recommendedBadge: { backgroundColor: colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  recommendedBadgeText: { fontSize: 11, fontWeight: '700', color: colors.inverseText },
  chevron: { fontSize: 18, color: colors.textDisabledAlt },
  bulletList: { gap: 6 },
  bullet: { fontSize: 13, lineHeight: 13 * 1.5, color: '#3B4A63' },
  bulletMuted: { fontSize: 13, lineHeight: 13 * 1.5, color: colors.textSecondaryAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
