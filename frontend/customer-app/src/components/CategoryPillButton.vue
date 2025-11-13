<!--
  CategoryPillButton.vue
  Pill-shaped category button with icon, used in horizontal scrolling row
-->
<template>
  <button
    @click="handleClick"
    class="flex-shrink-0 px-4 py-2.5 rounded-full font-medium transition-all flex items-center space-x-2 shadow-sm"
    :class="[
      isActive
        ? 'bg-orange-500 text-white shadow-orange-200'
        : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
    ]"
  >
    <!-- Icon (Emoji) -->
    <span class="text-xl" :class="{ 'filter brightness-200': isActive }">
      {{ category.icon }}
    </span>

    <!-- Name -->
    <span class="whitespace-nowrap text-sm">{{ category.name }}</span>

    <!-- Count Badge (Optional) -->
    <span
      v-if="showCount && category.count"
      class="text-xs px-1.5 py-0.5 rounded-full"
      :class="[
        isActive
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 text-gray-600'
      ]"
    >
      {{ category.count }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Category } from '@/stores/category'

// Props
interface Props {
  category: Category
  isActive?: boolean
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  showCount: false
})

// Emits
const emit = defineEmits<{
  (e: 'click', category: Category): void
}>()

const handleClick = () => {
  emit('click', props.category)
}
</script>
