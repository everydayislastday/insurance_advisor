/**
 * Build a Meituan insurance DeepLink URL.
 * @param scene - Target scene identifier (e.g. 'product', 'claim', 'surrender')
 * @param params - Query parameters to append
 */
export function buildDeeplink(scene: string, params: Record<string, string> = {}): string {
  const query = new URLSearchParams(params).toString()
  return query
    ? `meituan://insurance/${scene}?${query}`
    : `meituan://insurance/${scene}`
}
