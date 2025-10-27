/**
 * Menu management store for categories and menu items
 * Handles CRUD operations, real-time updates, and menu state management
 * Updated to use Spring Boot microservices backend
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriesApi, menuItemsApi } from '@/services/api-spring'

// Types
export interface MenuCategory {
  id: string
  name: string
  description: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  menuItems?: MenuItem[]
  _count?: {
    menuItems: number
  }
}

export interface MenuItem {
  id: string
  sku: string
  name: string
  description: string
  price: number
  cost?: number
  imageUrl?: string
  categoryId: string
  isAvailable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: MenuCategory
}

export interface MenuItemForm {
  name: string
  sku: string
  description: string
  price: number
  cost?: number
  categoryId: string
  imageUrl?: string
  isAvailable: boolean
}

export interface CategoryForm {
  name: string
  description: string
  sortOrder: number
  imageUrl?: string
}

export const useMenuStore = defineStore('menu', () => {
  // State
  const categories = ref<MenuCategory[]>([])
  const menuItems = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedCategory = ref<string | null>(null)

  // Computed
  const categoriesWithCounts = computed(() => {
    return categories.value.map(category => ({
      ...category,
      itemCount: menuItems.value.filter(item =>
        item.categoryId === category.id && item.isActive
      ).length
    }))
  })

  const filteredMenuItems = computed(() => {
    if (!selectedCategory.value) return menuItems.value
    return menuItems.value.filter(item =>
      item.categoryId === selectedCategory.value && item.isActive
    )
  })

  const availableItems = computed(() => {
    return menuItems.value.filter(item => item.isAvailable && item.isActive)
  })

  const categoriesForSelect = computed(() => {
    return categories.value
      .filter(cat => cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(cat => ({
        value: cat.id,
        label: cat.name
      }))
  })

  // Actions
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await categoriesApi.getAll()
      categories.value = Array.isArray(data) ? data : (data.categories || [])
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMenuItems = async (params?: any) => {
    try {
      loading.value = true
      error.value = null
      const data = await menuItemsApi.getAll(params)
      menuItems.value = Array.isArray(data) ? data : (data.menuItems || [])
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch menu items'
      console.error('Error fetching menu items:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPublicMenu = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await menuItemsApi.getPublic()

      // Extract categories and items from public menu response
      const publicCategories = Array.isArray(data) ? data : (data.categories || [])
      categories.value = publicCategories

      // Flatten menu items from all categories
      const allItems: MenuItem[] = []
      publicCategories.forEach((category: any) => {
        if (category.menuItems) {
          category.menuItems.forEach((item: any) => {
            allItems.push({
              ...item,
              categoryId: category.id,
              category: category
            })
          })
        }
      })
      menuItems.value = allItems
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch public menu'
      console.error('Error fetching public menu:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (categoryData: CategoryForm) => {
    try {
      loading.value = true
      error.value = null
      const data = await categoriesApi.create(categoryData)
      const newCategory = data
      categories.value.push(newCategory)
      return newCategory
    } catch (err: any) {
      error.value = err.message || 'Failed to create category'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<CategoryForm>) => {
    try {
      loading.value = true
      error.value = null
      const data = await categoriesApi.update(id, categoryData)
      const updatedCategory = data

      const index = categories.value.findIndex(cat => cat.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      return updatedCategory
    } catch (err: any) {
      error.value = err.message || 'Failed to update category'
      console.error('Error updating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      await categoriesApi.delete(id)
      categories.value = categories.value.filter(cat => cat.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMenuItem = async (itemData: MenuItemForm) => {
    try {
      loading.value = true
      error.value = null
      const data = await menuItemsApi.create(itemData)
      const newItem = data
      menuItems.value.push(newItem)
      return newItem
    } catch (err: any) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        error.value = 'Session expired. Please log in with admin credentials to manage menu items.'
      } else if (err.status === 403 || err.code === 'FORBIDDEN') {
        error.value = 'Admin or Manager role required to create menu items.'
      } else {
        error.value = err.message || 'Failed to create menu item'
      }
      console.error('Error creating menu item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMenuItem = async (id: string, itemData: Partial<MenuItemForm>) => {
    try {
      loading.value = true
      error.value = null
      const data = await menuItemsApi.update(id, itemData)
      const updatedItem = data

      const index = menuItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        menuItems.value[index] = updatedItem
      }
      return updatedItem
    } catch (err: any) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        error.value = 'Session expired. Please log in with admin credentials to manage menu items.'
      } else if (err.status === 403 || err.code === 'FORBIDDEN') {
        error.value = 'Admin or Manager role required to modify menu items.'
      } else {
        error.value = err.message || 'Failed to update menu item'
      }
      console.error('Error updating menu item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      await menuItemsApi.delete(id)
      menuItems.value = menuItems.value.filter(item => item.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete menu item'
      console.error('Error deleting menu item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleItemAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const data = await menuItemsApi.updateAvailability(id, isAvailable)
      const updatedItem = data

      const index = menuItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        menuItems.value[index] = updatedItem
      }
      return updatedItem
    } catch (err: any) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        error.value = 'Session expired. Please log in with admin credentials to manage menu items.'
      } else if (err.status === 403 || err.code === 'FORBIDDEN') {
        error.value = 'Admin or Manager role required to modify menu items.'
      } else {
        error.value = err.message || 'Failed to update item availability'
      }
      console.error('Error updating availability:', err)
      throw err
    }
  }

  const setSelectedCategory = (categoryId: string | null) => {
    selectedCategory.value = categoryId
  }

  const getItemById = (id: string) => {
    return menuItems.value.find(item => item.id === id)
  }

  const getCategoryById = (id: string) => {
    return categories.value.find(cat => cat.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  const refreshMenu = async () => {
    await Promise.all([
      fetchCategories(),
      fetchMenuItems()
    ])
  }

  return {
    // State
    categories,
    menuItems,
    loading,
    error,
    selectedCategory,

    // Computed
    categoriesWithCounts,
    filteredMenuItems,
    availableItems,
    categoriesForSelect,

    // Actions
    fetchCategories,
    fetchMenuItems,
    fetchPublicMenu,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    setSelectedCategory,
    getItemById,
    getCategoryById,
    clearError,
    refreshMenu
  }
})