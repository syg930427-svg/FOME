import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrepExampleBlock, PrepHeader, PrepRuleCard, PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraPrep'>;

const RULES = [
  { index: '01', title: '촬영 자세', description: '허리를 펴고 어깨를 정면으로, 고개를 기울이지 않아요' },
  { index: '02', title: '얼굴 방향', description: '카메라를 정면으로 바라보고 시선은 렌즈에 둬요' },
  { index: '03', title: '얼굴 크기', description: '화면 가이드선 안에 머리와 어깨가 들어오게 맞춰요' },
  { index: '04', title: '조명', description: '창문을 마주 보고, 역광과 강한 측면광은 피해요' },
  { index: '05', title: '배경', description: '밝고 단순한 벽 앞에서, 물건이 겹치지 않게 촬영해요' },
];

const TIPS = ['휴대폰을 눈높이에 두고 팔을 쭉 펴세요', '가능하면 다른 사람이 찍어주면 더 좋아요', '안경 반사광이 생기면 잠시 벗어주세요'];

/** 실루엣 도형 — width/height/top-radius(회전 없으면)만 다르고 구조는 동일해서 헬퍼로 뺌. */
function silhouetteStyle(width: number, height: number, topRadius: number, tone: 'good' | 'bad', rotateDeg?: number): ViewStyle {
  return {
    width,
    height,
    borderTopLeftRadius: topRadius,
    borderTopRightRadius: topRadius,
    backgroundColor: tone === 'good' ? '#BFDDCA' : '#E5C6C6',
    transform: rotateDeg ? [{ rotate: `${rotateDeg}deg` }] : undefined,
  };
}

/**
 * CameraPrep — Claude Design 핸드오프 "사진 준비 안내 2화면" 중 Camera
 * Preparation. `PhotoInputMethod`에서 "지금 촬영하기"를 고르고 카메라 권한이
 * 확인된 뒤 이 화면을 거쳐 S05_Camera로 들어간다(handoff README §Entry/Exit).
 * 목적(purpose)/정책(Policy) 콘텐츠는 이 화면에 절대 섞지 않는다 — 여기는
 * "촬영 방법" 안내 전용이고, 목적별 규격/정책은 기존 S02_PurposeGuide가 계속
 * 담당한다(S07 "사진 준비 기준 다시 보기"로만 재방문 가능, 이 화면과는 무관).
 * 정적 안내 화면 — 토글/아코디언/선택 상태 없음(핸드오프 Interactions 참고).
 */
export default function CameraPrep({ navigation }: Props) {
  return (
    // outer의 색은 상단 안전영역(노치/상태바 부분) 배경으로만 쓰인다 — 실제
    // 헤더는 스크롤 콘텐츠의 첫 항목이라 핸드오프 README대로 "스크롤과 함께
    // 올라가고(고정 아님)" 동작한다. 하단 CTA만 별도 SafeAreaView로 고정.
    <SafeAreaView style={styles.outer} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <PrepHeader
          bg={colors.primary}
          title="촬영 준비"
          badge="CAMERA"
          heading={'사진을 이렇게\n촬영해 주세요'}
          subtitle="아래 5가지만 지키면 좋은 결과가 나와요."
          subtitleColor="rgba(255,255,255,0.88)"
          onBack={navigation.goBack}
        />

        <View style={styles.body}>
          {RULES.map((rule) => (
            <PrepRuleCard key={rule.index} index={rule.index} title={rule.title} description={rule.description} tone="primary" />
          ))}

          <PrepExampleBlock tone="good" label="좋은 촬영 예시" caption="정면 자세 · 가이드선에 맞춘 얼굴 크기 · 균일한 조명">
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(36, 58, 18, 'good')} />
            </View>
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(36, 58, 18, 'good')} />
            </View>
            <View style={[styles.cell, styles.goodCell]}>
              <View style={silhouetteStyle(36, 58, 18, 'good')} />
            </View>
          </PrepExampleBlock>

          <PrepExampleBlock tone="bad" label="피해야 할 촬영 예시" caption="고개 기울임 · 너무 멀거나 가까운 촬영 · 역광과 그림자">
            <View style={[styles.cell, styles.badCell]}>
              <View style={silhouetteStyle(36, 58, 18, 'bad', -12)} />
            </View>
            <View style={[styles.cell, styles.badCell]}>
              <View style={silhouetteStyle(22, 34, 11, 'bad')} />
            </View>
            <View style={[styles.cell, styles.badCell]}>
              <View style={silhouetteStyle(52, 78, 26, 'bad')} />
            </View>
          </PrepExampleBlock>

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>촬영 팁</Text>
            <Text style={styles.tipText}>{TIPS.map((t) => `· ${t}`).join('\n')}</Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.ctaArea}>
          <PrimaryButton label="촬영 시작" onPress={() => navigation.navigate('S05_Camera')} />
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 8 },
  body: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, gap: 12 },
  cell: { flex: 1, height: 92, borderRadius: 9, alignItems: 'center', justifyContent: 'flex-end' },
  goodCell: { backgroundColor: '#DFEDE4' },
  badCell: { backgroundColor: '#F2DEDE' },
  tipBox: { padding: 14, borderRadius: radius.cardList, backgroundColor: colors.surfaceSubtle, gap: 7 },
  tipLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tipText: { fontSize: 13.5, lineHeight: 13.5 * 1.55, color: colors.textSecondaryAlt },
  footerSafe: { backgroundColor: colors.surface },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
});
