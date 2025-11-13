<!--
  HeaderBar.vue
  Top navigation bar with menu button, location selector, and cart badge
-->
<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Left: Menu Button -->
        <button
          @click="emit('toggle-menu')"
          class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Center: Location Selector -->
        <LocationSelector />

        <!-- Right: Cart Button with Badge -->
        <router-link
          to="/cart"
          class="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label="Shopping Cart"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>

          <!-- Badge -->
          <span
            v-if="cartItemCount > 0"
            class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ cartItemCount > 99 ? '99+' : cartItemCount }}
          </span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LocationSelector from './LocationSelector.vue'

// Props
interface Props {
  cartItemCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  cartItemCount: 0
})

// Emits
const emit = defineEmits<{
  (e: 'toggle-menu'): void
}>()
</script>
