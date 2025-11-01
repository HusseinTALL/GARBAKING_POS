<!--
  Modern minimal menu item card
  Clean white design with product photo, price, and add button
-->

<template>
  <div
    @click="$emit('view-detail', item)"
    class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
  >
    <!-- Product Image -->
    <div class="relative aspect-square bg-gray-50 overflow-hidden">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Name -->
      <h3 class="font-semibold text-text-DEFAULT text-base mb-2 line-clamp-2 leading-tight">
        {{ item.name }}
      </h3>

      <!-- Price -->
      <div class="text-lg font-bold text-text-DEFAULT mb-3">
        {{ formatPrice(item.price) }}
      </div>

      <!-- Meta Info & Add Button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 text-xs text-text-secondary">
          <!-- Calories -->
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
            </svg>
            44
          </span>

          <!-- Time -->
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            20 min
          </span>
        </div>

        <!-- Add Button -->
        <button
          @click.stop="handleAddToCart"
          class="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-sm"
          :aria-label="'Add ' + item.name + ' to cart'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/services/mockApi'
import { formatCurrency } from '@/utils/currency'

// Props
interface Props {
  item: MenuItem
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'add-to-cart': [item: MenuItem]
  'view-detail': [item: MenuItem]
}>()

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const handleAddToCart = () => {
  emit('add-to-cart', props.item)
}
</script>

<style scoped>
/* Text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
