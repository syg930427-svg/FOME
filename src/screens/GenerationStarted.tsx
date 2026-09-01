import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoPlaceholder, PrimaryButton, TextButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'GenerationStarted'>;

/**
 * 07-05 — 생성 시작 (transition). Phase 4: 결제 개념을 완전히 제거했다 —
 * 이전엔 `amount`가 0보다 크면 "결제가 완료되었어요" 토스트를 보여주는
 * 방식으로 "결제 없음"을 amount:0으로 우회 표현했는데, 그 우회 자체가
 * 결제 여부와 생성 상태를 섞는 문제였다. 이제 이 화면은 결제와 완전히
 * 무관하게 "생성 시작됨"만 의미하고, `generationId`만 S10으로 넘긴다.
 */
export default function GenerationStarted({ navigation, route }: Props) {
  const { generationId } = route.params;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <PhotoPlaceholder width={150} height={196} radius={14} tone="primary" />
        <View style={styles.textBlock}>
          <Text style={styles.title}>사진 만들기를{'\n'}시작했어요</Text>
          <Text style={styles.subtitle}>완료되면 알림으로 알려드려요. 이 화면을 닫아도 계속 진행돼요.</Text>
        </View>
      </View>

      <View style={styles.ctaArea}>
        <PrimaryButton label="진행 상황 보기" onPress={() => navigation.replace('S10_Generating', { generationId })} />
        <TextButton label="홈으로 돌아가기" onPress={() => navigation.popToTop()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 36 },
  textBlock: { alignItems: 'center', gap: 9 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.35, textAlign: 'center', color: colors.textPrimary },
  subtitle: { fontSize: 14.5, color: colors.textTertiary, lineHeight: 14.5 * 1.6, textAlign: 'center' },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingBottom: 28, gap: 10 },
});
