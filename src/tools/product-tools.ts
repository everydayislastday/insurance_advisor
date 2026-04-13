export interface ProductResult {
  productId: string
  name: string
  category: string
  price: number
}

export interface CompetitorResult {
  productId: string
  name: string
  insurer: string
  price: string
}

export interface RagClient {
  search(query: string, filters?: Record<string, string>): Promise<unknown[]>
}

export async function searchProducts(
  filters: { category?: string; budget?: string },
  rag: RagClient,
): Promise<ProductResult[]> {
  const query = `category:${filters.category ?? 'all'} budget:${filters.budget ?? 'any'}`
  const raw = await rag.search(query, filters)
  return raw as ProductResult[]
}

export async function searchCompetitorProducts(
  category: string,
  rag: RagClient,
): Promise<CompetitorResult[]> {
  const raw = await rag.search(`competitor category:${category}`)
  return raw as CompetitorResult[]
}

export function navigateToProduct(productId: string): string {
  return `meituan://insurance/product/${productId}`
}
