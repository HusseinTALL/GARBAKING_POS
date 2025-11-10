<!--
  BaseButton Component
  Reusable button following design system specifications
  Supports multiple variants, sizes, and states
-->

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>

    <!-- Content -->
    <span :class="{ 'opacity-0': loading }" class="flex items-center justify-center gap-2">
      <!-- Icon (left) -->
      <span v-if="$slots.icon || icon" class="flex-shrink-0">
        <slot name="icon">
          <component :is="icon" class="w-5 h-5" />
        </slot>
      </span>

      <!-- Label -->
      <span v-if="$slots.default || label" class="font-semibold">
        <slot>{{ label }}</slot>
      </span>

      <!-- Icon (right) -->
      <span v-if="$slots.iconRight" class="flex-shrink-0">
        <slot name="iconRight" />
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseButtonProps {
  // Variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cta'
  // Sizes
  size?: 'sm' | 'md' | 'lg' | 'xl'
  // States
  disabled?: boolean
  loading?: boolean
  // Content
  label?: string
  icon?: any
  // HTML attributes
  type?: 'button' | 'submit' | 'reset'
  // Styling
  fullWidth?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
  rounded: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

// Computed classes
const buttonClasses = computed(() => {
  const classes: string[] = [
    'relative inline-flex items-center justify-center',
    'font-semibold transition-all duration-250 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.97]'
  ]

  // Width
  if (props.fullWidth) {
    classes.push('w-full')
  }

  // Size variants
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl'
  }
  classes.push(sizeClasses[props.size])

  // Rounded
  if (props.rounded) {
    classes.push('rounded-full')
  } else {
    const roundedClasses = {
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-2xl'
    }
    classes.push(roundedClasses[props.size])
  }

  // Variant styles
  const variantClasses = {
    primary: [
      'bg-primary-500 text-white',
      'hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/30',
      'focus:ring-primary-300',
      'dark:bg-primary-600 dark:hover:bg-primary-500'
    ],
    secondary: [
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'focus:ring-gray-300',
      'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
    ],
    outline: [
      'bg-transparent border-2 border-primary-500 text-primary-500',
      'hover:bg-primary-50',
      'focus:ring-primary-300',
      'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20'
    ],
    ghost: [
      'bg-transparent text-primary-500',
      'hover:bg-primary-50',
      'focus:ring-primary-300',
      'dark:text-primary-400 dark:hover:bg-primary-900/20'
    ],
    cta: [
      'bg-gradient-to-r from-primary-300 to-primary-500 text-white',
      'hover:from-primary-400 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-500/40',
      'focus:ring-primary-300'
    ]
  }

  classes.push(...variantClasses[props.variant])

  return classes.join(' ')
})
</script>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
