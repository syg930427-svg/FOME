import { GENERATION_PACKAGES, GENERATION_STEPS, MOCK_CREDIT_BALANCE, POLICIES, PRODUCTS } from './mockData';
import { Generation, GenerationOptions, GenerationOrder, Order, PhotoUploadResult, Policy, PurposeId } from './types';

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

/**
 * 07-03/07-04 — pay for a generation attempt (1/4/8 candidate photos), the
 * mock wallet balance applied first. This is a separate purchase from the
 * post-preview high-res download at S12 — you're paying here for the
 * attempt itself, not yet for a specific finished file.
 */
export async function payForGeneration(count: 1 | 4 | 8): Promise<GenerationOrder> {
  await delay(400);
  const pkg = GENERATION_PACKAGES.find((p) => p.count === count) ?? GENERATION_PACKAGES[1];
  const amount = Math.max(0, pkg.price - MOCK_CREDIT_BALANCE);
  return { orderId: `gen_order_${Date.now()}`, count, amount };
}

/** 3. POST /v1/generations — identityLock/preserveHair are server-forced constants, never sent. */
export async function createGeneration(
  photoId: string,
  policyId: string,
  options: GenerationOptions,
  count: 1 | 4 | 8 = 1
): Promise<{ generationId: string; etaSeconds: number }> {
  await delay(300);
  void photoId;
  void policyId;
  void options;
  return { generationId: `gen_${Date.now()}`, etaSeconds: count === 1 ? 20 : count === 4 ? 40 : 70 };
}

/**
 * 4. GET /v1/generations/{id} — real backend is 2s-polled or SSE. Phase 4:
 * 이 mock은 실제 서버가 아니라서 세부 단계를 알 수 없다 — 그래서 절대
 * 가짜 퍼센트를 계산해 채우지 않고 `steps: null`만 반환한다(화면은 이걸
 * neutral 로딩으로 표시해야 한다). "몇 번 폴링했는지"만 내부적으로 세어
 * 적당한 시점에 done으로 넘길 뿐 — 이 카운트 자체는 절대 화면에 노출하지
 * 않는다. previewUrl/results carry a watermark until paid at S12.
 */
const mockGenerationPollCount = new Map<string, number>();
const POLLS_UNTIL_DONE = 3;

export async function getGeneration(generationId: string, count: 1 | 4 | 8 = 1): Promise<Generation> {
  await delay(200);
  const polls = (mockGenerationPollCount.get(generationId) ?? 0) + 1;
  mockGenerationPollCount.set(generationId, polls);
  const status: Generation['status'] = polls >= POLLS_UNTIL_DONE ? 'done' : 'running';
  return {
    generationId,
    status,
    steps: null,
    previewUrl: status === 'done' ? 'mock://generated-preview-watermarked' : null,
    results: status === 'done' ? Array.from({ length: count }, (_, i) => `mock://result-${generationId}-${i}`) : null,
  };
}

/** Refunds the mock credit and clears local poll state — used by S10's cancel path (현재 UI에서는 미노출, 함수는 보존). */
export async function cancelGeneration(generationId: string): Promise<{ cancelled: true }> {
  await delay(300);
  mockGenerationPollCount.delete(generationId);
  return { cancelled: true };
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
