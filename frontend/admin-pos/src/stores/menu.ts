/**
 * Menu management store for categories and menu items
 * Handles CRUD operations, real-time updates, and menu state management
 * Updated to use Spring Boot microservices backend
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriesApi, menuItemsApi } from '@/services/api-spring'
import { toNumericId } from '@/utils/identifiers'

// Types
export interface MenuCategory {
  id: number
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
  id: number
  sku: string
  name: string
  description: string
  price: number
  cost?: number
  imageUrl?: string
  categoryId: number
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
  categoryId: number
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
  function normalizeMenuItem(item: any): MenuItem {
    const id = toNumericId(item?.id) ?? 0
    const categoryId = toNumericId(item?.categoryId ?? item?.category?.id) ?? 0

    return {
      id,
      sku: item?.sku ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: Number(item?.price ?? 0),
      cost: item?.cost != null ? Number(item.cost) : undefined,
      imageUrl: item?.imageUrl ?? undefined,
      categoryId,
      isAvailable: Boolean(item?.isAvailable ?? item?.available ?? true),
      isActive: Boolean(item?.isActive ?? item?.active ?? true),
      createdAt: item?.createdAt ?? '',
      updatedAt: item?.updatedAt ?? '',
      category: item?.category ? normalizeCategory(item.category, false) : undefined
    }
  }

  function normalizeCategory(category: any, includeItems = true): MenuCategory {
    const id = toNumericId(category?.id) ?? 0

    const normalized: MenuCategory = {
      id,
      name: category?.name ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? undefined,
      sortOrder: Number(category?.sortOrder ?? 0),
      isActive: Boolean(category?.isActive ?? true),
      createdAt: category?.createdAt ?? '',
      updatedAt: category?.updatedAt ?? '',
      _count: category?._count
    }

    if (includeItems && Array.isArray(category?.menuItems)) {
      normalized.menuItems = category.menuItems.map((item: any) => normalizeMenuItem(item))
    }

    return normalized
  }

  // State
  const categories = ref<MenuCategory[]>([])
  const menuItems = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedCategory = ref<number | null>(null)

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
      const rawCategories = Array.isArray(data) ? data : data?.categories || []
      categories.value = rawCategories.map((category: any) => normalizeCategory(category))
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
      const rawItems = Array.isArray(data) ? data : data?.menuItems || []
      menuItems.value = rawItems.map((item: any) => normalizeMenuItem(item))
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
      const response = await menuItemsApi.getPublic()

      // Extract categories from the API response structure
      // API returns: { success: true, data: { categories: [...] } }
      const data = response?.data || response
      const publicCategories = Array.isArray(data) ? data : data?.categories || []

      categories.value = publicCategories.map((category: any) => normalizeCategory(category, true))

      // Extract all menu items from all categories
      menuItems.value = categories.value.flatMap(category => category.menuItems || [])

      console.log('Loaded menu:', {
        categoriesCount: categories.value.length,
        itemsCount: menuItems.value.length
      })
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
      const newCategory = normalizeCategory(data)
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

  const updateCategory = async (id: number | string, categoryData: Partial<CategoryForm>) => {
    try {
      loading.value = true
      error.value = null
      const numericId = toNumericId(id)
      if (numericId === null) {
        throw new Error('Invalid category id')
      }
      const data = await categoriesApi.update(numericId, categoryData)
      const updatedCategory = normalizeCategory(data)

      const index = categories.value.findIndex(cat => cat.id === numericId)
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

  const deleteCategory = async (id: number | string) => {
    try {
      loading.value = true
      error.value = null
      const numericId = toNumericId(id)
      if (numericId === null) {
        throw new Error('Invalid category id')
      }
      await categoriesApi.delete(numericId)
      categories.value = categories.value.filter(cat => cat.id !== numericId)
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
      const newItem = normalizeMenuItem(data)
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

  const updateMenuItem = async (id: number | string, itemData: Partial<MenuItemForm>) => {
    try {
      loading.value = true
      error.value = null
      const numericId = toNumericId(id)
      if (numericId === null) {
        throw new Error('Invalid menu item id')
      }
      const data = await menuItemsApi.update(numericId, itemData)
      const updatedItem = normalizeMenuItem(data)

      const index = menuItems.value.findIndex(item => item.id === numericId)
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

  const deleteMenuItem = async (id: number | string) => {
    try {
      loading.value = true
      error.value = null
      const numericId = toNumericId(id)
      if (numericId === null) {
        throw new Error('Invalid menu item id')
      }
      await menuItemsApi.delete(numericId)
      menuItems.value = menuItems.value.filter(item => item.id !== numericId)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete menu item'
      console.error('Error deleting menu item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleItemAvailability = async (id: number | string, isAvailable: boolean) => {
    try {
      const numericId = toNumericId(id)
      if (numericId === null) {
        throw new Error('Invalid menu item id')
      }
      const data = await menuItemsApi.update(numericId, { isAvailable })
      const updatedItem = normalizeMenuItem(data)

      const index = menuItems.value.findIndex(item => item.id === numericId)
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

  const setSelectedCategory = (categoryId: number | string | null) => {
    selectedCategory.value = categoryId === null ? null : toNumericId(categoryId)
  }

  const getItemById = (id: number | string) => {
    const numericId = toNumericId(id)
    if (numericId === null) return null
    return menuItems.value.find(item => item.id === numericId) || null
  }

  const getCategoryById = (id: number | string) => {
    const numericId = toNumericId(id)
    if (numericId === null) return null
    return categories.value.find(cat => cat.id === numericId) || null
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