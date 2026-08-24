import { create } from 'zustand';
import { GenerationStatus, PurposeId } from '../api/types';

export type Photo = { uri: string; width: number; height: number };

export type Options = {
  hair: 'original' | 'tidy' | 'flyaway';
  expression: 'natural';
  background: 'white' | 'lightGray' | 'original';
  /** Constants per README RULE-08/RULE-09 — never exposed as a user-facing toggle. */
  identityLock: true;
  preserveHair: true;
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
  /** 08-05 — one free retry per generation attempt (RULE: 실패 시 크레딧 미차감 + 1회 무료 재시도). */
  freeRetryUsed: boolean;
  /** 08-03 — which of the batch results the user picked to carry into S11/S12. */
  resultIndex: number;
  paid: boolean;
  orderId: string | null;

  selectPurpose: (purposeId: PurposeId, policyId: string, editLevel: 0 | 1 | 2 | 3) => void;
  setPhoto: (photo: Photo, source: 'camera' | 'gallery') => void;
  setPhotoId: (photoId: string) => void;
  setFraming: (framing: Partial<Framing>) => void;
  resetFraming: () => void;
  setOption: <K extends keyof Pick<Options, 'hair' | 'background'>>(key: K, value: Options[K]) => void;
  setGeneration: (generation: GenerationState) => void;
  setGenerationCount: (count: 1 | 4 | 8) => void;
  markFreeRetryUsed: () => void;
  setResultIndex: (index: number) => void;
  markPaid: (orderId: string) => void;
  reset: () => void;
};

const defaultOptions: Options = {
  hair: 'tidy',
  expression: 'natural',
  background: 'white',
  identityLock: true,
  preserveHair: true,
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
    }),
}));
