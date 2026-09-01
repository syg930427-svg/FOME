export type PurposeId = 'idPhoto' | 'passport' | 'residentId' | 'driverLicense' | 'job';

/**
 * ── Phase 1 (신규 상품/옵션 데이터 모델) ──────────────────────────────
 * PhotoFlow 최종 스펙 반영. 기존 Options/Framing/PRODUCTS/GENERATION_PACKAGES는
 * Phase 2~3에서 이 타입들로 이관될 때까지 그대로 둔다 — 지금은 병행 존재.
 */

/** S08 "구도"(AI 생성 정책) — 05-02의 SourceCrop(기술적 조정)과는 완전히 별개 데이터. */
export type CompositionId = 'faceCenter' | 'faceShoulders' | 'chestUp' | 'upperBody';

export type RetouchLevel = 'basic' | 'premium';

/**
 * purpose policy가 옵션 그룹별 "무엇이 허용되는지"를 선언하는 범용 스키마.
 * `FRAMING_LOCKED_PURPOSES`(Set 하드코딩) 같은 방식을 대체 — 화면 코드는
 * 목적별 규칙을 절대 하드코딩하지 않고 이 데이터만 읽는다. 비허용 값은
 * 화면에서 숨기지 않고 `lockReason`과 함께 비활성 표시한다.
 */
export type OptionGroupKey = 'composition' | 'hair' | 'background' | 'retouch';
export type OptionGroupPolicy = {
  key: OptionGroupKey;
  allowed: string[];
  lockReason?: string;
};

/** 05-02 기술 조정 전용 상태 — AI 구도(composition)를 포함하지 않는다. */
export type SourceCrop = {
  aspect: 'passport' | '3x4' | 'free';
  rotationDeg: number;
  faceSize: number;
  faceOffsetY: number;
};

/** 5개 상품 등급 (1/4/8장 개념 폐기). "목적/규격 수"와 "재생성 횟수"는 완전히 별개 필드. */
export type ProductId = 'basic' | 'standard' | 'premium' | 'allInOne' | 'max';
export type Product = {
  id: ProductId;
  name: string;
  price: number;
  /** 이 상품으로 만들 수 있는 목적/규격 개수(사용권 — 동시 다중 생성 의미 아님). */
  specCount: 1 | 2 | 'all';
  retouchLevel: RetouchLevel;
  /** 결제 후 지급되는 무료 재생성 횟수 — Preview Credit과는 완전히 별도 카운터. */
  freeRegenCount: number;
  hiResIncluded: true;
  printSets: 0 | 1 | 2 | 3;
  addonRegenPrice: number | 'free';
  addonPrintPrice: number;
  shippingFee: number | 'free';
  retentionDays: number;
};

export type Policy = {
  policyId: string;
  purposeId: PurposeId;
  editLevel: 0 | 1 | 2 | 3;
  spec: {
    widthMm: number;
    heightMm: number;
    headHeightMm: number;
    background: 'white' | 'lightGray';
  };
  guides: { id: string; title: string; description: string }[];
  sampleImageUrl: string | null;
  guideImageUrls: string[];
  lockedOptions: {
    hair: string[];
    face: string[];
    expression: string[];
  };
  /** Phase 1엔 'composition' 키만 채워짐 — hair/background/retouch 편입은 Phase 2~3에서 lockedOptions와 통합 검토. */
  optionGroups: OptionGroupPolicy[];
};

export type PhotoUploadResult = { photoId: string };

export type GenerationOptions = {
  hair: 'original' | 'tidy' | 'flyaway';
  expression: 'natural';
  background: 'white' | 'lightGray' | 'original';
};

export type GenerationStatus = 'idle' | 'queued' | 'running' | 'done' | 'failed';

export type GenerationStepState = 'done' | 'active' | 'pending';
export type GenerationStep = { id: string; label: string; state: GenerationStepState };

/**
 * Phase 4 — `progress: number`(가짜 %) 필드를 완전히 제거했다. 서버가 실제
 * 세부 단계를 제공하는 경우에만 `steps`가 채워지고, 그렇지 않으면(지금의
 * mock처럼) `steps: null`이며 화면은 neutral 로딩만 보여줘야 한다 — 있지도
 * 않은 진행률을 계산해서 채우지 않는다.
 */
export type Generation = {
  generationId: string;
  status: GenerationStatus;
  steps: GenerationStep[] | null;
  previewUrl: string | null;
  /** Populated once status is 'done' — one preview per photo in the requested batch. */
  results: string[] | null;
};

/**
 * Phase 6 — 결제(Order) 상태. My Photos의 `PhotoOrder.status`(purchased/unpaid/
 * expired, mockData.ts)와는 다른 개념이라 이름이 겹치지 않도록 `PaymentStatus`로
 * 명명했다(원 지시문의 `OrderStatus`는 이미 barrel export에서 충돌 — 값 자체는
 * 동일하게 유지).
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

/** Phase 6 — Generation과 `generationId`로 직접 연결된다(안 A: 새 Generation을 만들지 않음). */
export type Order = {
  orderId: string;
  productId: ProductId;
  generationId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  /** productId의 retentionDays로 계산됨 — createOrder() 참고. */
  expiresAt: string;
};
