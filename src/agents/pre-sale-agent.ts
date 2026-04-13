import { BaseAgent, type AgentTool } from './base-agent.js'
import type { AgentId, SessionContext } from '../types/session.js'
import { navigateToProduct } from '../tools/product-tools.js'

export class PreSaleAgent extends BaseAgent {
  protected agentId: AgentId = 'pre-sale'

  protected systemPrompt = `你是美团保险的售前顾问。
你的职责是通过多轮对话挖掘用户需求（年龄段、家庭角色、月预算、已有保障、保障类型偏好），
然后推荐 1-3 款美团自营产品，并提供主流保司对标产品横向对比。
若无匹配产品，收集需求并告知后续跟进。
不得对产品保障做出超出知识库内容的承诺。`

  protected tools: AgentTool[] = [
    {
      name: 'search_products',
      description: 'RAG 检索美团自营产品知识库',
      input_schema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'accident|health' },
          budget: { type: 'string', description: '月预算（元）' },
        },
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        // Production: inject real RAG client via DI
        return { results: [], note: 'RAG not connected' }
      },
    },
    {
      name: 'search_competitor_products',
      description: 'RAG 检索竞品知识库（主流保司 Top5）',
      input_schema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
        },
        required: ['category'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        return { results: [] }
      },
    },
    {
      name: 'navigate_to_product',
      description: '生成产品详情页 DeepLink',
      input_schema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
      async execute(input: Record<string, unknown>, _ctx: SessionContext) {
        return { deeplink: navigateToProduct(input.productId as string) }
      },
    },
    {
      name: 'collect_unmet_demand',
      description: '写入潜在需求库',
      input_schema: {
        type: 'object',
        properties: {
          need: { type: 'string' },
        },
        required: ['need'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        // Production: inject real log client
        return { recorded: true }
      },
    },
  ]
}
