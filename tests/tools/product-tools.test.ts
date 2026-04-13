import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchProducts, searchCompetitorProducts, navigateToProduct } from '../../src/tools/product-tools.js'

const mockRag = { search: vi.fn() }

describe('product-tools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchProducts returns filtered results from RAG', async () => {
    mockRag.search.mockResolvedValue([
      { productId: 'p1', name: '美团意外险', category: 'accident', price: 99 }
    ])
    const results = await searchProducts({ category: 'accident', budget: '100' }, mockRag as any)
    expect(results).toHaveLength(1)
    expect(results[0].productId).toBe('p1')
  })

  it('searchCompetitorProducts returns competitor list', async () => {
    mockRag.search.mockResolvedValue([
      { productId: 'c1', name: '平安意外险', insurer: '平安', price: '120/年' }
    ])
    const results = await searchCompetitorProducts('accident', mockRag as any)
    expect(results[0].insurer).toBe('平安')
  })

  it('navigateToProduct returns deeplink string', () => {
    const link = navigateToProduct('p1')
    expect(link).toMatch(/meituan:\/\/insurance\/product\/p1/)
  })
})
