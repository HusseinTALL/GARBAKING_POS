<!--
  CategoryChip Component
  Category/tag chip matching Figma design specifications
  Used for filtering and navigation
-->

<template>
  <button
    class="inline-flex items-center gap-2 transition-all duration-200 active:scale-95"
    :class="chipClasses"
    @click="handleClick"
  >
    <!-- Icon (Optional) -->
    <div v-if="$slots.icon || icon" class="flex-shrink-0">
      <slot name="icon">
        <div
          v-if="icon"
          class="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
          :class="iconContainerClass"
        >
          <img v-if="typeof icon === 'string'" :src="icon" :alt="label" class="w-full h-full object-cover" />
          <component v-else :is="icon" class="w-6 h-6" />
        </div>
      </slot>
    </div>

    <!-- Label -->
    <span class="font-bold capitalize whitespace-nowrap" :class="labelClass">
      {{ label }}
    </span>

    <!-- Dropdown Arrow (Optional) -->
    <svg
      v-if="hasDropdown"
      class="w-3 h-2 transition-transform"
      :class="{ 'rotate-180': isOpen }"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10 5"
      fill="none"
    >
      <path d="M0 0l5 5 5-5H0z" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CategoryChipProps {
  label: string
  icon?: string | any
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
  hasDropdown?: boolean
  isOpen?: boolean
}

const props = withDefaults(defineProps<CategoryChipProps>(), {
  active: false,
  size: 'md',
  variant: 'default',
  hasDropdown: false,
  isOpen: false
})

const emit = defineEmits<{
  click: []
}>()

// Computed classes
const chipClasses = computed(() => {
  const classes: string[] = []

  // Size classes
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-[46px] px-5 text-base',
    lg: 'h-[60px] px-6 text-lg'
  }
  classes.push(sizeClasses[props.size])

  // Border radius
  const radiusClasses = {
    sm: 'rounded-6xl',
    md: 'rounded-8xl',
    lg: 'rounded-9xl'
  }
  classes.push(radiusClasses[props.size])

  // Variant and active state
  if (props.active) {
    // Active state - filled with orange background
    classes.push('bg-accent-500 text-white shadow-promo')
  } else {
    // Inactive state
    if (props.variant === 'filled') {
      classes.push('bg-white text-text shadow-card-sm border-2 border-transparent hover:border-accent-500')
    } else if (props.variant === 'outline') {
      classes.push('bg-white border-2 border text-text hover:border-primary-500 hover:text-primary-500')
    } else {
      // Default variant
      classes.push('bg-white text-text shadow-card-sm border-2 border-transparent hover:border-accent-500 hover:text-accent-500')
    }
  }

  return classes.join(' ')
})

const iconContainerClass = computed(() => {
  if (props.active) {
    return 'bg-white/20'
  }
  return 'bg-background-light'
})

const labelClass = computed(() => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  return sizeClasses[props.size]
})

// Handlers
const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
