# AI 증명사진 — 앱 진입 + MVP 핵심 플로우 (01-01~01-10, S01–S12)

디자인 핸드오프 번들(`design_handoff_id_photo_app/`)의 두 화면 묶음을 React Native + Expo로 구현한 앱입니다.

1. **MVP 핵심 플로우 12화면 (S01–S12)** — 목적 선택부터 결제까지. 디자인 기준(Golden Reference).
2. **앱 진입 10화면 (01-01~01-10)** — Splash, 온보딩 3종, Contextual 권한 3종, 권한 거부, 강제 업데이트, 서버 오류.

## 실행

```bash
npm install
npm run start   # Expo Go 앱으로 QR 스캔
npm run web     # 브라우저 미리보기 (카메라/사진 피커는 브라우저 제약으로 완전히 동작하지 않을 수 있음)
npm run ios     # macOS 전용
npm run android
```

## 구조

```
src/
  theme/tokens.ts         디자인 토큰 (색상 / 타이포 / 간격 / radius) — 핸드오프 README 값 그대로
  components/             공통 컴포넌트 (PrimaryButton, SecondaryButton, TextButton,
                           SelectionCard, Chip, InfoBanner, SpecList, StepProgress,
                           ScreenHeader, PhotoPlaceholder, PermissionSheet, EntryIcons)
  state/session.ts        Zustand 플로우 세션 스토어 (핸드오프 README의 Session 타입)
  state/appEntry.ts        Zustand 앱 진입 스토어 — onboardingCompleted / notifPromptShown을
                           AsyncStorage에 영속. 권한 상태 자체는 매번 OS에서 재확인(permissions.ts)
  permissions.ts           카메라·사진·알림 권한 조회/요청을 4-state 모델로 통일
  api/                    목(mock) API 레이어 — 실제 서버 연동 전까지 화면이 바로 동작하도록
                           핸드오프 README의 API 명세를 mock 함수/데이터로 구현.
                           화면은 항상 `src/api`에서만 import하므로 실제 클라이언트로
                           교체할 때 client.ts 한 파일만 바꾸면 됩니다.
  navigation/              React Navigation native stack:
                           Splash → (Onboarding | S01_Purpose) → S02…S12
  screens/entry/           Splash, Onboarding(3페이지 페이저), PermissionDenied(3종 재사용),
                           UpdateRequired, ServerError
  screens/S01_Purpose.tsx … S12_Payment.tsx
```

## 앱 진입 화면 — 중복 정리 방침

핸드오프 README 지시대로, Golden Reference와 겹치는 화면은 **삭제하지 않고 재사용**했습니다.

| 화면 | 처리 |
|---|---|
| 01-01 Splash, 01-02~04 온보딩, 01-08 권한 거부, 01-09 업데이트, 01-10 서버 오류 | 신규 구현 (7화면) |
| 01-03 온보딩의 목적 카드 | `SelectionCard`를 `interactive={false}`로 재사용 (LEVEL 배지·체크 없음) |
| 01-05 카메라 권한 | `S04_ShootingGuide`의 "촬영 시작" 탭 시 `PermissionSheet`를 그 화면 위에 오버레이 — 배경을 다시 그리지 않고 실제 S04 컴포넌트를 그대로 사용 |
| 01-06 사진 접근 권한 | `S06_Upload`의 "갤러리에서 선택" 탭 시 동일 패턴 |
| 01-07 알림 권한 | `S10_Generating` 마운트 시(생성 시작과 동시에) 동일 패턴, 1회만 노출 |
| 01-08 권한 거부 | 카메라/사진/알림 3종이 `route.params.variant`로 문구만 바꿔 공유하는 단일 화면 |

## 지킨 제품 원칙

- **RULE-01** 목적 우선 — S01에는 목적 선택 전 카메라/갤러리 CTA가 없음
- **RULE-05** 자동 PASS/FAIL 판정 없음 — S05는 코칭 문구만 표시
- **RULE-07** 생성은 S09에서 1회만 — `submitting` 플래그로 중복 호출 방지
- **RULE-08 / RULE-09** Identity Lock / 원본 헤어 유지 — `options.identityLock`,
  `options.preserveHair`는 세션 스토어의 상수이며 UI 토글로 노출되지 않음
- **Contextual Permission** — 앱 시작 시 권한을 일괄 요청하지 않음. 카메라(S04 촬영 시작 직전),
  사진(S06 갤러리 열기 직전), 알림(S10 생성 시작과 동시) 각각의 실제 사용 시점에만 요청
- S01-09 강제 업데이트 — 닫기/뒤로 CTA 없음, 하드웨어 back 차단
- S10 하드웨어/제스처 back 차단 + 확인 모달, S12 결제 완료 후 스택 리셋
- 알림 권한 거부/스킵은 생성 흐름을 막지 않음 (거부해도 계속 진행)

## 남은 작업 (서버 연동 전 필요)

- `src/api/client.ts`의 mock 함수를 실제 백엔드 호출로 교체 (`prefetchBootstrap` 포함)
- Pretendard JP / Wanted Sans 폰트 파일(.otf/.woff2) 번들 — 현재는 시스템 폰트로 대체
- 실제 샘플/가이드 이미지 (`sampleImageUrl`, `guideImageUrls`) 연동 — 현재는 회색 placeholder
- 국내 PG SDK(토스페이먼츠/포트원) 연동 — 현재 결제는 mock으로 즉시 성공 처리
- 온보딩 페이저는 스와이프 지원 포함, 하지만 진입 트랜지션(250ms slide)·바텀시트 등장(300ms
  cubic-bezier) 등 세부 모션은 기본 네이티브 스택 트랜지션으로 단순화했습니다
