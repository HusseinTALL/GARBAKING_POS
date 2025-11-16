/**
 * Restaurant Store
 * Manages restaurant data, filtering, and favorites
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Types
export interface Restaurant {
  id: string
  name: string
  description: string
  image: string
  logo?: string
  rating: number
  reviewCount: number
  deliveryTime: string // e.g., "25-30 min"
  deliveryFee: number
  minimumOrder?: number
  cuisineTypes: string[]
  isOpen: boolean
  isFeatured: boolean
  distance?: string // e.g., "1.2 km"
  tags?: string[] // e.g., ["Free Delivery", "Popular", "New"]
  priceRange: number // 1-4 ($, $$, $$$, $$$$)
}

export const useRestaurantStore = defineStore('restaurant', () => {
  // State
  const restaurants = ref<Restaurant[]>([])
  const featuredRestaurants = ref<Restaurant[]>([])
  const selectedRestaurant = ref<Restaurant | null>(null)
  const favorites = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem('favorite_restaurants') || '[]')))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const selectedCategory = ref<string | null>(null)
  const selectedCuisine = ref<string | null>(null)
  const priceFilter = ref<number[]>([1, 2, 3, 4])
  const sortBy = ref<'rating' | 'deliveryTime' | 'distance' | 'popular'>('popular')

  // Computed
  const filteredRestaurants = computed(() => {
    let filtered = [...restaurants.value]

    // Filter by category
    if (selectedCategory.value) {
      filtered = filtered.filter(r =>
        r.cuisineTypes.some(c => c.toLowerCase().includes(selectedCategory.value!.toLowerCase()))
      )
    }

    // Filter by cuisine
    if (selectedCuisine.value) {
      filtered = filtered.filter(r =>
        r.cuisineTypes.includes(selectedCuisine.value!)
      )
    }

    // Filter by price range
    filtered = filtered.filter(r => priceFilter.value.includes(r.priceRange))

    // Filter by open status
    filtered = filtered.filter(r => r.isOpen)

    // Sort
    switch (sortBy.value) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'deliveryTime':
        filtered.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0])
          const bTime = parseInt(b.deliveryTime.split('-')[0])
          return aTime - bTime
        })
        break
      case 'distance':
        filtered.sort((a, b) => {
          const aDistance = parseFloat(a.distance || '999')
          const bDistance = parseFloat(b.distance || '999')
          return aDistance - bDistance
        })
        break
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    return filtered
  })

  const favoriteRestaurants = computed(() => {
    return restaurants.value.filter(r => favorites.value.has(r.id))
  })

  // Actions
  const fetchRestaurants = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants`)
      restaurants.value = response.data
      featuredRestaurants.value = response.data.filter((r: Restaurant) => r.isFeatured)
    } catch (err: any) {
      console.error('Failed to fetch restaurants:', err)
      error.value = err.response?.data?.message || 'Failed to load restaurants'

      // Use sample data as fallback
      loadSampleData()
    } finally {
      loading.value = false
    }
  }

  const fetchRestaurantById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${id}`)
      selectedRestaurant.value = response.data
      return response.data
    } catch (err: any) {
      console.error('Failed to fetch restaurant:', err)
      error.value = err.response?.data?.message || 'Failed to load restaurant'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleFavorite = (restaurantId: string) => {
    if (favorites.value.has(restaurantId)) {
      favorites.value.delete(restaurantId)
    } else {
      favorites.value.add(restaurantId)
    }

    // Persist to localStorage
    localStorage.setItem('favorite_restaurants', JSON.stringify([...favorites.value]))
  }

  const isFavorite = (restaurantId: string): boolean => {
    return favorites.value.has(restaurantId)
  }

  const setCategory = (category: string | null) => {
    selectedCategory.value = category
  }

  const setCuisine = (cuisine: string | null) => {
    selectedCuisine.value = cuisine
  }

  const setPriceFilter = (prices: number[]) => {
    priceFilter.value = prices
  }

  const setSortBy = (sort: 'rating' | 'deliveryTime' | 'distance' | 'popular') => {
    sortBy.value = sort
  }

  const clearFilters = () => {
    selectedCategory.value = null
    selectedCuisine.value = null
    priceFilter.value = [1, 2, 3, 4]
    sortBy.value = 'popular'
  }

  const loadSampleData = () => {
    // Sample restaurant data
    restaurants.value = [
      {
        id: '1',
        name: 'Garbaking Bakery',
        description: 'Fresh artisan breads and pastries',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        logo: 'https://ui-avatars.com/api/?name=Garbaking&background=FF6B35&color=fff',
        rating: 4.8,
        reviewCount: 520,
        deliveryTime: '20-25 min',
        deliveryFee: 0,
        minimumOrder: 10,
        cuisineTypes: ['Bakery', 'Desserts', 'Breakfast'],
        isOpen: true,
        isFeatured: true,
        distance: '0.8 km',
        tags: ['Free Delivery', 'Popular'],
        priceRange: 2
      },
      {
        id: '2',
        name: 'Burger Palace',
        description: 'Gourmet burgers and fries',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        logo: 'https://ui-avatars.com/api/?name=Burger+Palace&background=FF8C42&color=fff',
        rating: 4.6,
        reviewCount: 342,
        deliveryTime: '30-35 min',
        deliveryFee: 2.99,
        minimumOrder: 15,
        cuisineTypes: ['American', 'Fast Food', 'Burgers'],
        isOpen: true,
        isFeatured: true,
        distance: '1.5 km',
        tags: ['Popular'],
        priceRange: 2
      },
      {
        id: '3',
        name: 'Sushi Express',
        description: 'Fresh sushi and Japanese cuisine',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        logo: 'https://ui-avatars.com/api/?name=Sushi+Express&background=FFA500&color=fff',
        rating: 4.9,
        reviewCount: 789,
        deliveryTime: '25-30 min',
        deliveryFee: 3.99,
        minimumOrder: 20,
        cuisineTypes: ['Japanese', 'Sushi', 'Asian'],
        isOpen: true,
        isFeatured: true,
        distance: '2.1 km',
        tags: ['New', 'Popular'],
        priceRange: 3
      },
      {
        id: '4',
        name: 'Pizza Corner',
        description: 'Wood-fired pizzas and Italian classics',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        logo: 'https://ui-avatars.com/api/?name=Pizza+Corner&background=FF6B35&color=fff',
        rating: 4.5,
        reviewCount: 623,
        deliveryTime: '35-40 min',
        deliveryFee: 1.99,
        minimumOrder: 12,
        cuisineTypes: ['Italian', 'Pizza', 'Pasta'],
        isOpen: true,
        isFeatured: false,
        distance: '1.2 km',
        tags: [],
        priceRange: 2
      },
      {
        id: '5',
        name: 'Healthy Bowls',
        description: 'Nutritious salads and smoothie bowls',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        logo: 'https://ui-avatars.com/api/?name=Healthy+Bowls&background=4CAF50&color=fff',
        rating: 4.7,
        reviewCount: 445,
        deliveryTime: '20-25 min',
        deliveryFee: 2.49,
        minimumOrder: 10,
        cuisineTypes: ['Healthy', 'Salads', 'Vegan'],
        isOpen: true,
        isFeatured: false,
        distance: '0.9 km',
        tags: ['Free Delivery'],
        priceRange: 2
      },
      {
        id: '6',
        name: 'Taco Fiesta',
        description: 'Authentic Mexican street food',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        logo: 'https://ui-avatars.com/api/?name=Taco+Fiesta&background=FF6B35&color=fff',
        rating: 4.4,
        reviewCount: 289,
        deliveryTime: '25-30 min',
        deliveryFee: 2.99,
        minimumOrder: 12,
        cuisineTypes: ['Mexican', 'Tacos', 'Latin'],
        isOpen: true,
        isFeatured: false,
        distance: '1.8 km',
        tags: ['New'],
        priceRange: 2
      }
    ]

    featuredRestaurants.value = restaurants.value.filter(r => r.isFeatured)
  }

  // Initialize with sample data
  loadSampleData()

  return {
    // State
    restaurants,
    featuredRestaurants,
    selectedRestaurant,
    favorites,
    loading,
    error,
    selectedCategory,
    selectedCuisine,
    priceFilter,
    sortBy,

    // Computed
    filteredRestaurants,
    favoriteRestaurants,

    // Actions
    fetchRestaurants,
    fetchRestaurantById,
    toggleFavorite,
    isFavorite,
    setCategory,
    setCuisine,
    setPriceFilter,
    setSortBy,
    clearFilters
  }
})
