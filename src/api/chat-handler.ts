import type { FastifyInstance } from 'fastify'
import type { SessionGateway } from '../gateway/session-gateway.js'
import type { RouterAgent } from '../router/router-agent.js'
import type { AgentId, RiskLevel } from '../types/session.js'
import { matchFaq } from '../fallback/faq-rules.js'

interface ChatRequest {
  sessionId: string
  userId: string
  openId: string
  riskLevel: string
  message: string
}

interface AgentResponder {
  respond(message: string, ctx: unknown): Promise<string>
}

type AgentMap = Record<AgentId, AgentResponder>

export function registerChatRoute(
  app: FastifyInstance,
  gateway: SessionGateway,
  router: RouterAgent,
  agents: AgentMap,
): void {
  app.post<{ Body: ChatRequest }>('/chat', async (request, reply) => {
    const { sessionId, userId, openId, riskLevel, message } = request.body ?? {}

    if (!sessionId) {
      return reply.status(400).send({ error: 'sessionId is required' })
    }

    const VALID_RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high']
    if (riskLevel && !VALID_RISK_LEVELS.includes(riskLevel as RiskLevel)) {
      return reply.status(400).send({ error: 'Invalid riskLevel, must be low|medium|high' })
    }

    let ctx
    try {
      ctx = await gateway.getOrCreate(sessionId, userId, openId, riskLevel as RiskLevel)
    } catch {
      return reply.status(500).send({ error: 'Failed to load session' })
    }

    let routeResult
    try {
      routeResult = await router.route(message, ctx.messages)
    } catch {
      // Level 3 fallback: FAQ rules
      const faqAnswer = matchFaq(message)
      return reply.send({ reply: faqAnswer, agentId: ctx.currentAgent, fallback: true })
    }

    if (routeResult.needsClarification) {
      return reply.send({
        reply: routeResult.clarificationPrompt,
        agentId: ctx.currentAgent,
        needsClarification: true,
      })
    }

    ctx.currentAgent = routeResult.agentId
    const agent = agents[routeResult.agentId]

    let agentReply: string
    try {
      agentReply = await agent.respond(message, ctx)
    } catch {
      // Level 2 fallback: simple error message
      agentReply = '抱歉，系统暂时繁忙，请稍后重试。如需紧急帮助，请联系人工客服。'
    }

    await gateway.save(sessionId, ctx)
    return reply.send({ reply: agentReply, agentId: routeResult.agentId })
  })
}
