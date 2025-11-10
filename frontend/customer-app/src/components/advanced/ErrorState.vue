<!--
  ErrorState Component
  Error messages with retry functionality and various error types
  Features: custom icons, retry button, dismissible, error codes, support links
-->

<template>
  <div
    :class="[
      'error-state',
      variant === 'inline' && 'bg-error-50 dark:bg-error-900/20 border-2 border-error-200 dark:border-error-800 rounded-2xl',
      variant === 'full' && 'text-center',
      paddingClasses
    ]"
  >
    <div :class="variant === 'inline' ? 'flex items-start gap-4' : 'flex flex-col items-center'">
      <!-- Error Icon -->
      <div
        :class="[
          'flex-shrink-0',
          variant === 'inline' && 'mt-1'
        ]"
      >
        <!-- Custom Icon -->
        <component
          v-if="icon"
          :is="icon"
          :class="[iconSizeClasses, iconColorClasses]"
        />

        <!-- Default Icon based on type -->
        <svg
          v-else
          :class="[iconSizeClasses, iconColorClasses]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <!-- Network Error -->
          <path
            v-if="type === 'network'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />

          <!-- 404 Not Found -->
          <path
            v-else-if="type === '404'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />

          <!-- Permission Denied -->
          <path
            v-else-if="type === 'permission'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />

          <!-- Server Error -->
          <path
            v-else-if="type === 'server'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />

          <!-- Generic Error -->
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Error Content -->
      <div :class="variant === 'inline' ? 'flex-1' : 'text-center max-w-md'">
        <!-- Title -->
        <h3
          :class="[
            'font-bold mb-2',
            variant === 'inline' ? 'text-error-900 dark:text-error-100' : 'text-gray-900 dark:text-white',
            size === 'sm' && 'text-base',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-xl'
          ]"
        >
          {{ title || getDefaultTitle() }}
        </h3>

        <!-- Description -->
        <p
          :class="[
            variant === 'inline' ? 'text-error-700 dark:text-error-300' : 'text-gray-600 dark:text-gray-400',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            description && 'mb-4'
          ]"
        >
          {{ description || getDefaultDescription() }}
        </p>

        <!-- Error Code -->
        <div
          v-if="errorCode"
          class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 mb-4"
        >
          <span>Error Code:</span>
          <span class="font-semibold">{{ errorCode }}</span>
        </div>

        <!-- Technical Details (Expandable) -->
        <details
          v-if="technicalDetails"
          class="text-left mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Technical Details
          </summary>
          <pre class="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{{ technicalDetails }}</pre>
        </details>

        <!-- Actions -->
        <div
          :class="[
            'flex flex-wrap gap-3',
            variant === 'inline' ? 'justify-start mt-4' : 'justify-center mt-6'
          ]"
        >
          <!-- Retry Button -->
          <BaseButton
            v-if="showRetry"
            @click="handleRetry"
            :variant="variant === 'inline' ? 'outline' : 'primary'"
            :size="size === 'sm' ? 'sm' : 'md'"
            :loading="isRetrying"
          >
            {{ retryText }}
          </BaseButton>

          <!-- Custom Actions Slot -->
          <slot name="actions" />

          <!-- Support Link -->
          <BaseButton
            v-if="showSupport"
            @click="handleSupport"
            variant="ghost"
            :size="size === 'sm' ? 'sm' : 'md'"
          >
            {{ supportText }}
          </BaseButton>

          <!-- Go Back Button -->
          <BaseButton
            v-if="showGoBack"
            @click="handleGoBack"
            variant="outline"
            :size="size === 'sm' ? 'sm' : 'md'"
          >
            {{ goBackText }}
          </BaseButton>
        </div>
      </div>

      <!-- Dismiss Button (inline only) -->
      <button
        v-if="variant === 'inline' && dismissible"
        @click="handleDismiss"
        class="flex-shrink-0 p-2 text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/30 transition-colors"
        aria-label="Dismiss error"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

export interface ErrorStateProps {
  type?: 'generic' | 'network' | '404' | 'permission' | 'server'
  variant?: 'full' | 'inline'
  title?: string
  description?: string
  errorCode?: string
  technicalDetails?: string
  icon?: any
  showRetry?: boolean
  showSupport?: boolean
  showGoBack?: boolean
  retryText?: string
  supportText?: string
  goBackText?: string
  dismissible?: boolean
  size?: 'sm' | 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ErrorStateProps>(), {
  type: 'generic',
  variant: 'full',
  showRetry: true,
  showSupport: false,
  showGoBack: false,
  retryText: 'Try Again',
  supportText: 'Contact Support',
  goBackText: 'Go Back',
  dismissible: false,
  size: 'md',
  padding: 'md'
})

const emit = defineEmits<{
  retry: []
  support: []
  goBack: []
  dismiss: []
}>()

// Refs
const isRetrying = ref(false)

// Computed
const iconSizeClasses = computed(() => {
  return {
    sm: props.variant === 'inline' ? 'w-6 h-6' : 'w-16 h-16',
    md: props.variant === 'inline' ? 'w-8 h-8' : 'w-20 h-20',
    lg: props.variant === 'inline' ? 'w-10 h-10' : 'w-24 h-24'
  }[props.size]
})

const iconColorClasses = computed(() => {
  return props.variant === 'inline'
    ? 'text-error-500 dark:text-error-400'
    : 'text-error-300 dark:text-error-600'
})

const paddingClasses = computed(() => {
  if (props.variant === 'inline') {
    return {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }[props.padding]
  } else {
    return {
      sm: 'py-8 px-4',
      md: 'py-12 px-6',
      lg: 'py-16 px-8'
    }[props.padding]
  }
})

// Methods
const getDefaultTitle = () => {
  const titles = {
    generic: 'Something went wrong',
    network: 'Connection Error',
    '404': 'Page Not Found',
    permission: 'Access Denied',
    server: 'Server Error'
  }
  return titles[props.type]
}

const getDefaultDescription = () => {
  const descriptions = {
    generic: 'An unexpected error occurred. Please try again.',
    network: 'Unable to connect to the server. Please check your internet connection.',
    '404': 'The page you\'re looking for doesn\'t exist or has been moved.',
    permission: 'You don\'t have permission to access this resource.',
    server: 'Our servers are experiencing issues. Please try again later.'
  }
  return descriptions[props.type]
}

const handleRetry = async () => {
  isRetrying.value = true
  emit('retry')

  // Reset loading state after a delay
  setTimeout(() => {
    isRetrying.value = false
  }, 1000)
}

const handleSupport = () => {
  emit('support')
}

const handleGoBack = () => {
  emit('goBack')
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>
