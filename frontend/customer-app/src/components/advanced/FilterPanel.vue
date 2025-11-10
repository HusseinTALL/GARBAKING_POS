<!--
  FilterPanel Component
  Comprehensive filter interface with multiple filter types:
  - Checkboxes (cuisine, dietary)
  - Range sliders (price, distance)
  - Star ratings
  - Toggle switches
  Supports bottom sheet modal presentation
-->

<template>
  <BaseModal
    v-model="isOpen"
    :title="title"
    size="md"
    :closable="true"
  >
    <!-- Filter Content -->
    <div class="space-y-8">
      <!-- Cuisine Filter -->
      <div v-if="showCuisineFilter" class="filter-section">
        <h3 class="filter-section-title">Cuisine Type</h3>
        <div class="grid grid-cols-2 gap-2">
          <BaseChip
            v-for="cuisine in cuisineOptions"
            :key="cuisine.value"
            :label="cuisine.label"
            :selected="selectedCuisines.includes(cuisine.value)"
            variant="primary"
            size="md"
            @click="toggleCuisine(cuisine.value)"
          />
        </div>
      </div>

      <!-- Price Range Filter -->
      <div v-if="showPriceFilter" class="filter-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="filter-section-title">Price Range</h3>
          <span class="text-sm font-semibold text-primary-500">
            {{ formatPrice(priceRange[0]) }} - {{ formatPrice(priceRange[1]) }}
          </span>
        </div>

        <!-- Price Chips -->
        <div class="flex gap-2 mb-4">
          <BaseChip
            v-for="price in priceOptions"
            :key="price.value"
            :label="price.label"
            :selected="selectedPriceLevel === price.value"
            variant="primary"
            size="sm"
            @click="setPriceLevel(price.value)"
          />
        </div>

        <!-- Price Range Slider -->
        <div class="px-2">
          <input
            type="range"
            v-model.number="priceRange[0]"
            :min="minPrice"
            :max="maxPrice"
            :step="priceStep"
            class="range-slider"
          />
          <input
            type="range"
            v-model.number="priceRange[1]"
            :min="minPrice"
            :max="maxPrice"
            :step="priceStep"
            class="range-slider mt-2"
          />
        </div>
      </div>

      <!-- Rating Filter -->
      <div v-if="showRatingFilter" class="filter-section">
        <h3 class="filter-section-title">Rating</h3>
        <div class="space-y-2">
          <button
            v-for="rating in ratingOptions"
            :key="rating.value"
            @click="selectedRating = rating.value"
            :class="[
              'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
              selectedRating === rating.value
                ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
            ]"
          >
            <div class="flex items-center gap-3">
              <!-- Stars -->
              <div class="flex items-center gap-0.5">
                <svg
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= rating.value ? 'text-warning-500' : 'text-gray-300 dark:text-gray-600'
                  ]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ rating.label }}
              </span>
            </div>

            <!-- Checkmark -->
            <svg
              v-if="selectedRating === rating.value"
              class="w-5 h-5 text-primary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Distance Filter -->
      <div v-if="showDistanceFilter" class="filter-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="filter-section-title">Distance</h3>
          <span class="text-sm font-semibold text-primary-500">
            {{ distance }} {{ distanceUnit }}
          </span>
        </div>

        <!-- Distance Slider -->
        <div class="px-2">
          <input
            type="range"
            v-model.number="distance"
            :min="minDistance"
            :max="maxDistance"
            :step="distanceStep"
            class="range-slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{{ minDistance }} {{ distanceUnit }}</span>
            <span>{{ maxDistance }} {{ distanceUnit }}</span>
          </div>
        </div>
      </div>

      <!-- Dietary Preferences -->
      <div v-if="showDietaryFilter" class="filter-section">
        <h3 class="filter-section-title">Dietary Preferences</h3>
        <div class="space-y-2">
          <label
            v-for="dietary in dietaryOptions"
            :key="dietary.value"
            class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div class="flex items-center gap-3">
              <span v-if="dietary.icon" class="text-xl">{{ dietary.icon }}</span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ dietary.label }}
              </span>
            </div>
            <input
              type="checkbox"
              :value="dietary.value"
              v-model="selectedDietary"
              class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      <!-- Delivery Options -->
      <div v-if="showDeliveryFilter" class="filter-section">
        <h3 class="filter-section-title">Delivery Options</h3>
        <div class="space-y-2">
          <label
            v-for="option in deliveryOptions"
            :key="option.value"
            class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ option.label }}
            </span>
            <input
              type="checkbox"
              :value="option.value"
              v-model="selectedDeliveryOptions"
              class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      <!-- Sort By -->
      <div v-if="showSortFilter" class="filter-section">
        <h3 class="filter-section-title">Sort By</h3>
        <div class="grid grid-cols-2 gap-2">
          <BaseChip
            v-for="sort in sortOptions"
            :key="sort.value"
            :label="sort.label"
            :selected="selectedSort === sort.value"
            variant="primary"
            size="md"
            @click="selectedSort = sort.value"
          />
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <!-- Clear All -->
        <button
          @click="handleClearAll"
          class="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          Clear All
        </button>

        <!-- Apply Filters -->
        <div class="flex items-center gap-3">
          <BaseButton
            variant="ghost"
            label="Cancel"
            @click="handleCancel"
          />
          <BaseButton
            variant="primary"
            size="lg"
            @click="handleApply"
          >
            Apply Filters
            <BaseBadge
              v-if="activeFilterCount > 0"
              :label="activeFilterCount"
              variant="error"
              size="xs"
              rounded
              class="ml-2"
            />
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

