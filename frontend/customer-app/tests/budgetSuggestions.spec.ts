import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetSuggestionsStore } from '@/stores/budgetSuggestions'
import { useMenuStore } from '@/stores/menu'
import { recommendationsApi } from '@/services/api'

const createStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
}

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  })
}))

describe('budget suggestions store', () => {
  beforeEach(() => {
    ;(globalThis as any).localStorage = createStorageMock()
    ;(globalThis as any).navigator = { language: 'fr-FR' }
    setActivePinia(createPinia())
  })

  it('falls back to local suggestions when remote call fails', async () => {
    const menuStore = useMenuStore()
    const menuItems = [
      {
        id: 'item-1',
        sku: 'SKU-1',
        name: 'Attiéké',
        price: 1500,
        categoryId: 'cat-1',
        isAvailable: true,
        isActive: true
      },
      {
        id: 'item-2',
        sku: 'SKU-2',
        name: 'Poisson braisé',
        price: 2500,
        categoryId: 'cat-1',
        isAvailable: true,
        isActive: true
      },
      {
        id: 'item-3',
        sku: 'SKU-3',
        name: 'Bissap',
        price: 1000,
        categoryId: 'cat-2',
        isAvailable: true,
        isActive: true
      }
    ] as any

    menuStore.$patch({
      menuItems,
      categories: []
    } as any)

    menuStore.fetchMenu = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(recommendationsApi, 'getBudgetSuggestions').mockResolvedValue({
      success: false,
      error: 'network'
    })

    const store = useBudgetSuggestionsStore()
    store.setBudget(5000)
    await store.fetchSuggestions()

    expect(store.state.offlineMode).toBe(true)
    expect(store.state.suggestions.length).toBeGreaterThan(0)
    expect(store.state.suggestions[0].items.length).toBeGreaterThan(0)
  })
})
