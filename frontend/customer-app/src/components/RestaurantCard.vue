<!--
  RestaurantCard Component
  Restaurant card matching Figma design specifications
  Displays restaurant with image, name, tags, rating, delivery info
-->

<template>
  <div
    class="bg-white rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-floating"
    @click="handleClick"
  >
    <!-- Restaurant Image -->
    <div class="relative h-[140px] w-full overflow-hidden">
      <img
        :src="imageUrl"
        :alt="name"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <!-- Badge (Optional) -->
      <div
        v-if="badge"
        class="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded uppercase"
      >
        {{ badge }}
      </div>
    </div>

    <!-- Restaurant Info -->
    <div class="p-4">
      <!-- Restaurant Name -->
      <h3 class="text-2xl font-normal text-text capitalize mb-1">
        {{ name }}
      </h3>

      <!-- Tags/Categories -->
      <p class="text-base text-text-tertiary capitalize mb-3">
        {{ tags }}
      </p>

      <!-- Info Row: Rating, Delivery, Time -->
      <div class="flex items-center gap-4">
        <!-- Rating -->
        <div v-if="rating" class="flex items-center gap-1">
          <svg class="w-5 h-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="text-lg font-bold text-text">{{ rating }}</span>
        </div>

        <!-- Free Delivery -->
        <div v-if="freeDelivery" class="flex items-center gap-1">
          <svg class="w-[23px] h-4" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8h16M18 8l-2-2m2 2l-2 2" stroke="#FF7622" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-base text-text">{{ $t('free') || 'Free' }}</span>
        </div>

        <!-- Delivery Time -->
        <div v-if="deliveryTime" class="flex items-center gap-1">
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" stroke="#FF7622" stroke-width="2"/>
            <path d="M10 5v5l3 3" stroke="#FF7622" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="text-base text-text">{{ deliveryTime }} {{ $t('min') || 'min' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

export interface RestaurantCardProps {
  id: number | string
  name: string
  imageUrl: string
  tags: string // e.g., "Burger - Chicken - Rice - Wings"
  rating?: number
  freeDelivery?: boolean
  deliveryTime?: number // in minutes
  badge?: string
}

const props = withDefaults(defineProps<RestaurantCardProps>(), {
  freeDelivery: false
})

const emit = defineEmits<{
  click: [id: number | string]
}>()

const { t } = useI18n()

// Handlers
const handleClick = () => {
  emit('click', props.id)
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