export interface FilterPanelProps {
  modelValue: boolean
  title?: string
  // Show/hide specific filters
  showCuisineFilter?: boolean
  showPriceFilter?: boolean
  showRatingFilter?: boolean
  showDistanceFilter?: boolean
  showDietaryFilter?: boolean
  showDeliveryFilter?: boolean
  showSortFilter?: boolean
  // Price filter config
  minPrice?: number
  maxPrice?: number
  priceStep?: number
  currencySymbol?: string
  // Distance filter config
  minDistance?: number
  maxDistance?: number
  distanceStep?: number
  distanceUnit?: string
  // Initial values
  initialFilters?: any
}

const props = withDefaults(defineProps<FilterPanelProps>(), {
  modelValue: false,
  title: 'Filters',
  showCuisineFilter: true,
  showPriceFilter: true,
  showRatingFilter: true,
  showDistanceFilter: true,
  showDietaryFilter: true,
  showDeliveryFilter: true,
  showSortFilter: true,
  minPrice: 0,
  maxPrice: 100,
  priceStep: 5,
  currencySymbol: '$',
  minDistance: 1,
  maxDistance: 20,
  distanceStep: 1,
  distanceUnit: 'km'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  apply: [filters: any]
  clear: []
}>()

// Refs
const isOpen = ref(props.modelValue)

// Filter states
const selectedCuisines = ref<string[]>([])
const priceRange = ref([props.minPrice, props.maxPrice])
const selectedPriceLevel = ref<number | null>(null)
const selectedRating = ref<number | null>(null)
const distance = ref(10)
const selectedDietary = ref<string[]>([])
const selectedDeliveryOptions = ref<string[]>([])
const selectedSort = ref('relevance')

// Options
const cuisineOptions = [
  { label: 'Italian', value: 'italian' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'Indian', value: 'indian' },
  { label: 'American', value: 'american' },
  { label: 'Thai', value: 'thai' },
  { label: 'French', value: 'french' }
]

const priceOptions = [
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 }
]

const ratingOptions = [
  { label: '4.5+ Stars', value: 4.5 },
  { label: '4.0+ Stars', value: 4.0 },
  { label: '3.5+ Stars', value: 3.5 },
  { label: '3.0+ Stars', value: 3.0 }
]

