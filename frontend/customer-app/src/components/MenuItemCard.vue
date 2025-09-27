<!--
  Menu item card component for the PWA ordering system
  Displays menu items with add to cart functionality and accessibility support
-->

<template>
  <div class="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
    <!-- Image section -->
    <div class="relative aspect-square bg-gray-100">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
        :aria-label="item.name"
      />

      <!-- Dietary tags overlay -->
      <div v-if="item.tags && item.tags.length > 0" class="absolute top-2 left-2 flex flex-wrap gap-1">
        <span
          v-for="tag in item.tags"
          :key="tag"
          class="px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full backdrop-blur-sm"
        >
          {{ $t(`dietary_tags.${tag.replace('-', '_')}`) }}
        </span>
      </div>
    </div>

    <!-- Content section -->
    <div class="p-4">
      <!-- Category badge -->
      <div class="mb-2">
        <span class="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg">
          {{ $t(`categories.${item.category.toLowerCase()}`) }}
        </span>
      </div>

      <!-- Item name -->
      <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
        {{ item.name }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ item.description }}
      </p>

      <!-- Price and action -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-2xl font-bold text-orange-600">
            {{ formatPrice(item.price) }}
          </span>
          <span class="text-xs text-gray-400">
            {{ item.sku }}
          </span>
        </div>

        <button
          @click="handleAddToCart"
          :aria-label="$t('add_to_cart') + ' ' + item.name"
          class="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm min-w-[48px] min-h-[48px] flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MenuItem } from '@/services/mockApi'

// Props
interface Props {
  item: MenuItem
}

const props = defineProps<Props>()

// Composables
const { t } = useI18n()

// Emits
const emit = defineEmits<{
  'add-to-cart': [item: MenuItem]
}>()

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const handleAddToCart = () => {
  emit('add-to-cart', props.item)
}
</script>

<style scoped>
/* Text truncation utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card shadow utilities */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.shadow-card-hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Touch interactions */
@media (hover: none) and (pointer: coarse) {
  .hover\:scale-105:hover {
    transform: none;
  }

  .active\:scale-95:active {
    transform: scale(0.95);
  }
}
</style>