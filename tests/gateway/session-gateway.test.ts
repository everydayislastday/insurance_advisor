import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SessionGateway } from '../../src/gateway/session-gateway.js'
import type { SessionContext } from '../../src/types/session.js'

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
}

const mockPolicyApi = {
  fetchPolicies: vi.fn(),
}

describe('SessionGateway', () => {
  let gateway: SessionGateway

  beforeEach(() => {
    vi.clearAllMocks()
    gateway = new SessionGateway(mockRedis as any, mockPolicyApi as any)
  })

  it('returns existing session from Redis', async () => {
    const existing: SessionContext = {
      userId: 'u1', openId: 'o1', riskLevel: 'low',
      policies: [], messages: [], currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    mockRedis.get.mockResolvedValue(JSON.stringify(existing))

    const ctx = await gateway.getOrCreate('sess_1', 'u1', 'o1', 'low')
    expect(ctx.userId).toBe('u1')
    expect(mockPolicyApi.fetchPolicies).not.toHaveBeenCalled()
  })

  it('creates new session and injects policies when Redis misses', async () => {
    mockRedis.get.mockResolvedValue(null)
    mockPolicyApi.fetchPolicies.mockResolvedValue([
      { policyId: 'p1', productName: '意外险', status: 'active', nextDueDate: '2026-12-01', premium: 99 }
    ])

    const ctx = await gateway.getOrCreate('sess_2', 'u2', 'o2', 'medium')
    expect(ctx.policies).toHaveLength(1)
    expect(mockRedis.set).toHaveBeenCalled()
  })

  it('rebuilds session when Redis returns corrupted JSON', async () => {
    mockRedis.get.mockResolvedValue('{ invalid json }')
    mockPolicyApi.fetchPolicies.mockResolvedValue([])

    const ctx = await gateway.getOrCreate('sess_4', 'u4', 'o4', 'high')
    expect(ctx.userId).toBe('u4')
    expect(mockPolicyApi.fetchPolicies).toHaveBeenCalledWith('u4')
  })

  it('persists updated session back to Redis with TTL 1800', async () => {
    const ctx: SessionContext = {
      userId: 'u3', openId: 'o3', riskLevel: 'low',
      policies: [], messages: [], currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    await gateway.save('sess_3', ctx)
    expect(mockRedis.set).toHaveBeenCalledWith(
      'session:sess_3',
      JSON.stringify(ctx),
      'EX',
      1800
    )
  })
})
