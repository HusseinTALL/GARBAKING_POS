<!--
  SearchBar Component
  Advanced search with autocomplete, suggestions, recent searches, and voice input
  Supports debounced search, keyboard navigation, and clear functionality
-->

<template>
  <div class="search-bar-wrapper" :class="{ 'is-expanded': isExpanded }">
    <div
      class="relative"
      @click="handleFocus"
    >
      <!-- Search Input -->
      <div
        :class="[
          'flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-200',
          isFocused || modelValue
            ? 'border-primary-500 shadow-lg shadow-primary-500/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        <!-- Search Icon -->
        <div class="pl-4 text-gray-400 dark:text-gray-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Input Field -->
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="search"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex-1 bg-transparent py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc="handleEscape"
        />

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="pr-4">
          <BaseLoader variant="spinner" size="sm" color="primary" />
        </div>

        <!-- Voice Search Button -->
        <button
          v-else-if="showVoiceSearch && !modelValue"
          type="button"
          @click="handleVoiceSearch"
          class="pr-4 text-gray-400 hover:text-primary-500 transition-colors"
          aria-label="Voice search"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        </button>

        <!-- Clear Button -->
        <button
          v-else-if="modelValue"
          type="button"
          @click="handleClear"
          class="pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Filter Button -->
        <button
          v-if="showFilterButton"
          type="button"
          @click="handleFilterClick"
          :class="[
            'mr-2 p-2 rounded-xl transition-colors',
            hasActiveFilters
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
          aria-label="Open filters"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <BaseBadge
            v-if="filterCount"
            :label="filterCount"
            variant="error"
            size="xs"
            rounded
            class="absolute -top-1 -right-1"
          />
        </button>
      </div>

      <!-- Dropdown with Suggestions/Results -->
      <Transition name="dropdown">
        <div
          v-if="showDropdown"
          class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-hidden"
        >
          <div class="overflow-y-auto max-h-[400px] custom-scrollbar">
            <!-- Recent Searches -->
            <div v-if="!searchQuery && recentSearches.length > 0" class="p-2">
              <div class="flex items-center justify-between px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Searches
                </h3>
                <button
                  @click="clearRecentSearches"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  Clear
                </button>
              </div>
              <div
                v-for="(item, index) in recentSearches"
                :key="`recent-${index}`"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer',
                  highlightedIndex === index
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
                @click="selectSuggestion(item)"
              >
                <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ item }}</span>
                <button
                  @click.stop="removeRecentSearch(index)"
                  class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  aria-label="Remove"
                >
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Suggestions -->
            <div v-else-if="suggestions.length > 0" class="p-2">
              <h3 v-if="suggestionsTitle" class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ suggestionsTitle }}
              </h3>
              <button
                v-for="(suggestion, index) in suggestions"
                :key="`suggestion-${index}`"
                @click="selectSuggestion(suggestion)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left',
                  highlightedIndex === index
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                <!-- Icon -->
                <div v-if="suggestion.icon" class="flex-shrink-0">
                  <component :is="suggestion.icon" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <svg v-else class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-900 dark:text-gray-100 truncate" v-html="highlightMatch(suggestion.text || suggestion)"></div>
                  <div v-if="suggestion.subtitle" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ suggestion.subtitle }}
                  </div>
                </div>

                <!-- Badge -->
                <BaseBadge
                  v-if="suggestion.badge"
                  :label="suggestion.badge"
                  size="xs"
                  variant="primary"
                />
              </button>
            </div>

            <!-- No Results -->
            <div v-else-if="searchQuery && !isLoading" class="p-8 text-center">
              <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No results found</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Try a different search term</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="showDropdown"
        class="fixed inset-0 z-40"
        @click="closeDropdown"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

export interface SearchSuggestion {
  text: string
  subtitle?: string
  icon?: any
  badge?: string
  data?: any
}

