import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../state/auth';
import { colors, radius, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const MAX_LOGIN_ATTEMPTS = 5;

/**
 * 14-01 로그인 + 14-04 로그인 실패 (같은 화면의 상태 — 실패해도 이메일/비밀번호
 * 입력값은 그대로 두고 에러만 덧붙인다). Login is never an app-entry gate:
 * this screen only ever gets pushed right before a step that needs an
 * account, and always pops back to whoever pushed it.
 */
export default function Login({ navigation }: Props) {
  const loginWithProvider = useAuth((s) => s.loginWithProvider);
  const loginWithEmail = useAuth((s) => s.loginWithEmail);
  const failedAttempts = useAuth((s) => s.failedAttempts);
  const lockedOut = useAuth((s) => s.lockedOut);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [attemptedOnce, setAttemptedOnce] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !lockedOut;
  const showFailure = attemptedOnce && failedAttempts > 0;

  function handleSkip() {
    navigation.goBack();
  }

  function handleSocial(provider: 'apple' | 'google') {
    const maskedEmail = provider === 'apple' ? '비공개 이메일 사용 중' : 'hello•••@gmail.com';
    loginWithProvider(provider, maskedEmail);
    navigation.goBack();
  }

  function handleKakao() {
    // 14-03: this device has a previously-used Kakao account, so the mock
    // routes through the account-picker instead of logging in immediately.
    navigation.navigate('AccountPicker');
  }

  async function handleEmailLogin() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setAttemptedOnce(true);
    const ok = loginWithEmail(email.trim(), password);
    setSubmitting(false);
    if (ok) navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} hitSlop={10}>
          <Text style={styles.close}>×</Text>
        </Pressable>
        <Pressable onPress={handleSkip} hitSlop={10} style={styles.later}>
          <Text style={styles.laterText}>나중에</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <Text style={styles.title}>사진을 안전하게{'\n'}보관하려면 로그인해요</Text>
          <Text style={styles.subtitle}>만든 사진을 30일간 다시 받을 수 있고, 기기를 바꿔도 그대로 남아요.</Text>
        </View>

        <View style={styles.socialCol}>
          <Pressable style={styles.kakaoButton} onPress={handleKakao}>
            <View style={styles.kakaoGlyph} />
            <Text style={styles.kakaoText}>카카오로 계속하기</Text>
          </Pressable>
          <Pressable style={styles.appleButton} onPress={() => handleSocial('apple')}>
            <View style={styles.appleGlyph} />
            <Text style={styles.appleText}>Apple로 계속하기</Text>
          </Pressable>
          <Pressable style={styles.googleButton} onPress={() => handleSocial('google')}>
            <View style={styles.googleGlyph} />
            <Text style={styles.googleText}>Google로 계속하기</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {showFailure && (
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconGlyph}>!</Text>
            </View>
            <View style={styles.errorTextCol}>
              <Text style={styles.errorTitle}>이메일 또는 비밀번호가 맞지 않아요</Text>
              <Text style={styles.errorSubtitle}>
                {lockedOut
                  ? '5번 틀려서 10분간 로그인할 수 없어요.'
                  : `5번 더 틀리면 10분간 로그인할 수 없어요. (현재 ${failedAttempts}회)`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.formCol}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일 주소"
            placeholderTextColor={colors.textDisabledAlt}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!lockedOut}
          />
          <View style={[styles.input, styles.passwordInput, showFailure && styles.inputError]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor={colors.textDisabledAlt}
              style={styles.passwordText}
              secureTextEntry={!showPassword}
              editable={!lockedOut}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text style={styles.showToggle}>{showPassword ? '숨기기' : '보기'}</Text>
            </Pressable>
          </View>
          {showFailure && <Text style={styles.fieldError}>비밀번호를 다시 확인해 주세요</Text>}

          <View style={styles.optionsRow}>
            <Pressable style={styles.rememberRow} onPress={() => setRememberMe((v) => !v)} hitSlop={6}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkboxGlyph}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>로그인 상태 유지</Text>
            </Pressable>
            <Text style={styles.forgotText}>비밀번호 찾기</Text>
          </View>

          <PrimaryButton
            label={lockedOut ? '잠시 후 다시 시도해 주세요' : '이메일로 로그인'}
            disabled={!canSubmit}
            loading={submitting}
            onPress={handleEmailLogin}
          />

          {showFailure && (
            <View style={styles.altCol}>
              <Text style={styles.altLabel}>다른 방법으로 들어가기</Text>
              <Pressable style={styles.altRow}>
                <Text style={styles.altRowText}>비밀번호 재설정 메일 받기</Text>
                <Text style={styles.altRowChevron}>›</Text>
              </Pressable>
              <Pressable style={styles.altRow} onPress={handleKakao}>
                <Text style={styles.altRowText}>카카오·Apple로 로그인</Text>
                <Text style={styles.altRowChevron}>›</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoGlyph}>i</Text>
          <Text style={styles.infoText}>만들던 사진은 그대로 있어요. 로그인 후 이어서 진행해요.</Text>
        </View>

        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpLink}>
            처음이신가요? <Text style={styles.signUpLinkStrong}>회원가입</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadding },
  close: { fontSize: 20, color: colors.textPrimary },
  later: { marginLeft: 'auto' },
  laterText: { fontSize: 13, fontWeight: '700', color: colors.textTertiary },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 28, gap: 16 },
  titleBlock: { gap: 10, paddingTop: 4 },
  title: { fontSize: 27, fontWeight: '700', lineHeight: 27 * 1.28, letterSpacing: -0.025 * 27, color: colors.textPrimary },
  subtitle: { fontSize: 14.5, color: colors.textTertiary, lineHeight: 14.5 * 1.6 },
  socialCol: { gap: 11 },
  kakaoButton: { height: 54, borderRadius: radius.ctaPrimary, backgroundColor: '#FEE500', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  kakaoGlyph: { width: 20, height: 20, borderRadius: 5, backgroundColor: colors.textPrimary },
  kakaoText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  appleButton: { height: 54, borderRadius: radius.ctaPrimary, backgroundColor: colors.inverseBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  appleGlyph: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.inverseText },
  appleText: { fontSize: 16, fontWeight: '700', color: colors.inverseText },
  googleButton: { height: 54, borderRadius: radius.ctaPrimary, borderWidth: 1, borderColor: colors.borderStrong, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  googleGlyph: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surfaceSubtleAlt },
  googleText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderSubtle },
  dividerText: { fontSize: 12.5, color: colors.textDisabled },
  errorBox: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: 14, borderRadius: 14, backgroundColor: '#FBF2F2', borderWidth: 1, borderColor: '#F0DCDC' },
  errorIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  errorIconGlyph: { color: colors.inverseText, fontSize: 12, fontWeight: '700' },
  errorTextCol: { flex: 1, gap: 4 },
  errorTitle: { fontSize: 14.5, fontWeight: '700', color: '#A31515' },
  errorSubtitle: { fontSize: 12.5, lineHeight: 12.5 * 1.5, color: '#A33' },
  formCol: { gap: 10 },
  input: { height: 52, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, fontSize: 14.5, color: colors.textPrimary },
  passwordInput: { flexDirection: 'row', alignItems: 'center' },
  inputError: { borderWidth: 1.5, borderColor: colors.error, backgroundColor: '#FDF9F9' },
  passwordText: { flex: 1, fontSize: 14.5, color: colors.textPrimary, letterSpacing: 1 },
  showToggle: { fontSize: 12.5, fontWeight: '700', color: colors.textTertiary },
  fieldError: { fontSize: 12, color: colors.error, marginTop: -4 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 2 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxGlyph: { color: colors.inverseText, fontSize: 11 },
  rememberText: { fontSize: 13, color: colors.textSecondaryAlt },
  forgotText: { fontSize: 13, fontWeight: '600', color: colors.textTertiary },
  altCol: { gap: 9, padding: 15, borderRadius: 14, backgroundColor: colors.surfaceSubtle, marginTop: 4 },
  altLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  altRow: { flexDirection: 'row', alignItems: 'center', padding: 11, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  altRowText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  altRowChevron: { fontSize: 17, color: colors.textDisabledAlt },
  infoBox: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 12, backgroundColor: colors.primaryTint },
  infoGlyph: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 12.5 * 1.5, color: colors.infoText },
  signUpLink: { textAlign: 'center', fontSize: 13.5, color: colors.textTertiary },
  signUpLinkStrong: { color: colors.primary, fontWeight: '700' },
});
