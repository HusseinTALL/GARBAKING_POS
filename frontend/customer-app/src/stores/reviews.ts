/**
 * Reviews Store - State management for product reviews and ratings
 * Manages reviews, ratings, filters, sorting, and user interactions
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoadingState } from '@/types'

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  productName: string
  rating: number
  title: string
  comment: string
  images?: string[]
  helpful: number
  unhelpful: number
  verified: boolean
  createdAt: string
  updatedAt?: string
  response?: {
    text: string
    respondedAt: string
    respondedBy: string
  }
}

export interface ReviewFilters {
  rating?: number // Filter by specific rating (1-5)
  verified?: boolean // Show only verified purchases
  hasImages?: boolean // Show only reviews with images
  hasResponse?: boolean // Show only reviews with responses
}

export type ReviewSortOrder = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  percentRecommended: number
}

export interface UserReviewInteraction {
  reviewId: string
  vote: 'helpful' | 'unhelpful' | null
}

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const reviews = ref<Review[]>([])
  const userReviews = ref<Review[]>([]) // Reviews by current user
  const filters = ref<ReviewFilters>({})
  const sortBy = ref<ReviewSortOrder>('newest')
  const loadingState = ref<LoadingState>('idle')
  const error = ref<string | null>(null)
  const userInteractions = ref<Map<string, UserReviewInteraction>>(new Map())

  // Computed
  const isLoading = computed(() => loadingState.value === 'loading')

  const hasReviews = computed(() => reviews.value.length > 0)

  const filteredReviews = computed(() => {
    let filtered = [...reviews.value]

    // Filter by rating
    if (filters.value.rating) {
      filtered = filtered.filter(r => r.rating === filters.value.rating)
    }

    // Filter by verified purchases
    if (filters.value.verified) {
      filtered = filtered.filter(r => r.verified)
    }

    // Filter by images
    if (filters.value.hasImages) {
      filtered = filtered.filter(r => r.images && r.images.length > 0)
    }

    // Filter by responses
    if (filters.value.hasResponse) {
      filtered = filtered.filter(r => r.response !== undefined)
    }

    return filtered
  })

  const sortedReviews = computed(() => {
    const sorted = [...filteredReviews.value]

    switch (sortBy.value) {
      case 'newest':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating)
      case 'helpful':
        return sorted.sort((a, b) => b.helpful - a.helpful)
      default:
        return sorted
    }
  })

  const reviewStats = computed((): ReviewStats => {
    if (reviews.value.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentRecommended: 0
      }
    }

    const totalReviews = reviews.value.length
    const sumRatings = reviews.value.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = sumRatings / totalReviews

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.value.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })

    const recommended = reviews.value.filter(r => r.rating >= 4).length
    const percentRecommended = (recommended / totalReviews) * 100

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: distribution,
      percentRecommended: Math.round(percentRecommended)
    }
  })

  const hasActiveFilters = computed(() => {
    return (
      filters.value.rating !== undefined ||
      filters.value.verified !== undefined ||
      filters.value.hasImages !== undefined ||
      filters.value.hasResponse !== undefined
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.rating) count++
    if (filters.value.verified) count++
    if (filters.value.hasImages) count++
    if (filters.value.hasResponse) count++
    return count
  })

  // Actions
  function setReviews(newReviews: Review[]) {
    reviews.value = newReviews
  }

  function addReview(review: Review) {
    reviews.value.unshift(review)
    userReviews.value.unshift(review)
    saveToLocalStorage()
  }

  function updateReview(reviewId: string, updates: Partial<Review>) {
    const index = reviews.value.findIndex(r => r.id === reviewId)
    if (index !== -1) {
      reviews.value[index] = { ...reviews.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  function deleteReview(reviewId: string) {
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    userReviews.value = userReviews.value.filter(r => r.id !== reviewId)
    saveToLocalStorage()
  }

  async function fetchReviewsForProduct(productId: string) {
    loadingState.value = 'loading'
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock data - in real app, this would be an API call
      const mockReviews: Review[] = generateMockReviews(productId)

      reviews.value = mockReviews
      loadingState.value = 'success'
    } catch (err: any) {
      error.value = err.message || 'Failed to load reviews'
      loadingState.value = 'error'
      console.error('Error fetching reviews:', err)
    }
  }

  async function submitReview(reviewData: Omit<Review, 'id' | 'helpful' | 'unhelpful' | 'createdAt'>) {
    loadingState.value = 'loading'
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      const newReview: Review = {
        ...reviewData,
        id: generateId(),
        helpful: 0,
        unhelpful: 0,
        createdAt: new Date().toISOString()
      }

      addReview(newReview)
      loadingState.value = 'success'
      return newReview
    } catch (err: any) {
      error.value = err.message || 'Failed to submit review'
      loadingState.value = 'error'
      console.error('Error submitting review:', err)
      throw err
    }
  }

  function updateFilters(newFilters: Partial<ReviewFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function clearFilters() {
    filters.value = {}
  }

  function setSortBy(sort: ReviewSortOrder) {
    sortBy.value = sort
  }

  function voteHelpful(reviewId: string) {
    const review = reviews.value.find(r => r.id === reviewId)
    if (!review) return

    const currentVote = userInteractions.value.get(reviewId)

    if (currentVote?.vote === 'helpful') {
      // Remove helpful vote
      review.helpful--
      userInteractions.value.delete(reviewId)
    } else {
      // Add helpful vote
      if (currentVote?.vote === 'unhelpful') {
        review.unhelpful--
      }
      review.helpful++
      userInteractions.value.set(reviewId, { reviewId, vote: 'helpful' })
    }

    saveToLocalStorage()
  }

  function voteUnhelpful(reviewId: string) {
    const review = reviews.value.find(r => r.id === reviewId)
    if (!review) return

    const currentVote = userInteractions.value.get(reviewId)

    if (currentVote?.vote === 'unhelpful') {
      // Remove unhelpful vote
      review.unhelpful--
      userInteractions.value.delete(reviewId)
    } else {
      // Add unhelpful vote
      if (currentVote?.vote === 'helpful') {
        review.helpful--
      }
      review.unhelpful++
      userInteractions.value.set(reviewId, { reviewId, vote: 'unhelpful' })
    }

    saveToLocalStorage()
  }

  function getUserVote(reviewId: string): 'helpful' | 'unhelpful' | null {
    return userInteractions.value.get(reviewId)?.vote || null
  }

  function getReviewById(reviewId: string): Review | undefined {
    return reviews.value.find(r => r.id === reviewId)
  }

  function getReviewsByProduct(productId: string): Review[] {
    return reviews.value.filter(r => r.productId === productId)
  }

  function getUserReviews(): Review[] {
    return userReviews.value
  }

  function hasUserReviewedProduct(productId: string): boolean {
    return userReviews.value.some(r => r.productId === productId)
  }

  // Local Storage
  function saveToLocalStorage() {
    try {
      const data = {
        reviews: reviews.value,
        userReviews: userReviews.value,
        userInteractions: Array.from(userInteractions.value.entries()),
        timestamp: Date.now()
      }
      localStorage.setItem('garbaking_reviews', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving reviews to localStorage:', error)
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('garbaking_reviews')
      if (stored) {
        const data = JSON.parse(stored)

        if (data.reviews) reviews.value = data.reviews
        if (data.userReviews) userReviews.value = data.userReviews
        if (data.userInteractions) {
          userInteractions.value = new Map(data.userInteractions)
        }
      }
    } catch (error) {
      console.error('Error loading reviews from localStorage:', error)
    }
  }

  function clearAll() {
    reviews.value = []
    userReviews.value = []
    filters.value = {}
    sortBy.value = 'newest'
    userInteractions.value.clear()
    loadingState.value = 'idle'
    error.value = null
    saveToLocalStorage()
  }

  // Utilities
  function generateId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function generateMockReviews(productId: string): Review[] {
    const mockNames = [
      'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Brown',
      'Olivia Garcia', 'James Martinez', 'Sophia Rodriguez', 'William Lee'
    ]

    const mockTitles = [
      'Absolutely delicious!', 'Great value for money', 'Highly recommend',
      'Outstanding quality', 'Perfect every time', 'Best in town',
      'Really enjoyed this', 'Worth trying', 'Good but not great',
      'Could be better', 'Not what I expected'
    ]

    const mockComments = [
      'This is one of the best items I\'ve ordered. The quality is excellent and the taste is amazing. Will definitely order again!',
      'Really good product. Fresh ingredients and great presentation. Exceeded my expectations.',
      'Decent but nothing special. The portion size was good but flavor was average.',
      'The food arrived hot and fresh. Packaging was excellent. Highly satisfied with my order.',
      'Not impressed. Expected more based on the reviews. Maybe it was an off day.',
      'Perfect! This has become my go-to order. Never disappoints.',
      'Good quality but a bit pricey. Still worth it though.',
      'Amazing taste and generous portion. Will order again for sure!'
    ]

    const reviews: Review[] = []
    const reviewCount = Math.floor(Math.random() * 15) + 5 // 5-20 reviews

    for (let i = 0; i < reviewCount; i++) {
      const rating = Math.random() > 0.3 ? (Math.random() > 0.5 ? 5 : 4) : Math.floor(Math.random() * 3) + 1
      const hasImages = Math.random() > 0.7
      const hasResponse = Math.random() > 0.8

      const review: Review = {
        id: `review_${productId}_${i}`,
        userId: `user_${i}`,
        userName: mockNames[i % mockNames.length],
        userAvatar: Math.random() > 0.5 ? undefined : `https://i.pravatar.cc/150?u=${i}`,
        productId,
        productName: 'Product Name',
        rating,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        comment: mockComments[Math.floor(Math.random() * mockComments.length)],
        images: hasImages ? [
          `https://picsum.photos/400/300?random=${i}1`,
          `https://picsum.photos/400/300?random=${i}2`
        ] : undefined,
        helpful: Math.floor(Math.random() * 50),
        unhelpful: Math.floor(Math.random() * 5),
        verified: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      }

      if (hasResponse) {
        review.response = {
          text: 'Thank you for your feedback! We appreciate your review and are glad you enjoyed our product.',
          respondedAt: new Date(new Date(review.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          respondedBy: 'Garbaking Team'
        }
      }

      reviews.push(review)
    }

    return reviews.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    // State
    reviews,
    userReviews,
    filters,
    sortBy,
    loadingState,
    error,
    userInteractions,

    // Getters
    isLoading,
    hasReviews,
    filteredReviews,
    sortedReviews,
    reviewStats,
    hasActiveFilters,
    activeFiltersCount,

    // Actions
    setReviews,
    addReview,
    updateReview,
    deleteReview,
    fetchReviewsForProduct,
    submitReview,
    updateFilters,
    clearFilters,
    setSortBy,
    voteHelpful,
    voteUnhelpful,
    getUserVote,
    getReviewById,
    getReviewsByProduct,
    getUserReviews,
    hasUserReviewedProduct,
    loadFromLocalStorage,
    saveToLocalStorage,
    clearAll
  }
})
