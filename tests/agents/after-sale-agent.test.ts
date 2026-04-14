import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AfterSaleAgent } from '../../src/agents/after-sale-agent.js'
import type { SessionContext } from '../../src/types/session.js'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function() { return {
    messages: {
      create: vi.fn().mockResolvedValue({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: '您的保单状态如下：...' }],
      }),
    },
  }; }
  ),
}))

const ctxWithPolicy = (): SessionContext => ({
  userId: 'u1', openId: 'o1', riskLevel: 'low',
  policies: [{
    policyId: 'p1', productName: '意外险', status: 'active',
    nextDueDate: '2026-12-01', premium: 99,
  }],
  messages: [], currentAgent: 'after-sale',
  agentState: { stage: 'query', collectedFields: {}, lastIntent: 'after-sale' },
  needsProfile: {},
})

describe('AfterSaleAgent', () => {
  it('responds to policy query', async () => {
    const agent = new AfterSaleAgent()
    const reply = await agent.respond('我的保单什么时候到期', ctxWithPolicy())
    expect(typeof reply).toBe('string')
    expect(reply.length).toBeGreaterThan(0)
  })

  it('appends messages to ctx', async () => {
    const agent = new AfterSaleAgent()
    const ctx = ctxWithPolicy()
    await agent.respond('查一下我的保单', ctx)
    expect(ctx.messages).toHaveLength(2)
    expect(ctx.messages[0].agentId).toBe('after-sale')
  })
})
