import type { Complaint, ComplaintsResponse } from '../types/complaint'

const SODA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json'
const PAGE_SIZE = 50

interface FetchOptions {
  signal?: AbortSignal
  offset?: number
  limit?: number
  category?: string
}

/**
 * Exponential backoff fetch with retry logic
 * @param url - Request URL
 * @param options - Fetch options including AbortSignal
 * @param attempt - Current attempt number (0-indexed)
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit = {},
  attempt = 0
): Promise<Response> {
  const MAX_RETRIES = 3
  const BASE_DELAY = 1000 // 1s

  try {
    const response = await fetch(url, options)

    // Retry on 429, 5xx, or network errors
    if (
      response.status === 429 ||
      response.status >= 500 ||
      !response.ok
    ) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error
    }

    // Don't retry if aborted
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    const delay = BASE_DELAY * 2 ** attempt
    console.warn(`[API] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return fetchWithBackoff(url, options, attempt + 1)
  }
}

/**
 * Build SODA query URL with filters
 */
function buildUrl(options: FetchOptions): string {
  const params = new URLSearchParams({
    $limit: String(options.limit ?? PAGE_SIZE),
    $offset: String(options.offset ?? 0),
    $order: 'created_date DESC',
    $select: [
      'unique_key',
      'created_date',
      'closed_date',
      'agency',
      'agency_name',
      'complaint_type',
      'descriptor',
      'location_type',
      'incident_zip',
      'incident_address',
      'street_name',
      'cross_street_1',
      'cross_street_2',
      'city',
      'borough',
      'status',
      'latitude',
      'longitude',
      'location'
    ].join(','), // Reduce payload size
    $$app_token: '' // Optional: add if you have an app token for higher rate limits
  })

  if (options.category && options.category !== 'All') {
    params.append('$where', `complaint_type LIKE '%${options.category}%'`) // Simplified; real impl would use IN clause
  }

  return `${SODA_ENDPOINT}?${params.toString()}`
}

/**
 * Fetch a single page of complaints
 */
export async function fetchComplaints(
  options: FetchOptions = {}
): Promise<ComplaintsResponse> {
  const url = buildUrl(options)
  const response = await fetchWithBackoff(url, { signal: options.signal })
  const data = (await response.json()) as Complaint[]

  // SODA doesn't return total count in body; we estimate from pagination
  const total = data.length < (options.limit ?? PAGE_SIZE) 
    ? (options.offset ?? 0) + data.length
    : (options.offset ?? 0) + data.length + 1000 // Conservative estimate

  return { data, total, page: Math.floor((options.offset ?? 0) / PAGE_SIZE) + 1, pageSize: PAGE_SIZE }
}

/**
 * Fetch all unique complaint types for filter chips
 */
export async function fetchCategories(): Promise<string[]> {
  const url = `${SODA_ENDPOINT}?$select=complaint_type&$group=complaint_type&$order=complaint_type`
  const response = await fetchWithBackoff(url)
  const data = await response.json()
  return data.map((d: { complaint_type: string }) => d.complaint_type).sort()
}
