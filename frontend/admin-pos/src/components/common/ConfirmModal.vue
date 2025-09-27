<!--
  Reusable confirmation modal for dangerous actions
  Provides customizable confirmation dialogs with different variants
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-md w-full animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div :class="[
        'px-6 py-4 border-b flex items-center',
        variant === 'danger' ? 'border-red-200' : 'border-gray-200'
      ]">
        <div :class="[
          'w-10 h-10 rounded-full flex items-center justify-center mr-4',
          variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
        ]">
          <AlertTriangle
            v-if="variant === 'danger'"
            class="w-5 h-5 text-red-600"
          />
          <Info
            v-else-if="variant === 'info'"
            class="w-5 h-5 text-blue-600"
          />
          <HelpCircle
            v-else
            class="w-5 h-5 text-yellow-600"
          />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
        </div>
        <button
          @click="$emit('cancel')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <p class="text-gray-600 mb-4">
          {{ message }}
        </p>

        <!-- Custom content slot -->
        <slot></slot>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          :disabled="loading"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center',
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white',
            loading ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          <Loader2
            v-if="loading"
            class="animate-spin w-4 h-4 mr-2"
          />
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertTriangle,
  Info,
  HelpCircle,
  X,
  Loader2
} from 'lucide-vue-next'

interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'info',
  loading: false
})

const emit = defineEmits<Emits>()

const loading = ref(props.loading)

const handleConfirm = () => {
  emit('confirm')
}

// Close modal on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

// Add event listener on mount
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

// Clean up event listener on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>