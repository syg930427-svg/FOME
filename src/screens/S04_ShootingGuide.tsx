import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GUIDES } from '../api/mockData';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { CameraGlyph } from '../components/EntryIcons';
import { PermissionSheet } from '../components/PermissionSheet';
import { RootStackParamList } from '../navigation/types';
import { getCameraPermission, requestCameraPermission } from '../permissions';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S04_ShootingGuide'>;

export default function S04_ShootingGuide({ navigation }: Props) {
  const [expanded, setExpanded] = useState<string | null>(GUIDES[0]?.id ?? null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [sheetVisible, setSheetVisible] = useState(false);

  // Contextual permission (01-05): requested only when the user actually taps
  // "촬영 시작", never at app launch. Already-denied skips straight to 01-08.
  async function handleShootStart() {
    const status = await getCameraPermission();
    if (status === 'granted' || status === 'limited') {
      navigation.navigate('S05_Camera');
    } else if (status === 'denied') {
      navigation.navigate('PermissionDenied', { variant: 'camera' });
    } else {
      setSheetVisible(true);
    }
  }

  async function handleAllowCamera() {
    const status = await requestCameraPermission();
    setSheetVisible(false);
    if (status === 'granted' || status === 'limited') {
      navigation.navigate('S05_Camera');
    } else {
      navigation.navigate('PermissionDenied', { variant: 'camera' });
    }
  }

  // 03-06: confirming an item collapses it and auto-opens the next
  // unconfirmed one. Confirming all 6 is never required to shoot — the
  // primary CTA below stays enabled regardless of this state.
  function handleConfirm(id: string) {
    const next = new Set(confirmed);
    next.add(id);
    setConfirmed(next);
    const nextUnconfirmed = GUIDES.find((g) => g.id !== id && !next.has(g.id));
    setExpanded(nextUnconfirmed ? nextUnconfirmed.id : null);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="촬영 가이드"
        onBack={navigation.goBack}
        right={<Text style={styles.count}>{confirmed.size} / {GUIDES.length} 확인</Text>}
      />
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(confirmed.size / GUIDES.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {GUIDES.map((item, i) => {
          const isOpen = expanded === item.id;
          const isConfirmed = confirmed.has(item.id);
          return (
            <Pressable
              key={item.id}
              style={[styles.item, isConfirmed && !isOpen && styles.itemConfirmed, isOpen && styles.itemOpen]}
              onPress={() => setExpanded(isOpen ? null : item.id)}
            >
              {isConfirmed ? (
                <View style={styles.itemCheck}>
                  <Text style={styles.itemCheckGlyph}>✓</Text>
                </View>
              ) : (
                <Text style={styles.itemNumber}>{String(i + 1).padStart(2, '0')}</Text>
              )}
              <View style={styles.itemBody}>
                {isOpen ? (
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.toggleGlyphInline}>－</Text>
                  </View>
                ) : (
                  <Text style={styles.itemTitle}>{item.title}</Text>
                )}
                {isOpen ? (
                  <>
                    <View style={styles.itemImageWrap}>
                      <PhotoPlaceholder width="100%" height={128} radius={10} tone="primary" />
                      <View style={styles.goodBadge}>
                        <Text style={styles.goodBadgeText}>좋은 예시</Text>
                      </View>
                    </View>
                    <View style={styles.bulletList}>
                      {item.description.split(' · ').map((line) => (
                        <Text key={line} style={styles.bullet}>
                          · {line}
                        </Text>
                      ))}
                    </View>
                    {item.warning ? (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningGlyph}>!</Text>
                        <Text style={styles.warningText}>{item.warning}</Text>
                      </View>
                    ) : null}
                    <Pressable onPress={() => handleConfirm(item.id)} hitSlop={8}>
                      <Text style={styles.confirmLink}>확인했어요</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={isConfirmed ? styles.itemDescriptionMuted : styles.itemDescription}>
                    {isConfirmed ? '확인했어요' : item.description}
                  </Text>
                )}
              </View>
              {!isOpen && <Text style={styles.toggleGlyph}>＋</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="사진 선택" style={styles.selectButton} onPress={() => navigation.navigate('S06_Upload')} />
        <PrimaryButton label="촬영 시작" style={styles.shootButton} onPress={handleShootStart} />
      </View>

      <PermissionSheet
        visible={sheetVisible}
        icon={<CameraGlyph />}
        title="카메라 권한이 필요해요"
        body="앱에서 바로 촬영하려면 카메라 접근이 필요해요. 가이드에 맞춰 촬영할 때만 사용해요."
        checklist={['촬영 화면에서만 카메라를 켜요', '촬영한 사진은 사진 제작에만 사용해요']}
        primaryLabel="카메라 권한 허용"
        onPrimary={handleAllowCamera}
        secondaryLabel="기존 사진 선택하기"
        onSecondary={() => {
          setSheetVisible(false);
          navigation.navigate('S06_Upload');
        }}
        onDismiss={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  count: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  progressRow: { paddingHorizontal: spacing.screenPadding, paddingBottom: 12 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.primary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 10, paddingBottom: 24 },
  item: { flexDirection: 'row', gap: 12, padding: 16, paddingVertical: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  itemConfirmed: { backgroundColor: '#FCFCFD' },
  itemOpen: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  itemNumber: { fontSize: 13, fontWeight: '700', color: colors.primary, width: 20 },
  itemCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  itemCheckGlyph: { color: colors.inverseText, fontSize: 11 },
  itemBody: { flex: 1, gap: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center' },
  toggleGlyphInline: { marginLeft: 'auto', fontSize: 16, color: colors.primary },
  itemDescription: { fontSize: 14, lineHeight: 14 * 1.45, color: colors.textSecondaryAlt },
  itemDescriptionMuted: { fontSize: 14, lineHeight: 14 * 1.45, color: colors.textTertiary },
  itemImageWrap: { position: 'relative' },
  goodBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.surface, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  goodBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  bulletList: { gap: 5 },
  bullet: { fontSize: 13.5, lineHeight: 13.5 * 1.5, color: '#3B4A63' },
  warningBox: { flexDirection: 'row', gap: 8, padding: 11, borderRadius: 10, backgroundColor: colors.surface },
  warningGlyph: { color: colors.warning, fontWeight: '700', fontSize: 13 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 13 * 1.5, color: colors.warningStrong },
  confirmLink: { fontSize: 14, fontWeight: '600', color: colors.primary },
  toggleGlyph: { fontSize: 16, color: colors.textDisabledAlt },
  ctaArea: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
  selectButton: { width: 120 },
  shootButton: { flex: 1 },
});
