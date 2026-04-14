import Anthropic from '@anthropic-ai/sdk'
import type { SessionContext, ConversationMessage, AgentId } from '../types/session.js'

export interface AgentTool {
  name: string
  description: string
  input_schema: object
  execute(input: Record<string, unknown>, ctx: SessionContext): Promise<unknown>
}

export abstract class BaseAgent {
  protected client: Anthropic
  protected abstract agentId: AgentId
  protected abstract systemPrompt: string
  protected abstract tools: AgentTool[]

  constructor() {
    this.client = new Anthropic()
  }

  async respond(userMessage: string, ctx: SessionContext): Promise<string> {
    const messages = this.buildMessages(userMessage, ctx)
    const toolDefs = this.tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }))

    let response = await this.client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: this.systemPrompt,
      tools: toolDefs as Anthropic.Messages.Tool[],
      messages,
    })

    // Agentic loop: handle tool use
    const MAX_TOOL_ITERATIONS = 10
    let toolIterations = 0

    while (response.stop_reason === 'tool_use') {
      if (++toolIterations > MAX_TOOL_ITERATIONS) {
        throw new Error(`Tool use loop exceeded ${MAX_TOOL_ITERATIONS} iterations`)
      }
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const tool = this.tools.find(t => t.name === block.name)
          const result = tool
            ? await tool.execute(block.input as Record<string, unknown>, ctx)
            : { error: `Unknown tool: ${block.name}` }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          })
        }
      }

      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })

      response = await this.client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: this.systemPrompt,
        tools: toolDefs as Anthropic.Messages.Tool[],
        messages,
      })
    }

    const text = response.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    this.appendToHistory(userMessage, text, ctx)
    return text
  }

  private buildMessages(
    userMessage: string,
    ctx: SessionContext,
  ): Anthropic.Messages.MessageParam[] {
    const history: Anthropic.Messages.MessageParam[] = ctx.messages
      .filter(m => m.agentId === this.agentId)
      .map(m => ({ role: m.role, content: m.content }))
    return [...history, { role: 'user', content: userMessage }]
  }

  private appendToHistory(userMsg: string, assistantMsg: string, ctx: SessionContext): void {
    const now = Date.now()
    ctx.messages.push({ role: 'user', content: userMsg, agentId: this.agentId, timestamp: now })
    ctx.messages.push({ role: 'assistant', content: assistantMsg, agentId: this.agentId, timestamp: now })
  }
}
