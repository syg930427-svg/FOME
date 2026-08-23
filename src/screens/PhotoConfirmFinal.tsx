import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPOSES } from '../api';
import { FRAMING_OPTIONS } from '../api/mockData';
import { FramingPreview, PrimaryButton, ScreenHeader } from '../components';
import { ReplacePhotoSheet } from '../components/ReplacePhotoSheet';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoConfirmFinal'>;

/** 05-15 — 사진 사용 확정. Saves photo + crop params to the session and hands off to 목차 06 (options). */
export default function PhotoConfirmFinal({ navigation }: Props) {
  const purposeId = useSession((s) => s.purposeId);
  const framing = useSession((s) => s.framing);
  const source = useSession((s) => s.source);
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const selected = FRAMING_OPTIONS.find((o) => o.id === framing.framingId) ?? FRAMING_OPTIONS[2];
  const [replaceVisible, setReplaceVisible] = useState(false);
  const showToast = useToast((s) => s.show);

  useEffect(() => {
    showToast('사진과 범위를 저장했어요');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="사진 확정" onBack={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <FramingPreview
          height={300}
          topPct={selected.topPct}
          sidePct={selected.sidePct}
          faceScale={selected.faceScale}
          badge="확정 프레임"
          tone="primary"
          style={styles.previewFrame}
        />

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>목적</Text>
            <Text style={styles.summaryValue}>{purpose?.title ?? '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>규격</Text>
            <Text style={styles.summaryValue}>35 × 45 mm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>범위</Text>
            <Text style={styles.summaryValue}>{selected.title}</Text>
            <Text style={styles.summaryAction} onPress={() => navigation.navigate('FramingSelect')}>
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

        <View style={styles.infoBox}>
          <Text style={styles.infoGlyph}>i</Text>
          <Text style={styles.infoText}>다음 단계에서 배경과 복장 같은 목적별 옵션을 고르게 돼요. 얼굴은 원본 그대로 유지돼요.</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <PrimaryButton label="이 사진으로 계속하기" onPress={() => navigation.navigate('S08_Options')} />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 16, paddingBottom: 24 },
  previewFrame: { width: '100%' },
  summaryBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: 8 },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 13.5, color: colors.textTertiary, width: 48 },
  summaryValue: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  summaryAction: { fontSize: 13, fontWeight: '600', color: colors.primary },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.primaryTint },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 13 * 1.5, color: colors.infoText },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
});
