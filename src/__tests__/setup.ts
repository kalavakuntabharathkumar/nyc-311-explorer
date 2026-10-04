import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Mapbox GL
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn().mockImplementation(() => ({
      addControl: vi.fn(),
      on: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      getSource: vi.fn(),
      remove: vi.fn(),
      easeTo: vi.fn(),
      queryRenderedFeatures: vi.fn(() => [])
    })),
    NavigationControl: vi.fn(),
    Popup: vi.fn().mockImplementation(() => ({ setLngLat: vi.fn(), setHTML: vi.fn(), addTo: vi.fn(), remove: vi.fn() }))
  }
}))

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

vi.mock('react-window-infinite-scroll', () => ({
  default: ({ children }: any) => <div>{children({ onItemsRendered: vi.fn(), ref: vi.fn() })}</div>
}))
