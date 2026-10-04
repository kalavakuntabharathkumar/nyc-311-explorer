import { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteScroll from 'react-window-infinite-scroll'
import { useComplaints } from '../hooks/useComplaints'
import ComplaintItem from './ComplaintItem'
import LoadingSkeleton from './LoadingSkeleton'
import styles from './ComplaintList.module.css'

interface ComplaintListProps {
  category?: string
}

export default function ComplaintList({ category }: ComplaintListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useComplaints({ category, enabled: !!category })

  // Flatten pages into single array for react-window
  const items = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  if (isLoading) {
    return <div className={styles.skeletonContainer}>
      {[...Array(10)].map((_, i) => <LoadingSkeleton key={i} />)}
    </div>
  }

  if (isError) {
    return (
      <div className={styles.error} role="alert">
        Failed to load complaints: {(error as Error).message}
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
          Retry
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return <div className={styles.empty}>No complaints match your filters</div>
  }

  const Item = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <ComplaintItem complaint={items[index]} style={style} />
  )

  return (
    <div className={styles.container}>
      <InfiniteScroll
        loadMore={fetchNextPage}
        hasMore={hasNextPage}
        loader={<div className={styles.loadingMore}>Loading more...</div>}
        useWindow={false}
        threshold={200}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={600}
            itemCount={items.length}
            itemSize={72}
            width="100%"
            onItemsRendered={onItemsRendered}
            overscanCount={5}
          >
            {Item}
          </List>
        )}
      </InfiniteScroll>
      {isFetchingNextPage && <div className={styles.loadingMore}>Loading more complaints…</div>}
    </div>
  )
}
