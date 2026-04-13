import { BaseAgent, type AgentTool } from './base-agent.js'
import type { AgentId, SessionContext } from '../types/session.js'
import { getDeeplink } from '../tools/common-tools.js'

export class AfterSaleAgent extends BaseAgent {
  protected agentId: AgentId = 'after-sale'

  protected systemPrompt = `你是美团保险的售后助手。
你可以帮用户查询保单信息、解释续期流程、说明理赔材料和流程、查询理赔进度。
保单信息已在 Session 上下文中，优先使用上下文数据直接回答，避免重复查询。
若检测到退保意图，告知用户你将为其转接专业的退保顾问。
不得对理赔结果作出任何承诺。`

  protected tools: AgentTool[] = [
    {
      name: 'query_policy',
      description: '查询保单详情',
      input_schema: {
        type: 'object',
        properties: { policyId: { type: 'string' } },
        required: ['policyId'],
      },
      async execute(input: Record<string, unknown>, ctx: SessionContext) {
        const policy = ctx.policies.find(p => p.policyId === input.policyId)
        return policy ?? { error: '保单不存在' }
      },
    },
    {
      name: 'query_installment_info',
      description: '查分期状态（对接 insurance_mall_installment Thrift RPC port 8412）',
      input_schema: {
        type: 'object',
        properties: { policyId: { type: 'string' } },
        required: ['policyId'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        // Production: call insurance_mall_installment Thrift RPC port 8412
        return { note: 'installment service not connected' }
      },
    },
    {
      name: 'query_claim_status',
      description: '查理赔进度',
      input_schema: {
        type: 'object',
        properties: { claimId: { type: 'string' } },
        required: ['claimId'],
      },
      async execute(_input: Record<string, unknown>, _ctx: SessionContext) {
        return { note: 'claim service not connected' }
      },
    },
    {
      name: 'get_deeplink',
      description: '生成目标页跳转链接',
      input_schema: {
        type: 'object',
        properties: {
          scene: { type: 'string', description: 'policy|claim|payment|surrender' },
          params: { type: 'object' },
        },
        required: ['scene'],
      },
      async execute(input: Record<string, unknown>, _ctx: SessionContext) {
        return { deeplink: getDeeplink(input.scene as string, (input.params ?? {}) as Record<string, string>) }
      },
    },
  ]
}
