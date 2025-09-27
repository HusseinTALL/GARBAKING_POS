<!--
  Menu Grid Component
  Container for displaying menu items in grid or list view
-->
<template>
  <div :class="['menu-grid', viewMode]">
    <MenuItem
      v-for="item in menuItems"
      :key="item.id"
      :item="item"
      :quantity="getItemQuantity(item.id)"
      @add-to-cart="$emit('addToCart', $event)"
      @quantity-change="$emit('quantityChange', $event, $event)"
      @add-note="$emit('addNote', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import MenuItem from './MenuItem.vue'

interface MenuItemType {
  id: string
  name: string
  price: number
  category: string
  image?: string
  isNew?: boolean
}

interface CartItem {
  id: string
  quantity: number
}

interface Props {
  menuItems: MenuItemType[]
  viewMode: 'grid' | 'list'
  cartItems: CartItem[]
}

const props = defineProps<Props>()

defineEmits<{
  addToCart: [item: MenuItemType]
  quantityChange: [item: MenuItemType, quantity: number]
  addNote: [item: MenuItemType]
}>()

const getItemQuantity = (itemId: string): number => {
  const cartItem = props.cartItems.find(item => item.id === itemId)
  return cartItem?.quantity || 0
}
</script>

<style scoped>
/* Menu Grid */
.menu-grid {
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.menu-grid.list {
  grid-template-columns: 1fr;
}

/* Responsive Design */
@media (max-width: 1280px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .menu-grid {
    padding: 12px;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>