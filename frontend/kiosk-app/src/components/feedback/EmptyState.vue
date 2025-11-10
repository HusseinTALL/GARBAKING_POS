/**
 * EmptyState Component
 *
 * Professional empty state display with icons, helpful messaging,
 * and call-to-action buttons. Improves UX when no content is available.
 */
<template>
  <div class="flex flex-col items-center justify-center px-12 py-16 text-center">
    <!-- Icon/Illustration -->
    <div
      class="w-32 h-32 rounded-full flex items-center justify-center mb-6"
      :class="iconBackgroundClass"
    >
      <!-- Custom Icon Slot -->
      <slot name="icon">
        <!-- Default Icon (Shopping Cart) -->
        <svg
          class="w-16 h-16"
          :class="iconColorClass"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="icon === 'cart'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            v-else-if="icon === 'search'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <path
            v-else-if="icon === 'document'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          <path
            v-else-if="icon === 'inbox'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3 class="text-3xl font-brand font-semibold text-neutral-900 mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-lg text-neutral-600 mb-8 max-w-md">
      {{ description }}
    </p>

    <!-- Action Buttons -->
    <div v-if="showAction || $slots.action" class="flex items-center gap-4">
      <!-- Custom Action Slot -->
      <slot name="action">
        <!-- Default Action Button -->
        <KioskButton
          v-if="showAction"
          @click="handleAction"
          :variant="actionVariant"
          size="lg"
        >
          <template v-if="actionIcon" #icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </template>
          {{ actionLabel }}
        </KioskButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KioskButton from '@/components/KioskButton.vue'

/**
 * Component Props
 */
interface Props {
  icon?: 'cart' | 'search' | 'document' | 'inbox' | 'custom'
  title?: string
  description?: string
  variant?: 'neutral' | 'primary' | 'success' | 'warning'
  showAction?: boolean
  actionLabel?: string
  actionIcon?: boolean
  actionVariant?: 'primary' | 'secondary' | 'ghost'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'cart',
  title: 'No items found',
  description: 'There are no items to display at the moment.',
  variant: 'neutral',
  showAction: true,
  actionLabel: 'Get Started',
  actionIcon: true,
  actionVariant: 'primary'
})

/**
 * Component Emits
 */
const emit = defineEmits<{
  action: []
}>()

/**
 * Icon background class based on variant
 */
const iconBackgroundClass = computed(() => {
  const backgrounds = {
    neutral: 'bg-neutral-100',
    primary: 'bg-brand-50',
    success: 'bg-success-50',
    warning: 'bg-warning-50'
  }
  return backgrounds[props.variant]
})

/**
 * Icon color class based on variant
 */
const iconColorClass = computed(() => {
  const colors = {
    neutral: 'text-neutral-400',
    primary: 'text-brand-500',
    success: 'text-success-500',
    warning: 'text-warning-500'
  }
  return colors[props.variant]
})

/**
 * Handle action button click
 */
const handleAction = () => {
  emit('action')
}
</script>
