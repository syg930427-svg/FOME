# AI 증명사진 — 앱 진입 + MVP 핵심 플로우 + 목적 선택/안내 상태 (01-01~01-10, S01–S12, 02·03 STATE/MODAL)

디자인 핸드오프 번들(`design_handoff_id_photo_app/`)의 세 화면 묶음을 React Native + Expo로 구현한 앱입니다.

1. **MVP 핵심 플로우 12화면 (S01–S12)** — 목적 선택부터 결제까지. 디자인 기준(Golden Reference).
2. **앱 진입 10화면 (01-01~01-10)** — Splash, 온보딩 3종, Contextual 권한 3종, 권한 거부, 강제 업데이트, 서버 오류.
3. **목적 선택·안내 STATE/MODAL 5종 (02-02, 02-03, 03-03, 03-04, 03-06)** — S01/S03/S04의 상태
   변화. TYPE이 SCREEN인 신규 화면은 없고, 전부 기존 화면 위의 상태·오버레이라 기존 컴포넌트를 확장.

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
  state/toast.ts           전역 토스트 큐 — 네비게이션 전환과 함께 노출되는 확인 토스트(02-03)라
                           화면 하나에 속하지 않고 App.tsx의 ToastHost가 최상단에서 렌더
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

## 목적 선택·안내 STATE/MODAL 5종

핸드오프 노트: "02-01·03-01·03-02·03-05 = EXISTING(재사용), 신규 = STATE 4 + MODAL 1" — 새 화면을
만들지 않고 기존 S01/S03/S04에 상태를 추가했습니다.

| # | 화면 | 구현 |
|---|---|---|
| 02-02 | 목적 선택 상태 (default/pressed/selected/**준비 중**) | `SelectionCard`에 `available` prop 추가 — 정책이 아직 없는 목적은 50% 투명 + "준비 중" 배지로 비활성화(현재 4개 전부 available). Pressable의 pressed 콜백으로 눌림 스타일(`#DBDCDF`/`#F7F7F8`) 반영 |
| 02-03 | 목적 선택 완료 → 정책 로드 → 03-01 전환 | 카드를 고르는 것만으로는 API를 부르지 않고, CTA를 눌러야 `getPolicy`를 호출하도록 S01 재구성. 로드 중엔 CTA가 스피너+"OO 기준을 불러오는 중"(`#0052CC`)으로 바뀌고 나머지 카드는 45% 투명. 3초 타임아웃 시 `ServerError`로 이동. 성공하면 전역 `state/toast.ts`로 "OO 기준을 적용했어요" 토스트를 띄우며 S02로 이동 |
| 03-03 | 피해야 할 사진 탭 | S03에 "피해야 할 예시" 탭 전용 레이아웃 추가 — 회전된 샘플 이미지 + 이유 배지, 탭 가능한 4종 배드 이그잼플 썸네일(선택 시 배지 교체), 5줄 회피 사유 체크리스트, RULE-05 안내 배너 |
| 03-04 | 샘플 이미지 확대 (모달) | 신규 `ImageZoomModal` — 전체화면 다크 모달, 머리 정점/눈높이/턱선 가이드라인 토글, 세부 컷 썸네일, 정렬 안내 박스. S03 good/bad 탭의 "탭하면 확대"에서 오픈 |
| 03-06 | 가이드 항목 확장 | S04 아코디언에 확인(confirm) 상태 추가 — 항목별 "확인했어요"로 체크 전환 + 다음 미확인 항목 자동 오픈, 상단 진행바("N/6 확인"), 눈 항목에 경고 배너. 전체 확인은 촬영 시작의 필수 조건이 아님(그대로 유지) |

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
- `ImageZoomModal`은 탭-닫기/기준 토글/썸네일 전환만 구현했고, 핀치 줌과 스와이프 다운 닫기는
  아직 없습니다 (`react-native-gesture-handler` 도입 필요)
