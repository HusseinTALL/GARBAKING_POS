<!--
  SearchBar.vue
  Search input with debouncing, recent searches, and live results dropdown
-->
<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchStore.query"
        @input="handleInput"
        @focus="handleFocus"
        type="text"
        placeholder="Search for restaurants or dishes..."
        class="w-full pl-12 pr-12 py-3 bg-gray-100 border border-transparent focus:border-orange-500 focus:bg-white rounded-full text-gray-900 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
      />

      <!-- Search Icon -->
      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <svg v-if="!searchStore.isSearching" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Clear Button -->
      <button
        v-if="searchStore.hasQuery"
        @click="handleClear"
        class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Clear search"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Results Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="searchStore.showResults && (searchStore.hasResults || searchStore.recentSearches.length > 0)"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
      >
        <!-- Search Results -->
        <div v-if="searchStore.hasQuery && searchStore.hasResults" class="py-2">
          <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Search Results</div>
          <button
            v-for="result in searchStore.results"
            :key="`${result.type}-${result.id}`"
            @click="handleSelectResult(result)"
            class="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <!-- Icon/Image -->
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                v-if="result.image"
                :src="result.image"
                :alt="result.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg v-if="result.type === 'restaurant'" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <svg v-else-if="result.type === 'category'" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 truncate">{{ result.name }}</div>
              <div v-if="result.description" class="text-sm text-gray-500 truncate">{{ result.description }}</div>
              <div v-if="result.restaurantName" class="text-xs text-gray-400 mt-0.5">{{ result.restaurantName }}</div>
            </div>

            <!-- Type Badge -->
            <div class="flex-shrink-0">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-orange-100 text-orange-700': result.type === 'restaurant',
                  'bg-blue-100 text-blue-700': result.type === 'category',
                  'bg-green-100 text-green-700': result.type === 'dish'
                }"
              >
                {{ result.type }}
              </span>
            </div>
          </button>
        </div>

        <!-- No Results -->
        <div v-if="searchStore.hasQuery && !searchStore.hasResults && !searchStore.isSearching" class="py-8 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 font-medium">No results found</p>
          <p class="text-sm text-gray-400 mt-1">Try different keywords</p>
        </div>

        <!-- Recent Searches -->
        <div v-if="!searchStore.hasQuery && searchStore.recentSearches.length > 0" class="py-2">
          <div class="px-4 py-2 flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase">Recent Searches</span>
            <button
              @click="searchStore.clearRecentSearches()"
              class="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear All
            </button>
          </div>
          <button
            v-for="search in searchStore.recentSearches.slice(0, 5)"
            :key="search"
            @click="handleRecentSearch(search)"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-700 truncate">{{ search }}</span>
            </div>
            <button
              @click.stop="searchStore.removeFromRecentSearches(search)"
              class="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="searchStore.showResults"
      @click="searchStore.hideResults()"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import type { SearchResult } from '@/stores/search'

const router = useRouter()
const searchStore = useSearchStore()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchStore.setQuery(target.value)
}

const handleFocus = () => {
  if (searchStore.hasQuery || searchStore.recentSearches.length > 0) {
    searchStore.showResults = true
  }
}

const handleClear = () => {
  searchStore.clearSearch()
}

const handleSelectResult = (result: SearchResult) => {
  searchStore.selectResult(result)

  // Navigate based on type
  if (result.type === 'restaurant') {
    router.push(`/restaurant/${result.id}`)
  } else if (result.type === 'category') {
    // Filter by category
    router.push({ name: 'Home', query: { category: result.id } })
  } else if (result.type === 'dish') {
    // Could navigate to restaurant or show dish details
    router.push(`/restaurant/${result.id}`)
  }
}

const handleRecentSearch = (search: string) => {
  searchStore.setQuery(search)
  searchStore.performSearch(search)
}
</script>
