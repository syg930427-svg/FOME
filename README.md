# AI 증명사진 — 앱 진입 + MVP 핵심 플로우 + 목적 선택/안내 상태 + 사진 입력/프레이밍 + 최종 설정/생성

디자인 핸드오프 번들(`design_handoff_id_photo_app/`)의 다섯 화면 묶음을 React Native + Expo로 구현한 앱입니다.

1. **MVP 핵심 플로우 12화면 (S01–S12)** — 목적 선택부터 결제까지. 디자인 기준(Golden Reference).
2. **앱 진입 10화면 (01-01~01-10)** — Splash, 온보딩 3종, Contextual 권한 3종, 권한 거부, 강제 업데이트, 서버 오류.
3. **목적 선택·안내 STATE/MODAL 5종 (02-02, 02-03, 03-03, 03-04, 03-06)** — S01/S03/S04의 상태
   변화. TYPE이 SCREEN인 신규 화면은 없고, 전부 기존 화면 위의 상태·오버레이라 기존 컴포넌트를 확장.
4. **사진 입력·확인·프레이밍 13종 (04-01, 04-04~07, 05-02~05-15)** — 촬영/업로드 분기 화면과
   그 권한 거부·오류 상태, 사진 확대·교체 모달·시트, Crop → 얼굴 위치 → 상체 범위 → 최종 확정
   플로우. SCREEN-05/06/07은 EXISTING이라 재사용, 04-02·04-03·05-01이 그 자리다.
5. **최종 설정·AI 생성 10종 (07-02~07-05, 08-02~08-07)** — 결제 전 확인 계층(정책 상세·수량/비용·
   최종 확인·생성 시작)과 생성 중 성공/실패/취소 상태. SCREEN-09/10은 EXISTING이라 재사용, 07-01·
   08-01이 그 자리다.

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
                           ScreenHeader, PhotoPlaceholder, PermissionSheet, EntryIcons,
                           FramingPreview, PhotoZoomModal, ReplacePhotoSheet,
                           PolicyDetailModal, GenerationPackagePicker,
                           GenerationConfirmSheet, RegenerateSheet)
  state/session.ts        Zustand 플로우 세션 스토어 (핸드오프 README의 Session 타입) —
                           + `framing`(aspect/rotation/얼굴 크기·위치/framingId), 사진 교체 시 리셋
                           + `generationCount`(1/4/8), `freeRetryUsed`, `resultIndex`
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
                           Splash → (Onboarding | S01_Purpose) → S02 → S03 → S04
                           → PhotoInputMethod → (S05 | S06) → S07
                           → PhotoCrop → FacePosition → FramingSelect → PhotoConfirmFinal
                           → S08 → S09 → GenerationStarted → S10 → S11 → S12
  screens/entry/           Splash, Onboarding(3페이지 페이저), PermissionDenied(3종 재사용),
                           UpdateRequired, ServerError
  screens/PhotoInputMethod.tsx    04-01 — 촬영/업로드 선택 + 두 경로 공용 권한 게이트
  screens/CameraPermissionDenied.tsx  04-04
  screens/PhotoPermissionDenied.tsx   04-05
  screens/PhotoCrop.tsx           05-03 — 비율/회전/드래그
  screens/FacePosition.tsx        05-04 — 크기/위·아래 슬라이더 + 정렬 가이드
  screens/FramingSelect.tsx       05-05~13 — 상체 범위 리스트 + 상단 미리보기
  screens/PhotoConfirmFinal.tsx   05-15 — 요약 확정 → 목차 06(옵션)
  screens/GenerationStarted.tsx   07-05 — 결제 완료 → 생성 큐잉 전환 화면
  screens/S01_Purpose.tsx … S12_Payment.tsx (S09/S10에 07·08 STATE/MODAL 통합)
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

## 사진 입력·확인·프레이밍 13종

핸드오프 노트: "SCREEN-05/06/07은 EXISTING이므로 다시 만들지 않는다. 신규 제작 대상은 입력 방식
분기(04-01), 권한 거부·오류 상태 4종, 확대 모달과 Crop·프레이밍 흐름, 교체·확정 액션이다."

