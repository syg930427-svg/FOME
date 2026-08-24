import type { FramingId } from '../state/session';
import { Policy, PurposeId } from './types';

export const PURPOSES: {
  id: PurposeId;
  title: string;
  description: string;
  levelLabel: string;
  /** Server-decided (02-02 "준비 중" state) — all true today, capability wired for later. */
  available: boolean;
}[] = [
  { id: 'passport', title: '여권 사진', description: '정면 · 가장 엄격한 촬영 조건', levelLabel: 'LEVEL 0 · 헤어 정돈만 허용', available: true },
  { id: 'residentId', title: '주민등록증 사진', description: '신분증용 정면 사진', levelLabel: 'LEVEL 1 · 제한적 AI 편집', available: true },
  { id: 'driverLicense', title: '운전면허증 사진', description: '면허증용 정면 사진', levelLabel: 'LEVEL 2 · 제한적 AI 편집', available: true },
  { id: 'job', title: '취업·면접 사진', description: '전문적인 면접 사진', levelLabel: 'LEVEL 3 · AI 스타일 추천', available: true },
];

const CHECKLIST = [
  '얼굴이 카메라를 정면으로 향함',
  '시선이 렌즈를 자연스럽게 봄',
  '입을 편안하게 다문 상태',
  '눈·눈썹·얼굴 윤곽이 가려지지 않음',
  '균일한 조명과 깔끔한 배경',
];

export const GUIDES: { id: string; title: string; description: string; warning?: string }[] = [
  { id: 'face', title: '얼굴', description: '카메라를 정면으로 바라보고 고개를 기울이지 않아요' },
  { id: 'hair', title: '머리카락', description: '눈과 눈썹을 가리지 않게 정리 · 얼굴 양쪽 윤곽이 명확히 보이게 · 가르마·질감·길이감은 그대로 유지' },
  {
    id: 'eyes',
    title: '눈과 시선',
    description: '렌즈를 자연스럽게 바라보기 · 눈에 힘을 주거나 찡그리지 않기 · 안경 렌즈에 빛이 반사되지 않게 · 컬러 렌즈는 피하기',
    warning: '여권 사진은 눈동자가 또렷하게 보여야 해요. 반사가 심하면 안경을 벗고 촬영하세요.',
  },
  { id: 'mouth', title: '입과 표정', description: '입을 편안하게 다물고 차분한 정면 표정' },
  { id: 'posture', title: '어깨와 상체', description: '몸을 틀지 않고 상체를 정면으로 맞춰요' },
  { id: 'lighting', title: '조명과 배경', description: '역광·강한 측면광을 피하고 배경은 단순하게' },
];

/** LEVEL 0 (passport) locks everything down hard; higher levels progressively relax hair options. */
export const POLICIES: Record<PurposeId, Policy> = {
  passport: {
    policyId: 'policy_passport_v1',
    purposeId: 'passport',
    editLevel: 0,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: GUIDES,
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: ['flyaway'], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
  },
  residentId: {
    policyId: 'policy_residentId_v1',
    purposeId: 'residentId',
    editLevel: 1,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: GUIDES,
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
  },
  driverLicense: {
    policyId: 'policy_driverLicense_v1',
    purposeId: 'driverLicense',
    editLevel: 2,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'white' },
    guides: GUIDES,
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
  },
  job: {
    policyId: 'policy_job_v1',
    purposeId: 'job',
    editLevel: 3,
    spec: { widthMm: 35, heightMm: 45, headHeightMm: 32, background: 'lightGray' },
    guides: GUIDES,
    sampleImageUrl: null,
    guideImageUrls: [],
    lockedOptions: { hair: [], face: ['faceShape', 'skinSmoothing'], expression: ['smile'] },
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

/** 07-03/07-04 — how many candidate photos a single generation attempt produces. */
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
export const FRAMING_OPTIONS: {
  id: FramingId;
  title: string;
  subtitle: string;
  occupancyLabel: string;
  topPct: number;
  sidePct: number;
  faceScale: number;
  dashed?: boolean;
}[] = [
  { id: 'original', title: 'Original Framing', subtitle: '원본 그대로', occupancyLabel: '얼굴 점유 32%', topPct: 0.04, sidePct: 0.04, faceScale: 0.8 },
  { id: 'faceNeck', title: 'Face & Neck', subtitle: '목선까지', occupancyLabel: '얼굴 점유 72%', topPct: 0.05, sidePct: 0.12, faceScale: 1.05 },
  { id: 'faceShoulders', title: 'Face & Shoulders', subtitle: '어깨선까지', occupancyLabel: '얼굴 점유 60%', topPct: 0.07, sidePct: 0.09, faceScale: 0.92 },
  { id: 'upperChest', title: 'Upper Chest', subtitle: '가슴 상단까지', occupancyLabel: '얼굴 점유 48%', topPct: 0.1, sidePct: 0.08, faceScale: 0.78 },
  { id: 'midChest', title: 'Mid Chest', subtitle: '가슴 중앙까지', occupancyLabel: '얼굴 점유 40%', topPct: 0.14, sidePct: 0.07, faceScale: 0.68 },
  { id: 'waistUp', title: 'Waist-Up', subtitle: '허리까지', occupancyLabel: '얼굴 점유 30%', topPct: 0.19, sidePct: 0.05, faceScale: 0.56 },
  { id: 'fullUpperBody', title: 'Full Upper Body', subtitle: '상체 전체', occupancyLabel: '얼굴 점유 24%', topPct: 0.24, sidePct: 0.03, faceScale: 0.48 },
  { id: 'custom', title: 'Custom Framing', subtitle: '직접 조정 · 점선 = 편집 가능', occupancyLabel: '', topPct: 0.09, sidePct: 0.08, faceScale: 0.82, dashed: true },
];

/** Purposes whose policy locks the recommended framing (RULE: 규격 이탈 방지). */
export const FRAMING_LOCKED_PURPOSES = new Set(['passport', 'residentId', 'driverLicense']);

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
