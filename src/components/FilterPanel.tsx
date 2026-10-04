import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import styles from './FilterPanel.module.css'
import type { ComplaintCategory } from '../types/complaint'

interface FilterPanelProps {
  categories: ComplaintCategory[]
  selected: ComplaintCategory[]
  onChange: (categories: ComplaintCategory[]) => void
}

export default function FilterPanel({ categories, selected, onChange }: FilterPanelProps) {
  // Sync with URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const params = new URLSearchParams(hash)
      const cats = params.get('category')?.split(',').filter(Boolean) as ComplaintCategory[] | undefined
      if (cats?.length) onChange(cats)
    }
  }, [])

  const updateUrl = (cats: ComplaintCategory[]) => {
    const params = new URLSearchParams()
    if (cats.length) params.set('category', cats.join(','))
    window.location.hash = params.toString()
  }

  const handleChange = (cats: ComplaintCategory[]) => {
    onChange(cats)
    updateUrl(cats)
  }

  // Debounce for map sync
  const debouncedSelected = useDebounce(selected, 300)

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Complaint Categories</h2>
      <div className={styles.chipGroup}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.chip} ${selected.includes(cat) ? styles.active : ''}`}
            onClick={() => handleChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat])}
            aria-pressed={selected.includes(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button className={styles.clear} onClick={() => handleChange([])}>
          Clear all filters
        </button>
      )}
      <div className={styles.count}>
        {selected.length === 0 ? 'Showing all categories' : `${selected.length} category${selected.length !== 1 ? 's' : ''} selected`}
      </div>
    </div>
  )
}
