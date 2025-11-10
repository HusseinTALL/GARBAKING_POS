<!--
  KioskCard: Reusable card component for displaying content
  Features: Image support, hover effects, badge support, shadow transitions
-->
<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Image Section -->
    <div
      v-if="image || $slots.image"
      class="relative overflow-hidden"
      :class="imageContainerClasses"
    >
      <!-- Slot for custom image content -->
      <slot name="image">
        <img
          v-if="image"
          :src="image"
          :alt="imageAlt"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </slot>

      <!-- Image overlay on hover -->
      <div
        v-if="clickable"
        class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Badges (top-left) -->
      <div v-if="badges.length > 0 || $slots.badges" class="absolute top-4 left-4 flex gap-2 z-10">
        <slot name="badges">
          <span
            v-for="(badge, index) in badges"
            :key="index"
            class="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full"
            :class="getBadgeClasses(badge.variant)"
          >
            {{ badge.text }}
          </span>
        </slot>
      </div>

      <!-- Quick action button (bottom-right on hover) -->
      <div
        v-if="$slots.action"
        class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10"
      >
        <slot name="action" />
      </div>
    </div>

    <!-- Content Section -->
    <div :class="contentClasses">
      <!-- Header -->
      <div v-if="title || $slots.header" class="mb-3">
        <slot name="header">
          <h3
            class="font-brand font-semibold text-neutral-900 mb-2 transition-colors"
            :class="[
              titleSize === 'sm'
                ? 'text-xl'
                : titleSize === 'md'
                ? 'text-2xl'
                : 'text-3xl',
              clickable && 'group-hover:text-brand-600'
            ]"
          >
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-neutral-600 line-clamp-2">
            {{ subtitle }}
          </p>
        </slot>
      </div>

      <!-- Main content -->
      <div v-if="$slots.default" class="mb-4">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="mt-auto">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Badge {
  text: string
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info'
}

interface Props {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  imageRatio?: '1:1' | '4:3' | '16:9'
  badges?: Badge[]
  clickable?: boolean
  elevated?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  titleSize?: 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  clickable: false,
  elevated: true,
  padding: 'md',
  titleSize: 'md',
  imageRatio: '4:3',
  rounded: 'lg',
  imageAlt: '',
})

const emit = defineEmits<{
  click: []
}>()

const cardClasses = computed(() => {
  const classes = [
    'bg-white',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'flex',
    'flex-col',
  ]

  // Rounded corners
  const roundedClasses = {
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-[28px]',
  }
  classes.push(roundedClasses[props.rounded])

  // Shadow
  if (props.elevated) {
    classes.push('shadow-lg', 'hover:shadow-xl')
  } else {
    classes.push('border', 'border-neutral-200')
  }

  // Clickable
  if (props.clickable) {
    classes.push(
      'cursor-pointer',
      'group',
      'hover:-translate-y-1',
      'active:translate-y-0'
    )
  }

  return classes.join(' ')
})

const imageContainerClasses = computed(() => {
  const ratioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
  }
  return ['bg-neutral-100', 'relative', ratioClasses[props.imageRatio]].join(' ')
})

const contentClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return ['flex', 'flex-col', 'flex-1', paddingClasses[props.padding]].join(' ')
})

const getBadgeClasses = (variant: Badge['variant'] = 'primary'): string => {
  const variantClasses = {
    primary: 'bg-brand-500 text-white',
    success: 'bg-success-500 text-white',
    error: 'bg-error-500 text-white',
    warning: 'bg-warning-500 text-neutral-900',
    info: 'bg-info-500 text-white',
  }
  return variantClasses[variant]
}

const handleClick = () => {
  if (props.clickable) {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    emit('click')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
