<!--
  Payment Method Selector Component
  Allows users to select payment methods for orders
-->
<template>
  <div class="payment-method-selector">
    <h4 class="selector-title">Payment Method</h4>

    <div class="payment-methods">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-method"
        :class="{ active: selectedMethod === method.id }"
        @click="selectMethod(method.id)"
      >
        <div class="method-icon">
          <component :is="method.icon" class="w-5 h-5" />
        </div>
        <div class="method-info">
          <div class="method-name">{{ method.name }}</div>
          <div class="method-description">{{ method.description }}</div>
        </div>
        <div class="method-check">
          <Check class="w-4 h-4" v-if="selectedMethod === method.id" />
        </div>
      </div>
    </div>

    <div class="payment-options" v-if="selectedMethod">
      <div class="split-payment" v-if="selectedMethod === 'split'">
        <h5 class="option-title">Split Payment</h5>
        <div class="split-methods">
          <div class="split-item">
            <span class="split-label">Cash</span>
            <div class="split-input">
              <span class="currency">$</span>
              <input
                v-model="splitAmounts.cash"
                type="number"
                placeholder="0.00"
                class="amount-input"
                @input="updateSplitAmounts"
              />
            </div>
          </div>
          <div class="split-item">
            <span class="split-label">Card</span>
            <div class="split-input">
              <span class="currency">$</span>
              <input
                v-model="splitAmounts.card"
                type="number"
                placeholder="0.00"
                class="amount-input"
                @input="updateSplitAmounts"
              />
            </div>
          </div>
        </div>
        <div class="split-remaining" v-if="remainingAmount > 0">
          <span>Remaining: ${{ remainingAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="tip-section" v-if="showTipSection">
        <h5 class="option-title">Add Tip</h5>
        <div class="tip-buttons">
          <button
            v-for="tip in tipOptions"
            :key="tip.value"
            class="tip-btn"
            :class="{ active: selectedTip === tip.value }"
            @click="selectTip(tip.value)"
          >
            {{ tip.label }}
          </button>
          <div class="custom-tip">
            <span class="currency">$</span>
            <input
              v-model="customTipAmount"
              type="number"
              placeholder="Custom"
              class="tip-input"
              @input="selectTip('custom')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CreditCard, Banknote, Smartphone, DollarSign, Check } from 'lucide-vue-next'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: any
}

interface Props {
  totalAmount: number
  selectedPaymentMethod?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedPaymentMethod: 'cash'
})

const emit = defineEmits<{
  methodChange: [method: string, data?: any]
}>()

const selectedMethod = ref(props.selectedPaymentMethod)
const selectedTip = ref<string | number>('')
const customTipAmount = ref('')

const splitAmounts = ref({
  cash: '',
  card: ''
})

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Cash',
    description: 'Pay with cash',
    icon: Banknote
  },
  {
    id: 'card',
    name: 'Credit Card',
    description: 'Pay with card',
    icon: CreditCard
  },
  {
    id: 'mobile',
    name: 'Mobile Pay',
    description: 'Apple Pay, Google Pay',
    icon: Smartphone
  },
  {
    id: 'split',
    name: 'Split Payment',
    description: 'Cash + Card',
    icon: DollarSign
  }
]

const tipOptions = [
  { label: '10%', value: 0.1 },
  { label: '15%', value: 0.15 },
  { label: '18%', value: 0.18 },
  { label: '20%', value: 0.2 }
]

const showTipSection = computed(() => {
  return selectedMethod.value !== 'cash'
})

const remainingAmount = computed(() => {
  if (selectedMethod.value !== 'split') return 0

  const cashAmount = parseFloat(splitAmounts.value.cash) || 0
  const cardAmount = parseFloat(splitAmounts.value.card) || 0
  const total = cashAmount + cardAmount

  return Math.max(0, props.totalAmount - total)
})

const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId

  // Reset split amounts when changing methods
  if (methodId !== 'split') {
    splitAmounts.value = { cash: '', card: '' }
  }

  emitMethodChange()
}

const selectTip = (tipValue: string | number) => {
  selectedTip.value = tipValue
  if (tipValue !== 'custom') {
    customTipAmount.value = ''
  }
  emitMethodChange()
}

const updateSplitAmounts = () => {
  emitMethodChange()
}

const emitMethodChange = () => {
  const methodData: any = {
    method: selectedMethod.value,
    tip: getTipAmount(),
    totalWithTip: props.totalAmount + getTipAmount()
  }

  if (selectedMethod.value === 'split') {
    methodData.splitAmounts = {
      cash: parseFloat(splitAmounts.value.cash) || 0,
      card: parseFloat(splitAmounts.value.card) || 0
    }
    methodData.remaining = remainingAmount.value
  }

  emit('methodChange', selectedMethod.value, methodData)
}

const getTipAmount = (): number => {
  if (selectedTip.value === 'custom') {
    return parseFloat(customTipAmount.value) || 0
  } else if (typeof selectedTip.value === 'number') {
    return props.totalAmount * selectedTip.value
  }
  return 0
}

watch(() => props.selectedPaymentMethod, (newMethod) => {
  if (newMethod) {
    selectedMethod.value = newMethod
  }
})
</script>

<style scoped>
.payment-method-selector {
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

.selector-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 2px solid #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: border-color, background-color;
  transform: translate3d(0, 0, 0);
}

.payment-method:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.payment-method.active {
  border-color: #5b63d3;
  background: #eff6ff;
}

.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.payment-method.active .method-icon {
  background: #5b63d3;
  color: white;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.method-description {
  font-size: 12px;
  color: #6b7280;
}

.method-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b63d3;
}

.payment-options {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.split-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.split-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.split-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.split-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.currency {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.amount-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
}

.amount-input:focus {
  outline: none;
  border-color: #5b63d3;
  box-shadow: 0 0 0 3px rgba(91, 99, 211, 0.1);
}

.split-remaining {
  text-align: right;
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.tip-section {
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.tip-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tip-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.tip-btn:hover {
  border-color: #9ca3af;
}

.tip-btn.active {
  background: #5b63d3;
  border-color: #5b63d3;
  color: white;
}

.custom-tip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tip-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  text-align: right;
}

.tip-input:focus {
  outline: none;
  border-color: #5b63d3;
  box-shadow: 0 0 0 3px rgba(91, 99, 211, 0.1);
}
</style>