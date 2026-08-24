import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenHeader } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { colors, radius, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Strength = 0 | 1 | 2 | 3;

function passwordStrength(password: string): Strength {
  if (password.length < 8) return password.length === 0 ? 0 : 1;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const varietyCount = [hasLetter, hasDigit, hasSymbol].filter(Boolean).length;
  if (varietyCount >= 2 && password.length >= 10) return 3;
  if (hasLetter && hasDigit) return 2;
  return 1;
}

const STRENGTH_LABEL: Record<Strength, string> = { 0: '', 1: '약함', 2: '보통', 3: '강함' };

type TermKey = 'terms' | 'privacy' | 'faceData' | 'marketing';

const REQUIRED_TERMS: TermKey[] = ['terms', 'privacy', 'faceData'];

/** 14-02 회원가입. Required consent starts unchecked — a pre-checked box is
 * a real anti-pattern for legal consent, so this deviates from the mock's
 * "already filled" example state on purpose. */
export default function SignUp({ navigation }: Props) {
  const signUp = useAuth((s) => s.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState<Record<TermKey, boolean>>({
    terms: false,
    privacy: false,
    faceData: false,
    marketing: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const confirmValid = confirm.length > 0 && confirm === password;
  const allRequiredAgreed = REQUIRED_TERMS.every((k) => terms[k]);
  const allAgreed = allRequiredAgreed && terms.marketing;

  const canSubmit = emailValid && passwordValid && confirmValid && allRequiredAgreed;

  function toggleAll() {
    const next = !allAgreed;
    setTerms({ terms: next, privacy: next, faceData: next, marketing: next });
  }

  function toggleTerm(key: TermKey) {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    signUp(email.trim());
    setSubmitting(false);
    navigation.pop(2); // SignUp + Login → back to whoever asked for login
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="회원가입" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <Text style={styles.title}>이메일로 시작해요</Text>
          <Text style={styles.subtitle}>비밀번호는 8자 이상, 영문과 숫자를 섞어주세요.</Text>
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>이메일</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="hello@example.com"
            placeholderTextColor={colors.textDisabledAlt}
            style={[styles.input, email.length > 0 && styles.inputFocused]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>비밀번호</Text>
          <View style={styles.input}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="영문+숫자 8자 이상"
              placeholderTextColor={colors.textDisabledAlt}
              style={styles.passwordText}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text style={styles.showToggle}>{showPassword ? '숨기기' : '보기'}</Text>
            </Pressable>
          </View>
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3].map((bar) => (
                <View key={bar} style={[styles.strengthBar, bar <= strength && styles.strengthBarFilled]} />
              ))}
              <Text style={styles.strengthLabel}>{STRENGTH_LABEL[strength]}</Text>
            </View>
          )}
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>비밀번호 확인</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="다시 입력"
            placeholderTextColor={colors.textDisabledAlt}
            style={[styles.input, confirm.length > 0 && !confirmValid && styles.inputError]}
            secureTextEntry={!showPassword}
          />
          {confirm.length > 0 && !confirmValid && <Text style={styles.fieldError}>비밀번호가 일치하지 않아요</Text>}
        </View>

        <View style={styles.termsBox}>
          <Pressable style={styles.termsAllRow} onPress={toggleAll}>
            <View style={[styles.checkboxLg, allAgreed && styles.checkboxChecked]}>
              {allAgreed && <Text style={styles.checkboxGlyphLg}>✓</Text>}
            </View>
            <Text style={styles.termsAllText}>약관 전체 동의</Text>
          </Pressable>
          <View style={styles.termsDivider} />
          <TermRow label="서비스 이용약관" required checked={terms.terms} onToggle={() => toggleTerm('terms')} />
          <TermRow label="개인정보 처리방침" required checked={terms.privacy} onToggle={() => toggleTerm('privacy')} />
          <TermRow label="얼굴 정보 처리 동의" required checked={terms.faceData} onToggle={() => toggleTerm('faceData')} />
          <TermRow label="혜택·이벤트 알림" checked={terms.marketing} onToggle={() => toggleTerm('marketing')} />
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <View style={styles.infoBox}>
          <Text style={styles.infoGlyph}>i</Text>
          <Text style={styles.infoText}>얼굴 정보는 사진을 만드는 데만 쓰고, 7일 뒤 자동으로 지워요.</Text>
        </View>
        <PrimaryButton label="가입하고 시작하기" disabled={!canSubmit} loading={submitting} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

function TermRow({
  label,
  required,
  checked,
  onToggle,
}: {
  label: string;
  required?: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.termRow} onPress={onToggle}>
      <View style={[styles.checkboxSm, checked && styles.checkboxChecked]}>{checked && <Text style={styles.checkboxGlyphSm}>✓</Text>}</View>
      <Text style={styles.termText}>
        {label} <Text style={styles.termTag}>{required ? '(필수)' : '(선택)'}</Text>
      </Text>
      {required && <Text style={styles.termView}>보기</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24, gap: 11 },
  titleBlock: { gap: 7, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 22 * 1.32, letterSpacing: -0.02 * 22, color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textTertiary, lineHeight: 21 },
  fieldCol: { gap: 6 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  input: { height: 52, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, fontSize: 14.5, color: colors.textPrimary, flexDirection: 'row', alignItems: 'center' },
  inputFocused: { borderWidth: 1.5, borderColor: colors.primary, fontWeight: '600' },
  inputError: { borderColor: colors.error },
  passwordText: { flex: 1, fontSize: 14.5, color: colors.textPrimary, letterSpacing: 1 },
  showToggle: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle },
  strengthBarFilled: { backgroundColor: colors.primary },
  strengthLabel: { fontSize: 11.5, fontWeight: '700', color: colors.primary },
  fieldError: { fontSize: 12, color: colors.error },
  termsBox: { gap: 9, padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, marginTop: 2 },
  termsAllRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termsAllText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  termsDivider: { height: 1, backgroundColor: '#E9EAEC' },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termText: { flex: 1, fontSize: 13, color: colors.textSecondaryAlt },
  termTag: { color: colors.textTertiary },
  termView: { fontSize: 12, color: colors.textDisabled },
  checkboxLg: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxGlyphLg: { color: colors.inverseText, fontSize: 11 },
  checkboxSm: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxGlyphSm: { color: colors.inverseText, fontSize: 10 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  ctaArea: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 28, gap: 10 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 12, backgroundColor: colors.primaryTint },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.infoText },
});
