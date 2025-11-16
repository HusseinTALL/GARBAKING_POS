<!--
  ErrorBoundary - Catches and displays errors gracefully
  Provides user-friendly error messages and recovery options
-->

<template>
  <div v-if="hasError" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Error Icon -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('errors.something_went_wrong') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('errors.error_occurred_desc') }}
        </p>
      </div>

      <!-- Error Details (in development mode) -->
      <div v-if="showDetails && error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
        <details>
          <summary class="cursor-pointer font-semibold text-red-900 dark:text-red-300 mb-2">
            {{ t('errors.error_details') }}
          </summary>
          <div class="mt-3 space-y-2">
            <p class="text-sm text-red-800 dark:text-red-400 font-mono break-all">
              {{ error.message }}
            </p>
            <pre v-if="error.stack" class="text-xs text-red-700 dark:text-red-500 overflow-x-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">{{ error.stack }}</pre>
          </div>
        </details>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="handleReload"
          class="w-full py-3 px-6 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span>{{ t('errors.reload_page') }}</span>
        </button>

        <button
          @click="handleGoHome"
          class="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>{{ t('errors.go_home') }}</span>
        </button>

        <button
          v-if="showReport"
          @click="handleReport"
          class="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
        >
          {{ t('errors.report_problem') }}
        </button>
      </div>

      <!-- Support Info -->
      <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{{ t('errors.need_help') }}</p>
        <a href="mailto:support@garbaking.com" class="text-primary-600 dark:text-primary-400 hover:underline">
          support@garbaking.com
        </a>
      </div>
    </div>
  </div>

  <!-- Render children if no error -->
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const hasError = ref(false)
const error = ref<Error | null>(null)

// Show details in development mode
const showDetails = computed(() => import.meta.env.DEV)
const showReport = computed(() => !import.meta.env.DEV)

// Capture errors from child components
onErrorCaptured((err: Error, instance, info) => {
  console.error('Error caught by ErrorBoundary:', err, info)

  hasError.value = true
  error.value = err

  // Prevent error from propagating
  return false
})

// Handle window errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    hasError.value = true
    error.value = event.error
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    hasError.value = true
    error.value = new Error(event.reason?.message || 'Unhandled promise rejection')
  })
}

// Actions
function handleReload() {
  window.location.reload()
}

function handleGoHome() {
  hasError.value = false
  error.value = null
  router.push('/home')
}

function handleReport() {
  const subject = encodeURIComponent('Error Report - Customer App')
  const body = encodeURIComponent(`
Error Message: ${error.value?.message || 'Unknown error'}

Stack Trace:
${error.value?.stack || 'No stack trace available'}

User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
  `.trim())

  window.location.href = `mailto:support@garbaking.com?subject=${subject}&body=${body}`
}
</script>
