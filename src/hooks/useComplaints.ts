import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchComplaints } from '../utils/api'
import type { ComplaintsResponse } from '../types/complaint'

interface UseComplaintsOptions {
  category?: string
  enabled?: boolean
}

/**
 * Infinite query for virtualized list with deduplication
 * TanStack Query handles request deduplication automatically
 */
export function useComplaints({ category, enabled = true }: UseComplaintsOptions) {
  return useInfiniteQuery<ComplaintsResponse, Error>({
    queryKey: ['complaints', category],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchComplaints({ offset: pageParam * 50, category })
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < lastPage.pageSize) return undefined
      return lastPage.page
    },
    initialPageParam: 0,
    enabled
  })
}

/**
 * Fetch categories for filter chips (cached indefinitely)
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const url = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=complaint_type&$group=complaint_type&$order=complaint_type'
      const res = await fetch(url)
      const data = await res.json()
      return data.map((d: { complaint_type: string }) => d.complaint_type).sort()
    },
    staleTime: Infinity,
    gcTime: Infinity
  })
}
