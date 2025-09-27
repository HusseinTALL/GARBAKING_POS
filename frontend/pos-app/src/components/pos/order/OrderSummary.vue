<!--
  Order Summary Component
  Complete order summary container with cart items and payment details
-->
<template>
  <div class="order-summary">
    <!-- Order Header -->
    <OrderHeader
      :customer-name="customerName"
      :customer-type="customerType"
      :table-number="tableNumber"
      :order-number="currentOrderNumber"
      :order-status="orderStatus"
      :order-time="orderTime"
      @show-menu="handleShowMenu"
    />

    <!-- Cart Section -->
    <CartSection
      :cart-items="cartItems"
      :cart-item-count="cartItemCount"
      @remove-from-cart="$emit('removeFromCart', $event)"
      @clear-cart="$emit('clearCart')"
      @save-cart="$emit('saveCart')"
      @remove-multiple="$emit('removeMultiple', $event)"
    />

    <!-- Payment Summary -->
    <PaymentSummary
      :subtotal="subtotal"
      :taxes="taxes"
      :discount="discount"
      :total="total"
      :item-count="cartItemCount"
      :is-order-disabled="cartItems.length === 0"
      @place-order="$emit('placeOrder')"
      @payment-method-change="handlePaymentMethodChange"
    />
  </div>
</template>

<script setup lang="ts">
import OrderHeader from './OrderHeader.vue'
import CartSection from './CartSection.vue'
import PaymentSummary from './PaymentSummary.vue'

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
  currentOrderNumber: string
  subtotal: number
  taxes: number
  discount: number
  total: number
  customerName?: string
  customerType?: string
  tableNumber?: number
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'completed'
  orderTime?: Date
}

const props = withDefaults(defineProps<Props>(), {
  customerName: 'Walk-in Customer',
  customerType: 'Dine In',
  tableNumber: 12,
  orderStatus: 'pending',
  orderTime: () => new Date()
})

const emit = defineEmits<{
  removeFromCart: [item: CartItemType]
  placeOrder: []
  showMenu: []
  paymentMethodChange: [method: string, data?: any]
  clearCart: []
  saveCart: []
  removeMultiple: [itemIds: string[]]
}>()

const handleShowMenu = () => {
  emit('showMenu')
}

const handlePaymentMethodChange = (method: string, data?: any) => {
  emit('paymentMethodChange', method, data)
}
</script>

<style scoped>
.order-summary {
  width: 400px;
  min-width: 380px;
  max-width: 450px;
  background: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: box-shadow;
  transform: translate3d(0, 0, 0);
}

.order-summary:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}


/* Responsive Design */
@media (max-width: 1400px) {
  .order-summary {
    width: 360px;
    min-width: 340px;
    max-width: 380px;
  }
}

@media (max-width: 1280px) {
  .order-summary {
    width: 340px;
    min-width: 320px;
    max-width: 360px;
  }
}

@media (max-width: 1024px) {
  .order-summary {
    width: 100%;
    min-width: auto;
    max-width: none;
    border-radius: 16px;
  }
}
</style>