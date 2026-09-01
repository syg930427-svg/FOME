import { create } from 'zustand';
import { CompositionId, GenerationStatus, ProductId, PurposeId, RetouchLevel, SourceCrop } from '../api/types';

export type Photo = { uri: string; width: number; height: number };

export type Options = {
  hair: 'original' | 'tidy' | 'flyaway';
  expression: 'natural';
  background: 'white' | 'lightGray' | 'original';
  /** Constants per README RULE-08/RULE-09 — never exposed as a user-facing toggle. */
  identityLock: true;
  preserveHair: true;
  /**
   * Phase 1(신규) — S08 "구도"(AI 생성 정책). `framing.framingId`와 개념이
   * 겹치던 걸 분리한 필드 — `framing`은 05-02 기술 조정 전용으로 남고, AI
   * 구도는 여기 하나로만 저장된다. Phase 2에서 S08 UI가 이 필드를 실제로
   * 읽고 쓰기 전까지는 기본값만 들고 아무 화면도 참조하지 않는다.
   */
  composition: CompositionId;
  /** Phase 1(신규) — S08 "보정". 상품 등급에 따라 'premium' 선택 가능 여부가 갈릴 예정(Phase 3). */
  retouch: RetouchLevel;
};

export type GenerationState = {
  id: string;
  status: GenerationStatus;
  progress: number;
  previewUrl?: string;
  results?: string[];
  etaSeconds?: number;
} | null;

export type AspectPreset = 'passport' | '3x4' | 'free';
export type FramingId =
  | 'original'
  | 'faceNeck'
  | 'faceShoulders'
  | 'upperChest'
  | 'midChest'
  | 'waistUp'
  | 'fullUpperBody'
  | 'custom';

/** 05-03/05-04 crop + face-position state. Reset whenever the photo itself changes (05-14). */
export type Framing = {
  aspect: AspectPreset;
  rotationDeg: number;
  faceSize: number; // 0-1 slider value
  faceOffsetY: number; // 0-1 slider value
  framingId: FramingId;
};

const defaultFraming: Framing = {
  aspect: 'passport',
  rotationDeg: 0,
  faceSize: 0.58,
  faceOffsetY: 0.44,
  framingId: 'faceShoulders',
};

/**
 * Phase 1(신규) — 05-02 기술 조정 전용 상태. `framing`에서 `framingId`(AI 구도)를
 * 뺀 것과 같은 모양이다. `PhotoAdjustSheet`가 Phase 2에서 `framing` 대신 이
 * 필드를 읽고 쓰도록 옮겨가기 전까지는, 지금과 똑같이 `framing` 하나가 05-02의
 * 유일한 소스로 남는다 — 즉 지금은 `sourceCrop`을 아무도 읽지 않는다.
 */
const defaultSourceCrop: SourceCrop = {
  aspect: 'passport',
  rotationDeg: 0,
  faceSize: 0.58,
  faceOffsetY: 0.44,
};

const PREVIEW_CREDIT_INITIAL = 3; // 최초 1회 + Preview 재생성 2회 (확정 전 수치, 임의 변경 금지 — 사용자 확정 값)

type SessionState = {
  purposeId: PurposeId | null;
  policyId: string | null;
  editLevel: 0 | 1 | 2 | 3;
  source: 'camera' | 'gallery' | null;
  photo: Photo | null;
  photoId: string | null;
  framing: Framing;
  options: Options;
  generation: GenerationState;
  /** 07-03/07-04 — how many candidate photos the next generation attempt requests. */
  generationCount: 1 | 4 | 8;
  /**
   * @deprecated Phase 3에서 폐기 예정 — "1회 무료 재시도" 하나로 preview/paid를
   * 구분 없이 다루던 옛 개념. `previewCreditRemaining`/`paidRegenCreditRemaining`으로
   * 대체된다(둘은 완전히 별도 카운터 — 섞으면 안 됨, PhotoFlow 스펙 §4).
   * `S10_Generating.tsx`가 아직 이 필드를 쓰고 있어 Phase 2까지는 남겨둔다.
   */
  freeRetryUsed: boolean;
  /** 08-03 — which of the batch results the user picked to carry into S11/S12. */
  resultIndex: number;
  paid: boolean;
  orderId: string | null;

  /**
   * Phase 1(신규) — 05-02 기술 조정 전용. `framing`과 병행 존재하며 아직 아무
   * 화면도 참조하지 않는다(Phase 2에서 PhotoAdjustSheet가 이관).
   */
  sourceCrop: SourceCrop;
  /** Phase 1(신규) — 결제 전 Preview 생성/재생성 가능 횟수. 최초 세션 시작 시 지급, 결제와 무관. */
  previewCreditRemaining: number;
  /** Phase 1(신규) — 결제 후 지급되는 무료 재생성 횟수. 구매한 상품(productId)의 freeRegenCount로 지급. */
  paidRegenCreditRemaining: number;
  /** Phase 1(신규) — S09에서 선택한 5개 상품 중 하나. 결제 전엔 "무엇으로 Preview를 만들지"만 의미, 아직 결제 아님. */
  productId: ProductId | null;

  selectPurpose: (purposeId: PurposeId, policyId: string, editLevel: 0 | 1 | 2 | 3) => void;
  setPhoto: (photo: Photo, source: 'camera' | 'gallery') => void;
  setPhotoId: (photoId: string) => void;
  setFraming: (framing: Partial<Framing>) => void;
  resetFraming: () => void;
  setOption: <K extends keyof Pick<Options, 'hair' | 'background' | 'composition' | 'retouch'>>(key: K, value: Options[K]) => void;
  setGeneration: (generation: GenerationState) => void;
  setGenerationCount: (count: 1 | 4 | 8) => void;
  markFreeRetryUsed: () => void;
  setResultIndex: (index: number) => void;
  markPaid: (orderId: string) => void;
  setSourceCrop: (sourceCrop: Partial<SourceCrop>) => void;
  resetSourceCrop: () => void;
  consumePreviewCredit: () => void;
  setProductId: (productId: ProductId) => void;
  grantPaidRegenCredits: (count: number) => void;
  consumePaidRegenCredit: () => void;
  reset: () => void;
};

