import { describe, it, expect } from 'vitest'
import type { SessionContext, PolicySnapshot, AgentId } from '../../src/types/session.js'

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

  it('should type-check AgentId union', () => {
    const id: AgentId = 'pre-sale'
    expect(['pre-sale', 'after-sale', 'retention'].includes(id)).toBe(true)
  })
})
