<!--
  LoadingSpinner - Reusable loading indicator
  Supports different sizes and colors
-->

<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <!-- Spinner -->
      <div
        class="animate-spin rounded-full border-solid border-t-transparent"
        :class="[sizeClass, colorClass]"
        role="status"
        :aria-label="t('common.loading')"
      ></div>

      <!-- Center dot (optional) -->
      <div
        v-if="withDot"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
        :class="dotClass"
      ></div>
    </div>

    <!-- Loading text -->
    <span v-if="text" class="ml-3 font-medium" :class="textColorClass">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  withDot?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  withDot: false,
  fullscreen: false
})

const { t } = useI18n()

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  }
  return colors[props.color]
})

const textColorClass = computed(() => {
  const colors = {
    primary: 'text-gray-700 dark:text-gray-300',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400'
  }
  return colors[props.color]
})

const dotClass = computed(() => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }
  const colors = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    gray: 'bg-gray-500'
  }
  return `${sizes[props.size]} ${colors[props.color]}`
})

const containerClass = computed(() => {
  return props.fullscreen
    ? 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
    : ''
})
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}
</style>
