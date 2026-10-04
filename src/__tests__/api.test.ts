import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchComplaints, fetchWithBackoff } from '../utils/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('api utilities', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('fetchComplaints builds correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ unique_key: '1', complaint_type: 'Noise', created_date: '2024-01-01', borough: 'MANHATTAN', latitude: '40.7', longitude: '-73.9' }]
    })

    const result = await fetchComplaints({ offset: 0, limit: 50, category: 'Noise' })
    expect(result.data).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('erm2-nwe9.json'))
  })

  it('fetchWithBackoff retries on 500', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'ok' }) })

    const response = await fetchWithBackoff('https://test.com', {}, 0)
    expect(response.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('fetchWithBackoff throws after max retries', async () => {
    mockFetch.mockRejectedValue(new Error('Persistent error'))

    await expect(fetchWithBackoff('https://test.com', {}, 0)).rejects.toThrow('Persistent error')
    expect(mockFetch).toHaveBeenCalledTimes(4) // initial + 3 retries
  })

  it('fetchWithBackoff does not retry on AbortError', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    mockFetch.mockRejectedValue(abortError)

    await expect(fetchWithBackoff('https://test.com', { signal: { aborted: true } as any }, 0)).rejects.toThrow('AbortError')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
