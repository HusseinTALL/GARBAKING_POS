/**
 * PriceDisplay Component
 *
 * Professional price display component with consistent formatting,
 * currency symbols, and optional strike-through for discounts.
 */
<template>
  <div class="inline-flex items-baseline gap-2">
    <!-- Original Price (strikethrough if has discount) -->
    <span
      v-if="originalPrice && originalPrice > price"
      class="text-sm text-neutral-400 line-through font-normal"
    >
      {{ formattedOriginalPrice }}
    </span>

    <!-- Current Price -->
    <span
      class="font-mono font-bold"
      :class="[
        sizeClasses,
        colorClasses
      ]"
    >
      {{ formattedPrice }}
    </span>

    <!-- Discount Badge -->
    <span
      v-if="discountPercentage"
      class="inline-flex items-center rounded-full bg-error-50 text-error-600 text-xs font-semibold px-2 py-0.5 ml-1"
    >
      -{{ discountPercentage }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Component Props
 */
interface Props {
  price: number // Price in cents
  originalPrice?: number // Original price before discount (in cents)
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'default' | 'primary' | 'success' | 'muted'
  showCurrency?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  originalPrice: undefined,
  currency: 'FCFA',
  size: 'md',
  color: 'primary',
  showCurrency: true
})

/**
 * Format price from cents to display format
 */
const formatPrice = (cents: number): string => {
  const value = (cents / 100).toFixed(2)
  return props.showCurrency ? `${value} ${props.currency}` : value
}

/**
 * Formatted prices
 */
const formattedPrice = computed(() => formatPrice(props.price))
const formattedOriginalPrice = computed(() =>
  props.originalPrice ? formatPrice(props.originalPrice) : ''
)

/**
 * Calculate discount percentage
 */
const discountPercentage = computed(() => {
  if (!props.originalPrice || props.originalPrice <= props.price) return null
  const discount = ((props.originalPrice - props.price) / props.originalPrice) * 100
  return Math.round(discount)
})

/**
 * Size classes
 */
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }
  return sizes[props.size]
})

/**
 * Color classes
 */
const colorClasses = computed(() => {
  const colors = {
    default: 'text-neutral-700',
    primary: 'text-brand-500',
    success: 'text-success-500',
    muted: 'text-neutral-500'
  }
  return colors[props.color]
})
</script>
