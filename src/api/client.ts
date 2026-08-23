import { GENERATION_STEPS, POLICIES, PRODUCTS } from './mockData';
import { Generation, GenerationOptions, Order, PhotoUploadResult, Policy, PurposeId } from './types';

/**
 * Mock implementation of the server API described in the design handoff
 * README ("## API"). No real backend exists yet — every call here resolves
 * with fabricated data after a short delay to emulate network latency, so
 * the app is fully navigable end to end.
 *
 * Swap this module for a real HTTP client later; every screen only imports
 * from `src/api`, never this file directly, so the swap is one-line.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Splash-time bootstrap: policy metadata prefetch + version check, combined
 * into one call for the mock. Always succeeds — there is no real backend to
 * fail against yet, so 01-09 (update required) and 01-10 (server error) are
 * implemented and reachable, but nothing in this mock routes to them.
 */
export async function prefetchBootstrap(): Promise<{ ok: true } | { ok: false; reason: 'update_required' | 'server_error' }> {
  await delay(600);
  return { ok: true };
}

/** 1. GET /v1/policies/{purposeId} */
export async function getPolicy(purposeId: PurposeId): Promise<Policy> {
  await delay(250);
  return POLICIES[purposeId];
}

/** 2. POST /v1/photos — server never returns PASS/FAIL (RULE-05: no auto suitability judgement). */
export async function uploadPhoto(_uri: string): Promise<PhotoUploadResult> {
  await delay(400);
  return { photoId: `photo_${Date.now()}` };
}

/** 3. POST /v1/generations — identityLock/preserveHair are server-forced constants, never sent. */
export async function createGeneration(
  photoId: string,
  policyId: string,
  options: GenerationOptions
): Promise<{ generationId: string; etaSeconds: number }> {
  await delay(300);
  void photoId;
  void policyId;
  void options;
  return { generationId: `gen_${Date.now()}`, etaSeconds: 20 };
}

/**
 * 4. GET /v1/generations/{id} — real backend is 2s-polled or SSE; the mock
 * advances progress deterministically each call so a fixed-interval poller
 * (see S10) reaches `done` in ~4 polls. previewUrl carries a watermark until paid.
 */
const mockGenerationProgress = new Map<string, number>();

export async function getGeneration(generationId: string): Promise<Generation> {
  await delay(200);
  const prev = mockGenerationProgress.get(generationId) ?? 0;
  const next = Math.min(100, prev + 34);
  mockGenerationProgress.set(generationId, next);
  const status: Generation['status'] = next >= 100 ? 'done' : 'running';
  return {
    generationId,
    status,
    progress: next,
    previewUrl: status === 'done' ? 'mock://generated-preview-watermarked' : null,
  };
}

export function generationStepLabel(index: number) {
  return GENERATION_STEPS[index] ?? '';
}

/** 5. POST /v1/orders → PG SDK → POST /v1/orders/{id}/confirm. PG handoff is mocked as an instant success. */
export async function createOrder(productId: string): Promise<Order> {
  await delay(300);
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  return { orderId: `order_${Date.now()}`, productId: product.id, amount: product.price };
}

export async function confirmOrder(orderId: string): Promise<{ confirmed: true }> {
  await delay(500);
  void orderId;
  return { confirmed: true };
}

/** 6. GET /v1/generations/{id}/download — signed URL, 24h expiry, paid orders only. */
export async function getDownloadUrl(generationId: string): Promise<{ url: string; expiresAt: string }> {
  await delay(200);
  return {
    url: `mock://download/${generationId}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
