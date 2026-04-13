export interface FaqEntry {
  keywords: string[]
  answer: string
}

const FAQ_RULES: FaqEntry[] = [
  {
    keywords: ['保单', '查询', '我的保险'],
    answer: '您可以在美团 App → 保险频道 → 我的保单中查看所有保单信息。如需人工协助，请点击下方"转人工"。',
  },
  {
    keywords: ['理赔', '申请', '报案'],
    answer: '理赔申请请前往美团 App → 保险频道 → 理赔申请，准备好事故证明、医疗单据等材料。如需人工协助，请联系客服。',
  },
  {
    keywords: ['退保', '取消'],
    answer: '退保申请请前往美团 App → 保险频道 → 我的保单 → 申请退保。退保前建议了解退保损失，如有疑问请联系人工客服。',
  },
  {
    keywords: ['续期', '缴费', '到期'],
    answer: '续期缴费请前往美团 App → 保险频道 → 我的保单 → 续期缴费，可选择一次性或分期方式。',
  },
  {
    keywords: ['人工', '客服', '转接'],
    answer: '正在为您转接人工客服，请稍候...',
  },
]

const DEFAULT_ANSWER = '抱歉，我暂时无法回答您的问题。请点击下方"转人工"联系我们的专业客服。'

export function matchFaq(message: string): string {
  const lower = message.toLowerCase()
  for (const entry of FAQ_RULES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.answer
    }
  }
  return DEFAULT_ANSWER
}
