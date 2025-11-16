<!--
  CategoryCard.vue
  Large category card with icon and gradient background, used in grid layout
-->
<template>
  <button
    @click="handleClick"
    class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    :style="{ backgroundColor: category.color }"
  >
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
    </div>

    <!-- Content -->
    <div class="relative p-6">
      <!-- Icon -->
      <div class="mb-4">
        <span class="text-5xl filter drop-shadow-lg">{{ category.icon }}</span>
      </div>

      <!-- Name -->
      <h3 class="text-xl font-bold text-white mb-1">{{ category.name }}</h3>

      <!-- Count -->
      <p v-if="category.count" class="text-sm text-white/90">
        {{ category.count }} {{ category.count === 1 ? 'item' : 'items' }}
      </p>

      <!-- Arrow Icon -->
      <div class="absolute bottom-4 right-4">
        <svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- Shine Effect on Hover -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-all duration-700 translate-x-full hover:translate-x-[-200%]"></div>
  </button>
</template>

<script setup lang="ts">
import type { Category } from '@/stores/category'

// Props
interface Props {
  category: Category
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'click', category: Category): void
}>()

const handleClick = () => {
  emit('click', props.category)
}
</script>
