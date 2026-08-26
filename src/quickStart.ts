import { getPolicy } from './api';
import { useSession } from './state/session';

/**
 * 02-01 홈의 "촬영" 탭과 "사진을 이미 가지고 있어요" 행은 S02~S04의 안내를
 * 건너뛰는 원탭 단축 경로다 — 목적 카드를 먼저 보여주지 않으므로 가장 통용
 * 범위가 넓은 증명사진(idPhoto)을 기본 목적으로 선택해둔다.
 */
export async function quickStartPurpose(): Promise<void> {
  const policy = await getPolicy('idPhoto');
  useSession.getState().selectPurpose('idPhoto', policy.policyId, policy.editLevel);
}
