<!--
  BaseBadge Component
  Notification and status badges with variants, sizes, and positions
  Can be used standalone or as wrapper for badge indicators
-->

<template>
  <component
    :is="as"
    :class="badgeClasses"
    v-bind="$attrs"
  >
    <!-- Icon (optional) -->
    <component
      v-if="icon"
      :is="icon"
      :class="iconSizeClasses"
    />

    <!-- Content -->
    <slot>{{ label }}</slot>

    <!-- Dot indicator (for notification style) -->
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseBadgeProps {
  // Content
  label?: string | number
  icon?: any
  dot?: boolean
  // Variants
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'outline'
  // Sizes
  size?: 'xs' | 'sm' | 'md' | 'lg'
  // Styling
  rounded?: boolean
  pulse?: boolean
  // HTML element
  as?: string
}

const props = withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'default',
  size: 'md',
  rounded: false,
  pulse: false,
  dot: false,
  as: 'span'
})

// Badge classes
const badgeClasses = computed(() => {
  const classes: string[] = [
    'inline-flex items-center justify-center gap-1',
    'font-semibold transition-all duration-200',
    'shrink-0'
  ]

  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 min-w-[18px] h-[18px]',
    sm: 'text-xs px-2 py-0.5 min-w-[20px] h-[20px]',
    md: 'text-sm px-2.5 py-1 min-w-[24px] h-[24px]',
    lg: 'text-base px-3 py-1.5 min-w-[28px] h-[28px]'
  }
  classes.push(sizeClasses[props.size])

  // Rounded
  if (props.rounded) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-md')
  }

  // Variant classes
  const variantClasses = {
    default: [
      'bg-gray-100 text-gray-700',
      'dark:bg-gray-700 dark:text-gray-200'
    ],
    primary: [
      'bg-primary-500 text-white',
      'dark:bg-primary-600'
    ],
    success: [
      'bg-success-500 text-white',
      'dark:bg-success-600'
    ],
    error: [
      'bg-error-500 text-white',
      'dark:bg-error-600'
    ],
    warning: [
      'bg-warning-500 text-white',
      'dark:bg-warning-600'
    ],
    info: [
      'bg-info-500 text-white',
      'dark:bg-info-600'
    ],
    outline: [
      'bg-transparent border-2',
      'border-gray-300 text-gray-700',
      'dark:border-gray-600 dark:text-gray-300'
    ]
  }
  classes.push(...variantClasses[props.variant])

  // Pulse animation
  if (props.pulse) {
    classes.push('animate-pulse')
  }

  return classes.join(' ')
})

// Icon size classes
const iconSizeClasses = computed(() => {
  const sizeMap = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }
  return sizeMap[props.size]
})
</script>