| # | 화면 | 구현 |
|---|---|---|
| 04-01 | 사진 입력 방식 선택 | 신규 화면. `S04_ShootingGuide`의 두 버튼("사진 선택"/"촬영 시작")이 이제 여기로 먼저 온다. 카드 선택은 로컬 상태, CTA를 눌러야 해당 방식의 권한을 확인 — `PermissionSheet`(기존 컴포넌트)를 재사용해 카메라/사진 두 갈래를 한 화면에서 처리 |
| 04-04 / 04-05 | 카메라/사진 권한 거부 | 04-01 전용 신규 풀스크린(기존 `PermissionDenied`(01-08)와 별개 — 핸드오프가 이 지점만 새로 만들라고 명시). 포그라운드 복귀 시 권한 재확인 후 자동 진행 |
| 04-06 | 카메라 오류 | `S05_Camera`에 상태 추가 — `CameraView`의 `onMountError` 또는 촬영 실패를 잡아 다크 에러 화면으로 전환. 실제 목(mock) 카메라는 실패하지 않아 도달은 하드웨어 오류 시에만 |
| 04-07 | 사진 불러오기 오류 | `S06_Upload`에 바텀시트 추가 — `uploadPhoto` 실패를 캐치해 노출. mock은 항상 성공하므로 실제 백엔드 연동 후 의미가 생김 |
| 05-02 | 사진 확대 (모달) | 신규 `PhotoZoomModal` — 사용자의 실제 사진 + 목적 프레임 오버레이 토글. `S07_PhotoConfirm`에서 사진 탭하면 열림 |
| 05-03 | 사진 Crop | 신규 `PhotoCrop` — 비율 프리셋(여권 규격은 잠김), 회전 슬라이더(직접 구현, ±15°), 단일 손가락 팬(PanResponder). 핀치 줌은 없음 |
| 05-04 | 얼굴 위치 조정 | 신규 `FacePosition` — 크기/위·아래 슬라이더 + 머리 정점·눈높이·턱선 가이드라인, "자동으로 맞추기" |
| 05-05~13 | 상체 범위 선택 | 신규 `FramingSelect` — `FRAMING_OPTIONS` 8종(mockData). 여권·신분증·면허증은 Face & Shoulders로 고정되고 Waist-Up 이상은 목록에서 숨음(`FRAMING_LOCKED_PURPOSES`) |
| 05-14 | 사진 교체 확인 | 신규 `ReplacePhotoSheet` — 파괴적 동작이라 확인 시트를 거침. 목적/옵션은 유지, `framing`만 리셋(`setPhoto`가 자동으로 처리) |
| 05-15 | 사진 사용 확정 | 신규 `PhotoConfirmFinal` — 요약 테이블(변경/교체 링크) + 저장 토스트, 이후 S08(옵션)로 진입 |

## 최종 설정·AI 생성 10종

핸드오프 노트: "SCREEN-09 최종 설정 확인과 SCREEN-10 AI 생성 중은 EXISTING이므로 다시 만들지 않는다.
신규 대상은 결제 전 확인 계층(07-02~07-05)과 생성 중 성공·실패·중단 상태(08-02~08-07)다. 실패
화면은 항상 다음 행동을 제시한다."

| # | 화면 | 구현 |
|---|---|---|
| 07-02 | 적용 정책 상세 (모달) | 신규 `PolicyDetailModal` — 목적별 규격 표, "AI가 하지 않는 것" 고정 문구, 접수 보장 안 함 경고. S09의 정책 카드 "자세히 보기"에서 오픈 |
| 07-03 | 생성 횟수·비용 (컴포넌트) | 신규 `GenerationPackagePicker` — S09 하단에 임베드. 1/4/8장 프리셋(`GENERATION_PACKAGES`), 보유 크레딧(`MOCK_CREDIT_BALANCE`) 차감한 결제 금액을 실시간 계산 |
| 07-04 | 생성 전 최종 확인 (모달) | 신규 `GenerationConfirmSheet` — 결제가 일어나는 유일한 지점. 동의 체크(기본 선택) + 약관 링크. 확인 시 `payForGeneration` → `createGeneration(count)` 순서로 호출 |
| 07-05 | 생성 시작 (전환) | 신규 `GenerationStarted` — 결제 완료 토스트 + 12% 진행 표시. "진행 상황 보기"(S10) / "홈으로 돌아가기"(생성은 스토어에 남아 계속 진행) |
| 08-02 | 생성 진행 상태 | S10 재구성 — ETA 카운트다운, 썸네일 위 "N/4 완료" 배지, 4단계 상세 스텝 리스트(`GENERATION_STEP_LABELS`), "백그라운드로 계속하기" + 15초 후 활성화되는 "만들기 취소"(`cancelGeneration`) |
| 08-03 | AI 생성 완료 | S10 내부 상태 전환(같은 화면, 별도 라우트 아님) — 선택한 장수만큼 결과 그리드, 탭으로 선택, "결과 자세히 보기" → `resultIndex` 저장 후 S11 |
| 08-04 | AI 생성 실패 | S10 내부 상태 — 실패 사유별 팁(`GENERATION_FAILURE_TIPS`), 오류 코드 + 문의하기, 크레딧 미차감 문구. mock은 실패를 반환하지 않아 실제 백엔드 연동 후 도달 |
| 08-05 | 생성 재시도 (시트) | 신규 `RegenerateSheet` — 같은 사진 무료 재시도(`freeRetryUsed`로 1회 제한) / 다른 사진 / 옵션 변경. 08-04에서 오픈 |
| 08-06 | 네트워크 오류 | S10 내부 상태 — 상단 배너 + 재연결 UI. `getGeneration` throw를 이 상태로 매핑했지만 mock은 던지지 않아 dormant |
| 08-07 | 생성 시간 초과 | S10 내부 상태 — 경과 180초 시 실제로 전환되는 타이머 로직(로컬 `elapsed` state). mock은 8초 내 완료되어 데모에서는 도달하지 않음 |

