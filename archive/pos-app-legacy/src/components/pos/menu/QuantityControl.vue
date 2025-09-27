<!--
  Quantity Control Component
  Reusable quantity selector with plus/minus buttons
-->
<template>
  <div class="quantity-control">
    <button @click="decrease" class="qty-btn" :disabled="quantity <= 1">
      <Minus class="w-4 h-4" />
    </button>
    <span class="qty-value">{{ quantity }}</span>
    <button @click="increase" class="qty-btn">
      <Plus class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next'

interface Props {
  quantity: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 99
})

const emit = defineEmits<{
  quantityChange: [quantity: number]
}>()

const increase = () => {
  if (props.quantity < props.max) {
    emit('quantityChange', props.quantity + 1)
  }
}

const decrease = () => {
  if (props.quantity > props.min) {
    emit('quantityChange', props.quantity - 1)
  }
}
</script>

<style scoped>
.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color;
  transform: translate3d(0, 0, 0);
}

.qty-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  min-width: 20px;
  text-align: center;
}
</style>