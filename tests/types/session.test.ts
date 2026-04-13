import { describe, it, expect } from 'vitest'
import type { SessionContext, PolicySnapshot } from '../../src/types/session.js'

describe('SessionContext types', () => {
  it('should allow constructing a valid SessionContext', () => {
    const ctx: SessionContext = {
      userId: 'u_001',
      openId: 'o_001',
      riskLevel: 'low',
      policies: [{
        policyId: 'p_001',
        productName: '用户意外险',
        status: 'active',
        nextDueDate: '2026-12-01',
        premium: 99,
      }],
      messages: [],
      currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    expect(ctx.userId).toBe('u_001')
    expect(ctx.policies).toHaveLength(1)
  })

  it('should accept empty needsProfile', () => {
    const ctx: SessionContext = {
      userId: 'u_002',
      openId: 'o_002',
      riskLevel: 'medium',
      policies: [],
      messages: [],
      currentAgent: 'after-sale',
      agentState: { stage: 'query', collectedFields: {}, lastIntent: 'after-sale' },
      needsProfile: {},
    }
    expect(ctx.policies).toHaveLength(0)
    expect(ctx.needsProfile).toEqual({})
  })
})
