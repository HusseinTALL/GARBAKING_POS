<!--
  Menu Item Component
  Individual menu item card with image, details, and add/quantity controls
-->
<template>
  <div class="menu-item-card">
    <div class="item-image">
      <img
        :src="item.image || 'https://via.placeholder.com/300x200'"
        :alt="item.name"
      />
      <div class="item-badge" v-if="item.isNew">New</div>
    </div>

    <div class="item-details">
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-price">${{ item.price.toFixed(2) }}</p>

      <div class="item-actions">
        <button
          v-if="quantity === 0"
          @click="handleAddToCart"
          class="add-btn"
        >
          Choose
          <CheckCircle class="w-4 h-4 ml-1" />
        </button>

        <QuantityControl
          v-else
          :quantity="quantity"
          @quantity-change="handleQuantityChange"
        />

        <button v-if="quantity > 0" class="item-add-note" @click="handleAddNote">
          Add Item
          <CirclePlus class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, CirclePlus } from 'lucide-vue-next'
import QuantityControl from './QuantityControl.vue'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image?: string
  isNew?: boolean
}

interface Props {
  item: MenuItem
  quantity: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addToCart: [item: MenuItem]
  quantityChange: [item: MenuItem, newQuantity: number]
  addNote: [item: MenuItem]
}>()

const handleAddToCart = () => {
  emit('addToCart', props.item)
}

const handleQuantityChange = (newQuantity: number) => {
  emit('quantityChange', props.item, newQuantity)
}

const handleAddNote = () => {
  emit('addNote', props.item)
}
</script>

<style scoped>
.menu-item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: box-shadow, transform;
  transform: translate3d(0, 0, 0);
}

.menu-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translate3d(0, -2px, 0);
}

.item-image {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.item-details {
  padding: 16px;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.item-price {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 12px;
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #5b63d3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, transform;
  transform: translate3d(0, 0, 0);
}

.add-btn:hover {
  background: #4c51bf;
  transform: translate3d(0, -1px, 0);
}

.add-btn:active {
  transform: translate3d(0, 0, 0);
}

.item-add-note {
  margin-left: auto;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color;
  transform: translate3d(0, 0, 0);
}

.item-add-note:hover {
  background: #f9fafb;
}
</style>