import type { SessionContext, RiskLevel } from '../types/session.js'

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode: string, ttl: number): Promise<unknown>
}

export interface PolicyApiClient {
  fetchPolicies(userId: string): Promise<SessionContext['policies']>
}

export class SessionGateway {
  constructor(
    private redis: RedisClient,
    private policyApi: PolicyApiClient,
  ) {}

  async getOrCreate(
    sessionId: string,
    userId: string,
    openId: string,
    riskLevel: RiskLevel,
  ): Promise<SessionContext> {
    const raw = await this.redis.get(`session:${sessionId}`)
    if (raw) {
      return JSON.parse(raw) as SessionContext
    }

    const policies = await this.policyApi.fetchPolicies(userId)
    const ctx: SessionContext = {
      userId,
      openId,
      riskLevel,
      policies,
      messages: [],
      currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    await this.save(sessionId, ctx)
    return ctx
  }

  async save(sessionId: string, ctx: SessionContext): Promise<void> {
    await this.redis.set(`session:${sessionId}`, JSON.stringify(ctx), 'EX', 1800)
  }
}
