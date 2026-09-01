import type { LanguageCode, RetentionPolicyId } from '../state/settings';
import { CompositionId, OptionGroupPolicy, Policy, Product, PurposeId } from './types';

export const PURPOSES: {
  id: PurposeId;
  title: string;
  description: string;
  levelLabel: string;
  /** Server-decided (02-02 "준비 중" state) — all true today, capability wired for later. */
  available: boolean;
}[] = [
  { id: 'idPhoto', title: '증명사진', description: '정면 · 다양한 기관에서 통용되는 기본 규격', levelLabel: 'LEVEL 1 · 제한적 AI 편집', available: true },
  { id: 'passport', title: '여권 사진', description: '정면 · 가장 엄격한 촬영 조건', levelLabel: 'LEVEL 0 · 헤어 정돈만 허용', available: true },
  { id: 'residentId', title: '주민등록증 사진', description: '신분증용 정면 사진', levelLabel: 'LEVEL 1 · 제한적 AI 편집', available: true },
  { id: 'driverLicense', title: '운전면허증 사진', description: '면허증용 정면 사진', levelLabel: 'LEVEL 2 · 제한적 AI 편집', available: true },
  { id: 'job', title: '이력서', description: '자유 규격 · 정장 보정', levelLabel: 'LEVEL 3 · AI 스타일 추천', available: true },
];

const CHECKLIST = [
  '얼굴이 카메라를 정면으로 향함',
  '시선이 렌즈를 자연스럽게 봄',
  '입을 편안하게 다문 상태',
  '눈·눈썹·얼굴 윤곽이 가려지지 않음',
  '균일한 조명과 깔끔한 배경',
];

export type GuideItem = { id: string; title: string; description: string; warning?: string };

/**
 * 모든 목적에 공통으로 적용되는 촬영 기준. 특정 목적에만 해당하는 규칙(예: 여권
 * 전용 문구)은 여기 넣지 않는다 — PURPOSE_GUIDES로 분리해 다른 목적에 섞여
 * 노출되지 않게 한다.
 */
export const COMMON_GUIDES: GuideItem[] = [
  { id: 'face', title: '얼굴', description: '카메라를 정면으로 바라보고 고개를 기울이지 않아요' },
  { id: 'hair', title: '머리카락', description: '눈과 눈썹을 가리지 않게 정리 · 얼굴 양쪽 윤곽이 명확히 보이게 · 가르마·질감·길이감은 그대로 유지' },
  {
    id: 'eyes',
    title: '눈과 시선',
    description: '렌즈를 자연스럽게 바라보기 · 눈에 힘을 주거나 찡그리지 않기 · 안경 렌즈에 빛이 반사되지 않게 · 컬러 렌즈는 피하기',
  },
  { id: 'mouth', title: '입과 표정', description: '입을 편안하게 다물고 차분한 정면 표정' },
  { id: 'posture', title: '어깨와 상체', description: '몸을 틀지 않고 상체를 정면으로 맞춰요' },
  { id: 'lighting', title: '조명과 배경', description: '역광·강한 측면광을 피하고 배경은 단순하게' },
];

/**
 * 특정 purposeId에만 적용되는 추가 촬영 기준. 새 목적이 추가돼도 이 맵에
 * 항목을 넣지 않는 한 COMMON_GUIDES만 적용되므로, 다른 목적의 규칙이 섞여
 * 보일 일이 없다.
 */
export const PURPOSE_GUIDES: Partial<Record<PurposeId, GuideItem[]>> = {
  passport: [
    {
      id: 'passport-eyes',
      title: '여권 사진 추가 기준',
      description: '눈동자가 또렷하게 보여야 해요.',
      warning: '반사가 심하면 안경을 벗고 촬영하세요.',
    },
  ],
};

/** 화면에서 쓸 최종 촬영 기준 목록 — 공통 6개 + 해당 목적 전용 항목(있으면). */
export function getGuidesForPurpose(purposeId: PurposeId): GuideItem[] {
  return [...COMMON_GUIDES, ...(PURPOSE_GUIDES[purposeId] ?? [])];
}