const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian', icon: '🥗' },
  { label: 'Vegan', value: 'vegan', icon: '🌱' },
  { label: 'Halal', value: 'halal', icon: '☪️' },
  { label: 'Kosher', value: 'kosher', icon: '✡️' },
  { label: 'Gluten-Free', value: 'gluten-free', icon: '🌾' },
  { label: 'Dairy-Free', value: 'dairy-free', icon: '🥛' }
]

const deliveryOptions = [
  { label: 'Free Delivery', value: 'free-delivery' },
  { label: 'Under $5 Fee', value: 'low-fee' },
  { label: 'Fast Delivery', value: 'fast' },
  { label: 'Scheduled Delivery', value: 'scheduled' }
]

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Distance', value: 'distance' },
  { label: 'Rating', value: 'rating' },
  { label: 'Delivery Time', value: 'delivery-time' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' }
]

// Computed
const activeFilterCount = computed(() => {
  let count = 0

  if (selectedCuisines.value.length > 0) count++
  if (selectedPriceLevel.value !== null ||
      (priceRange.value[0] !== props.minPrice || priceRange.value[1] !== props.maxPrice)) count++
  if (selectedRating.value !== null) count++
  if (distance.value !== 10) count++
  if (selectedDietary.value.length > 0) count++
  if (selectedDeliveryOptions.value.length > 0) count++
  if (selectedSort.value !== 'relevance') count++

  return count
})

// Methods
const formatPrice = (value: number) => {
  return `${props.currencySymbol}${value}`
}

const toggleCuisine = (value: string) => {
  const index = selectedCuisines.value.indexOf(value)
  if (index > -1) {
    selectedCuisines.value.splice(index, 1)
  } else {
    selectedCuisines.value.push(value)
  }
}

const setPriceLevel = (level: number) => {
  selectedPriceLevel.value = selectedPriceLevel.value === level ? null : level

  // Update price range based on level
  if (selectedPriceLevel.value !== null) {
    const ranges = [
      [0, 25],
      [25, 50],
      [50, 75],
      [75, 100]
    ]
    priceRange.value = ranges[selectedPriceLevel.value - 1]
  }
}

const handleClearAll = () => {
  selectedCuisines.value = []
  priceRange.value = [props.minPrice, props.maxPrice]
  selectedPriceLevel.value = null
  selectedRating.value = null
  distance.value = 10
  selectedDietary.value = []
  selectedDeliveryOptions.value = []
  selectedSort.value = 'relevance'

  emit('clear')
}

const handleCancel = () => {
  isOpen.value = false
}

const handleApply = () => {
  const filters = {
    cuisines: selectedCuisines.value,
    priceRange: priceRange.value,
    priceLevel: selectedPriceLevel.value,
    rating: selectedRating.value,
    distance: distance.value,
    dietary: selectedDietary.value,
    deliveryOptions: selectedDeliveryOptions.value,
    sortBy: selectedSort.value
  }

  emit('apply', filters)
  isOpen.value = false
}

// Watch modelValue
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
})

// Load initial filters
watch(() => props.initialFilters, (filters) => {
  if (filters) {
    selectedCuisines.value = filters.cuisines || []
    priceRange.value = filters.priceRange || [props.minPrice, props.maxPrice]
    selectedPriceLevel.value = filters.priceLevel || null
    selectedRating.value = filters.rating || null
    distance.value = filters.distance || 10
    selectedDietary.value = filters.dietary || []
    selectedDeliveryOptions.value = filters.deliveryOptions || []
    selectedSort.value = filters.sortBy || 'relevance'
  }
}, { immediate: true })
</script>

<style scoped>
.filter-section-title {
  @apply text-base font-semibold text-gray-900 dark:text-white mb-4;
}

/* Range Slider Styling */
.range-slider {
  @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer;
}

.range-slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-primary-500 rounded-full cursor-pointer shadow-lg;
}

.range-slider::-moz-range-thumb {
  @apply w-5 h-5 bg-primary-500 rounded-full cursor-pointer shadow-lg border-0;
}

.range-slider::-webkit-slider-thumb:hover {
  @apply bg-primary-600;
}

.range-slider::-moz-range-thumb:hover {
  @apply bg-primary-600;
}
</style>