## 지킨 제품 원칙

- **RULE-01** 목적 우선 — S01에는 목적 선택 전 카메라/갤러리 CTA가 없음
- **RULE-05** 자동 PASS/FAIL 판정 없음 — S05는 코칭 문구만 표시
- **RULE-07** 생성 요청은 S09→07-04 확인 시트를 거쳐야만 발행 — `submitting` 플래그로 중복 호출 방지.
  1회 생성의 의미가 "사진 1장"에서 "선택한 장수(1/4/8)의 배치 1회"로 확장됨(07-03)
- **RULE-08 / RULE-09** Identity Lock / 원본 헤어 유지 — `options.identityLock`,
  `options.preserveHair`는 세션 스토어의 상수이며 UI 토글로 노출되지 않음
- **Contextual Permission** — 앱 시작 시 권한을 일괄 요청하지 않음. 카메라(S04 촬영 시작 직전),
  사진(S06 갤러리 열기 직전), 알림(S10 생성 시작과 동시) 각각의 실제 사용 시점에만 요청
- S01-09 강제 업데이트 — 닫기/뒤로 CTA 없음, 하드웨어 back 차단
- S10 하드웨어/제스처 back 차단 + 확인 모달, S12 결제 완료 후 스택 리셋
- 알림 권한 거부/스킵은 생성 흐름을 막지 않음 (거부해도 계속 진행)
- 여권/신분증/면허증은 Crop 비율과 상체 범위가 규격에 잠김 — 자유 비율·Waist-Up 이상 선택 불가
- 사진 확인 어디서든 자동 PASS/FAIL 없음 (05-02도 "확인하면 좋은 것" 안내일 뿐)
- 결제는 두 지점에서 따로 일어남 — **07-04**는 생성 배치(워터마크 포함 후보군 1/4/8장) 자체의 값,
  **S12**는 고른 사진 1장의 고화질 다운로드 값. 서로 다른 상품이라 금액도 mock 데이터도 분리했습니다

## 남은 작업 (서버 연동 전 필요)

- `src/api/client.ts`의 mock 함수를 실제 백엔드 호출로 교체 (`prefetchBootstrap` 포함)
- Pretendard JP / Wanted Sans 폰트 파일(.otf/.woff2) 번들 — 현재는 시스템 폰트로 대체
- 실제 샘플/가이드 이미지 (`sampleImageUrl`, `guideImageUrls`) 연동 — 현재는 회색 placeholder
- 국내 PG SDK(토스페이먼츠/포트원) 연동 — 현재 결제는 mock으로 즉시 성공 처리
- 온보딩 페이저는 스와이프 지원 포함, 하지만 진입 트랜지션(250ms slide)·바텀시트 등장(300ms
  cubic-bezier) 등 세부 모션은 기본 네이티브 스택 트랜지션으로 단순화했습니다
- `ImageZoomModal`/`PhotoZoomModal`은 탭-닫기/기준 토글/썸네일 전환만 구현했고, 핀치 줌과 스와이프
  다운 닫기는 아직 없습니다 (`react-native-gesture-handler` 도입 필요)
- `PhotoCrop`의 팬은 단일 손가락 드래그만 지원 — 핀치 확대/축소는 없습니다
- Custom Framing(05-13)은 목록에 뜨지만 드래그로 직접 조정하는 인터랙션은 아직 없고, 고정 미리보기만
  보여줍니다
- 08-04(실패)/08-06(네트워크 오류)/08-07(시간 초과)는 실제 상태 전환 로직까지 구현했지만 mock
  API가 항상 빠르게 성공하기 때문에 지금 앱에서는 자연스럽게 도달하지 않습니다 — 실제 백엔드가
  실패·타임아웃을 반환하거나 오프라인이 되면 그대로 작동합니다
- S11/S12는 이번 배치(07-05)에 포함되지 않아 `resultIndex`를 아직 반영하지 않습니다 — 항상 세션의
  원본 사진을 보여주며, 그리드에서 고른 특정 결과 이미지를 표시하지는 않습니다
