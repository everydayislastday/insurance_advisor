export interface UserProfileApiClient {
  getProfile(userId: string): Promise<{ riskLevel: string; familyInfo: Record<string, string> }>
}

export interface DemandLogClient {
  write(need: string, userId: string): Promise<void>
}

export async function getUserProfile(
  userId: string,
  api: UserProfileApiClient,
): Promise<{ riskLevel: string; familyInfo: Record<string, string> }> {
  return api.getProfile(userId)
}

export async function collectUnmetDemand(
  need: string,
  userId: string,
  logClient: DemandLogClient,
): Promise<void> {
  await logClient.write(need, userId)
}

export function getDeeplink(scene: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString()
  return `meituan://insurance/${scene}?${query}`
}
