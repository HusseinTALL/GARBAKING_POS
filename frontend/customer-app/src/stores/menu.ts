/**
 * Menu store for managing restaurant menu data
 * Handles categories, menu items, and filtering
 * Integrated with Spring Boot Inventory Service via API Gateway
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { api, API_ENDPOINTS } from '@/services/apiConfig'

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
  image?: string  // Alias pour compatibilité avec MenuItemCard
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

      // Fetch from API Gateway → Inventory Service
      const response = await api.get<{ categories: any[]; items?: any[] }>(
        API_ENDPOINTS.menu.public
      )

      if (response && response.categories) {
        categories.value = response.categories.map((category: any) => ({
          ...category,
          menuItems: category.menuItems || category.items || [],
          items: undefined
        }))

        // Flatten menu items from all categories
        menuItems.value = categories.value.reduce((items: MenuItem[], category: Category) => {
          if (category.menuItems && category.menuItems.length) {
            const mappedItems = category.menuItems.map(item => ({
              ...item,
              category,
              image: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
            }))
            items.push(...mappedItems)
          }
          return items
        }, [])

        // If response has items at root level, use those too
        if (response.items && Array.isArray(response.items)) {
          const rootItems = response.items.map(item => ({
            ...item,
            image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
          }))
          menuItems.value.push(...rootItems)
        }

        // Cache the menu data
        cacheMenu({ categories: categories.value, menuItems: menuItems.value })
      } else {
        throw new Error('Invalid menu data received from server')
      }
    } catch (err: any) {
      console.error('[Menu] Failed to fetch menu from backend:', err)
      error.value = err.message || 'Erreur lors du chargement du menu'

      // Try to load from cache as fallback
      const cachedMenu = getCachedMenu()
      if (cachedMenu) {
        categories.value = cachedMenu.categories
        menuItems.value = cachedMenu.menuItems
        toast.warning('Menu chargé depuis le cache (mode hors ligne)')
      } else {
        toast.error('Impossible de charger le menu. Vérifiez votre connexion.')
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch categories only from backend
   */
  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<{ categories: Category[] }>(
        API_ENDPOINTS.menu.categories
      )

      if (response && Array.isArray(response.categories)) {
        categories.value = response.categories
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        categories.value = response as Category[]
      } else {
        throw new Error('Invalid categories data received')
      }
    } catch (err: any) {
      console.error('[Menu] Failed to fetch categories:', err)
      error.value = err.message || 'Failed to load categories'
      toast.error('Impossible de charger les catégories')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single menu item by ID from backend
   */
  const fetchMenuItem = async (itemId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<MenuItem>(
        API_ENDPOINTS.menu.itemById(itemId)
      )

      if (response) {
        // Update the item in the menuItems array if it exists
        const index = menuItems.value.findIndex(item => item.id === itemId)
        if (index !== -1) {
          menuItems.value[index] = {
            ...response,
            image: response.imageUrl || response.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
          }
        } else {
          // Add to menuItems if not found
          menuItems.value.push({
            ...response,
            image: response.imageUrl || response.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
          })
        }

        return response
      } else {
        throw new Error('Menu item not found')
      }
    } catch (err: any) {
      console.error('[Menu] Failed to fetch menu item:', err)
      error.value = err.message || 'Failed to load menu item'
      toast.error('Impossible de charger l\'article')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search menu items on backend
   */
  const searchMenuItems = async (query: string) => {
    if (!query.trim()) {
      // Just update local search query for local filtering
      searchQuery.value = query
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<{ items: MenuItem[] }>(
        API_ENDPOINTS.menu.search,
        { params: { q: query } }
      )

      if (response && Array.isArray(response.items)) {
        // Update menuItems with search results
        menuItems.value = response.items.map(item => ({
          ...item,
          image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
        }))
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        menuItems.value = (response as MenuItem[]).map(item => ({
          ...item,
          image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
        }))
      }

      // Update local search query
      searchQuery.value = query
    } catch (err: any) {
      console.error('[Menu] Search failed:', err)
      error.value = err.message || 'Search failed'
      // Fall back to local search by just updating the query
      searchQuery.value = query
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
        version: '2.0'
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

      // Validate cache version & structure
      const hasValidStructure =
        cacheData.version === '2.0' &&
        Array.isArray(cacheData.categories) &&
        Array.isArray(cacheData.menuItems) &&
        cacheData.categories.every((category: any) => Array.isArray(category.menuItems))

      if (!hasValidStructure) {
        localStorage.removeItem('garbaking-menu-cache')
        return null
      }

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
    fetchCategories,
    fetchMenuItem,
    searchMenu,
    searchMenuItems,
    selectCategory,
    clearFilters,
    toggleFavorite,
    clearFavorites,
    refreshMenu,
    clearCache
  }
})
