import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GUIDES } from '../api/mockData';
import { PhotoPlaceholder, PrimaryButton, ScreenHeader, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'S04_ShootingGuide'>;

export default function S04_ShootingGuide({ navigation }: Props) {
  const [expanded, setExpanded] = useState<string | null>('hair');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="촬영 가이드"
        onBack={navigation.goBack}
        right={<Text style={styles.count}>{GUIDES.length}개 항목</Text>}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {GUIDES.map((item, i) => {
          const isOpen = expanded === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.item, isOpen && styles.itemOpen]}
              onPress={() => setExpanded(isOpen ? null : item.id)}
            >
              <Text style={styles.itemNumber}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {isOpen ? (
                  <>
                    <PhotoPlaceholder width="100%" height={112} radius={10} tone="primary" style={styles.itemImage} />
                    <View style={styles.bulletList}>
                      {item.description.split(' · ').map((line) => (
                        <Text key={line} style={styles.bullet}>
                          · {line}
                        </Text>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              {!isOpen && <Text style={styles.plus}>＋</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.ctaArea}>
        <SecondaryButton label="사진 선택" style={styles.selectButton} onPress={() => navigation.navigate('S06_Upload')} />
        <PrimaryButton label="촬영 시작" style={styles.shootButton} onPress={() => navigation.navigate('S05_Camera')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  count: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, gap: 10, paddingBottom: 24 },
  item: { flexDirection: 'row', gap: 12, padding: 16, paddingVertical: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  itemOpen: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryTint },
  itemNumber: { fontSize: 13, fontWeight: '700', color: colors.primary },
  itemBody: { flex: 1, gap: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  itemDescription: { fontSize: 14, lineHeight: 14 * 1.45, color: colors.textSecondaryAlt },
  itemImage: { marginTop: -2 },
  bulletList: { gap: 5 },
  bullet: { fontSize: 13.5, lineHeight: 13.5 * 1.5, color: '#3B4A63' },
  plus: { fontSize: 16, color: colors.textDisabledAlt },
  ctaArea: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28 },
  selectButton: { width: 120 },
  shootButton: { flex: 1 },
});
