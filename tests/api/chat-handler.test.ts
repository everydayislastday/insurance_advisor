import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { registerChatRoute } from '../../src/api/chat-handler.js'

const mockGateway = {
  getOrCreate: vi.fn(),
  save: vi.fn(),
}
const mockRouter = {
  route: vi.fn(),
}
const mockAgents = {
  'pre-sale': { respond: vi.fn() },
  'after-sale': { respond: vi.fn() },
  'retention': { respond: vi.fn() },
}

describe('POST /chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when sessionId is missing', async () => {
    const app = Fastify()
    registerChatRoute(app, mockGateway as any, mockRouter as any, mockAgents as any)
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/chat',
      payload: { userId: 'u1', openId: 'o1', riskLevel: 'low', message: 'hello' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 with reply on valid request', async () => {
    const ctx = {
      userId: 'u1', openId: 'o1', riskLevel: 'low',
      policies: [], messages: [], currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    mockGateway.getOrCreate.mockResolvedValue(ctx)
    mockRouter.route.mockResolvedValue({ agentId: 'pre-sale', needsClarification: false })
    mockAgents['pre-sale'].respond.mockResolvedValue('您好！')
    mockGateway.save.mockResolvedValue(undefined)

    const app = Fastify()
    registerChatRoute(app, mockGateway as any, mockRouter as any, mockAgents as any)
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/chat',
      payload: { sessionId: 'sess_1', userId: 'u1', openId: 'o1', riskLevel: 'low', message: '你好' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.reply).toBe('您好！')
    expect(body.agentId).toBe('pre-sale')
  })

  it('returns clarification message when router confidence is low', async () => {
    const ctx = {
      userId: 'u1', openId: 'o1', riskLevel: 'low',
      policies: [], messages: [], currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    mockGateway.getOrCreate.mockResolvedValue(ctx)
    mockRouter.route.mockResolvedValue({
      agentId: 'pre-sale',
      needsClarification: true,
      clarificationPrompt: '您是想了解新产品，还是查询已有保单？',
    })

    const app = Fastify()
    registerChatRoute(app, mockGateway as any, mockRouter as any, mockAgents as any)
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/chat',
      payload: { sessionId: 'sess_2', userId: 'u1', openId: 'o1', riskLevel: 'low', message: '帮我看看' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.reply).toContain('了解新产品')
  })

  it('returns FAQ fallback when router throws', async () => {
    const ctx = {
      userId: 'u1', openId: 'o1', riskLevel: 'low',
      policies: [], messages: [], currentAgent: 'pre-sale',
      agentState: { stage: 'greeting', collectedFields: {}, lastIntent: '' },
      needsProfile: {},
    }
    mockGateway.getOrCreate.mockResolvedValue(ctx)
    mockRouter.route.mockRejectedValue(new Error('LLM unavailable'))

    const app = Fastify()
    registerChatRoute(app, mockGateway as any, mockRouter as any, mockAgents as any)
    await app.ready()

    const res = await app.inject({
      method: 'POST',
      url: '/chat',
      payload: { sessionId: 'sess_3', userId: 'u1', openId: 'o1', riskLevel: 'low', message: '我要退保' },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.fallback).toBe(true)
    expect(body.reply).toContain('退保')
  })
})
