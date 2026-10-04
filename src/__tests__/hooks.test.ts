import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useComplaints } from '../hooks/useComplaints'
import { useDebounce } from '../hooks/useDebounce'
import { ReactNode } from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } }
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useComplaints', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useComplaints({ category: 'Noise' }), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 }
    })

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 300 })
    expect(result.current).toBe('initial') // Still initial

    vi.advanceTimersByTime(300)
    expect(result.current).toBe('updated')
  })
})