/**
 * 목적별 "구도"(composition) 허용 범위 — S08이 하드코딩 없이 여기서만 읽는다.
 * ⚠️ Phase 1 잠정치: 여권 예시("얼굴 중심 구도만 사용할 수 있어요")만 스펙에
 * 명시돼 있고 나머지 4개 목적은 editLevel에 비례해 추정한 값이다. 실제
 * Design Handoff(06-data-and-api.md) 확인 시 조정 필요 — 화면 코드는 이 값만
 * 바라보므로 여기 숫자만 바꾸면 전체에 반영된다.
 */
const COMPOSITION_OPTION_GROUP: Record<PurposeId, OptionGroupPolicy> = {
  passport: { key: 'composition', allowed: ['faceCenter'], lockReason: '여권 규격에서는 얼굴 중심 구도만 사용할 수 있어요.' },
  idPhoto: { key: 'composition', allowed: ['faceCenter', 'faceShoulders'], lockReason: '증명사진 규격에서는 얼굴 중심·어깨까지 구도만 사용할 수 있어요.' },
  residentId: { key: 'composition', allowed: ['faceCenter', 'faceShoulders'], lockReason: '주민등록증 규격에서는 얼굴 중심·어깨까지 구도만 사용할 수 있어요.' },
  driverLicense: { key: 'composition', allowed: ['faceCenter', 'faceShoulders', 'chestUp'], lockReason: '운전면허증 규격에서는 상반신 구도를 사용할 수 없어요.' },
  job: { key: 'composition', allowed: ['faceCenter', 'faceShoulders', 'chestUp', 'upperBody'] },
};

/** LEVEL 0 (passport) locks everything down hard; higher levels progressively relax hair options. */
export const POLICIES: Record<PurposeId, Policy> = {
  idPhoto: {
    policyId: 'policy_idPhoto_v1',
    purposeId: 'idPhoto',
    editLevel: 1,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: getGuidesForPurpose('idPhoto'),
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
    optionGroups: [COMPOSITION_OPTION_GROUP.idPhoto],
  },
  passport: {
    policyId: 'policy_passport_v1',
    purposeId: 'passport',
    editLevel: 0,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: getGuidesForPurpose('passport'),
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: ['flyaway'], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
    optionGroups: [COMPOSITION_OPTION_GROUP.passport],
  },
  residentId: {
    policyId: 'policy_residentId_v1',
    purposeId: 'residentId',
    editLevel: 1,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: getGuidesForPurpose('residentId'),
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
    optionGroups: [COMPOSITION_OPTION_GROUP.residentId],
  },
  driverLicense: {
    policyId: 'policy_driverLicense_v1',
    purposeId: 'driverLicense',
    editLevel: 2,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: getGuidesForPurpose('driverLicense'),
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
    optionGroups: [COMPOSITION_OPTION_GROUP.driverLicense],
  },
  job: {
    policyId: 'policy_job_v1',
    purposeId: 'job',
    editLevel: 3,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'lightGray' },
    guides: getGuidesForPurpose('job'),
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
    optionGroups: [COMPOSITION_OPTION_GROUP.job],
  },
};

export const IDEAL_SAMPLE_CHECKLIST = CHECKLIST;

export const GENERATION_STEPS = [
  '사진 구도를 정리했어요',
  '얼굴의 고유한 특징을 유지했어요',
  '선택한 스타일을 적용하고 있어요',
  '마지막으로 사진을 정리해요',
];

/** 08-02 — richer progress screen's step-list labels (task-in-progress phrasing, not past-tense). */
export const GENERATION_STEP_LABELS = ['얼굴 위치 정렬', '배경 정리', '피부·조명 보정', '규격 맞춰 자르기'];

/** 08-04 — shown when a generation attempt fails (face not detected, the mock's only reachable reason). */
export const GENERATION_FAILURE_TIPS = [
  '얼굴이 화면의 절반 이상 차지하도록',
  '밝은 곳에서 정면을 보고 촬영',
  '모자·마스크 없이, 눈이 보이도록',
];
export const GENERATION_FAILURE_CODE = 'GEN_FACE_NOT_FOUND';

