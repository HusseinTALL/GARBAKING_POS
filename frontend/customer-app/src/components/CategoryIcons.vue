<!--
  Category icons component
  Horizontal scrollable row of circular category badges
-->

<template>
  <div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
    <div class="flex gap-4 py-2">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="$emit('select', category.id)"
        :class="[
          'flex flex-col items-center flex-shrink-0 transition-all',
          selectedCategory === category.id ? 'scale-105' : ''
        ]"
      >
        <div
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all shadow-sm',
            selectedCategory === category.id
              ? 'bg-primary-500 shadow-md'
              : 'bg-gray-100'
          ]"
        >
          {{ category.emoji }}
        </div>
        <span
          :class="[
            'text-xs font-medium transition-colors',
            selectedCategory === category.id ? 'text-text-DEFAULT' : 'text-text-secondary'
          ]"
        >
          {{ category.name }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  emoji: string
}

interface Props {
  categories: Category[]
  selectedCategory: string
}

defineProps<Props>()

defineEmits<{
  'select': [categoryId: string]
}>()
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
