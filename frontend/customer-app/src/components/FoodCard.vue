<!--
  FoodCard Component
  Product card matching Figma design specifications
  Displays food items with image, name, description, price, and add button
-->

<template>
  <div
    class="relative bg-white rounded-3xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-floating cursor-pointer"
    :class="{ 'w-full': fullWidth, 'w-[153px]': !fullWidth }"
    @click="handleClick"
  >
    <!-- Food Image -->
    <div class="relative" :class="imageContainerClass">
      <img
        :src="imageUrl"
        :alt="name"
        class="w-full h-full object-cover"
        :class="imageClass"
        loading="lazy"
      />

      <!-- Badge (Optional - for promotions, new items, etc.) -->
      <div
        v-if="badge"
        class="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase"
      >
        {{ badge }}
      </div>

      <!-- Favorite Button (Optional) -->
      <button
        v-if="showFavorite"
        class="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        @click.stop="toggleFavorite"
      >
        <svg
          class="w-4 h-4"
          :class="isFavorite ? 'text-danger-500 fill-current' : 'text-gray-400'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
      </button>
    </div>

    <!-- Food Info -->
    <div class="p-3">
      <!-- Name -->
      <h3 class="font-bold text-md text-text mb-1 capitalize truncate">
        {{ name }}
      </h3>

      <!-- Restaurant/Description -->
      <p v-if="restaurant || description" class="text-sm text-text-secondary mb-2 capitalize truncate">
        {{ restaurant || description }}
      </p>

      <!-- Price and Add Button -->
      <div class="flex items-center justify-between">
        <!-- Starting Price Label + Price -->
        <div class="flex flex-col">
          <span v-if="showStartingLabel" class="text-xs text-text-secondary capitalize">
            {{ $t('starting') || 'Starting' }}
          </span>
          <span class="text-lg font-bold text-text">
            {{ formatPrice(price) }}
          </span>
        </div>

        <!-- Add to Cart Button -->
        <button
          class="w-[30px] h-[30px] bg-accent-500 rounded-full flex items-center justify-center text-white hover:bg-accent-600 transition-colors active:scale-95"
          @click.stop="handleAddToCart"
        >
          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Rating (Optional) -->
      <div v-if="rating" class="flex items-center mt-2 gap-1">
        <svg class="w-3.5 h-3.5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span class="text-xs font-semibold text-text">{{ rating }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface FoodCardProps {
  id: number | string
  name: string
  imageUrl: string
  price: number
  restaurant?: string
  description?: string
  rating?: number
  badge?: string
  isFavorite?: boolean
  showFavorite?: boolean
  showStartingLabel?: boolean
  fullWidth?: boolean
  imageHeight?: string
}

const props = withDefaults(defineProps<FoodCardProps>(), {
  isFavorite: false,
  showFavorite: true,
  showStartingLabel: false,
  fullWidth: false,
  imageHeight: 'h-[84px]'
})

const emit = defineEmits<{
  click: [id: number | string]
  addToCart: [id: number | string]
  toggleFavorite: [id: number | string]
}>()

const { t } = useI18n()

// Computed classes
const imageContainerClass = ref(`${props.imageHeight} overflow-hidden`)
const imageClass = ref('rounded-xl')

// Format price
const formatPrice = (price: number): string => {
  return `$${price}`
}

// Handlers
const handleClick = () => {
  emit('click', props.id)
}

const handleAddToCart = () => {
  emit('addToCart', props.id)
}

const toggleFavorite = () => {
  emit('toggleFavorite', props.id)
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
