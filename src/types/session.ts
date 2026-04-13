export type AgentId = 'pre-sale' | 'after-sale' | 'retention'

export interface PolicySnapshot {
  policyId: string
  productName: string
  status: string
  nextDueDate: string
  premium: number
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  agentId: AgentId
  timestamp: number
}

export interface AgentState {
  stage: string
  collectedFields: Record<string, string>
  lastIntent: string
}

export interface NeedsProfile {
  ageGroup?: string
  budget?: string
  familyRole?: string
  existingCoverage?: string[]
  preferredType?: string
}

export interface SessionContext {
  userId: string
  openId: string
  riskLevel: string
  policies: PolicySnapshot[]
  messages: ConversationMessage[]
  currentAgent: AgentId
  agentState: AgentState
  needsProfile: NeedsProfile
}
