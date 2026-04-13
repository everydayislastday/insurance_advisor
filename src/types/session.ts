export type AgentId = 'pre-sale' | 'after-sale' | 'retention'
export type PolicyStatus = 'active' | 'lapsed' | 'cancelled' | 'pending'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface PolicySnapshot {
  policyId: string
  productName: string
  status: PolicyStatus
  nextDueDate: string
  premium: number
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  agentId: AgentId
  /** Unix timestamp in milliseconds */
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
  riskLevel: RiskLevel
  policies: PolicySnapshot[]
  messages: ConversationMessage[]
  currentAgent: AgentId
  agentState: AgentState
  needsProfile: NeedsProfile
}
