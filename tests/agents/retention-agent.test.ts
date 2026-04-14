import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RetentionAgent } from '../../src/agents/retention-agent.js'
import type { SessionContext } from '../../src/types/session.js'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function() { return {
    messages: {
      create: vi.fn().mockResolvedValue({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: '我理解您的顾虑，请问是价格问题还是其他原因？' }],
      }),
    },
  }; }
  ),
}))

const retentionCtx = (): SessionContext => ({
  userId: 'u1', openId: 'o1', riskLevel: 'low',
  policies: [{
    policyId: 'p1', productName: '意外险', status: 'active',
    nextDueDate: '2026-12-01', premium: 99,
  }],
  messages: [], currentAgent: 'retention',
  agentState: { stage: 'diagnosis', collectedFields: {}, lastIntent: 'retention' },
  needsProfile: {},
})

describe('RetentionAgent', () => {
  it('responds to surrender intent with diagnosis question', async () => {
    const agent = new RetentionAgent()
    const reply = await agent.respond('我要退保', retentionCtx())
    expect(typeof reply).toBe('string')
    expect(reply.length).toBeGreaterThan(0)
  })

  it('does not block user right to surrender', () => {
    const agent = new RetentionAgent()
    const prompt = agent.getSystemPrompt()
    expect(prompt).not.toContain('不允许退保')
    expect(prompt).not.toContain('拒绝退保')
  })

  it('appends messages with retention agentId', async () => {
    const agent = new RetentionAgent()
    const ctx = retentionCtx()
    await agent.respond('我要退保', ctx)
    expect(ctx.messages[0].agentId).toBe('retention')
  })
})
