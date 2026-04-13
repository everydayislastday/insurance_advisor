import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PreSaleAgent } from '../../src/agents/pre-sale-agent.js'
import type { SessionContext } from '../../src/types/session.js'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: '您好！我来帮您推荐适合的保险产品。' }],
      }),
    },
  })),
}))

const baseCtx = (): SessionContext => ({
  userId: 'u1', openId: 'o1', riskLevel: 'low',
  policies: [], messages: [], currentAgent: 'pre-sale',
  agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
  needsProfile: {},
})

describe('PreSaleAgent', () => {
  it('responds with greeting on first message', async () => {
    const agent = new PreSaleAgent()
    const reply = await agent.respond('你好', baseCtx())
    expect(reply).toContain('您好')
  })

  it('appends messages to ctx after responding', async () => {
    const agent = new PreSaleAgent()
    const ctx = baseCtx()
    await agent.respond('我想买意外险', ctx)
    expect(ctx.messages).toHaveLength(2)
    expect(ctx.messages[0].role).toBe('user')
    expect(ctx.messages[1].role).toBe('assistant')
  })

  it('sets agentId to pre-sale in appended messages', async () => {
    const agent = new PreSaleAgent()
    const ctx = baseCtx()
    await agent.respond('我想买健康险', ctx)
    expect(ctx.messages[0].agentId).toBe('pre-sale')
    expect(ctx.messages[1].agentId).toBe('pre-sale')
  })
})
