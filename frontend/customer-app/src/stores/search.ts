/**
 * Search Store
 * Manages search functionality with debouncing and search history
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRestaurantStore } from './restaurant'

// Types
export interface SearchResult {
  id: string
  type: 'restaurant' | 'dish' | 'category'
  name: string
  description?: string
  image?: string
  restaurantName?: string // for dishes
}

export const useSearchStore = defineStore('search', () => {
  const restaurantStore = useRestaurantStore()

  // State
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem('recent_searches') || '[]'))
  const isSearching = ref(false)
  const showResults = ref(false)

  // Debounce timer
  let debounceTimer: NodeJS.Timeout | null = null

  // Computed
  const hasQuery = computed(() => query.value.trim().length > 0)
  const hasResults = computed(() => results.value.length > 0)

  // Actions
  const setQuery = (q: string) => {
    query.value = q

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!q.trim()) {
      results.value = []
      showResults.value = false
      return
    }

    isSearching.value = true

    // Debounce search for 300ms
    debounceTimer = setTimeout(() => {
      performSearch(q)
    }, 300)
  }

  const performSearch = (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase().trim()

    if (!lowerQuery) {
      results.value = []
      isSearching.value = false
      showResults.value = false
      return
    }

    // Search in restaurants
    const restaurantResults: SearchResult[] = restaurantStore.restaurants
      .filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.cuisineTypes.some(c => c.toLowerCase().includes(lowerQuery))
      )
      .map(r => ({
        id: r.id,
        type: 'restaurant' as const,
        name: r.name,
        description: r.description,
        image: r.image
      }))

    // Search in categories (cuisine types)
    const categoryResults: SearchResult[] = []
    const uniqueCuisines = new Set<string>()

    restaurantStore.restaurants.forEach(r => {
      r.cuisineTypes.forEach(cuisine => {
        if (
          cuisine.toLowerCase().includes(lowerQuery) &&
          !uniqueCuisines.has(cuisine.toLowerCase())
        ) {
          uniqueCuisines.add(cuisine.toLowerCase())
          categoryResults.push({
            id: cuisine.toLowerCase(),
            type: 'category',
            name: cuisine,
            description: `${restaurantStore.restaurants.filter(rest =>
              rest.cuisineTypes.some(c => c.toLowerCase() === cuisine.toLowerCase())
            ).length} restaurants`
          })
        }
      })
    })

    // Combine results (restaurants first, then categories)
    results.value = [...restaurantResults, ...categoryResults].slice(0, 10)

    isSearching.value = false
    showResults.value = true
  }

  const addToRecentSearches = (searchTerm: string) => {
    const term = searchTerm.trim()
    if (!term) return

    // Remove if already exists
    const filtered = recentSearches.value.filter(s => s !== term)

    // Add to beginning
    recentSearches.value = [term, ...filtered].slice(0, 10) // Keep max 10

    // Save to localStorage
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches.value))
  }

  const removeFromRecentSearches = (searchTerm: string) => {
    recentSearches.value = recentSearches.value.filter(s => s !== searchTerm)
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches.value))
  }

  const clearRecentSearches = () => {
    recentSearches.value = []
    localStorage.removeItem('recent_searches')
  }

  const clearSearch = () => {
    query.value = ''
    results.value = []
    showResults.value = false
    isSearching.value = false

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  const hideResults = () => {
    showResults.value = false
  }

  const selectResult = (result: SearchResult) => {
    // Add to recent searches
    addToRecentSearches(result.name)

    // Hide results
    showResults.value = false

    // Return the selected result for navigation
    return result
  }

  return {
    // State
    query,
    results,
    recentSearches,
    isSearching,
    showResults,

    // Computed
    hasQuery,
    hasResults,

    // Actions
    setQuery,
    performSearch,
    addToRecentSearches,
    removeFromRecentSearches,
    clearRecentSearches,
    clearSearch,
    hideResults,
    selectResult
  }
})
