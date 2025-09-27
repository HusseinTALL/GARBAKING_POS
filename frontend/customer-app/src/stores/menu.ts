/**
 * Menu store for managing restaurant menu data
 * Handles categories, menu items, and filtering
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { menuApi } from '@/services/api'

export interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  menuItems?: MenuItem[]
}

export interface MenuItem {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  categoryId: string
  category?: Category
  isAvailable: boolean
  isActive: boolean
}

export const useMenuStore = defineStore('menu', () => {
  const toast = useToast()

  // State
  const categories = ref<Category[]>([])
  const menuItems = ref<MenuItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategoryId = ref<string | null>(null)
  const favorites = ref<string[]>([])

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem('garbaking-favorites')
      if (savedFavorites) {
        favorites.value = JSON.parse(savedFavorites)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  // Save favorites to localStorage
  const saveFavorites = () => {
    try {
      localStorage.setItem('garbaking-favorites', JSON.stringify(favorites.value))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  // Getters
  const availableCategories = computed(() => {
    return categories.value
      .filter(category => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  })

  const availableMenuItems = computed(() => {
    return menuItems.value.filter(item => item.isActive && item.isAvailable)
  })

  const filteredMenuItems = computed(() => {
    let filtered = availableMenuItems.value

    // Filter by category
    if (selectedCategoryId.value) {
      filtered = filtered.filter(item => item.categoryId === selectedCategoryId.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const favoriteItems = computed(() => {
    return availableMenuItems.value.filter(item => favorites.value.includes(item.id))
  })

  const getCategoryById = computed(() => (id: string) => {
    return categories.value.find(category => category.id === id)
  })

  const getMenuItemById = computed(() => (id: string) => {
    return menuItems.value.find(item => item.id === id)
  })

  const getItemsByCategory = computed(() => (categoryId: string) => {
    return availableMenuItems.value.filter(item => item.categoryId === categoryId)
  })

  const isFavorite = computed(() => (itemId: string) => {
    return favorites.value.includes(itemId)
  })

  // Actions
  const fetchMenu = async (useCache = true) => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      // Try to load from cache first if online
      if (useCache) {
        const cachedMenu = getCachedMenu()
        if (cachedMenu) {
          categories.value = cachedMenu.categories
          menuItems.value = cachedMenu.menuItems
          isLoading.value = false
          return
        }
      }

      // Fetch from API
      const response = await menuApi.getPublicMenu()

      if (response.success && response.data) {
        categories.value = response.data.categories

        // Flatten menu items from all categories
        menuItems.value = response.data.categories.reduce((items: MenuItem[], category: Category) => {
          if (category.menuItems) {
            category.menuItems.forEach(item => {
              item.category = category
            })
            items.push(...category.menuItems)
          }
          return items
        }, [])

        // Cache the menu data
        cacheMenu({ categories: categories.value, menuItems: menuItems.value })
      } else {
        throw new Error(response.error || 'Failed to load menu')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du menu'

      // Try to load from cache as fallback
      const cachedMenu = getCachedMenu()
      if (cachedMenu) {
        categories.value = cachedMenu.categories
        menuItems.value = cachedMenu.menuItems
        toast.warning('Menu chargé depuis le cache (mode hors ligne)')
      } else {
        toast.error('Impossible de charger le menu')
      }
    } finally {
      isLoading.value = false
    }
  }

  const searchMenu = (query: string) => {
    searchQuery.value = query
  }

  const selectCategory = (categoryId: string | null) => {
    selectedCategoryId.value = categoryId
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategoryId.value = null
  }

  const toggleFavorite = (itemId: string) => {
    const index = favorites.value.indexOf(itemId)
    const item = getMenuItemById.value(itemId)

    if (index > -1) {
      favorites.value.splice(index, 1)
      if (item) {
        toast.info(`${item.name} retiré des favoris`)
      }
    } else {
      favorites.value.push(itemId)
      if (item) {
        toast.success(`${item.name} ajouté aux favoris`)
      }
    }

    saveFavorites()
  }

  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
    toast.info('Favoris effacés')
  }

  // Cache management
  const cacheMenu = (menuData: { categories: Category[]; menuItems: MenuItem[] }) => {
    try {
      const cacheData = {
        ...menuData,
        timestamp: Date.now(),
        version: '1.0'
      }
      localStorage.setItem('garbaking-menu-cache', JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching menu:', error)
    }
  }

  const getCachedMenu = (): { categories: Category[]; menuItems: MenuItem[] } | null => {
    try {
      const cached = localStorage.getItem('garbaking-menu-cache')
      if (!cached) return null

      const cacheData = JSON.parse(cached)

      // Check if cache is valid (less than 1 hour old)
      const cacheAge = Date.now() - cacheData.timestamp
      const maxAge = 60 * 60 * 1000 // 1 hour

      if (cacheAge > maxAge) {
        localStorage.removeItem('garbaking-menu-cache')
        return null
      }

      return {
        categories: cacheData.categories,
        menuItems: cacheData.menuItems
      }
    } catch (error) {
      console.error('Error reading menu cache:', error)
      return null
    }
  }

  const clearCache = () => {
    localStorage.removeItem('garbaking-menu-cache')
  }

  // Refresh menu data
  const refreshMenu = async () => {
    clearCache()
    await fetchMenu(false)
  }

  // Initialize
  loadFavorites()

  return {
    // State
    categories,
    menuItems,
    isLoading,
    error,
    searchQuery,
    selectedCategoryId,
    favorites,

    // Getters
    availableCategories,
    availableMenuItems,
    filteredMenuItems,
    favoriteItems,
    getCategoryById,
    getMenuItemById,
    getItemsByCategory,
    isFavorite,

    // Actions
    fetchMenu,
    searchMenu,
    selectCategory,
    clearFilters,
    toggleFavorite,
    clearFavorites,
    refreshMenu,
    clearCache
  }
})