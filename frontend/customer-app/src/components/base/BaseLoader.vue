<!--
  BaseLoader Component
  Multiple loading states: spinner, skeleton, progress bar
  Supports overlay mode for full-screen loading
-->

<template>
  <div :class="wrapperClasses">
    <!-- Spinner Variant -->
    <div v-if="variant === 'spinner'" :class="spinnerClasses">
      <svg
        class="animate-spin"
        :class="sizeClasses"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p v-if="label" class="mt-3 text-sm font-medium" :class="labelColorClass">
        {{ label }}
      </p>
    </div>

    <!-- Skeleton Variant -->
    <div v-else-if="variant === 'skeleton'" :class="skeletonContainerClasses">
      <!-- Default skeleton slot content -->
      <slot>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" :style="{ width: '80%' }" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" :style="{ width: '60%' }" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" :style="{ width: '70%' }" />
        </div>
      </slot>
    </div>

    <!-- Progress Bar Variant -->
    <div v-else-if="variant === 'progress'" class="w-full">
      <div v-if="label" class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</span>
        <span class="text-sm font-semibold text-primary-500">{{ progress }}%</span>
      </div>

      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300 ease-out"
          :class="progressColorClass"
          :style="{ width: `${progress}%` }"
        >
          <div v-if="indeterminate" class="h-full w-full animate-progress-indeterminate bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </div>

    <!-- Dots Variant -->
    <div v-else-if="variant === 'dots'" class="flex items-center gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-full animate-bounce"
        :class="[dotSizeClasses, dotColorClass]"
        :style="{ animationDelay: `${i * 150}ms` }"
      />
    </div>

    <!-- Pulse Variant -->
    <div v-else-if="variant === 'pulse'" :class="pulseClasses">
      <div class="relative">
        <div class="rounded-full" :class="[pulseSizeClasses, pulseColorClass]" />
        <div class="absolute inset-0 rounded-full animate-ping opacity-75" :class="pulseColorClass" />
      </div>
      <p v-if="label" class="mt-3 text-sm font-medium" :class="labelColorClass">
        {{ label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseLoaderProps {
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  label?: string
  progress?: number
  indeterminate?: boolean
  overlay?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<BaseLoaderProps>(), {
  variant: 'spinner',
  size: 'md',
  color: 'primary',
  progress: 0,
  indeterminate: false,
  overlay: false,
  fullscreen: false
})

// Wrapper classes
const wrapperClasses = computed(() => {
  const classes: string[] = []

  if (props.overlay || props.fullscreen) {
    classes.push(
      'fixed inset-0 z-50',
      'flex items-center justify-center',
      'bg-white/80 dark:bg-gray-900/80',
      'backdrop-blur-sm'
    )
  }

  return classes.join(' ')
})

// Spinner classes
const spinnerClasses = computed(() => {
  const colorMap = {
    primary: 'text-primary-500',
    secondary: 'text-gray-500',
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-info-500'
  }

  return ['flex flex-col items-center justify-center', colorMap[props.color]].join(' ')
})

// Size classes for spinner
const sizeClasses = computed(() => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizeMap[props.size]
})

// Skeleton container classes
const skeletonContainerClasses = computed(() => {
  const classes = ['w-full']

  if (props.size === 'lg') {
    classes.push('space-y-4')
  } else if (props.size === 'xl') {
    classes.push('space-y-6')
  } else {
    classes.push('space-y-3')
  }

  return classes.join(' ')
})

// Progress bar color
const progressColorClass = computed(() => {
  const colorMap = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500',
    info: 'bg-info-500'
  }
  return colorMap[props.color]
})

// Dots size classes
const dotSizeClasses = computed(() => {
  const sizeMap = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }
  return sizeMap[props.size]
})

// Dots color
const dotColorClass = computed(() => {
  const colorMap = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500',
    info: 'bg-info-500'
  }
  return colorMap[props.color]
})

// Pulse classes
const pulseClasses = computed(() => {
  return 'flex flex-col items-center justify-center'
})

const pulseSizeClasses = computed(() => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizeMap[props.size]
})

const pulseColorClass = computed(() => {
  const colorMap = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500',
    info: 'bg-info-500'
  }
  return colorMap[props.color]
})

// Label color
const labelColorClass = computed(() => {
  const colorMap = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-success-600 dark:text-success-400',
    error: 'text-error-600 dark:text-error-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-info-600 dark:text-info-400'
  }
  return colorMap[props.color]
})
</script>

<style scoped>
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}
</style>
