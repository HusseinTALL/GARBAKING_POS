/**
 * Favorites Store Tests
 * Unit tests for favorites store functionality including persistence
 */

import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useFavoritesStore } from '../favorites'
import type { MenuItem } from '@/services/mockApi'

describe('Favorites Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Clean up
    localStorage.clear()
  })

  const mockItem1: MenuItem = {
    id: '1',
    sku: 'ITEM001',
    name: 'Test Pizza',
    description: 'Delicious test pizza',
    price: 12.99,
    category: { id: 'pizza', name: 'Pizza' },
    imageUrl: '/test.jpg',
    isAvailable: true
  }

  const mockItem2: MenuItem = {
    id: '2',
    sku: 'ITEM002',
    name: 'Test Burger',
    description: 'Tasty test burger',
    price: 9.99,
    category: { id: 'burger', name: 'Burger' },
    imageUrl: '/test2.jpg',
    isAvailable: true
  }

  describe('Initial State', () => {
    it('should initialize with empty favorites', () => {
      const store = useFavoritesStore()
      expect(store.favoritesCount).toBe(0)
      expect(store.hasFavorites).toBe(false)
      expect(store.getFavorites()).toEqual([])
    })

    it('should load favorites from localStorage if available', () => {
      const stored = {
        ids: ['1'],
        items: [mockItem1],
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('garbaking_favorites', JSON.stringify(stored))

      const store = useFavoritesStore()
      expect(store.favoritesCount).toBe(1)
      expect(store.hasFavorites).toBe(true)
      expect(store.isFavorite('1')).toBe(true)
    })
  })

  describe('Adding Favorites', () => {
    it('should add an item to favorites', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)

      expect(store.favoritesCount).toBe(1)
      expect(store.hasFavorites).toBe(true)
      expect(store.isFavorite('1')).toBe(true)
      expect(store.getFavorites()).toContainEqual(mockItem1)
    })

    it('should not add duplicate items', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.addFavorite(mockItem1)

      expect(store.favoritesCount).toBe(1)
      expect(store.getFavorites().length).toBe(1)
    })

    it('should add multiple different items', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.addFavorite(mockItem2)

      expect(store.favoritesCount).toBe(2)
      expect(store.isFavorite('1')).toBe(true)
      expect(store.isFavorite('2')).toBe(true)
    })

    it('should persist favorites to localStorage when adding', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)

      const stored = localStorage.getItem('garbaking_favorites')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.ids).toContain('1')
      expect(parsed.items).toHaveLength(1)
      expect(parsed.items[0].name).toBe('Test Pizza')
    })
  })

  describe('Removing Favorites', () => {
    it('should remove an item from favorites', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      expect(store.favoritesCount).toBe(1)

      store.removeFavorite('1')
      expect(store.favoritesCount).toBe(0)
      expect(store.hasFavorites).toBe(false)
      expect(store.isFavorite('1')).toBe(false)
    })

    it('should handle removing non-existent items gracefully', () => {
      const store = useFavoritesStore()
      store.removeFavorite('non-existent')
      expect(store.favoritesCount).toBe(0)
    })

    it('should persist changes to localStorage when removing', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.addFavorite(mockItem2)
      store.removeFavorite('1')

      const stored = localStorage.getItem('garbaking_favorites')
      const parsed = JSON.parse(stored!)
      expect(parsed.ids).not.toContain('1')
      expect(parsed.ids).toContain('2')
      expect(parsed.items).toHaveLength(1)
    })
  })

  describe('Toggle Favorites', () => {
    it('should add item when toggling on non-favorite', () => {
      const store = useFavoritesStore()
      const result = store.toggleFavorite(mockItem1)

      expect(result).toBe(true)
      expect(store.isFavorite('1')).toBe(true)
    })

    it('should remove item when toggling on favorite', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      const result = store.toggleFavorite(mockItem1)

      expect(result).toBe(false)
      expect(store.isFavorite('1')).toBe(false)
    })

    it('should toggle multiple times correctly', () => {
      const store = useFavoritesStore()

      store.toggleFavorite(mockItem1) // Add
      expect(store.isFavorite('1')).toBe(true)

      store.toggleFavorite(mockItem1) // Remove
      expect(store.isFavorite('1')).toBe(false)

      store.toggleFavorite(mockItem1) // Add again
      expect(store.isFavorite('1')).toBe(true)
    })
  })

  describe('Clear All Favorites', () => {
    it('should clear all favorites', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.addFavorite(mockItem2)
      expect(store.favoritesCount).toBe(2)

      store.clearFavorites()
      expect(store.favoritesCount).toBe(0)
      expect(store.hasFavorites).toBe(false)
      expect(store.getFavorites()).toEqual([])
    })

    it('should persist empty state to localStorage', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.clearFavorites()

      const stored = localStorage.getItem('garbaking_favorites')
      const parsed = JSON.parse(stored!)
      expect(parsed.ids).toEqual([])
      expect(parsed.items).toEqual([])
    })
  })

  describe('Update Favorite Items', () => {
    it('should update favorite items from menu items', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)

      const updatedItem = { ...mockItem1, price: 15.99 }
      store.updateFavoriteItems([updatedItem, mockItem2])

      const favorites = store.getFavorites()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].price).toBe(15.99)
    })

    it('should remove favorites that are no longer in menu', () => {
      const store = useFavoritesStore()
      store.addFavorite(mockItem1)
      store.addFavorite(mockItem2)

      store.updateFavoriteItems([mockItem2])

      expect(store.favoritesCount).toBe(1)
      expect(store.getFavorites()).toContainEqual(mockItem2)
    })
  })

  describe('Computed Properties', () => {
    it('should correctly compute favoritesCount', () => {
      const store = useFavoritesStore()
      expect(store.favoritesCount).toBe(0)

      store.addFavorite(mockItem1)
      expect(store.favoritesCount).toBe(1)

      store.addFavorite(mockItem2)
      expect(store.favoritesCount).toBe(2)
    })

    it('should correctly compute hasFavorites', () => {
      const store = useFavoritesStore()
      expect(store.hasFavorites).toBe(false)

      store.addFavorite(mockItem1)
      expect(store.hasFavorites).toBe(true)

      store.clearFavorites()
      expect(store.hasFavorites).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupt localStorage data gracefully', () => {
      localStorage.setItem('garbaking_favorites', 'invalid json')

      const store = useFavoritesStore()
      expect(store.favoritesCount).toBe(0)
      expect(store.hasFavorites).toBe(false)
    })

    it('should handle localStorage errors when saving', () => {
      const store = useFavoritesStore()

      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      // Should not throw
      expect(() => store.addFavorite(mockItem1)).not.toThrow()

      // Restore original
      localStorage.setItem = originalSetItem
    })
  })

  describe('Items with SKU only', () => {
    it('should handle items with only SKU (no id)', () => {
      const itemWithSku: MenuItem = {
        sku: 'ITEM003',
        name: 'SKU Item',
        description: 'Item with SKU only',
        price: 7.99,
        category: { id: 'test', name: 'Test' },
        isAvailable: true
      }

      const store = useFavoritesStore()
      store.addFavorite(itemWithSku)

      expect(store.isFavorite('ITEM003')).toBe(true)
      expect(store.favoritesCount).toBe(1)
    })
  })
})
