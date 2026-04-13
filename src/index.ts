import Fastify from 'fastify'
import { SessionGateway } from './gateway/session-gateway.js'
import { RouterAgent } from './router/router-agent.js'
import { PreSaleAgent } from './agents/pre-sale-agent.js'
import { AfterSaleAgent } from './agents/after-sale-agent.js'
import { RetentionAgent } from './agents/retention-agent.js'
import { registerChatRoute } from './api/chat-handler.js'

// Stub implementations — replace with real services in production
const stubRedis = {
  get: async (_key: string) => null as string | null,
  set: async (_key: string, _val: string, _mode: string, _ttl: number) => {},
}
const stubPolicyApi = {
  fetchPolicies: async (_userId: string) => [] as never[],
}
const stubLlmClassifier = {
  classify: async (_msg: string, _history: unknown[]) => ({
    intent: 'pre-sale' as const,
    confidence: 0.9,
  }),
}

const gateway = new SessionGateway(stubRedis as any, stubPolicyApi as any)
const router = new RouterAgent(stubLlmClassifier as any)
const agents = {
  'pre-sale': new PreSaleAgent(),
  'after-sale': new AfterSaleAgent(),
  'retention': new RetentionAgent(),
}

const app = Fastify({ logger: true })
registerChatRoute(app, gateway, router, agents)

app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
