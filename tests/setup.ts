/**
 * Vitest Test Setup
 * Global setup and mocks for all tests
 */

import { vi } from 'vitest'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    search: '',
    hostname: 'localhost',
    protocol: 'http:',
    href: 'http://localhost:3000',
    reload: vi.fn()
  },
  writable: true
})

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
})

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Environment)',
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock requestAnimationFrame
window.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16) as unknown as number
})

window.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// Mock console methods to reduce noise in tests
// Comment these out if you need to debug tests
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'debug').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})

// Global cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})

