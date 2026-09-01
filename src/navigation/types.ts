export type PermissionDeniedVariant = 'camera' | 'photos' | 'notifications';
export type InputMethod = 'camera' | 'gallery';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PermissionDenied: { variant: PermissionDeniedVariant };
  UpdateRequired: undefined;
  ServerError: undefined;

  S01_Purpose: undefined;
  // 「사진 준비 기준」 단일 화면 — 좋은 예시/핵심 체크리스트/목적별 규격·정책은
  // 항상 노출, "피해야 할 사진 예시"/"촬영 기준"은 접힘(아코디언)으로 흡수했다
  // (구 S03_IdealSample 3탭 + 구 S04_ShootingGuide 6항목). S01 다음 딱 한 번만
  // 보여주는 게 원칙이라 별도 "자세히 보기" route는 없다 — S06/S07의 "다시
  // 보기"는 이 화면을 `push`로 재방문한다.
  S02_PurposeGuide: undefined;
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
  // Phase 4: 결제(amount)와 완전히 분리 — 이 화면은 이제 순수 "생성 시작됨"
  // 전환 화면이고, generationId만 넘겨 S10으로 이어준다.
  GenerationStarted: { generationId: string };
  // generationId를 필수로 받는다 — 나중에 푸시 알림/딥링크로 특정 generation을
  // 곧장 열 수 있도록 route 자체를 처음부터 이 모양으로 설계해 둔다(Phase 4).
  S10_Generating: { generationId: string };
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
