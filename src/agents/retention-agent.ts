import { BaseAgent, type AgentTool } from './base-agent.js'
import type { AgentId, SessionContext } from '../types/session.js'
import { navigateTo } from '../tools/retention-tools.js'

export class RetentionAgent extends BaseAgent {
  protected agentId: AgentId = 'retention'

  protected systemPrompt = `你是美团保险的退保顾问。
你的职责是通过结构化对话诊断退保原因，提供有针对性的挽留方案。
合规要求：
1. 不得阻止用户行使合法退保权利；
2. 退保损失金额必须来自系统接口，不得自行估算；
3. 挽留话术不得包含误导性承诺或虚假保障说明。
若用户坚持退保，礼貌告知退保流程并提供跳转链接。`

  /** Exposed for compliance testing */
  getSystemPrompt(): string {
    return this.systemPrompt
  }

  protected tools: AgentTool[] = [
    {
      name: 'query_surrender_cost',
      description: '计算退保损失金额（必须来自系统，不得估算）',
      input_schema: {
        type: 'object',
        properties: { policyId: { type: 'string' } },
        required: ['policyId'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        // Production: call surrender cost API
        return { note: 'surrender cost service not connected' }
      },
    },
    {
      name: 'query_alternative_plans',
      description: '查询降档 / 替代方案',
      input_schema: {
        type: 'object',
        properties: { policyId: { type: 'string' } },
        required: ['policyId'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        return { plans: [] }
      },
    },
    {
      name: 'navigate_to',
      description: '跳转降档 / 退保 / 人工客服页',
      input_schema: {
        type: 'object',
        properties: {
          scene: { type: 'string', description: 'downgrade|surrender|human-service' },
          params: { type: 'object' },
        },
        required: ['scene'],
      },
      async execute(input: Record<string, unknown>, _ctx: SessionContext) {
        return { deeplink: navigateTo(input.scene as string, (input.params ?? {}) as Record<string, string>) }
      },
    },
    {
      name: 'log_churn_reason',
      description: '记录退保原因，供业务分析',
      input_schema: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'price|unnecessary|wrong_product|bad_service|other' },
          policyId: { type: 'string' },
        },
        required: ['reason', 'policyId'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        // Production: write to churn log
        return { logged: true }
      },
    },
  ]
}