const defaultOptions: Options = {
  hair: 'tidy',
  expression: 'natural',
  background: 'white',
  identityLock: true,
  preserveHair: true,
  composition: 'faceShoulders',
  retouch: 'basic',
};

/**
 * Flow-session store — mirrors the `Session` type in the design handoff
 * README. One session per generation attempt; changing the purpose resets
 * everything downstream of it, matching the README's stated rule.
 */
export const useSession = create<SessionState>((set) => ({
  purposeId: null,
  policyId: null,
  editLevel: 0,
  source: null,
  photo: null,
  photoId: null,
  framing: defaultFraming,
  options: defaultOptions,
  generation: null,
  generationCount: 4,
  freeRetryUsed: false,
  resultIndex: 0,
  paid: false,
  orderId: null,
  sourceCrop: defaultSourceCrop,
  previewCreditRemaining: PREVIEW_CREDIT_INITIAL,
  paidRegenCreditRemaining: 0,
  productId: null,

  selectPurpose: (purposeId, policyId, editLevel) =>
    set({
      purposeId,
      policyId,
      editLevel,
      // Purpose change clears everything captured/decided under the old purpose.
      source: null,
      photo: null,
      photoId: null,
      framing: defaultFraming,
      options: defaultOptions,
      generation: null,
      generationCount: 4,
      freeRetryUsed: false,
      resultIndex: 0,
      paid: false,
      orderId: null,
      sourceCrop: defaultSourceCrop,
      previewCreditRemaining: PREVIEW_CREDIT_INITIAL,
      paidRegenCreditRemaining: 0,
      productId: null,
    }),

  // 05-14: replacing the photo keeps purpose/options but drops crop/framing/face position.
  setPhoto: (photo, source) => set({ photo, source, framing: defaultFraming }),
  setPhotoId: (photoId) => set({ photoId }),

  setFraming: (partial) => set((state) => ({ framing: { ...state.framing, ...partial } })),
  resetFraming: () => set({ framing: defaultFraming }),

  setOption: (key, value) => set((state) => ({ options: { ...state.options, [key]: value } })),

  setGeneration: (generation) => set({ generation }),
  setGenerationCount: (generationCount) => set({ generationCount }),
  markFreeRetryUsed: () => set({ freeRetryUsed: true }),
  setResultIndex: (resultIndex) => set({ resultIndex }),

  markPaid: (orderId) => set({ paid: true, orderId }),

  setSourceCrop: (partial) => set((state) => ({ sourceCrop: { ...state.sourceCrop, ...partial } })),
  resetSourceCrop: () => set({ sourceCrop: defaultSourceCrop }),

  // Preview Credit — 결제 여부와 무관, paidRegenCreditRemaining과 절대 합치지 않는다(스펙 §4).
  consumePreviewCredit: () => set((state) => ({ previewCreditRemaining: Math.max(0, state.previewCreditRemaining - 1) })),

  setProductId: (productId) => set({ productId }),

  // Paid Free Regeneration Credit — 결제 성공 시 상품의 freeRegenCount로 지급(Phase 6에서 S12가 호출).
  grantPaidRegenCredits: (count) => set({ paidRegenCreditRemaining: count }),
  consumePaidRegenCredit: () => set((state) => ({ paidRegenCreditRemaining: Math.max(0, state.paidRegenCreditRemaining - 1) })),

  reset: () =>
    set({
      purposeId: null,
      policyId: null,
      editLevel: 0,
      source: null,
      photo: null,
      photoId: null,
      framing: defaultFraming,
      options: defaultOptions,
      generation: null,
      generationCount: 4,
      freeRetryUsed: false,
      resultIndex: 0,
      paid: false,
      orderId: null,
      sourceCrop: defaultSourceCrop,
      previewCreditRemaining: PREVIEW_CREDIT_INITIAL,
      paidRegenCreditRemaining: 0,
      productId: null,
    }),
}));
