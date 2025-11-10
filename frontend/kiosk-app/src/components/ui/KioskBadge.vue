/**
 * KioskBadge Component
 *
 * Professional badge component for status indicators, labels, and tags
 * with consistent styling and semantic color variants.
 */
<template>
  <span
    class="badge inline-flex items-center gap-1.5 font-semibold rounded-full transition-all duration-fast"
    :class="[variantClasses, sizeClasses]"
  >
    <!-- Icon (left) -->
    <span v-if="$slots.icon" class="flex-shrink-0">
      <slot name="icon" />
    </span>

    <!-- Badge Content -->
    <slot />

    <!-- Dot Indicator -->
    <span v-if="showDot" class="w-2 h-2 rounded-full bg-current opacity-75" />

    <!-- Close Button -->
    <button
      v-if="dismissible"
      @click="handleDismiss"
      class="flex-shrink-0 hover:opacity-70 focus:outline-none transition-opacity duration-fast"
      :aria-label="dismissLabel"
    >
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Component Props
 */
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
  dismissible?: boolean
  dismissLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  showDot: false,
  dismissible: false,
  dismissLabel: 'Dismiss'
})

/**
 * Component Emits
 */
const emit = defineEmits<{
  dismiss: []
}>()

/**
 * Variant classes
 */
const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-brand-100 text-brand-700 border border-brand-200',
    secondary: 'bg-white text-brand-600 border border-brand-200',
    success: 'bg-success-50 text-success-700 border border-success-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    error: 'bg-error-50 text-error-700 border border-error-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    info: 'bg-info-50 text-info-700 border border-info-200'
  }
  return variants[props.variant]
})

/**
 * Size classes
 */
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5'
  }
  return sizes[props.size]
})

/**
 * Handle dismiss action
 */
const handleDismiss = () => {
  emit('dismiss')
}
</script>
