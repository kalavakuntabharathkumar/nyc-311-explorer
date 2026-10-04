import { useState, useCallback, useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import ComplaintList from './components/ComplaintList'
import MapView from './components/MapView'
import FilterPanel from './components/FilterPanel'
import { useCategories } from './hooks/useComplaints'
import type { ComplaintCategory } from './types/complaint'
import styles from './App.module.css'

export default function App() {
  const { data: categories = [] } = useCategories()
  const [selectedCategories, setSelectedCategories] = useState<ComplaintCategory[]>([])
  const [view, setView] = useState<'list' | 'map'>('list')

  // Map category names from API to our simplified categories
  const mappedCategories = useMemo(() => {
    const cats = new Set<ComplaintCategory>()
    categories.forEach((c) => {
      if (c.includes('Noise')) cats.add('Noise')
      else if (c.includes('Heat')) cats.add('Heat/Hot Water')
      else if (c.includes('Plumbing')) cats.add('Plumbing')
      else if (c.includes('Sanitation')) cats.add('Sanitation')
      else if (c.includes('Building') || c.includes('Construction')) cats.add('Building/Construction')
      else if (c.includes('Rodent')) cats.add('Rodent')
      else if (c.includes('Street')) cats.add('Street Condition')
      else if (c.includes('Traffic')) cats.add('Traffic')
      else cats.add('Other')
    })
    return Array.from(cats).sort()
  }, [categories])

  const handleCategoryChange = useCallback((cats: ComplaintCategory[]) => {
    setSelectedCategories(cats)
  }, [])

  const activeCategory = selectedCategories[0] // List shows one category at a time for simplicity

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>NYC 311 Explorer</h1>
        <div className={styles.viewToggle}>
          <button className={view === 'list' ? styles.active : ''} onClick={() => setView('list')}>List</button>
          <button className={view === 'map' ? styles.active : ''} onClick={() => setView('map')}>Map</button>
        </div>
      </header>
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <FilterPanel
            categories={mappedCategories}
            selected={selectedCategories}
            onChange={handleCategoryChange}
          />
        </aside>
        <section className={styles.content}>
          {view === 'list' ? (
            <ComplaintList category={activeCategory} />
          ) : (
            <MapView
              complaints={[]} // MapView fetches its own data via useComplaints internally in real impl
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </section>
      </main>
    </div>
  )
}
