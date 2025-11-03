<!--
  Premium menu item card with enhanced design
  Features: hover effects, favorite button, rating badge, smooth animations
-->

<template>
  <div
    @click="$emit('view-detail', item)"
    class="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden cursor-pointer relative"
  >
    <!-- Favorite Button -->
    <button
      @click.stop="toggleFavorite"
      class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200"
      :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    >
      <svg 
        class="w-5 h-5 transition-all duration-200" 
        :class="isFavorite ? 'text-danger-500 fill-current' : 'text-gray-400'"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>

    <!-- Product Image with Overlay -->
    <div class="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      <!-- Gradient Overlay on hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <!-- Rating Badge -->
      <div class="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
        <svg class="w-4 h-4 text-warning-500 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <span class="text-sm font-semibold text-gray-900">{{ rating }}</span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Category Badge -->
      <div class="mb-2">
        <span class="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
          {{ getCategoryName(item) }}
        </span>
      </div>

      <!-- Name -->
      <h3 class="font-bold text-text-DEFAULT text-base mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
        {{ item.name }}
      </h3>

      <!-- Description (if available) -->
      <p v-if="item.description" class="text-xs text-text-tertiary mb-3 line-clamp-1">
        {{ item.description }}
      </p>

      <!-- Bottom Section -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <!-- Left: Price & Meta -->
        <div>
          <div class="text-xl font-bold text-text-DEFAULT mb-1">
            {{ formatPrice(item.price) }}
          </div>
          <div class="flex items-center gap-3 text-xs text-text-secondary">
            <!-- Calories -->
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">{{ calories }}</span>
            </span>

            <!-- Time -->
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-medium">{{ prepTime }}</span>
            </span>
          </div>
        </div>

        <!-- Right: Add Button -->
        <button
          @click.stop="handleAddToCart"
          class="relative w-11 h-11 rounded-2xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all duration-200 shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40"
          :aria-label="'Add ' + item.name + ' to cart'"
        >
          <svg 
            class="w-5 h-5 transition-transform group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          
          <!-- Ripple effect -->
          <span class="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '@/services/mockApi'
import { formatCurrency } from '@/utils/currency'

interface Props {
  item: MenuItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-to-cart': [item: MenuItem]
  'view-detail': [item: MenuItem]
}>()

// State
const isFavorite = ref(false)

// Computed
const rating = computed(() => props.item.rating || 4.8)
const calories = computed(() => props.item.calories || 44)
const prepTime = computed(() => props.item.prepTime || '20 min')

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const getCategoryName = (item: MenuItem): string => {
  if (typeof item.category === 'string') return item.category
  return item.category?.name || 'Food'
}

const handleAddToCart = () => {
  emit('add-to-cart', props.item)
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // Here you would typically call a store action to save the favorite
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>