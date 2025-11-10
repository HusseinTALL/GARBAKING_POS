<!--
  BaseModal Component
  Accessible modal dialog with overlay, focus trapping hooks, and size variants.
  Uses design system radii and motion easing.
-->

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
        role="dialog"
        :aria-modal="true"
        @keydown.esc="handleEsc"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          @click="handleOverlayClick"
        />

        <!-- Modal container -->
        <Transition name="modal-scale">
          <div
            v-if="modelValue"
            :class="[
              'relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900',
              sizeClasses
            ]"
          >
            <div class="flex flex-col max-h-[85vh]">
              <!-- Header -->
              <header v-if="showHeader" class="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <div>
                  <h2 v-if="title" class="text-xl font-semibold text-gray-900 dark:text-gray-50">
                    {{ title }}
                  </h2>
                  <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ subtitle }}
                  </p>
                  <slot name="header" />
                </div>

                <button
                  v-if="closable"
                  type="button"
                  class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  @click="close"
                  aria-label="Fermer le dialogue"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>

              <!-- Content -->
              <section class="flex-1 overflow-y-auto px-6 py-6">
                <slot />
              </section>

              <!-- Footer -->
              <footer v-if="$slots.footer" class="border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                <slot name="footer" />
              </footer>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'

export interface BaseModalProps {
  modelValue: boolean
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  closeOnBackdrop?: boolean
  showHeader?: boolean
}

const props = withDefaults(defineProps<BaseModalProps>(), {
  modelValue: false,
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  showHeader: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-lg'
    case 'lg':
      return 'max-w-4xl'
    default:
      return 'max-w-3xl'
  }
})

const close = () => {
  if (!props.closable) return
  emit('update:modelValue', false)
  emit('close')
  enableBodyScroll()
}

const handleOverlayClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleEsc = () => {
  close()
}

const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const enableBodyScroll = () => {
  document.body.style.overflow = ''
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      disableBodyScroll()
      emit('open')
    } else {
      enableBodyScroll()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  enableBodyScroll()
})

defineExpose({ close })
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 150ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease;
}

.modal-scale-leave-active {
  transition: transform 120ms ease, opacity 120ms ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
