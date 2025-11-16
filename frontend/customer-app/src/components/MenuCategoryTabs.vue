<!--
  MenuCategoryTabs.vue
  Horizontal scrolling tabs for menu categories
-->

<template>
  <div class="px-4 py-3">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      <button
        v-for="category in categories"
        :key="category"
        @click="emit('select', category)"
        class="flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all capitalize"
        :class="[
          selectedCategory === category
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ category }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  categories: string[]
  selectedCategory: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'select', category: string): void
}>()
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
