<!--
  Professional KioskButton Component

  Enterprise-grade button component with consistent styling, accessibility,
  haptic feedback, loading states, and smooth animations. Follows the design
  system tokens for professional appearance.
-->
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin h-5 w-5 mr-3"
      :class="spinnerColor"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Icon (left) -->
    <span v-if="$slots.icon && !loading" class="mr-3">
      <slot name="icon" />
    </span>

    <!-- Button text -->
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>

    <!-- Icon (right) -->
    <span v-if="$slots.iconRight && !loading" class="ml-3">
      <slot name="iconRight" />
    </span>

    <!-- Ripple effect -->
    <span
      v-if="showRipple"
      class="absolute inset-0 overflow-hidden rounded-full"
    >
      <span
        class="absolute bg-white rounded-full opacity-30 animate-ripple"
        :style="{
          left: rippleX + 'px',
          top: rippleY + 'px',
          width: '0px',
          height: '0px',
        }"
      ></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  pill?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  pill: true,
  ariaLabel: undefined
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const showRipple = ref(false)
const rippleX = ref(0)
const rippleY = ref(0)

const buttonClasses = computed(() => {
  const classes = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'transition-all',
    'duration-fast',
    'overflow-hidden',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
    'disabled:pointer-events-none',
  ]

  // Width
  if (props.fullWidth) {
    classes.push('w-full')
  }

  // Border radius
  if (props.pill) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-lg')
  }

  // Size
  const sizeClasses = {
    sm: 'px-6 py-3 text-base min-h-[48px]',
    md: 'px-8 py-4 text-lg min-h-[56px]',
    lg: 'px-10 py-5 text-xl min-h-[64px]',
    xl: 'px-12 py-6 text-2xl min-h-[72px]',
  }
  classes.push(sizeClasses[props.size])

  // Variant styles (using design system tokens with gradients)
  const variantClasses = {
    primary: [
      'bg-gradient-primary',
      'text-white',
      'hover:brightness-110',
      'shadow-button',
      'hover:shadow-button-hover',
      'focus-visible:ring-brand-500',
      'hover:scale-105',
      'active:scale-95',
      'border',
      'border-brand-600/20',
    ],
    secondary: [
      'bg-white',
      'text-brand-600',
      'border-2',
      'border-brand-300',
      'shadow-md',
      'hover:shadow-lg',
      'hover:bg-gradient-soft',
      'hover:border-brand-400',
      'focus-visible:ring-brand-300',
      'hover:scale-105',
      'active:scale-95',
    ],
    success: [
      'bg-gradient-success',
      'text-white',
      'hover:brightness-110',
      'shadow-lg',
      'hover:shadow-xl',
      'focus-visible:ring-success-500',
      'hover:scale-105',
      'active:scale-95',
      'border',
      'border-success-600/20',
    ],
    error: [
      'bg-gradient-error',
      'text-white',
      'hover:brightness-110',
      'shadow-lg',
      'hover:shadow-xl',
      'focus-visible:ring-error-500',
      'hover:scale-105',
      'active:scale-95',
      'border',
      'border-error-600/20',
    ],
    danger: [
      'bg-gradient-error',
      'text-white',
      'hover:brightness-110',
      'shadow-lg',
      'hover:shadow-xl',
      'focus-visible:ring-error-500',
      'hover:scale-105',
      'active:scale-95',
      'border',
      'border-error-600/20',
    ],
    ghost: [
      'bg-neutral-50/50',
      'text-brand-600',
      'border-2',
      'border-neutral-200',
      'hover:bg-brand-50',
      'hover:text-brand-700',
      'hover:border-brand-300',
      'focus-visible:ring-brand-300',
      'hover:scale-105',
      'active:scale-95',
      'backdrop-blur-sm',
    ],
  }
  classes.push(...variantClasses[props.variant])

  return classes.join(' ')
})

const spinnerColor = computed(() => {
  if (props.variant === 'ghost') {
    return 'text-brand-600'
  }
  if (props.variant === 'secondary') {
    return 'text-brand-500'
  }
  return 'text-white'
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return

  // Haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }

  // Create ripple effect
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  rippleX.value = event.clientX - rect.left
  rippleY.value = event.clientY - rect.top
  showRipple.value = true

  setTimeout(() => {
    showRipple.value = false
  }, 600)

  emit('click', event)
}
</script>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
