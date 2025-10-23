<!--
  CartPanel Component
  Displays current order items with quantity controls and order summary
  Based on Order Management screen design (Image 2)
-->
<template>
  <div class="cart-panel">
    <!-- Header -->
    <div class="cart-header">
      <h2 class="cart-title">Current Order</h2>
      <button v-if="cartItems.length > 0" @click="clearCart" class="clear-btn">
        <Trash2 class="w-4 h-4" />
        Clear
      </button>
    </div>

    <!-- Customer Info (Optional) -->
    <div class="customer-section">
      <input
        v-model="customerName"
        type="text"
        placeholder="Customer Name (Optional)"
        class="customer-input"
      />
      <input
        v-model="customerPhone"
        type="tel"
        placeholder="Phone Number (Optional)"
        class="customer-input"
      />
    </div>

    <!-- Cart Items -->
    <div class="cart-items">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <ShoppingCart class="w-16 h-16 text-gray-600" />
        <p class="empty-text">No items in cart</p>
        <p class="empty-subtext">Add items from the menu</p>
      </div>

      <div v-else class="items-list">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <!-- Item Image -->
          <div class="cart-item-image">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
            <div v-else class="image-placeholder">
              <UtensilsCrossed class="w-6 h-6" />
            </div>
          </div>

          <!-- Item Details -->
          <div class="cart-item-details">
            <h4 class="cart-item-name">{{ item.name }}</h4>
            <p class="cart-item-price">{{ formatPrice(item.price) }}</p>
            <p v-if="item.notes" class="cart-item-notes">{{ item.notes }}</p>
          </div>

          <!-- Quantity Controls -->
          <div class="quantity-controls">
            <button @click="decreaseQuantity(item)" class="qty-btn">
              <Minus class="w-4 h-4" />
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)" class="qty-btn">
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <!-- Item Total -->
          <div class="cart-item-total">
            {{ formatPrice(item.price * item.quantity) }}
          </div>

          <!-- Remove Button -->
          <button @click="removeItem(item)" class="remove-btn">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div v-if="cartItems.length > 0" class="order-summary">
      <div class="summary-row">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Tax (10%)</span>
        <span class="summary-value">{{ formatPrice(tax) }}</span>
      </div>
      <div class="summary-row summary-total">
        <span class="summary-label">Total</span>
        <span class="summary-value">{{ formatPrice(total) }}</span>
      </div>

      <!-- Payment Method -->
      <div class="payment-method">
        <label class="payment-label">Payment Method</label>
        <select v-model="paymentMethod" class="payment-select">
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="MOBILE_MONEY">Mobile Money</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="saveDraft" class="btn btn-outline">
          Save Draft
        </button>
        <button @click="placeOrder" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting">Processing...</span>
          <span v-else>Place Order</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  ShoppingCart,
  UtensilsCrossed,
  Plus,
  Minus,
  X,
  Trash2
} from 'lucide-vue-next'

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()

const customerName = ref('')
const customerPhone = ref('')
const paymentMethod = ref('CASH')
const isSubmitting = ref(false)

const cartItems = computed(() => cartStore.items || [])

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const tax = computed(() => subtotal.value * 0.10)

const total = computed(() => subtotal.value + tax.value)

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const increaseQuantity = (item: any) => {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  } else {
    removeItem(item)
  }
}

const removeItem = (item: any) => {
  cartStore.removeItem(item.id)
  toast.info(`${item.name} removed from cart`)
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear the cart?')) {
    cartStore.clearCart()
    customerName.value = ''
    customerPhone.value = ''
    toast.success('Cart cleared')
  }
}

const saveDraft = async () => {
  // TODO: Implement save draft functionality
  toast.info('Draft saved (feature coming soon)')
}

const placeOrder = async () => {
  if (cartItems.value.length === 0) {
    toast.error('Cart is empty')
    return
  }

  isSubmitting.value = true
  try {
    const orderData = {
      customerName: customerName.value || 'Walk-in Customer',
      customerPhone: customerPhone.value || null,
      items: cartItems.value.map(item => ({
        menuItemId: item.menuItemId || item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.notes
      })),
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
      paymentMethod: paymentMethod.value,
      orderType: 'DINE_IN',
      status: 'PENDING'
    }

    // Submit order
    await cartStore.checkout(orderData)

    toast.success('Order placed successfully!')

    // Clear form
    customerName.value = ''
    customerPhone.value = ''

    // Redirect to orders page
    router.push('/orders')
  } catch (error: any) {
    toast.error(error.message || 'Failed to place order')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.cart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.cart-title {
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.customer-section {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  transition: all 0.3s;
}

.customer-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-subtext {
  font-size: var(--font-size-small);
  color: var(--text-tertiary);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: var(--text-tertiary);
}

.cart-item-details {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-price {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.cart-item-notes {
  font-size: 11px;
  color: var(--text-tertiary);
  font-style: italic;
  margin-top: 4px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
}

.cart-item-total {
  font-weight: 600;
  color: var(--accent-orange);
  font-size: var(--font-size-body);
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: var(--accent-red);
}

.order-summary {
  padding: 24px;
  border-top: 1px solid var(--border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-body);
}

.summary-total {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--border);
}

.summary-total .summary-label {
  font-size: var(--font-size-h3);
  font-weight: 700;
  color: var(--text-primary);
}

.summary-total .summary-value {
  font-size: var(--font-size-h3);
  color: var(--accent-orange);
}

.payment-method {
  margin: 20px 0;
}

.payment-label {
  display: block;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.payment-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all 0.3s;
}

.payment-select:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn {
  padding: 14px 20px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-outline:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

.btn-primary {
  background: var(--accent-orange);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #FF8C5A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 50px 1fr auto;
    grid-template-rows: auto auto;
  }

  .cart-item-total,
  .remove-btn {
    grid-column: 3;
  }

  .quantity-controls {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
