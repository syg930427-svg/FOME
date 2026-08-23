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
} | null;

type SessionState = {
  purposeId: PurposeId | null;
  policyId: string | null;
  editLevel: 0 | 1 | 2 | 3;
  source: 'camera' | 'gallery' | null;
  photo: Photo | null;
  photoId: string | null;
  options: Options;
  generation: GenerationState;
  paid: boolean;
  orderId: string | null;

  selectPurpose: (purposeId: PurposeId, policyId: string, editLevel: 0 | 1 | 2 | 3) => void;
  setPhoto: (photo: Photo, source: 'camera' | 'gallery') => void;
  setPhotoId: (photoId: string) => void;
  setOption: <K extends keyof Pick<Options, 'hair' | 'background'>>(key: K, value: Options[K]) => void;
  setGeneration: (generation: GenerationState) => void;
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
  options: defaultOptions,
  generation: null,
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
      options: defaultOptions,
      generation: null,
      paid: false,
      orderId: null,
    }),

  setPhoto: (photo, source) => set({ photo, source }),
  setPhotoId: (photoId) => set({ photoId }),

  setOption: (key, value) => set((state) => ({ options: { ...state.options, [key]: value } })),

  setGeneration: (generation) => set({ generation }),

  markPaid: (orderId) => set({ paid: true, orderId }),

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
      paid: false,
      orderId: null,
    }),
}));
