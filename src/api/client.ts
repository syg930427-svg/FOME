import { GENERATION_STEPS, POLICIES, PRODUCTS_V2 } from './mockData';
import { Generation, GenerationOptions, Order, PhotoUploadResult, Policy, ProductId, PurposeId } from './types';

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

/**
 * 5. POST /v1/orders → PG SDK → POST /v1/orders/{id}/confirm. PG handoff is
 * mocked as an instant success. Phase 6: S09에서 이미 확정된 productId와, 이
 * 결제로 Paid 전환될 generationId를 그대로 받아 Order에 못 박는다(안 A — 새
 * Generation을 만들지 않고 기존 것을 그대로 연결). `expiresAt`은 이 mock에
 * Order 저장소가 없어(실제 서버 없음) product.retentionDays로 즉시 계산해
 * 반환값에 담아준다.
 */
export async function createOrder(productId: ProductId, generationId: string): Promise<Order> {
  await delay(300);
  const product = PRODUCTS_V2.find((p) => p.id === productId) ?? PRODUCTS_V2[0];
  const now = Date.now();
  return {
    orderId: `order_${now}`,
    productId: product.id,
    generationId,
    amount: product.price,
    status: 'pending',
    createdAt: new Date(now).toISOString(),
    paidAt: null,
    expiresAt: new Date(now + product.retentionDays * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** PG 확인 성공 여부만 반환 — 실제 Order를 paid로 표시하는 건 호출부(S12)가 createOrder의 반환값에 status/paidAt을 합성해서 처리한다(이 mock엔 서버측 Order 저장소가 없음). */
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
