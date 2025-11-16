<!--
  MenuItem.vue
  Menu item card with image, name, description, price, and add button
-->

<template>
  <div
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex"
    @click="handleClick"
  >
    <!-- Item Image -->
    <div class="w-28 h-28 flex-shrink-0 bg-gray-200 overflow-hidden">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Item Info -->
    <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
      <div class="flex-1">
        <!-- Name and Badge -->
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3 class="font-semibold text-gray-900 text-base truncate">
            {{ item.name }}
          </h3>
          <span
            v-if="item.badge"
            class="flex-shrink-0 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full uppercase"
          >
            {{ item.badge }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 line-clamp-2 mb-2">
          {{ item.description }}
        </p>

        <!-- Tags (if available) -->
        <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
          <span
            v-for="tag in item.tags.slice(0, 3)"
            :key="tag"
            class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Price and Add Button -->
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold text-gray-900">
            ${{ item.price.toFixed(2) }}
          </span>
          <span
            v-if="item.originalPrice && item.originalPrice > item.price"
            class="text-sm text-gray-400 line-through"
          >
            ${{ item.originalPrice.toFixed(2) }}
          </span>
        </div>

        <!-- Add Button -->
        <button
          @click.stop="handleAddClick"
          class="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <!-- Customizable Indicator -->
      <div v-if="item.customizable" class="mt-2">
        <span class="text-xs text-orange-500 font-medium flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Customizable
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  item: {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number
    image?: string
    badge?: string
    tags?: string[]
    customizable?: boolean
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'click', item: any): void
  (e: 'add-to-cart', item: any): void
}>()

// Methods
const handleClick = () => {
  emit('click', props.item)
}

const handleAddClick = () => {
  emit('add-to-cart', props.item)
}
</script>
