import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { BackHandler, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FORCED_UPDATE_INFO } from '../../api';
import { InfoBanner, PrimaryButton, SpecList } from '../../components';
import { UpdateGlyph } from '../../components/EntryIcons';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateRequired'>;

/**
 * 19-01 (구 01-09) — 업데이트가 필요해요. 규격이 바뀐 업데이트만 강제되고
 * 이유가 첫 문장에 있어야 정당하다 — "건너뛰기" 버튼 대신 왜 없는지를
 * 문장으로 설명한다. Force-update: no dismiss, hardware back blocked too.
 */
export default function UpdateRequired({}: Props) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconWrap}>
          <UpdateGlyph />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>업데이트가 필요해요</Text>
          <Text style={styles.text}>{FORCED_UPDATE_INFO.reason}</Text>
        </View>

        <View style={styles.specBox}>
          <Text style={styles.specLabel}>바뀐 규격</Text>
          {FORCED_UPDATE_INFO.changedSpecs.map((spec) => (
            <Text key={spec} style={styles.specRow}>
              · {spec}
            </Text>
          ))}
        </View>

        <SpecList
          boxed
          rows={[
            { label: '현재 버전', value: FORCED_UPDATE_INFO.currentVersion },
            { label: '새 버전', value: FORCED_UPDATE_INFO.newVersion },
            { label: '내려받을 용량', value: FORCED_UPDATE_INFO.sizeLabel },
          ]}
        />

        <InfoBanner tone="info" text="만들어 둔 사진과 주문 내역은 그대로 유지돼요." />
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="App Store에서 업데이트" onPress={() => Linking.openURL('https://apps.apple.com/')} />
        <Text style={styles.caption}>이 업데이트는 건너뛸 수 없어요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 24, alignItems: 'center', gap: 20 },
  iconWrap: { width: 88, height: 88, borderRadius: 26, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2, color: colors.textPrimary },
  text: { fontSize: 14, lineHeight: 14 * 1.65, color: colors.textSecondaryAlt, textAlign: 'center' },
  specBox: { width: '100%', gap: 11, padding: 16, borderRadius: 16, backgroundColor: colors.warningBg },
  specLabel: { fontSize: 13, fontWeight: '700', color: colors.warningStrong },
  specRow: { fontSize: 12.5, lineHeight: 12.5 * 1.55, color: colors.warningStrong },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 8 },
  caption: { textAlign: 'center', fontSize: 12.5, color: colors.textDisabled },
});
