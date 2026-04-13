export interface RetentionApiClient {
  getSurrenderCost(policyId: string): Promise<{ amount: number; currency: string }>
  getAlternativePlans(policyId: string): Promise<Array<{ planId: string; name: string; premium: number }>>
}

export interface ChurnLogClient {
  log(reason: string, policyId: string): Promise<void>
}

export async function querySurrenderCost(
  policyId: string,
  api: RetentionApiClient,
): Promise<{ amount: number; currency: string }> {
  return api.getSurrenderCost(policyId)
}

export async function queryAlternativePlans(
  policyId: string,
  api: RetentionApiClient,
): Promise<Array<{ planId: string; name: string; premium: number }>> {
  return api.getAlternativePlans(policyId)
}

export async function logChurnReason(
  reason: string,
  policyId: string,
  logClient: ChurnLogClient,
): Promise<void> {
  await logClient.log(reason, policyId)
}

export function navigateTo(scene: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString()
  return `meituan://insurance/${scene}?${query}`
}