/** 07-02 — policy detail modal. Spec rows + the fixed "AI가 하지 않는 것" list (same for every purpose). */
export const POLICY_DETAILS: Record<PurposeId, { subtitle: string; rows: { label: string; value: string }[] }> = {
  idPhoto: {
    subtitle: '여러 기관에서 통용되는 기본 증명사진 규격을 기준으로 제작해요.',
    rows: [
      { label: '사진 크기', value: '35 × 45 mm' },
      { label: '배경', value: '흰색 · 무늬 없음' },
      { label: '해상도', value: '300 dpi 이상' },
    ],
  },
  passport: {
    subtitle: '외교부 여권 사진 규격(2023 개정)을 기준으로 제작해요.',
    rows: [
      { label: '사진 크기', value: '35 × 45 mm' },
      { label: '머리 길이', value: '32 ~ 36 mm' },
      { label: '눈높이', value: '아래에서 26 ~ 34 mm' },
      { label: '배경', value: '흰색 · 무늬 없음' },
      { label: '해상도', value: '300 dpi 이상' },
    ],
  },
  residentId: {
    subtitle: '행정안전부 주민등록증 사진 규격을 기준으로 제작해요.',
    rows: [
      { label: '사진 크기', value: '35 × 45 mm' },
      { label: '머리 길이', value: '32 ~ 36 mm' },
      { label: '배경', value: '흰색 · 무늬 없음' },
      { label: '해상도', value: '300 dpi 이상' },
    ],
  },
  driverLicense: {
    subtitle: '도로교통공단 운전면허증 사진 규격을 기준으로 제작해요.',
    rows: [
      { label: '사진 크기', value: '35 × 45 mm' },
      { label: '머리 길이', value: '32 ~ 36 mm' },
      { label: '배경', value: '흰색 · 무늬 없음' },
      { label: '해상도', value: '300 dpi 이상' },
    ],
  },
  job: {
    subtitle: '일반적인 이력서·프로필용 사진 권장 기준으로 제작해요.',
    rows: [
      { label: '사진 크기', value: '35 × 45 mm' },
      { label: '배경', value: '흰색 또는 밝은 회색' },
      { label: '해상도', value: '300 dpi 이상' },
    ],
  },
};

export const POLICY_AI_DOES_NOT = ['얼굴 골격·이목구비 위치 변경', '안경 착용 여부 변경', '나이·성별로 보이는 특징 변경'];

/** @deprecated "1/4/8장" 개념 자체가 PhotoFlow 최종 스펙에서 폐기됨 — PRODUCTS_V2로 대체 예정(Phase 3). */
export const GENERATION_PACKAGES: {
  count: 1 | 4 | 8;
  price: number;
  originalPrice?: number;
  description: string;
  recommended?: boolean;
}[] = [
  { count: 1, price: 2900, description: '가장 저렴하게' },
  { count: 4, price: 5900, originalPrice: 11600, description: '배경·보정 조합을 비교', recommended: true },
  { count: 8, price: 8900, description: '여러 목적에 함께 사용' },
];

/** Mock wallet balance applied against the generation package price at 07-03/07-04. */
export const MOCK_CREDIT_BALANCE = 2000;

/**
 * 05-05~13 — 상체 범위(framing) presets. `topPct`/`sidePct` are the crop
 * frame's inset from the preview container as a fraction (0-1), used to draw
 * the blue frame outline over the placeholder figure; `faceScale` scales the
 * figure so tighter framings read as "closer" without a real image pipeline.
 */
/**
 * S08 "구도" 옵션 4종 (PhotoFlow 최종 스펙 §6) — AI 생성 정책이므로 여기 있는
 * 4개가 유일한 선택지다. 05-02(PhotoAdjustSheet)는 더 이상 이 목록을 참조하지
 * 않는다(구 FRAMING_OPTIONS 8종·FRAMING_LOCKED_PURPOSES는 Phase 2에서 완전히
 * 제거됨 — 소비처가 없어 안전하게 삭제, grep으로 확인).
 * ⚠️ topPct/sidePct/faceScale은 실제 디자인 확정 전 임시 프리뷰 비율.
 */
