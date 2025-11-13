<!--
  SearchResults View - Enhanced search with filters and sorting
  Global search across menu items with advanced filtering
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header with Search Bar -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40">
      <div class="px-4 py-3">
        <div class="flex items-center gap-3">
          <button
            @click="$router.back()"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Search Input -->
          <div class="flex-1 relative">
            <input
              v-model="searchStore.query"
              @input="handleSearch"
              @focus="showSuggestions = true"
              type="text"
              :placeholder="$t('search.placeholder')"
              class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <button
              v-if="searchStore.query"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Filter Button -->
          <button
            @click="showFilters = !showFilters"
            class="p-2.5 rounded-xl border-2 transition-all relative flex-shrink-0"
            :class="searchStore.hasFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span
              v-if="searchStore.activeFiltersCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {{ searchStore.activeFiltersCount }}
            </span>
          </button>
        </div>

        <!-- Quick Filters (Tags) -->
        <div v-if="searchStore.hasFilters" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="category in searchStore.filters.categories"
            :key="category"
            @click="removeCategory Filter(category)"
            class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium flex items-center gap-1"
          >
            {{ category }}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <button
            @click="searchStore.clearFilters()"
            class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
          >
            {{ $t('search.clearAll') }}
          </button>
        </div>
      </div>

      <!-- Results Count & Sort -->
      <div v-if="searchStore.hasResults" class="px-4 pb-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('search.resultsCount', { count: searchStore.sortedResults.length }) }}
        </p>
        <button
          @click="showSortOptions = !showSortOptions"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
          {{ $t(`search.sortBy.${searchStore.sortBy}`) }}
        </button>
      </div>
    </div>

    <!-- Filter Panel (Slide-in) -->
    <transition name="slide-left">
      <div
        v-if="showFilters"
        class="fixed inset-0 bg-black/50 z-50"
        @click="showFilters = false"
      >
        <div
          class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
          @click.stop
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ $t('search.filters') }}
              </h3>
              <button
                @click="showFilters = false"
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {{ $t('search.priceRange') }}
              </label>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="localFilters.priceRange.min"
                    type="number"
                    min="0"
                    :placeholder="$t('search.min')"
                    class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <span class="text-gray-500">-</span>
                  <input
                    v-model.number="localFilters.priceRange.max"
                    type="number"
                    min="0"
                    :placeholder="$t('search.max')"
                    class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Dietary Restrictions -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {{ $t('search.dietary') }}
              </label>
              <div class="space-y-2">
                <label
                  v-for="restriction in dietaryOptions"
                  :key="restriction.value"
                  class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    v-model="localFilters.dietaryRestrictions"
                    type="checkbox"
                    :value="restriction.value"
                    class="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span class="text-sm text-gray-900 dark:text-white">{{ restriction.label }}</span>
                </label>
              </div>
            </div>

            <!-- Availability -->
            <div class="mb-6">
              <label class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer">
                <input
                  v-model="localFilters.availability"
                  type="checkbox"
                  class="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ $t('search.availableOnly') }}
                </span>
              </label>
            </div>

            <!-- Apply/Clear Buttons -->
            <div class="flex gap-3">
              <button
                @click="clearAllFilters"
                class="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ $t('search.clearAll') }}
              </button>
              <button
                @click="applyFilters"
                class="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                {{ $t('search.applyFilters') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Sort Options Dropdown -->
    <transition name="fade">
      <div
        v-if="showSortOptions"
        class="fixed inset-0 bg-black/30 z-40"
        @click="showSortOptions = false"
      >
        <div class="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2 min-w-[200px]" @click.stop>
          <button
            v-for="option in sortOptions"
            :key="option.value"
            @click="selectSort(option.value)"
            class="w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors flex items-center justify-between"
            :class="searchStore.sortBy === option.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            {{ option.label }}
            <svg
              v-if="searchStore.sortBy === option.value"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Content -->
    <div class="px-4 py-6">
      <!-- Search History & Popular (when no query) -->
      <div v-if="!searchStore.query && !searchStore.hasResults">
        <!-- Search History -->
        <div v-if="searchStore.recentSearches.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ $t('search.recent') }}
            </h3>
            <button
              @click="searchStore.clearHistory()"
              class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {{ $t('search.clearHistory') }}
            </button>
          </div>
          <div class="space-y-2">
            <button
              v-for="item in searchStore.recentSearches"
              :key="item.id"
              @click="selectHistoryItem(item.query)"
              class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-gray-900 dark:text-white">{{ item.query }}</span>
                <span class="text-xs text-gray-500">{{ item.resultsCount }} {{ $t('search.results') }}</span>
              </div>
              <button
                @click.stop="searchStore.removeFromHistory(item.id)"
                class="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </button>
          </div>
        </div>

        <!-- Popular Searches -->
        <div v-if="searchStore.trendingSearches.length > 0">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {{ $t('search.trending') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="search in searchStore.trendingSearches"
              :key="search.query"
              @click="selectPopularSearch(search.query)"
              class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              {{ search.query }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="searchStore.isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('search.searching') }}</p>
      </div>

      <!-- No Results -->
      <div v-else-if="searchStore.query && !searchStore.hasResults" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('search.noResults') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ $t('search.noResultsDesc', { query: searchStore.query }) }}
        </p>
        <button
          @click="clearSearch"
          class="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
        >
          {{ $t('search.clearSearch') }}
        </button>
      </div>

      <!-- Results Grid -->
      <div v-else-if="searchStore.hasResults" class="grid grid-cols-2 gap-4">
        <MenuItemCard
          v-for="item in searchStore.sortedResults"
          :key="item.id"
          :item="item"
          :show-add-button="true"
          :show-favorite-button="true"
          :compact="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '@/stores/search'
import { useMenuStore } from '@/stores/menu'
import MenuItemCard from '@/components/MenuItemCard.vue'
import type { SortOrder } from '@/types'

const router = useRouter()
const { t } = useI18n()
const searchStore = useSearchStore()
const menuStore = useMenuStore()

// State
const showFilters = ref(false)
const showSortOptions = ref(false)
const showSuggestions = ref(false)

const localFilters = reactive({
  categories: [] as string[],
  priceRange: {
    min: 0,
    max: 1000
  },
  dietaryRestrictions: [] as string[],
  availability: true
})

// Options
const sortOptions = [
  { value: 'name', label: t('search.sortBy.name') },
  { value: 'price', label: t('search.sortBy.price') },
  { value: 'popularity', label: t('search.sortBy.popularity') },
  { value: 'newest', label: t('search.sortBy.newest') }
]

const dietaryOptions = [
  { value: 'vegetarian', label: t('dietary_tags.vegetarian') },
  { value: 'vegan', label: t('dietary_tags.vegan') },
  { value: 'gluten_free', label: t('dietary_tags.gluten_free') },
  { value: 'dairy_free', label: t('dietary_tags.dairy_free') }
]

// Methods
function handleSearch() {
  searchStore.search()
}

function clearSearch() {
  searchStore.clearSearch()
  showSuggestions = false
}

function selectHistoryItem(query: string) {
  searchStore.setQuery(query)
  searchStore.search()
}

function selectPopularSearch(query: string) {
  searchStore.setQuery(query)
  searchStore.search()
}

function removeCategoryFilter(category: string) {
  searchStore.updateFilters({
    categories: searchStore.filters.categories.filter(c => c !== category)
  })
}

function applyFilters() {
  searchStore.updateFilters(localFilters)
  showFilters.value = false
}

function clearAllFilters() {
  localFilters.categories = []
  localFilters.priceRange = { min: 0, max: 1000 }
  localFilters.dietaryRestrictions = []
  localFilters.availability = true
  searchStore.clearFilters()
  showFilters.value = false
}

function selectSort(sort: SortOrder) {
  searchStore.setSortBy(sort)
  showSortOptions.value = false
}

// Lifecycle
onMounted(() => {
  // Load all menu items into search store
  if (menuStore.menuItems.length > 0) {
    searchStore.setAllItems(menuStore.menuItems)
  }

  // Initialize local filters from store
  localFilters.categories = [...searchStore.filters.categories]
  localFilters.priceRange = { ...searchStore.filters.priceRange }
  localFilters.dietaryRestrictions = [...searchStore.filters.dietaryRestrictions]
  localFilters.availability = searchStore.filters.availability || true
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
