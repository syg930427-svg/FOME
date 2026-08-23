import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadPhoto } from '../api';
import { PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S05_Camera'>;

const HINTS = ['고개를 똑바로 세워주세요', '앞머리가 눈·눈썹을 가리지 않게 정리해주세요', '카메라와 너무 가까이 붙지 마세요'];

/**
 * S05 — 실시간 촬영. Coaching copy only, no automatic PASS/FAIL judgement (RULE-05).
 * Permission is requested contextually, right here, the moment the camera is needed.
 */
export default function S05_Camera({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [torch, setTorch] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const setPhoto = useSession((s) => s.setPhoto);
  const setPhotoId = useSession((s) => s.setPhotoId);

  async function handleShutter() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo) {
        setPhoto({ uri: photo.uri, width: photo.width, height: photo.height }, 'camera');
        const { photoId } = await uploadPhoto(photo.uri);
        setPhotoId(photoId);
        navigation.navigate('S07_PhotoConfirm');
      }
    } finally {
      setCapturing(false);
    }
  }

  if (!permission) {
    return <View style={styles.dark} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.dark} edges={['top', 'bottom']}>
        <ScreenHeader title="여권 촬영" closeIcon onBack={navigation.goBack} dark />
        <View style={styles.permissionBody}>
          <Text style={styles.permissionTitle}>카메라 접근이 필요해요</Text>
          <Text style={styles.permissionText}>사진 촬영을 위해 카메라 권한을 허용해 주세요.</Text>
          <PrimaryButton label="카메라 허용" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.dark} edges={['top', 'bottom']}>
      <ScreenHeader
        title="여권 촬영"
        closeIcon
        onBack={navigation.goBack}
        dark
        right={
          <Pressable style={styles.guidePill} onPress={() => navigation.navigate('S04_ShootingGuide')}>
            <Text style={styles.guidePillText}>가이드 다시 보기</Text>
          </Pressable>
        }
      />

      <View style={styles.previewWrap}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} />

        <View pointerEvents="none" style={styles.faceGuide} />
        <View pointerEvents="none" style={styles.shoulderLine}>
          <Text style={styles.shoulderLabel}>어깨선</Text>
        </View>

        <View style={styles.coachingBanner}>
          <Text style={styles.coachingText}>얼굴을 화면 중앙에 맞춰주세요</Text>
        </View>

        <View style={styles.hints}>
          {HINTS.map((hint) => (
            <View key={hint} style={styles.hintPill}>
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.sideControl} onPress={() => setTorch((v) => !v)}>
          <Text style={styles.sideControlLabel}>조명</Text>
        </Pressable>
        <Pressable style={styles.shutter} onPress={handleShutter} disabled={capturing}>
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable
          style={styles.sideControl}
          onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
        >
          <Text style={styles.sideControlLabel}>전환</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: colors.cameraDark },
  permissionBody: { flex: 1, padding: spacing.screenPadding, gap: 12, justifyContent: 'center' },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: colors.inverseText },
  permissionText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  guidePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)' },
  guidePillText: { fontSize: 12, fontWeight: '600', color: colors.inverseText },
  previewWrap: { flex: 1, backgroundColor: colors.cameraDarkAlt, overflow: 'hidden' },
  faceGuide: {
    position: 'absolute',
    top: 96,
    left: '50%',
    marginLeft: -98,
    width: 196,
    height: 264,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.72)',
    borderTopLeftRadius: 98,
    borderTopRightRadius: 98,
    borderBottomLeftRadius: 84,
    borderBottomRightRadius: 84,
  },
  shoulderLine: {
    position: 'absolute',
    top: 392,
    left: 36,
    right: 36,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.5)',
    alignItems: 'flex-end',
  },
  shoulderLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  coachingBanner: {
    position: 'absolute',
    top: 26,
    left: 20,
    right: 20,
    padding: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0,102,255,0.92)',
  },
  coachingText: { color: colors.inverseText, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  hints: { position: 'absolute', bottom: 20, left: 20, right: 20, gap: 7 },
  hintPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
  hintText: { fontSize: 13, color: colors.inverseText },
  controls: {
    height: 150,
    backgroundColor: colors.cameraDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  sideControl: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.cameraDarkAlt, alignItems: 'center', justifyContent: 'center' },
  sideControlLabel: { fontSize: 12, fontWeight: '600', color: colors.inverseText },
  shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: colors.inverseText, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.inverseText },
});
