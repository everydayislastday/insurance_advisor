import { describe, it, expect, vi } from 'vitest'
import { RouterAgent } from '../../src/router/router-agent.js'

const mockLlm = {
  classify: vi.fn(),
}

describe('RouterAgent', () => {
  const router = new RouterAgent(mockLlm as any)

  it('routes 售前 intent to pre-sale', async () => {
    mockLlm.classify.mockResolvedValue({ intent: 'pre-sale', confidence: 0.92 })
    const result = await router.route('我想买一份健康险', [])
    expect(result.agentId).toBe('pre-sale')
    expect(result.needsClarification).toBe(false)
  })

  it('routes 退保 intent to retention', async () => {
    mockLlm.classify.mockResolvedValue({ intent: 'retention', confidence: 0.88 })
    const result = await router.route('我要退保', [])
    expect(result.agentId).toBe('retention')
    expect(result.needsClarification).toBe(false)
  })

  it('requests clarification when confidence < 0.7', async () => {
    mockLlm.classify.mockResolvedValue({ intent: 'pre-sale', confidence: 0.55 })
    const result = await router.route('帮我看看', [])
    expect(result.needsClarification).toBe(true)
    expect(result.clarificationPrompt).toContain('了解新产品')
  })

  it('routes 售后 intent to after-sale', async () => {
    mockLlm.classify.mockResolvedValue({ intent: 'after-sale', confidence: 0.85 })
    const result = await router.route('我的保单什么时候到期', [])
    expect(result.agentId).toBe('after-sale')
    expect(result.needsClarification).toBe(false)
  })

  it('requests clarification when intent is unknown', async () => {
    mockLlm.classify.mockResolvedValue({ intent: 'unknown', confidence: 0.9 })
    const result = await router.route('随便说说', [])
    expect(result.needsClarification).toBe(true)
  })
})
