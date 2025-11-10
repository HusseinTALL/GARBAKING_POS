/**
 * Pinia store for menu data management
 * Fetches and caches menu categories and items from the backend API
 * Falls back to mock data when backend is unavailable
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem, MenuCategory } from '@/types'
import apiService from '@/services/api'
import { mockCategories, mockMenuItems } from '@/services/mockMenuData'

export const useMenuStore = defineStore('menu', () => {
  const categories = ref<MenuCategory[]>([])
  const items = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedCategoryId = ref<string | number | null>(null)
  const selectedCategoryName = ref<string | null>(null)

  const filteredItems = computed(() => {
    if (!Array.isArray(items.value)) return []
    if (!selectedCategoryId.value && !selectedCategoryName.value) return items.value

    return items.value.filter((item) => {
      // Try matching by categoryId first, then by categoryName
      if (selectedCategoryId.value && item.categoryId) {
        return String(item.categoryId) === String(selectedCategoryId.value)
      }
      if (selectedCategoryName.value && item.categoryName) {
        return item.categoryName === selectedCategoryName.value
      }
      return false
    })
  })

  const availableItems = computed(() => {
    const filtered = filteredItems.value
    if (!Array.isArray(filtered)) return []
    // Backend may not set available flag, so default to true if undefined
    return filtered.filter((item) => item.available !== false)
  })

  // Fetch both categories and items in a single call using the public menu endpoint
  async function fetchMenu() {
    loading.value = true
    error.value = null
    try {
      const { categories: fetchedCategories, items: fetchedItems } = await apiService.getPublicMenu()
      categories.value = fetchedCategories
      items.value = fetchedItems
    } catch (e) {
      error.value = 'Failed to load menu'
      console.error('Error fetching menu:', e)

      // Fallback: Try separate endpoints
      try {
        items.value = await apiService.getMenuItems()

        // Derive categories from items if needed
        if (items.value.length > 0) {
          const uniqueCategories = new Map<string, MenuCategory>()
          let order = 0

          items.value.forEach((item) => {
            if (item.categoryName && !uniqueCategories.has(item.categoryName)) {
              uniqueCategories.set(item.categoryName, {
                id: item.categoryName,
                name: item.categoryName,
                displayOrder: order++
              })
            }
          })

          categories.value = Array.from(uniqueCategories.values())
          error.value = null
        } else {
          categories.value = []
          items.value = []
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        console.warn('Using mock data as final fallback')

        // Use mock data as final fallback
        categories.value = mockCategories
        items.value = mockMenuItems
        error.value = null // Clear error since we have mock data
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    // For backward compatibility, just call fetchMenu
    await fetchMenu()
  }

  async function fetchItems(categoryId?: string) {
    // If we already have items, just return (they were fetched with fetchMenu)
    if (items.value.length > 0 && !categoryId) {
      return
    }

    loading.value = true
    error.value = null
    try {
      items.value = await apiService.getMenuItems(categoryId)
    } catch (e) {
      error.value = 'Failed to load menu items'
      items.value = []
      console.error('Error fetching items:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuItem(id: string): Promise<MenuItem | null> {
    try {
      return await apiService.getMenuItem(id)
    } catch (e) {
      console.error('Error fetching menu item:', e)
      return null
    }
  }

  function selectCategory(categoryId: string | number | null, categoryName?: string | null) {
    selectedCategoryId.value = categoryId
    selectedCategoryName.value = categoryName || null
  }

  function getItemById(id: string | number): MenuItem | undefined {
    return items.value.find((item) => String(item.id) === String(id))
  }

  function getCategoryById(id: string | number): MenuCategory | undefined {
    return categories.value.find((cat) => String(cat.id) === String(id))
  }

  return {
    categories,
    items,
    loading,
    error,
    selectedCategoryId,
    selectedCategoryName,
    filteredItems,
    availableItems,
    fetchMenu,
    fetchCategories,
    fetchItems,
    fetchMenuItem,
    selectCategory,
    getItemById,
    getCategoryById
  }
})