export interface SearchBarProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  // Suggestions
  suggestions?: (string | SearchSuggestion)[]
  suggestionsTitle?: string
  isLoading?: boolean
  // Recent searches
  showRecentSearches?: boolean
  maxRecentSearches?: number
  // Features
  showVoiceSearch?: boolean
  showFilterButton?: boolean
  hasActiveFilters?: boolean
  filterCount?: number
  // Debounce
  debounceMs?: number
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  modelValue: '',
  placeholder: 'Search...',
  disabled: false,
  suggestions: () => [],
  isLoading: false,
  showRecentSearches: true,
  maxRecentSearches: 5,
  showVoiceSearch: false,
  showFilterButton: false,
  hasActiveFilters: false,
  filterCount: 0,
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  select: [suggestion: string | SearchSuggestion]
  filter: []
  voiceSearch: []
  clear: []
}>()

// Refs
const inputRef = ref<HTMLInputElement>()
const searchQuery = ref(props.modelValue)
const isFocused = ref(false)
const isExpanded = ref(false)
const highlightedIndex = ref(-1)
const recentSearches = ref<string[]>([])
const debounceTimer = ref<ReturnType<typeof setTimeout>>()

// Computed
const showDropdown = computed(() => {
  return isFocused.value && (
    searchQuery.value.length > 0 ||
    (props.showRecentSearches && recentSearches.value.length > 0)
  )
})

// Methods
const handleInput = () => {
  emit('update:modelValue', searchQuery.value)

  // Debounced search
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  debounceTimer.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      emit('search', searchQuery.value)
    }
  }, props.debounceMs)

  // Reset highlighted index on input
  highlightedIndex.value = -1
}

const handleFocus = () => {
  isFocused.value = true
  isExpanded.value = true
  inputRef.value?.focus()
}

const handleBlur = () => {
  // Delay to allow click events on dropdown items
  setTimeout(() => {
    isFocused.value = false
    isExpanded.value = false
  }, 200)
}

const handleClear = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const handleEscape = () => {
  if (searchQuery.value) {
    handleClear()
  } else {
    inputRef.value?.blur()
  }
}

const handleFilterClick = () => {
  emit('filter')
}

const handleVoiceSearch = () => {
  emit('voiceSearch')
}

const closeDropdown = () => {
  isFocused.value = false
  isExpanded.value = false
}

// Keyboard navigation
const navigateDown = () => {
  const maxIndex = searchQuery.value
    ? props.suggestions.length - 1
    : recentSearches.value.length - 1

  if (highlightedIndex.value < maxIndex) {
    highlightedIndex.value++
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  } else {
    highlightedIndex.value = -1
  }
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0) {
    const items = searchQuery.value ? props.suggestions : recentSearches.value
    const item = items[highlightedIndex.value]
    selectSuggestion(item)
  } else if (searchQuery.value) {
    performSearch()
  }
}

const selectSuggestion = (suggestion: string | SearchSuggestion) => {
  const text = typeof suggestion === 'string' ? suggestion : suggestion.text
  searchQuery.value = text
  emit('update:modelValue', text)
  emit('select', suggestion)

  // Add to recent searches
  addToRecentSearches(text)

  // Close dropdown
  closeDropdown()

  // Perform search
  performSearch()
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
    addToRecentSearches(searchQuery.value)
  }
}

// Recent searches management
const loadRecentSearches = () => {
  const stored = localStorage.getItem('recent-searches')
  if (stored) {
    try {
      recentSearches.value = JSON.parse(stored)
    } catch (e) {
      recentSearches.value = []
    }
  }
}

const addToRecentSearches = (query: string) => {
  if (!props.showRecentSearches || !query.trim()) return

  // Remove if already exists
  const filtered = recentSearches.value.filter(item => item !== query)

  // Add to beginning
  recentSearches.value = [query, ...filtered].slice(0, props.maxRecentSearches)

  // Save to localStorage
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
}

const removeRecentSearch = (index: number) => {
  recentSearches.value.splice(index, 1)
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem('recent-searches')
}

// Highlight matching text
const highlightMatch = (text: string) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary-200 dark:bg-primary-900/50 text-primary-900 dark:text-primary-100">$1</mark>')
}

// Watch modelValue changes
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Lifecycle
onMounted(() => {
  if (props.showRecentSearches) {
    loadRecentSearches()
  }
})

onUnmounted(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: handleClear
})
</script>

<style scoped>
/* Hide default search clear button */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 3px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
