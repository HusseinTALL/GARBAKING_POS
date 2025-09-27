<!--
  Cart Section Component
  Cart items list with empty state and cart management
-->
<template>
  <div class="cart-section">
    <div class="cart-header">
      <h3 class="cart-title">Total Items ({{ cartItemCount }})</h3>
      <div class="cart-actions" v-if="cartItems.length > 0">
        <button class="bulk-action-btn save-btn" @click="$emit('saveCart')" title="Save for later">
          <Bookmark class="w-4 h-4" />
        </button>
        <button class="bulk-action-btn clear-btn" @click="showClearConfirm = true" title="Clear all items">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="cart-items">
      <!-- Empty Cart State -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <ShoppingBag class="w-12 h-12 text-gray-300" />
        <p>Your cart is empty</p>
        <span>Add items to get started</span>
      </div>

      <!-- Cart Items -->
      <div v-else>
        <div class="bulk-operations" v-if="cartItems.length > 1">
          <div class="bulk-select">
            <input
              type="checkbox"
              id="select-all"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="bulk-checkbox"
            />
            <label for="select-all" class="bulk-label">Select all items</label>
          </div>
          <div class="bulk-buttons" v-if="selectedItems.length > 0">
            <button class="bulk-btn remove-selected" @click="removeSelectedItems">
              <Trash2 class="w-3 h-3" />
              Remove ({{ selectedItems.length }})
            </button>
          </div>
        </div>

        <CartItem
          v-for="item in cartItems"
          :key="item.cartId"
          :item="item"
          :is-selected="selectedItems.includes(item.cartId)"
          :show-checkbox="cartItems.length > 1"
          @remove-from-cart="$emit('removeFromCart', $event)"
          @toggle-select="toggleItemSelection"
        />
      </div>
    </div>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="confirmation-modal" @click.stop>
        <div class="modal-header">
          <AlertTriangle class="w-5 h-5 text-amber-500" />
          <h4>Clear Cart</h4>
        </div>
        <p class="modal-message">Are you sure you want to clear all {{ cartItemCount }} items from your cart?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel-btn" @click="showClearConfirm = false">Cancel</button>
          <button class="modal-btn confirm-btn" @click="confirmClearCart">Clear All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShoppingBag, Bookmark, Trash2, AlertTriangle } from 'lucide-vue-next'
import CartItem from './CartItem.vue'

interface CartItemType {
  cartId: string
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Props {
  cartItems: CartItemType[]
  cartItemCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  removeFromCart: [item: CartItemType]
  clearCart: []
  saveCart: []
  removeMultiple: [itemIds: string[]]
}>()

const showClearConfirm = ref(false)
const selectedItems = ref<string[]>([])

const allSelected = computed(() => {
  return selectedItems.value.length === props.cartItems.length && props.cartItems.length > 0
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = props.cartItems.map(item => item.cartId)
  }
}

const toggleItemSelection = (cartId: string) => {
  const index = selectedItems.value.indexOf(cartId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(cartId)
  }
}

const removeSelectedItems = () => {
  emit('removeMultiple', selectedItems.value)
  selectedItems.value = []
}

const confirmClearCart = () => {
  emit('clearCart')
  showClearConfirm.value = false
  selectedItems.value = []
}
</script>

<style scoped>
.cart-section {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  min-height: 0;
  position: relative;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.cart-actions {
  display: flex;
  gap: 8px;
}

.bulk-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, border-color, transform;
  transform: translate3d(0, 0, 0);
}

.bulk-action-btn:hover {
  transform: translate3d(0, -1px, 0);
}

.save-btn {
  color: #059669;
}

.save-btn:hover {
  background: #ecfdf5;
  border-color: #059669;
}

.clear-btn {
  color: #dc2626;
}

.clear-btn:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-cart p {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin-top: 12px;
}

.empty-cart span {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.bulk-operations {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
  cursor: pointer;
}

.bulk-checkbox:checked {
  background: #5b63d3;
  border-color: #5b63d3;
}

.bulk-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.remove-selected {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.remove-selected:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  margin: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-message {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cancel-btn {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.confirm-btn {
  background: #dc2626;
  color: white;
}

.confirm-btn:hover {
  background: #b91c1c;
}
</style>