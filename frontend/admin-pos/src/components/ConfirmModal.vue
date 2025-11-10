<!--
  Reusable confirmation modal for destructive actions
  Provides clear messaging and consistent styling for confirmations
-->

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <component :is="icon" class="w-6 h-6 text-red-600" />
          </div>
          <h2 class="text-xl font-bold text-white">
            {{ title }}
          </h2>
        </div>
        <button
          @click="$emit('cancel')"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6">
        <p class="text-gray-300 text-sm leading-relaxed mb-6">
          {{ message }}
        </p>

        <!-- Warning for destructive actions -->
        <div v-if="isDestructive" class="p-4 bg-red-900/20 border border-red-700/50 rounded-lg mb-6">
          <div class="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle class="w-4 h-4" />
            <span class="font-medium">This action cannot be undone</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 btn btn-secondary"
            :disabled="isLoading"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            @click="$emit('confirm')"
            :class="[
              'flex-1 btn',
              isDestructive ? 'btn-danger' : 'btn-primary'
            ]"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ loadingText }}
            </span>
            <span v-else>
              {{ confirmText }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  isLoading?: boolean
  isDestructive?: boolean
  icon?: Component
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  isLoading: false,
  isDestructive: false,
  icon: () => AlertCircle
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
