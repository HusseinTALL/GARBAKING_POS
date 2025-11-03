/**
 * Budget suggestions store
 * Fetches AI/heuristic menu bundles based on a user's budget
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { recommendationsApi, type BudgetSuggestionBundle, type BudgetSuggestionRequest } from '@/services/api'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { formatCurrency } from '@/utils/currency'
import { useCartStore } from '@/stores/cart'

export interface SuggestionFilters {
  dietary: 'ALL' | 'VEGETARIAN' | 'VEGAN'
  timeOfDay: 'AUTO' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  tags: string[]
}

export interface SuggestionState {
  budget: number
  suggestions: BudgetSuggestionBundle[]
  isLoading: boolean
  error: string | null
  lastUsedFilters: SuggestionFilters
  lastUpdatedAt: string | null
  offlineMode: boolean
  partySize: number
}

const CACHE_KEY = 'garbaking-budget-suggestions'
const ANALYTICS_KEY = 'garbaking-budget-suggestions-analytics'

export const useBudgetSuggestionsStore = defineStore('budgetSuggestions', () => {
  const toast = useToast()
  const menuStore = useMenuStore()
  const cartStore = useCartStore()

const state = ref<SuggestionState>({
  budget: 5000,
  suggestions: [],
  isLoading: false,
  error: null,
  lastUsedFilters: {
    dietary: 'ALL',
    timeOfDay: 'AUTO',
    tags: []
  },
  lastUpdatedAt: null,
  offlineMode: false,
  partySize: 1
})

  const hasSuggestions = computed(() => state.value.suggestions.length > 0)

  const formattedBudget = computed(() => formatCurrency(state.value.budget))

  const saveCache = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.warn('Unable to cache budget suggestions', error)
    }
  }

  const loadCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as SuggestionState
        state.value = {
          ...parsed,
          isLoading: false,
          error: null
        }
        if (!parsed.partySize || parsed.partySize < 1) {
          state.value.partySize = 1
        }
      }
    } catch (error) {
      console.warn('Unable to load cached budget suggestions', error)
    }
  }

  const appendEvent = (event: {
    type: string
    budget: number
    source: 'REMOTE' | 'LOCAL'
    timestamp: string
    extra?: Record<string, any>
  }) => {
    try {
      const existing = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]')
      existing.push(event)
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(existing.slice(-50)))
    } catch (error) {
      console.warn('Unable to persist budget suggestion analytics', error)
    }
  }

  const trackEvent = (type: string, source: 'REMOTE' | 'LOCAL', extra?: Record<string, any>) => {
    appendEvent({
      type,
      budget: state.value.budget,
      source,
      timestamp: new Date().toISOString(),
      extra
    })
  }

const setBudget = (amount: number) => {
  state.value.budget = Math.max(500, Math.round(amount))
  saveCache()
}

const setFilters = (filters: Partial<SuggestionFilters>) => {
  state.value.lastUsedFilters = {
    ...state.value.lastUsedFilters,
    ...filters
  }
  saveCache()
}

const setPartySize = (value: number) => {
  const normalized = Math.max(1, Math.min(12, Math.round(value)))
  state.value.partySize = normalized
  saveCache()
}

  const addBundleToCart = (bundle: BudgetSuggestionBundle) => {
    bundle.items.forEach(item => {
      cartStore.addItem({
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.categoryName
      })
    })
    toast.success('Offre ajoutée à votre panier 🎉')
    trackEvent('bundle_selected', bundle.source ?? 'LOCAL', {
      total: bundle.total,
      items: bundle.items.length
    })
  }

  const fetchSuggestions = async (options?: Partial<SuggestionFilters>) => {
    if (!menuStore.menuItems.length) {
      await menuStore.fetchMenu()
    }

    if (options) {
      setFilters(options)
    }

    const filters = state.value.lastUsedFilters

    state.value.isLoading = true
    state.value.error = null

    const request: BudgetSuggestionRequest = {
      budget: state.value.budget,
      preferences: {
        dietary: filters.dietary === 'ALL' ? [] : [filters.dietary],
        timeOfDay: filters.timeOfDay === 'AUTO' ? undefined : filters.timeOfDay,
      tags: filters.tags
    },
    context: {
      locale: navigator.language || 'fr-FR',
      partySize: state.value.partySize
    }
  }

    try {
      trackEvent('suggestions_requested', 'REMOTE', {
        dietary: filters.dietary,
        timeOfDay: filters.timeOfDay
      })
      const response = await recommendationsApi.getBudgetSuggestions(request)

      if (response.success && response.data) {
        const remoteSuggestions = Array.isArray(response.data.suggestions)
          ? response.data.suggestions
          : []

        state.value.suggestions = remoteSuggestions.map(suggestion => ({
          ...suggestion,
          source: suggestion.source ?? 'REMOTE'
        }))
        state.value.offlineMode = false
        state.value.lastUpdatedAt = response.data.generatedAt || new Date().toISOString()
        trackEvent('suggestions_received', 'REMOTE', { count: remoteSuggestions.length })
        saveCache()

        state.value.error = remoteSuggestions.length
          ? null
          : response.data.message || 'Aucune suggestion disponible pour ce budget'

        if (!remoteSuggestions.length && state.value.error) {
          toast.info(state.value.error)
        }

        return
      }

      // Remote call failed or returned invalid payload – fallback to local generation
      throw new Error(response.error || response.message || 'No remote suggestions')
    } catch (error: any) {
      console.warn('Remote suggestion fetch failed, using local fallback', error)
      state.value.offlineMode = true
      state.value.suggestions = generateLocalSuggestions(
        state.value.budget,
        filters,
        menuStore.menuItems,
        state.value.partySize
      )
      state.value.lastUpdatedAt = new Date().toISOString()
      trackEvent('suggestions_received', 'LOCAL', { count: state.value.suggestions.length })
      saveCache()
      if (state.value.suggestions.length === 0) {
        state.value.error = 'Aucune suggestion disponible pour ce budget'
      } else {
        toast.info("Suggestions générées en mode hors ligne")
      }
    } finally {
      state.value.isLoading = false
    }
  }

  const generateLocalSuggestions = (
    budget: number,
    filters: SuggestionFilters,
    items: MenuItem[],
    partySize: number
  ): BudgetSuggestionBundle[] => {
    if (!items.length) return []

    const filteredItems = items.filter(item => {
      if (!item.isAvailable || !item.isActive) return false
      const description = item.description?.toLowerCase() || ''
      if (filters.dietary === 'VEGETARIAN' && (description.includes('poisson') || description.includes('poulet') || description.includes('viande'))) {
        return false
      }
      if (filters.dietary === 'VEGAN' && (description.includes('poisson') || description.includes('poulet') || description.includes('viande') || description.includes('oeuf'))) {
        return false
      }
      return true
    })

    if (!filteredItems.length) {
      return []
    }

    const normalizedPartySize = Math.max(1, Math.min(12, Math.round(partySize)))

    const cheapestItems = [...filteredItems].sort((a, b) => a.price - b.price)
    const premiumItems = [...filteredItems].sort((a, b) => b.price - a.price)

    const buildBundle = (strategy: 'VALUE' | 'USUAL' | 'TREAT'): BudgetSuggestionBundle => {
      const aggregated = new Map<string, { item: BudgetSuggestionItem; quantity: number; unitPrice: number }>()

      const addMenuItem = (menuItem: MenuItem) => {
        const key = menuItem.id?.toString() ?? menuItem.name
        const existing = aggregated.get(key)
        if (existing) {
          existing.quantity += 1
          existing.item = { ...existing.item, quantity: existing.quantity }
        } else {
          aggregated.set(key, {
            item: {
              menuItemId: key,
              name: menuItem.name,
              price: menuItem.price,
              quantity: 1,
              imageUrl: menuItem.imageUrl || (menuItem as any).image,
              categoryName: menuItem.categoryName || (typeof menuItem.category === 'string' ? menuItem.category : menuItem.category?.name)
            },
            quantity: 1,
            unitPrice: menuItem.price
          })
        }
      }

      const sourceItems: MenuItem[] = (() => {
        switch (strategy) {
          case 'VALUE':
            return cheapestItems
          case 'TREAT':
            return premiumItems
          case 'USUAL':
          default:
            return prioritizeFavorites(filteredItems)
        }
      })()

      let total = 0
      for (const item of sourceItems) {
        if (aggregated.size === 0 || total + item.price <= budget) {
          addMenuItem(item)
          total += item.price
        }
        if (total >= budget * 0.85) {
          break
        }
      }

      let servings = Array.from(aggregated.values()).reduce((acc, entry) => acc + entry.quantity, 0)
      let index = 0
      const cycle = sourceItems.length ? sourceItems : filteredItems

      while (servings < normalizedPartySize && cycle.length > 0) {
        const candidate = cycle[index % cycle.length]
        if (total + candidate.price > budget) {
          break
        }
        addMenuItem(candidate)
        total += candidate.price
        servings += 1
        index += 1
        if (index > normalizedPartySize * cycle.length * 2) {
          break
        }
      }

      const bundleItems = Array.from(aggregated.values()).map(entry => ({
        ...entry.item,
        quantity: entry.quantity
      }))

      const savings = Math.max(0, budget - total)

      return {
        id: `${strategy}-${budget}`,
        title: strategy === 'VALUE' ? 'Meilleur prix' : strategy === 'USUAL' ? 'Comme d\'habitude' : 'Petite folie',
        description: strategy === 'VALUE'
          ? 'Une sélection optimisée pour rester sous le budget'
          : strategy === 'USUAL'
            ? 'Inspiré de vos choix récents'
            : 'Offrez-vous un extra gourmand',
        total,
        savings,
        highlight: strategy === 'VALUE'
          ? `Économisez ~${Math.round(savings)} FCFA`
          : strategy === 'USUAL'
            ? `Adapté pour ${normalizedPartySize} convives`
            : 'Ajoutez une boisson pour compléter',
        tags: strategy === 'TREAT' ? ['UPSELL'] : strategy === 'VALUE' ? ['BUDGET'] : ['USUAL'],
        items: bundleItems,
        source: 'LOCAL'
      }
    }

    return ['VALUE', 'USUAL', 'TREAT']
      .map(strategy => buildBundle(strategy as 'VALUE' | 'USUAL' | 'TREAT'))
      .filter(bundle => bundle.items.length > 0)
  }

  const prioritizeFavorites = (items: MenuItem[]): MenuItem[] => {
    const favorites = menuStore.favoriteItems
    if (favorites.length) {
      const favoriteIds = new Set(favorites.map(item => item.id))
      const favItems = items.filter(item => favoriteIds.has(item.id))
      if (favItems.length) {
        return favItems.concat(items.filter(item => !favoriteIds.has(item.id)))
      }
    }
    return items
  }

  return {
    state,
    hasSuggestions,
    formattedBudget,
    loadCache,
    setBudget,
    setFilters,
    setPartySize,
    fetchSuggestions,
    addBundleToCart
  }
})
