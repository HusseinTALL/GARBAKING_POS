/**
 * Category Store
 * Manages food categories and filtering
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

// Types
export interface Category {
  id: string
  name: string
  icon: string // emoji or icon name
  image?: string
  color: string // hex color for background
  count?: number // number of items/restaurants
}

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<Category[]>([])
  const selectedCategory = ref<Category | null>(null)

  // Actions
  const initializeCategories = () => {
    categories.value = [
      {
        id: 'all',
        name: 'All',
        icon: '🍽️',
        color: '#FF6B35',
        count: 156
      },
      {
        id: 'bakery',
        name: 'Bakery',
        icon: '🥐',
        color: '#FFA500',
        count: 24
      },
      {
        id: 'burgers',
        name: 'Burgers',
        icon: '🍔',
        color: '#FF8C42',
        count: 32
      },
      {
        id: 'pizza',
        name: 'Pizza',
        icon: '🍕',
        color: '#FF6B35',
        count: 28
      },
      {
        id: 'sushi',
        name: 'Sushi',
        icon: '🍣',
        color: '#FFA500',
        count: 18
      },
      {
        id: 'desserts',
        name: 'Desserts',
        icon: '🍰',
        color: '#FF8C42',
        count: 42
      },
      {
        id: 'healthy',
        name: 'Healthy',
        icon: '🥗',
        color: '#4CAF50',
        count: 36
      },
      {
        id: 'mexican',
        name: 'Mexican',
        icon: '🌮',
        color: '#FF6B35',
        count: 22
      },
      {
        id: 'asian',
        name: 'Asian',
        icon: '🥡',
        color: '#FFA500',
        count: 45
      },
      {
        id: 'italian',
        name: 'Italian',
        icon: '🍝',
        color: '#FF8C42',
        count: 38
      },
      {
        id: 'breakfast',
        name: 'Breakfast',
        icon: '🍳',
        color: '#FFB347',
        count: 26
      },
      {
        id: 'coffee',
        name: 'Coffee',
        icon: '☕',
        color: '#8B4513',
        count: 31
      }
    ]
  }

  const selectCategory = (category: Category | null) => {
    selectedCategory.value = category
  }

  const getCategoryById = (id: string): Category | undefined => {
    return categories.value.find(c => c.id === id)
  }

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.value.find(c =>
      c.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Initialize on store creation
  initializeCategories()

  return {
    // State
    categories,
    selectedCategory,

    // Actions
    initializeCategories,
    selectCategory,
    getCategoryById,
    getCategoryByName
  }
})
