<!--
  Category Tabs Component
  Category filter tabs for menu items (All Menu, Meals, Soups, etc.)
-->
<template>
  <div class="category-tabs">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="$emit('categoryChange', category.id)"
      :class="['category-tab', { active: selectedCategory === category.id }]"
    >
      <component :is="category.icon" class="category-icon" />
      <span>{{ category.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  icon: any
}

interface Props {
  categories: Category[]
  selectedCategory: string
}

defineProps<Props>()

defineEmits<{
  categoryChange: [categoryId: string]
}>()
</script>

<style scoped>
/* Category Tabs */
.category-tabs {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  border-bottom: 1px solid #e5e7eb;
}

.category-tabs::-webkit-scrollbar {
  height: 4px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, border-color;
  white-space: nowrap;
  transform: translate3d(0, 0, 0);
}

.category-tab:hover {
  background: #f9fafb;
}

.category-tab.active {
  background: #5b63d3;
  border-color: #5b63d3;
  color: white;
}

.category-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-tabs {
    padding: 12px;
  }
}
</style>