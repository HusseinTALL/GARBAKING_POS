/**
 * ErrorState Component
 *
 * Professional error state display with consistent styling, retry actions,
 * and helpful messaging. Improves UX when errors occur.
 */
<template>
  <div class="flex flex-col items-center justify-center px-12 py-16 text-center">
    <!-- Error Icon -->
    <div
      class="w-24 h-24 rounded-full bg-error-50 flex items-center justify-center mb-6"
    >
      <svg
        class="w-12 h-12 text-error-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-3xl font-brand font-semibold text-neutral-900 mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-lg text-neutral-600 mb-8 max-w-md">
      {{ description }}
    </p>

    <!-- Error Details (collapsible) -->
    <div v-if="errorMessage && showDetails" class="mb-8 w-full max-w-2xl">
      <button
        @click="detailsExpanded = !detailsExpanded"
        class="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors duration-fast"
      >
        <svg
          class="w-5 h-5 transition-transform duration-fast"
          :class="{ 'rotate-180': detailsExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {{ detailsExpanded ? 'Hide' : 'Show' }} error details
      </button>

      <Transition name="slide-down">
        <div
          v-if="detailsExpanded"
          class="mt-4 p-4 bg-neutral-100 rounded-2xl text-left"
        >
          <code class="text-sm text-neutral-700 break-all">
            {{ errorMessage }}
          </code>
        </div>
      </Transition>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <!-- Retry Button -->
      <KioskButton
        v-if="showRetry"
        @click="handleRetry"
        variant="primary"
        size="lg"
        :loading="retrying"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </template>
        {{ retryLabel }}
      </KioskButton>

      <!-- Secondary Action Button -->
      <KioskButton
        v-if="showSecondaryAction"
        @click="handleSecondaryAction"
        variant="ghost"
        size="lg"
      >
        {{ secondaryActionLabel }}
      </KioskButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KioskButton from '@/components/KioskButton.vue'

/**
 * Component Props
 */
interface Props {
  title?: string
  description?: string
  errorMessage?: string
  showDetails?: boolean
  showRetry?: boolean
  retryLabel?: string
  showSecondaryAction?: boolean
  secondaryActionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  description: "We encountered an error. Please try again or contact support if the problem persists.",
  errorMessage: '',
  showDetails: false,
  showRetry: true,
  retryLabel: 'Try Again',
  showSecondaryAction: false,
  secondaryActionLabel: 'Go Back'
})

/**
 * Component Emits
 */
const emit = defineEmits<{
  retry: []
  secondaryAction: []
}>()

const detailsExpanded = ref(false)
const retrying = ref(false)

/**
 * Handle retry action
 */
const handleRetry = async () => {
  retrying.value = true
  emit('retry')
  // Reset after a delay (parent should handle actual retry logic)
  setTimeout(() => {
    retrying.value = false
  }, 1000)
}

/**
 * Handle secondary action
 */
const handleSecondaryAction = () => {
  emit('secondaryAction')
}
</script>

<style scoped>
/* Slide down transition for error details */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
