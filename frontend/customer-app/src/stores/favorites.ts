/**
 * Favorites Store
 * Manages user's favorite menu items with local storage persistence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/services/mockApi'

const STORAGE_KEY = 'garbaking_favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favoriteIds = ref<Set<string>>(new Set())
  const favoriteItems = ref<MenuItem[]>([])

  // Computed
  const favoritesCount = computed(() => favoriteIds.value.size)
  const hasFavorites = computed(() => favoriteIds.value.size > 0)

  // Load favorites from localStorage on initialization
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        favoriteIds.value = new Set(parsed.ids || [])
        favoriteItems.value = parsed.items || []
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error)
    }
  }

  // Save favorites to localStorage
  const saveToStorage = () => {
    try {
      const data = {
        ids: Array.from(favoriteIds.value),
        items: favoriteItems.value,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving favorites to storage:', error)
    }
  }

  // Check if item is favorite
  const isFavorite = (itemId: string): boolean => {
    return favoriteIds.value.has(itemId)
  }

  // Add item to favorites
  const addFavorite = (item: MenuItem) => {
    const itemId = item.id || item.sku
    if (!favoriteIds.value.has(itemId)) {
      favoriteIds.value.add(itemId)

      // Add to items array if not already present
      const exists = favoriteItems.value.some(i => (i.id || i.sku) === itemId)
      if (!exists) {
        favoriteItems.value.unshift(item)
      }

      saveToStorage()
    }
  }

  // Remove item from favorites
  const removeFavorite = (itemId: string) => {
    if (favoriteIds.value.has(itemId)) {
      favoriteIds.value.delete(itemId)
      favoriteItems.value = favoriteItems.value.filter(
        item => (item.id || item.sku) !== itemId
      )
      saveToStorage()
    }
  }

  // Toggle favorite status
  const toggleFavorite = (item: MenuItem): boolean => {
    const itemId = item.id || item.sku
    if (isFavorite(itemId)) {
      removeFavorite(itemId)
      return false
    } else {
      addFavorite(item)
      return true
    }
  }

  // Clear all favorites
  const clearFavorites = () => {
    favoriteIds.value.clear()
    favoriteItems.value = []
    saveToStorage()
  }

  // Get all favorite items
  const getFavorites = (): MenuItem[] => {
    return favoriteItems.value
  }

  // Update favorite items (useful when menu data changes)
  const updateFavoriteItems = (menuItems: MenuItem[]) => {
    const updatedItems = menuItems.filter(item =>
      isFavorite(item.id || item.sku)
    )

    // Update the items array
    favoriteItems.value = updatedItems

    // Update the IDs set to match the filtered items
    const newIds = new Set(updatedItems.map(item => item.id || item.sku))
    favoriteIds.value = newIds

    saveToStorage()
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    favoriteIds,
    favoriteItems,

    // Computed
    favoritesCount,
    hasFavorites,

    // Actions
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    getFavorites,
    updateFavoriteItems
  }
})
