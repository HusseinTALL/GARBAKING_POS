<!--
  ReviewsList.vue
  Reviews section with overall rating, filters, and review cards
-->

<template>
  <div>
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Customer Reviews</h2>
      <button
        @click="showWriteReview = true"
        class="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Write Review
      </button>
    </div>

    <!-- Overall Rating Summary -->
    <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-6">
        <!-- Rating Number -->
        <div class="text-center">
          <div class="text-5xl font-bold text-gray-900 mb-1">{{ overallRating.toFixed(1) }}</div>
          <div class="flex items-center justify-center gap-1 mb-1">
            <svg
              v-for="n in 5"
              :key="n"
              class="w-5 h-5"
              :class="n <= Math.round(overallRating) ? 'text-orange-500' : 'text-orange-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div class="text-sm text-gray-600">{{ totalReviews }} reviews</div>
        </div>

        <!-- Rating Distribution -->
        <div class="flex-1 space-y-2">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="flex items-center gap-2"
          >
            <span class="text-sm font-medium text-gray-700 w-12">{{ star }} star</span>
            <div class="flex-1 h-2 bg-white rounded-full overflow-hidden">
              <div
                class="h-full bg-orange-500 transition-all"
                :style="{ width: `${getRatingPercentage(star)}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-600 w-8">{{ getRatingCount(star) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="selectedFilter = filter.value"
        class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="[
          selectedFilter === filter.value
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Reviews List -->
    <div v-if="filteredReviews.length > 0" class="space-y-4">
      <ReviewCard
        v-for="review in paginatedReviews"
        :key="review.id"
        :review="review"
        @helpful="handleHelpful"
        @image-click="handleImageClick"
      />

      <!-- Load More Button -->
      <button
        v-if="hasMore"
        @click="loadMore"
        class="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
      >
        Load More Reviews
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-gray-500">No reviews yet. Be the first to review!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ReviewCard from './ReviewCard.vue'

// Props
interface Props {
  restaurantId: string
  overallRating: number
  totalReviews: number
}

const props = defineProps<Props>()

// State
const selectedFilter = ref('all')
const showWriteReview = ref(false)
const currentPage = ref(1)
const reviewsPerPage = 5

// Sample reviews data (will be fetched from store)
const reviews = ref([
  {
    id: '1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Amazing food and great service! The burger was perfectly cooked and the fries were crispy. Will definitely order again!',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    helpfulCount: 12,
    images: []
  },
  {
    id: '2',
    userName: 'Sarah Smith',
    rating: 4,
    comment: 'Good quality food, delivery was on time. Only minor issue was the portion size was a bit small for the price.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    helpfulCount: 8
  },
  {
    id: '3',
    userName: 'Mike Johnson',
    rating: 5,
    comment: 'Best restaurant in the area! Fresh ingredients, generous portions, and friendly staff. The pizza is to die for!',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    helpfulCount: 15,
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200']
  },
  {
    id: '4',
    userName: 'Emily Davis',
    rating: 3,
    comment: 'Food was okay, nothing special. Service could be improved.',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    helpfulCount: 3
  },
  {
    id: '5',
    userName: 'David Wilson',
    rating: 5,
    comment: 'Excellent experience! The customization options are great and everything tasted fresh. Highly recommend!',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    helpfulCount: 20
  }
])

// Filters
const filters = [
  { label: 'All Reviews', value: 'all' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: 'With Photos', value: 'photos' },
  { label: 'Most Helpful', value: 'helpful' }
]

// Computed
const filteredReviews = computed(() => {
  let filtered = [...reviews.value]

  if (selectedFilter.value === 'photos') {
    filtered = filtered.filter(r => r.images && r.images.length > 0)
  } else if (selectedFilter.value === 'helpful') {
    filtered = filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
  } else if (selectedFilter.value !== 'all') {
    const rating = parseInt(selectedFilter.value)
    filtered = filtered.filter(r => r.rating === rating)
  }

  return filtered
})

const paginatedReviews = computed(() => {
  return filteredReviews.value.slice(0, currentPage.value * reviewsPerPage)
})

const hasMore = computed(() => {
  return paginatedReviews.value.length < filteredReviews.value.length
})

const getRatingPercentage = (star: number): number => {
  const count = getRatingCount(star)
  return (count / props.totalReviews) * 100
}

const getRatingCount = (star: number): number => {
  return reviews.value.filter(r => r.rating === star).length
}

// Methods
const loadMore = () => {
  currentPage.value++
}

const handleHelpful = (reviewId: string) => {
  const review = reviews.value.find(r => r.id === reviewId)
  if (review) {
    review.helpfulCount = (review.helpfulCount || 0) + 1
  }
}

const handleImageClick = (image: string) => {
  // Open image in full screen or lightbox
  console.log('Image clicked:', image)
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
