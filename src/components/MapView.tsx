import { useEffect, useRef, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './MapView.module.css'
import type { Complaint, ComplaintCategory, CATEGORIES } from '../types/complaint'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

interface MapViewProps {
  complaints: Complaint[]
  selectedCategories: ComplaintCategory[]
  onCategoryChange: (categories: ComplaintCategory[]) => void
}

export default function MapView({ complaints, selectedCategories, onCategoryChange }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [tokenMissing, setTokenMissing] = useState(false)

  // Filter complaints by selected categories + valid coordinates
  const filteredComplaints = useMemo(() => {
    if (selectedCategories.length === 0) return []
    return complaints.filter((c) => {
      if (!c.latitude || !c.longitude) return false
      const cat = c.complaint_type // Simplified mapping
      return selectedCategories.some((sc) => cat.includes(sc))
    })
  }, [complaints, selectedCategories])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || tokenMissing) return

    if (!mapboxgl.accessToken) {
      setTokenMissing(true)
      return
    }

    try {
      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.98, 40.75],
        zoom: 10.5
      })

      m.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current = m

      m.on('load', () => {
        setMapLoaded(true)
        updateMapLayers()
      })
    } catch (err) {
      console.error('Mapbox init failed:', err)
      setTokenMissing(true)
    }

    return () => {
      map.current?.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [])

  // Update sources/layers when data or filters change
  const updateMapLayers = () => {
    if (!map.current || !mapLoaded) return

    const m = map.current
    const geojson = {
      type: 'FeatureCollection' as const,
      features: filteredComplaints.map((c) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(c.longitude!), parseFloat(c.latitude!)]
        },
        properties: {
          type: c.complaint_type,
          descriptor: c.descriptor,
          borough: c.borough,
          date: c.created_date
        }
      }))
    }

    // Update or create source
    if (m.getSource('complaints')) {
      ;(m.getSource('complaints') as mapboxgl.GeoJSONSource).setData(geojson)
    } else {
      m.addSource('complaints', { type: 'geojson', data: geojson, cluster: true, clusterMaxZoom: 11, clusterRadius: 50 })

      // Cluster circles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'complaints',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6',
            10,
            '#2563eb',
            50,
            '#1d4ed8'
          ],
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28]
        }
      })

      // Cluster counts
      m.addLayer({
        id: 'cluster-counts',
        type: 'symbol',
        source: 'complaints',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: { 'text-color': '#fff' }
      })

      // Individual points (unclustered)
      m.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'complaints',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      })

      // Click cluster → zoom
      m.on('click', 'clusters', (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0]?.properties?.cluster_id
        if (clusterId != null) {
          m.getSource('complaints').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            m.easeTo({ center: features[0].geometry.coordinates, zoom: (zoom as number) + 1 })
          })
        }
      })

      // Hover unclustered → popup
      const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      m.on('mouseenter', 'unclustered-point', (e) => {
        const props = e.features?.[0]?.properties
        if (props) {
          popup.setLngLat(e.lngLat).setHTML(`<strong>${props.type}</strong><br/>${props.descriptor}<br/>${props.borough}`).addTo(m)
        }
      })
      m.on('mouseleave', 'unclustered-point', () => popup.remove())
    }
  }

  // Re-run when filtered data changes
  useEffect(() => {
    updateMapLayers()
  }, [filteredComplaints, mapLoaded])

  if (tokenMissing) {
    return (
      <div className={styles.tokenMissing}>
        <h3>Mapbox Token Required</h3>
        <p>Add <code>VITE_MAPBOX_TOKEN</code> to your <code>.env.local</code> file.</p>
        <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener">Get a free token →</a>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div ref={mapContainer} className={styles.map} />
      <FilterChips
        categories={['Noise', 'Heat/Hot Water', 'Plumbing', 'Sanitation', 'Building/Construction', 'Rodent', 'Street Condition', 'Traffic', 'Other'] as ComplaintCategory[]}
        selected={selectedCategories}
        onChange={onCategoryChange}
      />
    </div>
  )
}

// Filter chips component (inline for brevity)
function FilterChips({ categories, selected, onChange }: { categories: ComplaintCategory[]; selected: ComplaintCategory[]; onChange: (cats: ComplaintCategory[]) => void }) {
  return (
    <div className={styles.chips}>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`${styles.chip} ${selected.includes(cat) ? styles.active : ''}`}
          onClick={() => onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat])}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
