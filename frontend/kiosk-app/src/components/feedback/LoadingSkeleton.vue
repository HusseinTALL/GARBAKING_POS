/**
 * LoadingSkeleton Component
 *
 * Professional loading skeleton with shimmer animation for better UX
 * during content loading. Supports multiple variants for different layouts.
 */
<template>
  <div :class="containerClasses">
    <!-- Card Variant -->
    <template v-if="variant === 'card'">
      <div
        v-for="n in count"
        :key="n"
        class="bg-white rounded-2xl shadow-lg p-8 space-y-4"
      >
        <!-- Image placeholder -->
        <div class="w-full aspect-[4/3] bg-neutral-200 rounded-lg loading-shimmer" />

        <!-- Title placeholder -->
        <div class="h-8 bg-neutral-200 rounded loading-shimmer" :style="{ width: '70%' }" />

        <!-- Description placeholders -->
        <div class="space-y-2">
          <div class="h-4 bg-neutral-100 rounded loading-shimmer" />
          <div class="h-4 bg-neutral-100 rounded loading-shimmer" :style="{ width: '85%' }" />
        </div>

        <!-- Price placeholder -->
        <div class="h-10 bg-neutral-200 rounded loading-shimmer" :style="{ width: '40%' }" />
      </div>
    </template>

    <!-- List Item Variant -->
    <template v-else-if="variant === 'list'">
      <div
        v-for="n in count"
        :key="n"
        class="flex items-center gap-4 bg-white rounded-2xl shadow-lg p-6"
      >
        <!-- Image/Icon placeholder -->
        <div class="flex-shrink-0 w-16 h-16 bg-neutral-200 rounded-lg loading-shimmer" />

        <!-- Content placeholder -->
        <div class="flex-1 space-y-2">
          <div class="h-6 bg-neutral-200 rounded loading-shimmer" :style="{ width: '60%' }" />
          <div class="h-4 bg-neutral-100 rounded loading-shimmer" :style="{ width: '40%' }" />
        </div>

        <!-- Action placeholder -->
        <div class="flex-shrink-0 w-20 h-10 bg-neutral-200 rounded loading-shimmer" />
      </div>
    </template>

    <!-- Text Variant -->
    <template v-else-if="variant === 'text'">
      <div class="space-y-3">
        <div
          v-for="n in count"
          :key="n"
          class="h-4 bg-neutral-200 rounded loading-shimmer"
          :style="{ width: n === count ? '75%' : '100%' }"
        />
      </div>
    </template>

    <!-- Button Variant -->
    <template v-else-if="variant === 'button'">
      <div
        v-for="n in count"
        :key="n"
        class="h-14 bg-neutral-200 rounded-full loading-shimmer"
        :style="{ width: buttonWidth }"
      />
    </template>

    <!-- Circle/Avatar Variant -->
    <template v-else-if="variant === 'circle'">
      <div
        v-for="n in count"
        :key="n"
        :class="`w-${circleSize} h-${circleSize} bg-neutral-200 rounded-full loading-shimmer`"
      />
    </template>

    <!-- Custom Variant -->
    <template v-else>
      <div
        v-for="n in count"
        :key="n"
        :class="`h-${height} bg-neutral-200 rounded loading-shimmer`"
        :style="{ width }"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Component Props
 */
interface Props {
  variant?: 'card' | 'list' | 'text' | 'button' | 'circle' | 'custom'
  count?: number
  height?: string | number
  width?: string
  buttonWidth?: string
  circleSize?: string | number
  gap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  count: 3,
  height: '4',
  width: '100%',
  buttonWidth: '200px',
  circleSize: '12',
  gap: 'md'
})

/**
 * Container classes
 */
const containerClasses = computed(() => {
  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const layouts = {
    card: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    list: 'flex flex-col',
    text: 'space-y-3',
    button: 'flex flex-wrap',
    circle: 'flex',
    custom: 'flex flex-col'
  }

  return `${layouts[props.variant]} ${gaps[props.gap]}`
})
</script>

<style scoped>
/* Shimmer animation is defined in main.css */
</style>
