<!--
  Enhanced Cart Item Component
  Individual cart item with image, details, quantity controls and actions
-->
<template>
  <div class="cart-item" :class="{ selected: isSelected }">
    <div class="item-checkbox" v-if="showCheckbox">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="$emit('toggleSelect', item.cartId)"
        class="checkbox-input"
      />
    </div>

    <div class="item-image-container">
      <img
        :src="item.image || 'https://via.placeholder.com/70x70'"
        :alt="item.name"
        class="cart-item-image"
      />
      <div class="quantity-badge">{{ item.quantity }}</div>
    </div>

    <div class="cart-item-details">
      <div class="item-header">
        <h4 class="item-name">{{ item.name }}</h4>
        <span class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</span>
      </div>

      <div class="item-info">
        <span class="item-price">${{ item.price.toFixed(2) }} each</span>
        <div class="quantity-controls">
          <button
            @click="$emit('updateQuantity', item, item.quantity - 1)"
            class="qty-btn decrease"
            :disabled="item.quantity <= 1"
          >
            <Minus class="w-3 h-3" />
          </button>
          <span class="qty-display">{{ item.quantity }}</span>
          <button
            @click="$emit('updateQuantity', item, item.quantity + 1)"
            class="qty-btn increase"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>
      </div>

      <div class="item-actions" v-if="showActions">
        <button class="action-btn add-note" @click="$emit('addNote', item)">
          <MessageSquare class="w-3 h-3" />
          Note
        </button>
      </div>
    </div>

    <button
      @click="$emit('removeFromCart', item)"
      class="cart-item-remove"
      title="Remove item"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus, X, MessageSquare } from 'lucide-vue-next'

interface CartItem {
  cartId: string
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Props {
  item: CartItem
  showActions?: boolean
  showCheckbox?: boolean
  isSelected?: boolean
}

withDefaults(defineProps<Props>(), {
  showActions: true,
  showCheckbox: false,
  isSelected: false
})

defineEmits<{
  removeFromCart: [item: CartItem]
  updateQuantity: [item: CartItem, quantity: number]
  addNote: [item: CartItem]
  toggleSelect: [cartId: string]
}>()
</script>

<style scoped>
.cart-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  align-items: flex-start;
  transition: box-shadow 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: box-shadow;
  transform: translate3d(0, 0, 0);
  position: relative;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.cart-item.selected {
  border-color: #5b63d3;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(91, 99, 211, 0.15);
}

.item-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
  cursor: pointer;
  appearance: none;
  position: relative;
  background: white;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.checkbox-input:checked {
  background: #5b63d3;
  border-color: #5b63d3;
}

.checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.item-image-container {
  position: relative;
  flex-shrink: 0;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #f3f4f6;
}

.quantity-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #5b63d3;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  margin: 0;
}

.item-total {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
  white-space: nowrap;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-price {
  font-size: 13px;
  color: #6b7280;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, transform;
  transform: translate3d(0, 0, 0);
}

.qty-btn.decrease {
  background: #fee2e2;
  color: #dc2626;
}

.qty-btn.decrease:hover:not(:disabled) {
  background: #fecaca;
  transform: translate3d(0, -1px, 0);
}

.qty-btn.decrease:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.qty-btn.increase {
  background: #dcfce7;
  color: #16a34a;
}

.qty-btn.increase:hover {
  background: #bbf7d0;
  transform: translate3d(0, -1px, 0);
}

.qty-display {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  min-width: 20px;
  text-align: center;
}

.item-actions {
  margin-top: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, border-color;
  transform: translate3d(0, 0, 0);
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.cart-item-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, transform;
  transform: translate3d(0, 0, 0);
}

.cart-item-remove:hover {
  background: #fee2e2;
  transform: translate3d(0, -1px, 0);
}
</style>