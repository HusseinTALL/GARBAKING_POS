<!--
  Payment Summary Component
  Payment breakdown and place order button
-->
<template>
  <div class="payment-summary">
    <!-- Payment Method Selector -->
    <PaymentMethodSelector
      :total-amount="total"
      :selected-payment-method="selectedPaymentMethod"
      @method-change="handlePaymentMethodChange"
    />

    <div class="summary-header">
      <h3 class="summary-title">Order Summary</h3>
      <div class="summary-badge">{{ itemCount }} items</div>
    </div>

    <div class="summary-breakdown">
      <div class="summary-line">
        <span class="line-label">Subtotal</span>
        <span class="line-value">${{ subtotal.toFixed(2) }}</span>
      </div>

      <div class="summary-line">
        <span class="line-label">Taxes (10%)</span>
        <span class="line-value">${{ taxes.toFixed(2) }}</span>
      </div>

      <div class="summary-line discount-line" v-if="discount > 0">
        <span class="line-label">Discount</span>
        <span class="line-value discount-value">-${{ discount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="summary-total">
      <span class="total-label">Total Amount</span>
      <span class="total-value">${{ total.toFixed(2) }}</span>
    </div>

    <button
      @click="$emit('placeOrder')"
      :disabled="isOrderDisabled"
      class="place-order-btn"
    >
      <span class="btn-text">Place Order</span>
      <CheckCircle class="btn-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle } from 'lucide-vue-next'
import PaymentMethodSelector from './PaymentMethodSelector.vue'

interface Props {
  subtotal: number
  taxes: number
  discount: number
  total: number
  isOrderDisabled: boolean
  itemCount?: number
  selectedPaymentMethod?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemCount: 0,
  selectedPaymentMethod: 'cash'
})

const emit = defineEmits<{
  placeOrder: []
  paymentMethodChange: [method: string, data?: any]
}>()

const selectedPaymentMethod = ref(props.selectedPaymentMethod)

const handlePaymentMethodChange = (method: string, data?: any) => {
  selectedPaymentMethod.value = method
  emit('paymentMethodChange', method, data)
}
</script>

<style scoped>
.payment-summary {
  padding: 16px;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  border-top: 2px solid #e5e7eb;
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.summary-badge {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.summary-breakdown {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-line:last-child {
  border-bottom: none;
}

.line-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.line-value {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.discount-line {
  background: #fef7ff;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px -4px;
  border: 1px solid #fde2ff;
}

.discount-value {
  color: #a21caf;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.total-value {
  font-size: 20px;
  font-weight: 800;
  color: white;
}

.place-order-btn {
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, box-shadow;
  transform: translate3d(0, 0, 0);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.place-order-btn:hover:not(:disabled) {
  transform: translate3d(0, -2px, 0);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.place-order-btn:active:not(:disabled) {
  transform: translate3d(0, 0, 0);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.place-order-btn:disabled {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  cursor: not-allowed;
  box-shadow: none;
}

.btn-text {
  font-size: 16px;
}

.btn-icon {
  width: 20px;
  height: 20px;
}
</style>