export const COMPOSITION_OPTIONS: {
  id: CompositionId;
  title: string;
  subtitle: string;
  topPct: number;
  sidePct: number;
  faceScale: number;
}[] = [
  { id: 'faceCenter', title: '얼굴 중심', subtitle: '얼굴 위주로 가깝게', topPct: 0.05, sidePct: 0.12, faceScale: 1.05 },
  { id: 'faceShoulders', title: '어깨까지', subtitle: '얼굴 + 어깨선', topPct: 0.07, sidePct: 0.09, faceScale: 0.92 },
  { id: 'chestUp', title: '가슴 위', subtitle: '상체 상단까지', topPct: 0.1, sidePct: 0.08, faceScale: 0.78 },
  { id: 'upperBody', title: '상반신', subtitle: '상체 전체', topPct: 0.24, sidePct: 0.03, faceScale: 0.48 },
];

/** @deprecated Phase 3에서 PRODUCTS_V2로 완전히 교체 예정 — 지금은 S12_Payment.tsx가 그대로 사용 중이라 남겨둠. */
export const PRODUCTS = [
  {
    id: 'basic',
    title: '기본 · 고화질 디지털 파일',
    description: '규격 파일 1종 · 1회 무료 재생성 포함',
    price: 2900,
  },
  {
    id: 'premium',
    title: '프리미엄 · 여러 스타일',
    description: '스타일 3종 + 인쇄용 분할 파일',
    price: 5900,
  },
];

/**
 * 5개 상품 등급 (PhotoFlow 최종 스펙 §1) — "1장/4장/8장" 개념 완전 폐기.
 * "목적/규격 수"(specCount)와 "무료 재생성 횟수"(freeRegenCount)는 서로 다른
 * 축의 데이터임을 타입 레벨에서도 분리해 유지한다. Phase 3에서 S09/S12가
 * 이 배열로 옮겨가면 위 `PRODUCTS`와 `GENERATION_PACKAGES`는 제거한다.
 */
export const PRODUCTS_V2: Product[] = [
  { id: 'basic', name: '베이직', price: 2900, specCount: 1, retouchLevel: 'basic', freeRegenCount: 1, hiResIncluded: true, printSets: 0, addonRegenPrice: 500, addonPrintPrice: 7000, shippingFee: 3000, retentionDays: 30 },
  { id: 'standard', name: '스탠다드', price: 5900, specCount: 1, retouchLevel: 'basic', freeRegenCount: 2, hiResIncluded: true, printSets: 1, addonRegenPrice: 500, addonPrintPrice: 7000, shippingFee: 3000, retentionDays: 60 },
  { id: 'premium', name: '프리미엄', price: 9900, specCount: 2, retouchLevel: 'premium', freeRegenCount: 3, hiResIncluded: true, printSets: 2, addonRegenPrice: 500, addonPrintPrice: 7000, shippingFee: 3000, retentionDays: 90 },
  { id: 'allInOne', name: '올인원', price: 14900, specCount: 'all', retouchLevel: 'premium', freeRegenCount: 4, hiResIncluded: true, printSets: 3, addonRegenPrice: 500, addonPrintPrice: 7000, shippingFee: 3000, retentionDays: 180 },
  { id: 'max', name: '맥스', price: 23000, specCount: 'all', retouchLevel: 'premium', freeRegenCount: 5, hiResIncluded: true, printSets: 3, addonRegenPrice: 'free', addonPrintPrice: 4500, shippingFee: 'free', retentionDays: 365 },
];

/** 목차 13 — 내 사진. Past generation orders; "구매 완료" carries a real product, "미결제" ones are watermarked and self-expire. */
export type OrderStatus = 'purchased' | 'unpaid' | 'expired';

export type PhotoOrder = {
  id: string;
  purposeId: PurposeId;
  title: string;
  createdLabel: string;
  createdFullLabel: string;
  resultCount: number;
  productShort: string | null;
  productFullLabel: string;
  status: OrderStatus;
  metaLabel: string;
  expiryDetailLabel: string;
  originalDeleteLabel: string | null;
  originalDeleteDetailLabel: string | null;
  tone: 'primary' | 'neutral';
  watermarked: boolean;
};

