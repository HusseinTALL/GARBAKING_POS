<!--
  EmptyState Component
  Beautiful empty/no-results views with customizable content
  Features: custom icons, images, animations, action buttons
-->

<template>
  <div :class="['empty-state text-center', paddingClasses]">
    <!-- Illustration/Icon -->
    <div class="flex justify-center mb-6">
      <!-- Custom Image -->
      <img
        v-if="image"
        :src="image"
        :alt="title"
        :class="['object-contain', imageSizeClasses]"
      />

      <!-- Custom Icon -->
      <component
        v-else-if="icon"
        :is="icon"
        :class="['text-gray-300 dark:text-gray-600', iconSizeClasses]"
      />

      <!-- Default Icon based on type -->
      <svg
        v-else
        :class="['text-gray-300 dark:text-gray-600', iconSizeClasses]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <!-- Search No Results -->
        <path
          v-if="type === 'search'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />

        <!-- Empty Cart -->
        <path
          v-else-if="type === 'cart'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />

        <!-- Empty Inbox/List -->
        <path
          v-else-if="type === 'inbox'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />

        <!-- No Favorites -->
        <path
          v-else-if="type === 'favorites'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />

        <!-- No Data/Generic -->
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>

    <!-- Title -->
    <h3
      :class="[
        'font-bold text-gray-900 dark:text-white mb-2',
        size === 'sm' && 'text-base',
        size === 'md' && 'text-lg',
        size === 'lg' && 'text-xl'
      ]"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      :class="[
        'text-gray-600 dark:text-gray-400 max-w-md mx-auto',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
        description && 'mb-6'
      ]"
    >
      {{ description }}
    </p>

    <!-- Custom Content Slot -->
    <div v-if="$slots.default" class="mb-6">
      <slot />
    </div>

    <!-- Action Button(s) -->
    <div
      v-if="actionText || $slots.actions"
      class="flex flex-col sm:flex-row items-center justify-center gap-3"
    >
      <slot name="actions">
        <BaseButton
          v-if="actionText"
          :variant="actionVariant"
          :size="size === 'sm' ? 'md' : 'lg'"
          @click="handleAction"
        >
          {{ actionText }}
        </BaseButton>
        <BaseButton
          v-if="secondaryActionText"
          variant="outline"
          :size="size === 'sm' ? 'md' : 'lg'"
          @click="handleSecondaryAction"
        >
          {{ secondaryActionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

export interface EmptyStateProps {
  type?: 'search' | 'cart' | 'inbox' | 'favorites' | 'generic'
  title?: string
  description?: string
  image?: string
  icon?: any
  actionText?: string
  actionVariant?: 'primary' | 'secondary' | 'outline'
  secondaryActionText?: string
  size?: 'sm' | 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  type: 'generic',
  title: 'No items found',
  description: '',
  actionVariant: 'primary',
  size: 'md',
  padding: 'lg'
})

const emit = defineEmits<{
  action: []
  secondaryAction: []
}>()

// Computed
const iconSizeClasses = computed(() => {
  return {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  }[props.size]
})

const imageSizeClasses = computed(() => {
  return {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48'
  }[props.size]
})

const paddingClasses = computed(() => {
  return {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
    xl: 'py-24 px-12'
  }[props.padding]
})

// Methods
const handleAction = () => {
  emit('action')
}

const handleSecondaryAction = () => {
  emit('secondaryAction')
}
</script>
