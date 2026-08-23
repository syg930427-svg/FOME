# AI 증명사진 — MVP 핵심 플로우 (S01–S12)

디자인 핸드오프 번들(`AI 증명사진 12화면 (오프라인).html` 및 `design_handoff_id_photo_app/`)의
**MVP 핵심 플로우 12화면**을 React Native + Expo로 구현한 앱입니다.
목적별 앱 진입 화면(01-01 ~ 01-10)은 이번 구현 범위에 포함되지 않았습니다.

## 실행

```bash
npm install
npm run start   # Expo Go 앱으로 QR 스캔
npm run web     # 브라우저 미리보기 (카메라는 브라우저 제약으로 동작하지 않을 수 있음)
npm run ios     # macOS 전용
npm run android
```

## 구조

```
src/
  theme/tokens.ts        디자인 토큰 (색상 / 타이포 / 간격 / radius) — 핸드오프 README 값 그대로
  components/            공통 컴포넌트 (PrimaryButton, SecondaryButton, TextButton,
                          SelectionCard, Chip, InfoBanner, SpecList, StepProgress,
                          ScreenHeader, PhotoPlaceholder)
  state/session.ts       Zustand 플로우 세션 스토어 (핸드오프 README의 Session 타입)
  api/                   목(mock) API 레이어 — 실제 서버 연동 전까지 화면이 바로 동작하도록
                          핸드오프 README의 API 명세를 mock 함수/데이터로 구현.
                          화면은 항상 `src/api`에서만 import하므로 실제 클라이언트로
                          교체할 때 client.ts 한 파일만 바꾸면 됩니다.
  navigation/             React Navigation native stack, S01 → S12 플로우
  screens/S01_Purpose.tsx … S12_Payment.tsx
```

## 지킨 제품 원칙

- **RULE-01** 목적 우선 — S01에는 목적 선택 전 카메라/갤러리 CTA가 없음
- **RULE-05** 자동 PASS/FAIL 판정 없음 — S05는 코칭 문구만 표시
- **RULE-07** 생성은 S09에서 1회만 — `submitting` 플래그로 중복 호출 방지
- **RULE-08 / RULE-09** Identity Lock / 원본 헤어 유지 — `options.identityLock`,
  `options.preserveHair`는 세션 스토어의 상수이며 UI 토글로 노출되지 않음
- S10 하드웨어/제스처 back 차단 + 확인 모달, S12 결제 완료 후 스택 리셋

## 남은 작업 (서버 연동 전 필요)

- `src/api/client.ts`의 mock 함수를 실제 백엔드 호출로 교체
- Pretendard JP 폰트 파일(.otf/.woff2) 번들 — 현재는 시스템 폰트로 대체
- 실제 샘플/가이드 이미지 (`sampleImageUrl`, `guideImageUrls`) 연동 — 현재는 회색 placeholder
- 국내 PG SDK(토스페이먼츠/포트원) 연동 — 현재 결제는 mock으로 즉시 성공 처리