export const INITIAL_MY_PHOTO_ORDERS: PhotoOrder[] = [
  {
    id: 'order_passport_0824',
    purposeId: 'passport',
    title: '여권 사진',
    createdLabel: '8월 24일',
    createdFullLabel: '2026년 8월 24일',
    resultCount: 4,
    productShort: '프리미엄',
    productFullLabel: '프리미엄 · 3,900원',
    status: 'purchased',
    metaLabel: '9월 23일까지 다시 받기 가능',
    expiryDetailLabel: '9월 23일 (30일 남음)',
    originalDeleteLabel: '8월 31일 자동 삭제 예정',
    originalDeleteDetailLabel: '8월 31일에 서버에서 완전히 지워져요',
    tone: 'primary',
    watermarked: false,
  },
  {
    id: 'order_job_0821',
    purposeId: 'job',
    title: '이력서 사진',
    createdLabel: '8월 21일',
    createdFullLabel: '2026년 8월 21일',
    resultCount: 4,
    productShort: null,
    productFullLabel: '미결제 · 워터마크 포함',
    status: 'unpaid',
    metaLabel: '9월 20일에 자동 삭제돼요',
    expiryDetailLabel: '9월 20일 (미결제 · 27일 남음)',
    originalDeleteLabel: '8월 28일 자동 삭제 예정',
    originalDeleteDetailLabel: '8월 28일에 서버에서 완전히 지워져요',
    tone: 'neutral',
    watermarked: true,
  },
  {
    id: 'order_passport_0702',
    purposeId: 'passport',
    title: '여권 사진',
    createdLabel: '7월 2일',
    createdFullLabel: '2026년 7월 2일',
    resultCount: 4,
    productShort: '기본',
    productFullLabel: '기본 · 2,900원',
    status: 'expired',
    metaLabel: '보관 기한 지남 · 재구매 필요',
    expiryDetailLabel: '8월 1일에 만료됨',
    originalDeleteLabel: null,
    originalDeleteDetailLabel: null,
    tone: 'primary',
    watermarked: false,
  },
];

// 목차 16 — 설정 및 개인정보.

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; subtitle: string }[] = [
  { code: 'ko', label: '한국어', subtitle: '기기 언어와 같아요' },
  { code: 'en', label: 'English', subtitle: '영어' },
  { code: 'ja', label: '日本語', subtitle: '일본어' },
  { code: 'zh-CN', label: '中文(简体)', subtitle: '중국어 간체' },
];

export const RETENTION_OPTIONS: { id: RetentionPolicyId; label: string; subtitle: string; shortLabel: string }[] = [
  { id: 'immediate', label: '주문 후 바로 삭제', subtitle: '다시 받기 불가', shortLabel: '즉시 삭제' },
  { id: '30days', label: '30일 보관 (권장)', subtitle: '기간 내 다시 받을 수 있어요', shortLabel: '30일 후 자동 삭제' },
  { id: '1year', label: '1년 보관', subtitle: '재발급이 잦은 경우', shortLabel: '1년 후 자동 삭제' },
];

export type OpenSourceLibrary = { id: string; name: string; license: string; licenseText: string };

export const OPEN_SOURCE_LIBRARIES: OpenSourceLibrary[] = [
  {
    id: 'react-native',
    name: 'React Native',
    license: 'MIT License',
    licenseText: 'Copyright (c) Meta Platforms, Inc. and affiliates.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction.',
  },
  {
    id: 'pretendard',
    name: 'Pretendard',
    license: 'SIL Open Font License 1.1',
    licenseText: 'Copyright 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.\n\nLicensed under the SIL Open Font License, Version 1.1.',
  },
  {
    id: 'wanted-sans',
    name: 'Wanted Sans',
    license: 'SIL Open Font License 1.1',
    licenseText: 'Copyright 2023 Wanted Lab Inc., with Reserved Font Name Wanted Sans.\n\nLicensed under the SIL Open Font License, Version 1.1.',
  },
  {
    id: 'tensorflow-lite',
    name: 'TensorFlow Lite',
    license: 'Apache License 2.0',
    licenseText: 'Copyright 2019 The TensorFlow Authors.\n\nLicensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.',
  },
  {
    id: 'vision-camera',
    name: 'react-native-vision-camera',
    license: 'MIT License',
    licenseText: 'Copyright (c) 2021 mrousavy.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction.',
  },
  {
    id: 'react-native-svg',
    name: 'react-native-svg',
    license: 'MIT License',
    licenseText: 'Copyright (c) 2015-present, react-native-community.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction.',
  },
];

