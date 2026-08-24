import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OPTIONAL_UPDATE_INFO, POST_UPDATE_NEW_SPECS } from '../api';
import { InfoBanner, PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateComplete'>;

/** 19-03 업데이트 완료 — 업데이트 후 첫 진입 1회. 자축으로 끝나지 않게 새 규격 안내 + 재작업 경로를 함께 준다. */
export default function UpdateComplete({ navigation }: Props) {
  function handleStart() {
    navigation.popToTop();
  }

  function handleViewMyPhotos() {
    navigation.navigate('MyPhotos');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Text style={styles.iconGlyph}>✓</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{OPTIONAL_UPDATE_INFO.newVersion}로 업데이트했어요</Text>
          <Text style={styles.text}>바뀐 여권 규격이 적용됐어요. 새 규격 3종도 바로 쓸 수 있어요.</Text>
        </View>

        <View style={styles.specsCol}>
          <Text style={styles.specsLabel}>이번에 추가된 규격</Text>
          <View style={styles.specsBox}>
            {POST_UPDATE_NEW_SPECS.map((spec, i) => (
              <Pressable
                key={spec.title}
                style={[styles.specRow, i < POST_UPDATE_NEW_SPECS.length - 1 && styles.specRowDivider]}
                onPress={() => Alert.alert(spec.title, '이 배치엔 아직 연결되지 않았어요.')}
              >
                <View style={styles.specThumb} />
                <View style={styles.specTextCol}>
                  <Text style={styles.specTitle}>{spec.title}</Text>
                  <Text style={styles.specSize}>{spec.sizeLabel}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <InfoBanner tone="info" text="9월 1일 전에 만든 여권 사진은 예전 규격이에요. 필요하면 무료로 다시 만들어 드려요." />
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="시작하기" onPress={handleStart} />
        <Text style={styles.secondaryLink} onPress={handleViewMyPhotos}>
          내 사진 확인하기
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 28, alignItems: 'center', gap: 22 },
  iconOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 26, color: colors.inverseText },
  titleBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 23, fontWeight: '700', letterSpacing: -0.2, textAlign: 'center', color: colors.textPrimary },
  text: { fontSize: 14, lineHeight: 14 * 1.65, color: colors.textSecondaryAlt, textAlign: 'center' },
  specsCol: { width: '100%', gap: 11 },
  specsLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  specsBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, paddingHorizontal: 14 },
  specRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  specThumb: { width: 30, height: 38, borderRadius: 5, backgroundColor: colors.surfaceSubtleAlt },
  specTextCol: { flex: 1, gap: 2 },
  specTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  specSize: { fontSize: 11.5, color: colors.textTertiary },
  chevron: { fontSize: 16, color: colors.textDisabledAlt },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  secondaryLink: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.textTertiary },
});
