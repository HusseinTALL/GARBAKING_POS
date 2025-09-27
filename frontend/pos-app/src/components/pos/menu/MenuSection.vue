<!--
  Menu Section Component
  Main menu container combining header, category tabs, and menu grid
-->
<template>
  <div class="menu-section">
    <MenuHeader
      :item-count="filteredMenuItems.length"
      :search-query="searchQuery"
      :view-mode="viewMode"
      @search-change="$emit('searchChange', $event)"
      @view-mode-change="$emit('viewModeChange', $event)"
    />

    <CategoryTabs
      :categories="categories"
      :selected-category="selectedCategory"
      @category-change="$emit('categoryChange', $event)"
    />

    <MenuGrid
      :menu-items="filteredMenuItems"
      :view-mode="viewMode"
      :cart-items="cartItems"
      @add-to-cart="$emit('addToCart', $event)"
      @quantity-change="$emit('quantityChange', $event.item, $event.quantity)"
      @add-note="$emit('addNote', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import MenuHeader from './MenuHeader.vue'
import CategoryTabs from './CategoryTabs.vue'
import MenuGrid from './MenuGrid.vue'

interface MenuItemType {
  id: string
  name: string
  price: number
  category: string
  image?: string
  isNew?: boolean
}

interface Category {
  id: string
  name: string
  icon: any
}

interface CartItem {
  id: string
  quantity: number
}

interface Props {
  filteredMenuItems: MenuItemType[]
  categories: Category[]
  selectedCategory: string
  searchQuery: string
  viewMode: 'grid' | 'list'
  cartItems: CartItem[]
}

defineProps<Props>()

defineEmits<{
  searchChange: [query: string]
  viewModeChange: [mode: 'grid' | 'list']
  categoryChange: [categoryId: string]
  addToCart: [item: MenuItemType]
  quantityChange: [item: MenuItemType, quantity: number]
  addNote: [item: MenuItemType]
}>()
</script>

<style scoped>
/* Menu Section */
.menu-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}
</style>