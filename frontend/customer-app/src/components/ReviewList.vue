<!--
  ReviewList - Display list of reviews with stats, filters, and sorting
  Features: rating stats, filters, sort options, review cards, image viewer
-->

<template>
  <div class="space-y-6">
    <!-- Review Stats -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
      <div class="flex items-start gap-6">
        <!-- Average Rating -->
        <div class="text-center">
          <div class="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {{ stats.averageRating.toFixed(1) }}
          </div>
          <div class="flex justify-center mb-2">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-5 h-5"
              :class="star <= Math.round(stats.averageRating)
                ? 'text-warning-500 fill-current'
                : 'text-gray-300 dark:text-gray-600'"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('reviews.total_reviews', stats.totalReviews) }}
          </p>
        </div>

        <!-- Rating Distribution -->
        <div class="flex-1 space-y-2">
          <div
            v-for="rating in [5, 4, 3, 2, 1]"
            :key="rating"
            @click="toggleRatingFilter(rating)"
            class="flex items-center gap-3 cursor-pointer group"
          >
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {{ rating }}
              <svg class="w-3 h-3 inline text-warning-500 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </span>
            <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-warning-500 transition-all"
                :class="{ 'group-hover:bg-warning-600': true }"
                :style="{ width: getRatingPercentage(rating) + '%' }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {{ stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] }}
            </span>
          </div>

          <!-- Recommendation percentage -->
          <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-bold">{{ stats.percentRecommended }}%</span>
              {{ t('reviews.customers_recommend') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Sort -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <!-- Filters -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filter button -->
        <button
          @click="showFilters = !showFilters"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <span>{{ t('reviews.filters') }}</span>
          <span
            v-if="activeFiltersCount > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full"
          >
            {{ activeFiltersCount }}
          </span>
        </button>

        <!-- Quick filter badges -->
        <button
          v-if="currentFilters.verified"
          @click="updateFilter('verified', undefined)"
          class="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium"
        >
          <span>{{ t('reviews.verified_only') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <button
          v-if="currentFilters.hasImages"
          @click="updateFilter('hasImages', undefined)"
          class="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium"
        >
          <span>{{ t('reviews.with_photos') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <button
          v-if="currentFilters.rating"
          @click="updateFilter('rating', undefined)"
          class="flex items-center gap-1 px-3 py-1.5 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 rounded-lg text-sm font-medium"
        >
          <span>{{ currentFilters.rating }} {{ t('reviews.stars') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >
          {{ t('reviews.clear_all') }}
        </button>
      </div>

      <!-- Sort -->
      <div class="relative" ref="sortDropdownRef">
        <button
          @click="showSortDropdown = !showSortDropdown"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
          <span>{{ t('reviews.sort.' + currentSort) }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Sort dropdown -->
        <div
          v-if="showSortDropdown"
          class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden"
        >
          <button
            v-for="sort in sortOptions"
            :key="sort"
            @click="setSort(sort)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': currentSort === sort }"
          >
            <span class="font-medium">{{ t('reviews.sort.' + sort) }}</span>
            <svg
              v-if="currentSort === sort"
              class="w-5 h-5 text-primary-600 dark:text-primary-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter panel -->
    <div
      v-if="showFilters"
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4"
    >
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-gray-900 dark:text-white">{{ t('reviews.filter_reviews') }}</h4>
        <button
          @click="showFilters = false"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Filter options -->
      <label class="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          :checked="currentFilters.verified"
          @change="updateFilter('verified', $event.target.checked || undefined)"
          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
        />
        <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
          {{ t('reviews.verified_purchases') }}
        </span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          :checked="currentFilters.hasImages"
          @change="updateFilter('hasImages', $event.target.checked || undefined)"
          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
        />
        <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
          {{ t('reviews.reviews_with_photos') }}
        </span>
      </label>

      <label class="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          :checked="currentFilters.hasResponse"
          @change="updateFilter('hasResponse', $event.target.checked || undefined)"
          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
        />
        <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
          {{ t('reviews.with_store_response') }}
        </span>
      </label>
    </div>

    <!-- Review count -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      {{ t('reviews.showing_reviews', { count: sortedReviews.length, total: stats.totalReviews }) }}
    </div>

    <!-- Reviews list -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>

    <div v-else-if="sortedReviews.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('reviews.no_reviews') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ hasActiveFilters ? t('reviews.no_reviews_with_filters') : t('reviews.be_first_to_review') }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <ReviewCard
        v-for="review in sortedReviews"
        :key="review.id"
        :review="review"
        @view-image="handleViewImage"
      />
    </div>

    <!-- Image viewer modal -->
    <Teleport to="body">
      <div
        v-if="showImageViewer"
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        @click="closeImageViewer"
      >
        <button
          @click="closeImageViewer"
          class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div @click.stop class="max-w-4xl w-full px-4">
          <img
            :src="viewerImages[currentImageIndex]"
            alt="Review image"
            class="w-full h-auto rounded-2xl"
          />

          <!-- Navigation -->
          <div v-if="viewerImages.length > 1" class="flex items-center justify-center gap-4 mt-6">
            <button
              @click="previousImage"
              class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="text-white font-medium">
              {{ currentImageIndex + 1 }} / {{ viewerImages.length }}
            </span>
            <button
              @click="nextImage"
              class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReviewsStore } from '@/stores/reviews'
import type { ReviewFilters, ReviewSortOrder } from '@/stores/reviews'
import ReviewCard from './ReviewCard.vue'

interface Props {
  productId: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const reviewsStore = useReviewsStore()

// State
const showFilters = ref(false)
const showSortDropdown = ref(false)
const sortDropdownRef = ref<HTMLElement | null>(null)
const showImageViewer = ref(false)
const viewerImages = ref<string[]>([])
const currentImageIndex = ref(0)

const sortOptions: ReviewSortOrder[] = ['newest', 'oldest', 'highest', 'lowest', 'helpful']

// Computed
const stats = computed(() => reviewsStore.reviewStats)
const sortedReviews = computed(() => reviewsStore.sortedReviews)
const isLoading = computed(() => reviewsStore.isLoading)
const currentFilters = computed(() => reviewsStore.filters)
const currentSort = computed(() => reviewsStore.sortBy)
const hasActiveFilters = computed(() => reviewsStore.hasActiveFilters)
const activeFiltersCount = computed(() => reviewsStore.activeFiltersCount)

// Methods
function getRatingPercentage(rating: number): number {
  if (stats.value.totalReviews === 0) return 0
  return (stats.value.ratingDistribution[rating as keyof typeof stats.value.ratingDistribution] / stats.value.totalReviews) * 100
}

function toggleRatingFilter(rating: number) {
  if (currentFilters.value.rating === rating) {
    updateFilter('rating', undefined)
  } else {
    updateFilter('rating', rating)
  }
}

function updateFilter(key: keyof ReviewFilters, value: any) {
  reviewsStore.updateFilters({ [key]: value })
}

function clearAllFilters() {
  reviewsStore.clearFilters()
}

function setSort(sort: ReviewSortOrder) {
  reviewsStore.setSortBy(sort)
  showSortDropdown.value = false
}

function handleViewImage(data: { images: string[], index: number }) {
  viewerImages.value = data.images
  currentImageIndex.value = data.index
  showImageViewer.value = true
}

function closeImageViewer() {
  showImageViewer.value = false
  viewerImages.value = []
  currentImageIndex.value = 0
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = viewerImages.value.length - 1
  }
}

function nextImage() {
  if (currentImageIndex.value < viewerImages.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

function handleClickOutside(event: MouseEvent) {
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
    showSortDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  reviewsStore.fetchReviewsForProduct(props.productId)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
