import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Onboarding from '../screens/entry/Onboarding';
import PermissionDenied from '../screens/entry/PermissionDenied';
import ServerError from '../screens/entry/ServerError';
import Splash from '../screens/entry/Splash';
import UpdateRequired from '../screens/entry/UpdateRequired';
import AccountPicker from '../screens/AccountPicker';
import AccountSettings from '../screens/AccountSettings';
import CameraPermissionDenied from '../screens/CameraPermissionDenied';
import DeleteAccount from '../screens/DeleteAccount';
import GenerationStarted from '../screens/GenerationStarted';
import LanguageSettings from '../screens/LanguageSettings';
import Login from '../screens/Login';
import MyPhotos from '../screens/MyPhotos';
import NoticeDetail from '../screens/NoticeDetail';
import Notices from '../screens/Notices';
import NotificationSettings from '../screens/NotificationSettings';
import OpenSourceLicenses from '../screens/OpenSourceLicenses';
import PhotoInputMethod from '../screens/PhotoInputMethod';
import PhotoOrderDetail from '../screens/PhotoOrderDetail';
import PhotoPermissionDenied from '../screens/PhotoPermissionDenied';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import ResultsGrid from '../screens/ResultsGrid';
import S01_Purpose from '../screens/S01_Purpose';
import S02_PurposeGuide from '../screens/S02_PurposeGuide';
import S03_IdealSample from '../screens/S03_IdealSample';
import S05_Camera from '../screens/S05_Camera';
import S06_Upload from '../screens/S06_Upload';
import S07_PhotoConfirm from '../screens/S07_PhotoConfirm';
import S08_Options from '../screens/S08_Options';
import S09_FinalConfirm from '../screens/S09_FinalConfirm';
import S10_Generating from '../screens/S10_Generating';
import S11_Preview from '../screens/S11_Preview';
import S12_Payment from '../screens/S12_Payment';
import Settings from '../screens/Settings';
import SignUp from '../screens/SignUp';
import StoragePolicy from '../screens/StoragePolicy';
import TermsOfService from '../screens/TermsOfService';
import UpdateAvailable from '../screens/UpdateAvailable';
import UpdateComplete from '../screens/UpdateComplete';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * S01 → S02 → PhotoInputMethod → (S05 촬영 | S06 업로드) → S07
 *   → S08 → S09 → GenerationStarted → S10 → S11 → (S12 다운로드 | S08 재생성)
 * S02("이 사진처럼 준비해 주세요")가 목적별 안내 + 핵심 체크사항을 한 화면에서
 * 보여주는 메인 화면 — "자세히 보기"는 S03(상세 기준, 정보 전용·goBack만)으로,
 * "사진 준비하기"는 PhotoInputMethod로 바로 이동한다. 두 버튼이 같은 화면으로
 * 가지 않는 것이 이 구조의 핵심 조건. 구 S04_ShootingGuide(촬영 가이드)는
 * 별도 화면 없이 S03의 "촬영 기준" 탭으로 흡수되어 더 이상 존재하지 않는다 —
 * 촬영 화면(S05)에는 준비 기준을 재확인하는 CTA를 의도적으로 두지 않는다.
 * S07은 옛 PhotoCrop/FacePosition/FramingSelect/PhotoConfirmFinal 4단계를
 * 흡수한 통합 확인 화면 — 범위·위치 조정은 PhotoAdjustSheet(Bottom Sheet)로
 * 옮겨졌고, 여기서 바로 S08로 넘어간다. 재생성(S11 "재생성" 버튼)도 새 화면
 * 없이 S08→S09→GenerationStarted→S10 루프를 그대로 재사용한다.
 * Native stack push/pop transitions (default). Headers are drawn per-screen
 * to match the design's custom nav bar, so the stack header is hidden here.
 *
 * 목차 13 (MyPhotos/PhotoOrderDetail/ResultsGrid) and Settings are plain
 * siblings in this same stack — there's no real bottom-tab navigator.
 * S01_Purpose, MyPhotos, and Settings each render <BottomTabBar> as their
 * own last child, so switching tabs is just `.navigate()` between them.
 *
 * 목차 14 (Login/SignUp/AccountPicker/DeleteAccount) is never an app-entry
 * gate — it's only ever pushed right before a step that needs an account
 * (S12_Payment's pay button, or Settings' 로그인 row) and always pops back
 * to whoever pushed it (`goBack()`/`pop(2)`), so none of them take route
 * params.
 *
 * 목차 16 (AccountSettings/NotificationSettings/LanguageSettings/
 * StoragePolicy/PrivacyPolicy/TermsOfService/OpenSourceLicenses) all hang
 * off Settings (16-01) and pop back via `goBack()` — same no-params
 * convention. 로그아웃/회원 탈퇴 now live on AccountSettings, not Settings.
 *
 * 목차 19: UpdateRequired is the existing 01-09 route, just with richer
 * (규격 변경) content now. UpdateAvailable/UpdateComplete/Notices hang off
 * Settings' 앱 설정 section; UpdateAvailable's "지금 업데이트" *replaces*
 * itself with UpdateComplete (mocking the app-store round trip away, same
 * mock-shortcut idea as S12_Payment's instant "결제" success). NoticeDetail
 * is the one 목차 19 route with a param (`noticeId`) since a notice has to
 * be looked up by id.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, gestureEnabled: true }}
      >
        <Stack.Screen name="Splash" component={Splash} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ gestureEnabled: false }} />
        <Stack.Screen name="PermissionDenied" component={PermissionDenied} />
        <Stack.Screen name="UpdateRequired" component={UpdateRequired} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ServerError" component={ServerError} />

        <Stack.Screen name="S01_Purpose" component={S01_Purpose} />
        <Stack.Screen name="S02_PurposeGuide" component={S02_PurposeGuide} />
        <Stack.Screen name="S03_IdealSample" component={S03_IdealSample} />
        <Stack.Screen name="PhotoInputMethod" component={PhotoInputMethod} />
        <Stack.Screen name="CameraPermissionDenied" component={CameraPermissionDenied} />
        <Stack.Screen name="PhotoPermissionDenied" component={PhotoPermissionDenied} />
        <Stack.Screen name="S05_Camera" component={S05_Camera} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="S06_Upload" component={S06_Upload} />
        <Stack.Screen name="S07_PhotoConfirm" component={S07_PhotoConfirm} />
        <Stack.Screen name="S08_Options" component={S08_Options} />
        <Stack.Screen name="S09_FinalConfirm" component={S09_FinalConfirm} />
        <Stack.Screen name="GenerationStarted" component={GenerationStarted} options={{ gestureEnabled: false }} />
        <Stack.Screen name="S10_Generating" component={S10_Generating} options={{ gestureEnabled: false }} />
        <Stack.Screen name="S11_Preview" component={S11_Preview} />
        <Stack.Screen name="S12_Payment" component={S12_Payment} />

        <Stack.Screen name="MyPhotos" component={MyPhotos} />
        <Stack.Screen name="PhotoOrderDetail" component={PhotoOrderDetail} />
        <Stack.Screen name="ResultsGrid" component={ResultsGrid} />
        <Stack.Screen name="Settings" component={Settings} />

        <Stack.Screen name="Login" component={Login} options={{ presentation: 'modal' }} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="AccountPicker" component={AccountPicker} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccount} />

        <Stack.Screen name="AccountSettings" component={AccountSettings} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettings} />
        <Stack.Screen name="StoragePolicy" component={StoragePolicy} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="TermsOfService" component={TermsOfService} />
        <Stack.Screen name="OpenSourceLicenses" component={OpenSourceLicenses} />

        <Stack.Screen name="UpdateAvailable" component={UpdateAvailable} options={{ presentation: 'modal' }} />
        <Stack.Screen name="UpdateComplete" component={UpdateComplete} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Notices" component={Notices} />
        <Stack.Screen name="NoticeDetail" component={NoticeDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
