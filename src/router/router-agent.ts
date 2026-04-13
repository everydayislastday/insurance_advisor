import type { AgentId, ConversationMessage } from '../types/session.js'

export interface IntentClassification {
  intent: AgentId | 'unknown'
  confidence: number
}

export interface LlmClassifier {
  classify(message: string, history: ConversationMessage[]): Promise<IntentClassification>
}

export interface IntentResult {
  agentId: AgentId
  needsClarification: boolean
  clarificationPrompt?: string
}

const CONFIDENCE_THRESHOLD = 0.7
const CLARIFICATION_PROMPT = '您是想了解新产品，还是查询已有保单？'

export class RouterAgent {
  constructor(private llm: LlmClassifier) {}

  async route(message: string, history: ConversationMessage[]): Promise<IntentResult> {
    const { intent, confidence } = await this.llm.classify(message, history)

    if (confidence < CONFIDENCE_THRESHOLD || intent === 'unknown') {
      return {
        agentId: 'pre-sale',
        needsClarification: true,
        clarificationPrompt: CLARIFICATION_PROMPT,
      }
    }

    return {
      agentId: intent as AgentId,
      needsClarification: false,
    }
  }
}
