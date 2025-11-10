<!--
  BaseChip Component
  Interactive chips for filters, tags, and selections
  Supports removal, selection states, and icons
-->

<template>
  <button
    type="button"
    :class="chipClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- Left icon -->
    <component
      v-if="icon"
      :is="icon"
      :class="iconSizeClasses"
    />

    <!-- Avatar (for user chips) -->
    <img
      v-if="avatar"
      :src="avatar"
      :alt="label"
      :class="avatarSizeClasses"
      class="rounded-full object-cover"
    />

    <!-- Label -->
    <span class="truncate">
      <slot>{{ label }}</slot>
    </span>

    <!-- Remove/close button -->
    <button
      v-if="removable"
      type="button"
      @click.stop="handleRemove"
      class="ml-1 -mr-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
      :aria-label="`Remove ${label}`"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <!-- Selected check mark -->
    <svg
      v-else-if="selected && !removable"
      class="w-4 h-4 ml-1"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseChipProps {
  // Content
  label?: string
  icon?: any
  avatar?: string
  // States
  selected?: boolean
  disabled?: boolean
  removable?: boolean
  // Variants
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'outline'
  // Sizes
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseChipProps>(), {
  variant: 'default',
  size: 'md',
  selected: false,
  disabled: false,
  removable: false
})

const emit = defineEmits<{
  click: []
  remove: []
}>()

// Chip classes
const chipClasses = computed(() => {
  const classes: string[] = [
    'inline-flex items-center gap-1.5',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'whitespace-nowrap'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 h-7',
    md: 'text-sm px-3 py-1.5 h-8',
    lg: 'text-base px-4 py-2 h-10'
  }
  classes.push(sizeClasses[props.size])

  // Always rounded
  classes.push('rounded-full')

  // Base variant styles
  const variantClasses = {
    default: {
      normal: [
        'bg-gray-100 text-gray-700',
        'hover:bg-gray-200',
        'dark:bg-gray-700 dark:text-gray-200',
        'dark:hover:bg-gray-600'
      ],
      selected: [
        'bg-gray-700 text-white',
        'dark:bg-gray-200 dark:text-gray-900'
      ]
    },
    primary: {
      normal: [
        'bg-primary-100 text-primary-700',
        'hover:bg-primary-200',
        'dark:bg-primary-900/30 dark:text-primary-300',
        'dark:hover:bg-primary-900/50'
      ],
      selected: [
        'bg-primary-500 text-white',
        'dark:bg-primary-600'
      ]
    },
    success: {
      normal: [
        'bg-success-100 text-success-700',
        'hover:bg-success-200',
        'dark:bg-success-900/30 dark:text-success-300',
        'dark:hover:bg-success-900/50'
      ],
      selected: [
        'bg-success-500 text-white',
        'dark:bg-success-600'
      ]
    },
    error: {
      normal: [
        'bg-error-100 text-error-700',
        'hover:bg-error-200',
        'dark:bg-error-900/30 dark:text-error-300',
        'dark:hover:bg-error-900/50'
      ],
      selected: [
        'bg-error-500 text-white',
        'dark:bg-error-600'
      ]
    },
    warning: {
      normal: [
        'bg-warning-100 text-warning-700',
        'hover:bg-warning-200',
        'dark:bg-warning-900/30 dark:text-warning-300',
        'dark:hover:bg-warning-900/50'
      ],
      selected: [
        'bg-warning-500 text-white',
        'dark:bg-warning-600'
      ]
    },
    info: {
      normal: [
        'bg-info-100 text-info-700',
        'hover:bg-info-200',
        'dark:bg-info-900/30 dark:text-info-300',
        'dark:hover:bg-info-900/50'
      ],
      selected: [
        'bg-info-500 text-white',
        'dark:bg-info-600'
      ]
    },
    outline: {
      normal: [
        'bg-transparent border-2 border-gray-300 text-gray-700',
        'hover:border-gray-400 hover:bg-gray-50',
        'dark:border-gray-600 dark:text-gray-300',
        'dark:hover:border-gray-500 dark:hover:bg-gray-800'
      ],
      selected: [
        'border-primary-500 bg-primary-50 text-primary-700',
        'dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
      ]
    }
  }

  const state = props.selected ? 'selected' : 'normal'
  classes.push(...variantClasses[props.variant][state])

  // Focus ring color
  if (props.variant === 'primary') {
    classes.push('focus:ring-primary-300')
  } else {
    classes.push('focus:ring-gray-300 dark:focus:ring-gray-600')
  }

  return classes.join(' ')
})

// Icon size classes
const iconSizeClasses = computed(() => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizeMap[props.size]
})

// Avatar size classes
const avatarSizeClasses = computed(() => {
  const sizeMap = {
    sm: 'w-5 h-5 -ml-1',
    md: 'w-6 h-6 -ml-1',
    lg: 'w-7 h-7 -ml-1.5'
  }
  return sizeMap[props.size]
})

// Methods
const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}

const handleRemove = () => {
  if (!props.disabled) {
    emit('remove')
  }
}
</script>