export const APP_VERSION_LABEL = '1.4.2';
export const APP_VERSION_BUILD_LABEL = '1.4.2 (2608)';
export const SUPPORT_EMAIL = 'support@aiphoto.example.com';

export const PRIVACY_POLICY_VERSION = '2026.06.01';
export const PRIVACY_POLICY_PREVIOUS_VERSION = '2025.11.01';

export const PRIVACY_POLICY_SUMMARY = [
  '얼굴 사진은 주문 처리에만 씁니다',
  'AI 학습에 쓰지 않습니다',
  '기본 30일 후 자동 삭제합니다',
  '언제든 전체 삭제를 요청할 수 있습니다',
];

export const PRIVACY_POLICY_SECTIONS: { n: number; title: string }[] = [
  { n: 1, title: '수집하는 정보' },
  { n: 2, title: '이용 목적' },
  { n: 3, title: '보관 및 파기' },
  { n: 4, title: '처리 위탁 및 국외 이전' },
  { n: 5, title: '이용자의 권리' },
  { n: 6, title: '개인정보 보호책임자' },
];

export const PRIVACY_POLICY_DETAIL = {
  sectionLabel: '3.',
  title: '보관 및 파기',
  body: '회사는 이용자가 업로드한 원본 사진과 생성된 결과 사진을 이용자가 설정한 보관 기간(기본 30일) 동안 저장하며, 기간이 지나면 복구할 수 없는 방식으로 자동 삭제합니다. 이용자가 삭제를 요청한 경우 지체 없이 파기합니다.',
};

export const TERMS_VERSION = '2026.06.01';

export const TERMS_SUMMARY = [
  '본인의 얼굴 사진만 올릴 수 있어요',
  '제출 기관의 승인 여부는 보장하지 않아요',
  '다운로드 후에는 환불이 제한돼요',
];

export const TERMS_SECTIONS: { n: string; title: string }[] = [
  { n: '1조', title: '목적 및 정의' },
  { n: '2조', title: '서비스 내용' },
  { n: '3조', title: '이용자의 의무' },
  { n: '4조', title: '결제 및 환불' },
  { n: '5조', title: '지식재산권' },
  { n: '6조', title: '책임의 제한' },
];

export const TERMS_DETAIL = {
  sectionLabel: '제3조',
  title: '이용자의 의무',
  body: '이용자는 본인의 얼굴이 촬영된 사진만을 업로드해야 하며, 타인의 사진이나 초상권을 침해하는 이미지를 업로드해서는 안 됩니다. 신분증 사진의 위조·변조 목적으로 서비스를 이용하는 경우 이용이 제한될 수 있습니다.',
  warning: '제출 기관의 규격 심사 결과는 기관 재량이며, 반려에 대한 환불은 제공하지 않아요.',
};

// 목차 19 — 앱 업데이트 및 공지. 규격 변경으로 인한 업데이트만 강제(19-01)이고
// 나머지 업데이트는 건너뛸 수 있다(19-02) — 세 화면(19-01~03)은 서로 이어지는
// 하나의 내러티브라 버전 번호도 디자인 그대로(1.3.0 → 1.4.2) 맞춰뒀다.

export const FORCED_UPDATE_INFO = {
  currentVersion: '1.3.0',
  newVersion: '1.4.2',
  sizeLabel: '48MB',
  reason: '여권 사진 규격이 바뀌어서, 지금 버전으로 만들면 기관에서 반려될 수 있어요.',
  changedSpecs: ['여권 — 머리 높이 기준 32–36mm로 변경 (2026.09.01 시행)', '미국 비자 — 배경 밝기 기준 강화'],
};

