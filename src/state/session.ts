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
   * S08 "구도"(AI 생성 정책). 구 `framing.framingId`가 기술 조정(05-02)과
   * 섞여 있던 걸 분리한 필드 — `sourceCrop`은 05-02 전용으로 남고, AI 구도는
   * 여기 하나로만 저장된다(Phase 2, PhotoFlow 최종 스펙 §6).
   */
  composition: CompositionId;
  /** S08 "보정". 상품 등급별 'premium' 활성/비활성 연동은 Phase 3(상품 선택) 이후 과제. */
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
  options: Options;
  generation: GenerationState;
  /** 07-03/07-04 — how many candidate photos the next generation attempt requests. */
  generationCount: 1 | 4 | 8;
  /**
   * @deprecated Phase 3에서 폐기 예정 — "1회 무료 재시도" 하나로 preview/paid를
   * 구분 없이 다루던 옛 개념. `previewCreditRemaining`/`paidRegenCreditRemaining`으로
   * 대체된다(둘은 완전히 별도 카운터 — 섞으면 안 됨, PhotoFlow 스펙 §4).
   * `S10_Generating.tsx`가 아직 이 필드를 쓰고 있어 Phase 3까지는 남겨둔다.
   */
  freeRetryUsed: boolean;
  /** 08-03 — which of the batch results the user picked to carry into S11/S12. */
  resultIndex: number;
  paid: boolean;
  orderId: string | null;

  /** 05-02 기술 조정 전용 상태(회전/얼굴 크기·위치/비율) — AI 구도(composition)를 포함하지 않는다. */
  sourceCrop: SourceCrop;
  /** 결제 전 Preview 생성/재생성 가능 횟수. 최초 세션 시작 시 지급, 결제와 무관. */
  previewCreditRemaining: number;
  /** 결제 후 지급되는 무료 재생성 횟수. 구매한 상품(productId)의 freeRegenCount로 지급. */
  paidRegenCreditRemaining: number;
  /** S09에서 선택한 5개 상품 중 하나. 결제 전엔 "무엇으로 Preview를 만들지"만 의미, 아직 결제 아님. */
  productId: ProductId | null;

  selectPurpose: (purposeId: PurposeId, policyId: string, editLevel: 0 | 1 | 2 | 3) => void;
  setPhoto: (photo: Photo, source: 'camera' | 'gallery') => void;
  setPhotoId: (photoId: string) => void;
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

  // 05-14: replacing the photo keeps purpose/options but drops the technical crop/face-position.
  setPhoto: (photo, source) => set({ photo, source, sourceCrop: defaultSourceCrop }),
  setPhotoId: (photoId) => set({ photoId }),

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
