<!--
  RestaurantHeader.vue
  Restaurant hero header with image gallery and favorite button
-->

<template>
  <div class="relative">
    <!-- Hero Image with Gallery -->
    <div class="relative h-64 bg-gray-200 overflow-hidden">
      <img
        :src="currentImage"
        :alt="restaurant.name"
        class="w-full h-full object-cover"
      />

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

      <!-- Back Button -->
      <button
        @click="emit('back')"
        class="absolute top-4 left-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
      >
        <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Favorite Button -->
      <button
        @click="emit('toggle-favorite', restaurant.id)"
        class="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
      >
        <svg
          class="w-6 h-6 transition-colors"
          :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-900'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Status Badge -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2">
        <div
          v-if="!restaurant.isOpen"
          class="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg"
        >
          Closed Now
        </div>
        <div
          v-else
          class="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg"
        >
          Open Now
        </div>
      </div>

      <!-- Image Gallery Dots (if multiple images) -->
      <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          v-for="(img, index) in images"
          :key="index"
          @click="currentImageIndex = index"
          class="w-2 h-2 rounded-full transition-all"
          :class="currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'"
        ></button>
      </div>

      <!-- Share Button -->
      <button
        @click="handleShare"
        class="absolute bottom-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
      >
        <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>

    <!-- Logo (if available) -->
    <div v-if="restaurant.logo" class="absolute -bottom-12 left-4 z-10">
      <div class="w-24 h-24 bg-white rounded-2xl shadow-xl p-2 border-4 border-white">
        <img
          :src="restaurant.logo"
          :alt="`${restaurant.name} logo`"
          class="w-full h-full object-contain rounded-xl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Restaurant } from '@/stores/restaurant'

// Props
interface Props {
  restaurant: Restaurant
  isFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false
})

// Emits
const emit = defineEmits<{
  (e: 'toggle-favorite', id: string): void
  (e: 'back'): void
}>()

// State
const currentImageIndex = ref(0)

// Computed
const images = computed(() => {
  // Return array of images (main image + additional gallery images if available)
  return [props.restaurant.image]
})

const currentImage = computed(() => images.value[currentImageIndex.value])

// Methods
const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.restaurant.name,
        text: props.restaurant.description,
        url: window.location.href
      })
    } catch (error) {
      console.log('Share cancelled or failed:', error)
    }
  } else {
    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }
}
</script>
