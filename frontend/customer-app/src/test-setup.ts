/**
 * Test Setup
 * Configures global test environment including localStorage mock
 */

import { vi } from 'vitest'

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString()
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

global.localStorage = new LocalStorageMock() as Storage
