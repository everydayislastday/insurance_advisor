import type { PolicySnapshot } from '../types/session.js'

export interface PolicyApiClient {
  getPolicy(policyId: string): Promise<PolicySnapshot>
  getInstallmentInfo(policyId: string): Promise<{ nextDueDate: string; amount: number; status: string }>
  getClaimStatus(claimId: string): Promise<{ status: string; updateTime: string; description: string }>
}

export async function queryPolicy(policyId: string, api: PolicyApiClient): Promise<PolicySnapshot> {
  return api.getPolicy(policyId)
}

export async function queryInstallmentInfo(
  policyId: string,
  api: PolicyApiClient,
): Promise<{ nextDueDate: string; amount: number; status: string }> {
  return api.getInstallmentInfo(policyId)
}

export async function queryClaimStatus(
  claimId: string,
  api: PolicyApiClient,
): Promise<{ status: string; updateTime: string; description: string }> {
  return api.getClaimStatus(claimId)
}