export const OPTIONAL_UPDATE_INFO = {
  newVersion: '1.4.2',
  releaseDateLabel: '2026년 8월 20일',
  sizeLabel: '48MB',
  headline: '사진 품질이 좋아졌어요',
  highlights: [
    { icon: '✦', title: '머리카락 경계가 자연스러워졌어요', subtitle: '배경을 지울 때 머리카락이 잘려 보이던 문제를 고쳤어요' },
    { icon: '＋', title: '규격 3종이 추가됐어요', subtitle: '일본 비자, 태국 워크퍼밋, 국제운전면허증' },
    { icon: '⚡', title: '만드는 시간이 절반으로', subtitle: '평균 24초 → 11초' },
  ],
  fixedIssuesLabel: '인쇄용 파일 저장 실패, 결제 후 화면 멈춤',
};

export const POST_UPDATE_NEW_SPECS: { title: string; sizeLabel: string }[] = [
  { title: '일본 비자', sizeLabel: '45×45mm' },
  { title: '태국 워크퍼밋', sizeLabel: '40×50mm' },
  { title: '국제운전면허증', sizeLabel: '45×35mm' },
];

export type NoticeCategory = 'spec' | 'maintenance' | 'event' | 'privacy';

export type Notice = {
  id: string;
  category: NoticeCategory;
  categoryLabel: string;
  important: boolean;
  dateLabel: string;
  title: string;
  summary: string;
  read: boolean;
};

export const NOTICE_FILTERS: { id: NoticeCategory | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'spec', label: '규격 변경' },
  { id: 'maintenance', label: '점검' },
  { id: 'event', label: '이벤트' },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_passport_spec',
    category: 'spec',
    categoryLabel: '중요 · 규격 변경',
    important: true,
    dateLabel: '8월 20일',
    title: '여권 사진 규격 변경 안내 (9월 1일 시행)',
    summary: '머리 높이 기준이 32–36mm로 변경됩니다. 8월 31일까지 만든 사진은…',
    read: false,
  },
  {
    id: 'notice_maintenance_0824',
    category: 'maintenance',
    categoryLabel: '점검',
    important: false,
    dateLabel: '8월 22일',
    title: '8월 24일 새벽 서버 점검 안내',
    summary: '02:00–05:00 동안 새 사진 만들기가 중단됩니다.',
    read: false,
  },
  {
    id: 'notice_event_free',
    category: 'event',
    categoryLabel: '이벤트',
    important: false,
    dateLabel: '8월 12일',
    title: '첫 사진 무료 이벤트 (~8월 31일)',
    summary: '처음 만드는 사진 1장을 무료로 받아보세요.',
    read: true,
  },
  {
    id: 'notice_visa_bg',
    category: 'spec',
    categoryLabel: '규격 변경',
    important: false,
    dateLabel: '7월 28일',
    title: '미국 비자 사진 배경 기준 강화',
    summary: '배경 밝기 허용 범위가 좁아졌습니다.',
    read: true,
  },
  {
    id: 'notice_privacy_0601',
    category: 'privacy',
    categoryLabel: '개인정보',
    important: false,
    dateLabel: '6월 1일',
    title: '개인정보 처리방침 개정 안내',
    summary: '사진 보관 기간을 사용자가 직접 고를 수 있게 됐어요.',
    read: true,
  },
];

/** 19-05 — 이 배치에서 실제 상세 본문이 있는 유일한 공지. 나머지는 목록의 summary로 대체한다. */
export const PASSPORT_SPEC_NOTICE_DETAIL = {
  noticeId: 'notice_passport_spec',
  audience: ['9월 1일 이후 여권을 접수할 분', '8월 31일까지 만든 여권 사진을 아직 제출하지 않은 분'],
  body: '외교부 여권 사진 기준이 2026년 9월 1일부터 바뀝니다. 머리 높이(정수리–턱) 허용 범위가 32–36mm로 조정되고, 기존 기준(29–34mm)으로 만든 사진은 접수 창구에서 반려될 수 있습니다.',
  comparisonRows: [
    { label: '머리 높이', before: '29–34mm', after: '32–36mm' },
    { label: '사진 크기', before: '35×45mm', after: '동일' },
  ],
  reworkNote: '앱을 1.4.2로 업데이트한 뒤 \'내 사진\'에서 다시 만들기를 누르면 새 규격으로 무료 재작업해 드려요. 12월 31일까지 신청할 수 있어요.',
  externalLinkLabel: '외교부 원문 공고 보기',
  externalUrl: 'https://www.mofa.go.kr/',
};
