/**
 * Search Store - State management for search and filters
 * Manages search queries, filters, history, popular searches, and sorting
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem, LoadingState, SortOrder } from '@/types'

export interface SearchFilters {
  categories: string[]
  priceRange: {
    min: number
    max: number
  }
  dietaryRestrictions: string[]
  rating?: number
  availability?: boolean
}

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
  resultsCount: number
}

export interface PopularSearch {
  query: string
  count: number
  trending: boolean
}

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const results = ref<MenuItem[]>([])
  const allItems = ref<MenuItem[]>([]) // Cache of all menu items
  const filters = ref<SearchFilters>({
    categories: [],
    priceRange: {
      min: 0,
      max: 1000
    },
    dietaryRestrictions: [],
    rating: undefined,
    availability: true
  })
  const sortBy = ref<SortOrder>('name')
  const searchHistory = ref<SearchHistoryItem[]>([])
  const popularSearches = ref<PopularSearch[]>([
    { query: 'pizza', count: 245, trending: true },
    { query: 'burger', count: 198, trending: true },
    { query: 'pasta', count: 156, trending: false },
    { query: 'salad', count: 134, trending: false },
    { query: 'dessert', count: 112, trending: true }
  ])
  const loadingState = ref<LoadingState>('idle')
  const error = ref<string | null>(null)

  // Getters / Computed
  const isLoading = computed(() => loadingState.value === 'loading')

  const hasResults = computed(() => results.value.length > 0)

  const hasFilters = computed(() => {
    return (
      filters.value.categories.length > 0 ||
      filters.value.dietaryRestrictions.length > 0 ||
      filters.value.rating !== undefined ||
      filters.value.priceRange.min > 0 ||
      filters.value.priceRange.max < 1000
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.categories.length > 0) count += filters.value.categories.length
    if (filters.value.dietaryRestrictions.length > 0) count += filters.value.dietaryRestrictions.length
    if (filters.value.rating) count++
    if (filters.value.priceRange.min > 0 || filters.value.priceRange.max < 1000) count++
    return count
  })

  const filteredResults = computed(() => {
    let items = [...results.value]

    // Filter by categories
    if (filters.value.categories.length > 0) {
      items = items.filter(item =>
        filters.value.categories.includes(item.categoryId)
      )
    }

    // Filter by price range
    items = items.filter(item =>
      item.price >= filters.value.priceRange.min &&
      item.price <= filters.value.priceRange.max
    )

    // Filter by dietary restrictions (assuming items have tags)
    if (filters.value.dietaryRestrictions.length > 0) {
      items = items.filter(item => {
        // This assumes menu items have a 'tags' or 'dietary' property
        // Adjust based on your actual data structure
        const itemTags = (item as any).tags || []
        return filters.value.dietaryRestrictions.some(restriction =>
          itemTags.includes(restriction)
        )
      })
    }

    // Filter by availability
    if (filters.value.availability) {
      items = items.filter(item => item.isAvailable)
    }

    return items
  })

  const sortedResults = computed(() => {
    const items = [...filteredResults.value]

    switch (sortBy.value) {
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name))
      case 'price':
        return items.sort((a, b) => a.price - b.price)
      case 'popularity':
        // Assume items have a popularity score
        return items.sort((a, b) =>
          ((b as any).popularity || 0) - ((a as any).popularity || 0)
        )
      case 'newest':
        return items.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      default:
        return items
    }
  })

  const recentSearches = computed(() =>
    searchHistory.value
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  )

  const trendingSearches = computed(() =>
    popularSearches.value.filter(s => s.trending).slice(0, 5)
  )

  // Actions
  function setQuery(newQuery: string) {
    query.value = newQuery
  }

  function search(searchQuery?: string) {
    const q = searchQuery || query.value
    if (!q || q.trim() === '') {
      results.value = []
      return
    }

    loadingState.value = 'loading'
    error.value = null

    try {
      // Search through all items
      const searchTerm = q.toLowerCase().trim()
      const matchedItems = allItems.value.filter(item => {
        // Search in name
        if (item.name.toLowerCase().includes(searchTerm)) return true

        // Search in description
        if (item.description?.toLowerCase().includes(searchTerm)) return true

        // Search in category name
        if (item.category?.name.toLowerCase().includes(searchTerm)) return true

        return false
      })

      results.value = matchedItems
      loadingState.value = 'success'

      // Add to search history
      addToHistory(q, matchedItems.length)

      // Update popular searches (increment count if exists)
      updatePopularSearch(q)
    } catch (err: any) {
      error.value = err.message || 'Search failed'
      loadingState.value = 'error'
      console.error('Search error:', err)
    }
  }

  function clearSearch() {
    query.value = ''
    results.value = []
    loadingState.value = 'idle'
    error.value = null
  }

  function setResults(items: MenuItem[]) {
    results.value = items
  }

  function setAllItems(items: MenuItem[]) {
    allItems.value = items
  }

  function updateFilters(newFilters: Partial<SearchFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function clearFilters() {
    filters.value = {
      categories: [],
      priceRange: {
        min: 0,
        max: 1000
      },
      dietaryRestrictions: [],
      rating: undefined,
      availability: true
    }
  }

  function setSortBy(sort: SortOrder) {
    sortBy.value = sort
  }

  function addToHistory(searchQuery: string, resultsCount: number) {
    const historyItem: SearchHistoryItem = {
      id: generateId(),
      query: searchQuery,
      timestamp: Date.now(),
      resultsCount
    }

    // Remove duplicate if exists
    searchHistory.value = searchHistory.value.filter(
      item => item.query.toLowerCase() !== searchQuery.toLowerCase()
    )

    // Add to beginning
    searchHistory.value.unshift(historyItem)

    // Keep only last 50 items
    if (searchHistory.value.length > 50) {
      searchHistory.value = searchHistory.value.slice(0, 50)
    }

    saveToLocalStorage()
  }

  function removeFromHistory(id: string) {
    searchHistory.value = searchHistory.value.filter(item => item.id !== id)
    saveToLocalStorage()
  }

  function clearHistory() {
    searchHistory.value = []
    saveToLocalStorage()
  }

  function updatePopularSearch(searchQuery: string) {
    const existing = popularSearches.value.find(
      s => s.query.toLowerCase() === searchQuery.toLowerCase()
    )

    if (existing) {
      existing.count++
    } else {
      popularSearches.value.push({
        query: searchQuery,
        count: 1,
        trending: false
      })
    }

    // Sort by count
    popularSearches.value.sort((a, b) => b.count - a.count)

    // Mark top 5 as trending
    popularSearches.value.forEach((search, index) => {
      search.trending = index < 5
    })

    saveToLocalStorage()
  }

  function searchByCategory(categoryId: string) {
    const categoryItems = allItems.value.filter(item => item.categoryId === categoryId)
    results.value = categoryItems
  }

  function searchByDietaryRestriction(restriction: string) {
    updateFilters({
      dietaryRestrictions: [restriction]
    })
  }

  // Quick search presets
  function searchBestSellers() {
    const bestSellers = allItems.value
      .filter(item => (item as any).isBestSeller || (item as any).popularity > 80)
    results.value = bestSellers
  }

  function searchNewItems() {
    setSortBy('newest')
    results.value = allItems.value
  }

  function searchByPriceRange(min: number, max: number) {
    updateFilters({
      priceRange: { min, max }
    })
  }

  // Local Storage
  function saveToLocalStorage() {
    try {
      const data = {
        searchHistory: searchHistory.value,
        popularSearches: popularSearches.value,
        timestamp: Date.now()
      }
      localStorage.setItem('garbaking_search', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving search data to localStorage:', error)
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('garbaking_search')
      if (stored) {
        const data = JSON.parse(stored)

        if (data.searchHistory) searchHistory.value = data.searchHistory
        if (data.popularSearches) popularSearches.value = data.popularSearches
      }
    } catch (error) {
      console.error('Error loading search data from localStorage:', error)
    }
  }

  function clearAll() {
    query.value = ''
    results.value = []
    clearFilters()
    sortBy.value = 'name'
    searchHistory.value = []
    loadingState.value = 'idle'
    error.value = null
    saveToLocalStorage()
  }

  // Utilities
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    // State
    query,
    results,
    allItems,
    filters,
    sortBy,
    searchHistory,
    popularSearches,
    loadingState,
    error,

    // Getters
    isLoading,
    hasResults,
    hasFilters,
    activeFiltersCount,
    filteredResults,
    sortedResults,
    recentSearches,
    trendingSearches,

    // Actions
    setQuery,
    search,
    clearSearch,
    setResults,
    setAllItems,
    updateFilters,
    clearFilters,
    setSortBy,
    addToHistory,
    removeFromHistory,
    clearHistory,
    updatePopularSearch,
    searchByCategory,
    searchByDietaryRestriction,
    searchBestSellers,
    searchNewItems,
    searchByPriceRange,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearAll
  }
})
