<!--
  RestaurantCard Component
  Enhanced restaurant card with image, name, rating, delivery info, favorite button, and tags
-->

<template>
  <div
    class="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl shadow-md"
    @click="handleClick"
  >
    <!-- Restaurant Image -->
    <div class="relative h-[160px] w-full overflow-hidden">
      <img
        :src="imageUrl"
        :alt="name"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        loading="lazy"
      />

      <!-- Favorite Button -->
      <button
        @click.stop="handleFavoriteClick"
        class="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg class="w-5 h-5 transition-colors" :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Status Badge (Open/Closed) -->
      <div
        v-if="!isOpen"
        class="absolute inset-0 bg-black/40 flex items-center justify-center"
      >
        <span class="bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-900">
          Closed
        </span>
      </div>

      <!-- Badge/Tag (Optional - Featured, New, etc.) -->
      <div
        v-if="badge"
        class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase"
      >
        {{ badge }}
      </div>

      <!-- Multiple Tags -->
      <div v-if="tagsList && tagsList.length > 0" class="absolute bottom-3 left-3 flex gap-2">
        <span
          v-for="tag in tagsList.slice(0, 2)"
          :key="tag"
          class="bg-white/90 text-gray-900 text-xs font-medium px-2 py-1 rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Restaurant Info -->
    <div class="p-4">
      <!-- Restaurant Name -->
      <h3 class="text-lg font-bold text-gray-900 mb-1 truncate">
        {{ name }}
      </h3>

      <!-- Tags/Categories -->
      <p class="text-sm text-gray-500 mb-3 truncate">
        {{ tags }}
      </p>

      <!-- Info Row: Rating, Reviews, Delivery Time, Fee -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Rating with Reviews -->
          <div v-if="rating" class="flex items-center gap-1">
            <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-sm font-bold text-gray-900">{{ rating.toFixed(1) }}</span>
            <span v-if="reviewCount" class="text-xs text-gray-400">({{ reviewCount }})</span>
          </div>

          <!-- Delivery Time -->
          <div v-if="deliveryTime" class="flex items-center gap-1">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs text-gray-600">{{ deliveryTime }}</span>
          </div>
        </div>

        <!-- Delivery Fee or Distance -->
        <div class="flex items-center gap-2">
          <span v-if="deliveryFee === 0" class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            Free
          </span>
          <span v-else-if="deliveryFee" class="text-xs text-gray-600">
            ${{ deliveryFee.toFixed(2) }}
          </span>
          <span v-if="distance" class="text-xs text-gray-400">
            • {{ distance }}
          </span>
        </div>
      </div>

      <!-- Price Range Indicator -->
      <div v-if="priceRange" class="mt-2 flex items-center gap-1">
        <span
          v-for="n in 4"
          :key="n"
          class="text-sm"
          :class="n <= priceRange ? 'text-orange-500' : 'text-gray-300'"
        >
          $
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface RestaurantCardProps {
  id: number | string
  name: string
  imageUrl: string
  tags: string // e.g., "Burger, Chicken, Rice, Wings"
  tagsList?: string[] // Array of tags for badges
  rating?: number
  reviewCount?: number
  deliveryTime?: string // e.g., "25-30 min"
  deliveryFee?: number
  distance?: string // e.g., "1.2 km"
  badge?: string // Featured, New, Popular
  isOpen?: boolean
  isFavorite?: boolean
  priceRange?: number // 1-4 ($, $$, $$$, $$$$)
}

const props = withDefaults(defineProps<RestaurantCardProps>(), {
  isOpen: true,
  isFavorite: false
})

const emit = defineEmits<{
  click: [id: number | string]
  'toggle-favorite': [id: number | string]
}>()

// Handlers
const handleClick = () => {
  emit('click', props.id)
}

const handleFavoriteClick = () => {
  emit('toggle-favorite', props.id)
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
