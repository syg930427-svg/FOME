export type PermissionDeniedVariant = 'camera' | 'photos' | 'notifications';
export type InputMethod = 'camera' | 'gallery';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PermissionDenied: { variant: PermissionDeniedVariant };
  UpdateRequired: undefined;
  ServerError: undefined;

  S01_Purpose: undefined;
  S02_PurposeGuide: undefined;
  S03_IdealSample: undefined;
  S04_ShootingGuide: undefined;
  PhotoInputMethod: { preselect?: InputMethod };
  CameraPermissionDenied: undefined;
  PhotoPermissionDenied: undefined;
  S05_Camera: undefined;
  S06_Upload: undefined;
  // 05-02~05-15 통합본. 촬영(S05)·기존 사진(S06) 두 경로가 모두 이 화면으로
  // 모이고, 여기서 바로 S08_Options로 넘어간다 — 옛 PhotoCrop/FacePosition/
  // FramingSelect/PhotoConfirmFinal 4개 route는 PhotoAdjustSheet(Bottom
  // Sheet)로 흡수되어 더 이상 존재하지 않는다.
  S07_PhotoConfirm: undefined;
  S08_Options: undefined;
  S09_FinalConfirm: undefined;
  GenerationStarted: { amount: number };
  S10_Generating: undefined;
  S11_Preview: undefined;
  S12_Payment: undefined;

  // 목차 13 — 내 사진. Plain screens in the same stack as everything above (no
  // real tab navigator) — S01_Purpose/MyPhotos/Settings each render their own
  // BottomTabBar as their last child, so tab-switching is just `.navigate()`.
  MyPhotos: undefined;
  PhotoOrderDetail: { orderId: string };
  ResultsGrid: { orderId: string };
  Settings: undefined;

  // 목차 14 — 로그인 및 계정. Login/SignUp/AccountPicker are always pushed from
  // whatever screen needs an account (결제 직전에만, per the handoff), and
  // they always return there via goBack()/pop() — no `next` param needed.
  Login: undefined;
  SignUp: undefined;
  AccountPicker: undefined;
  DeleteAccount: undefined;

  // 목차 16 — 설정 및 개인정보. All pushed from Settings (16-01) and popped
  // back via goBack() — no route params, same convention as 목차 14.
  AccountSettings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  StoragePolicy: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  OpenSourceLicenses: undefined;

  // 목차 19 — 앱 업데이트 및 공지. UpdateAvailable/UpdateComplete/Notices are
  // pushed from Settings; UpdateRequired is a Splash boot-check destination
  // (unchanged route, richer content). NoticeDetail takes the one param in
  // this whole batch since a notice needs to be looked up by id.
  UpdateAvailable: undefined;
  UpdateComplete: undefined;
  Notices: undefined;
  NoticeDetail: { noticeId: string };
};
