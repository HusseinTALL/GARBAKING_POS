<!--
  BaseToast Component
  Lightweight toast notification with variant styling and auto-dismiss support.
-->

<template>
  <Transition name="toast-slide">
    <div
      v-if="visible"
      :class="[
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-4 shadow-lg ring-1 ring-black/5',
        variantClasses
      ]"
      role="status"
      :aria-live="variant === 'error' ? 'assertive' : 'polite'"
    >
      <component
        v-if="icon"
        :is="icon"
        class="mt-0.5 h-5 w-5 flex-shrink-0"
      />

      <div class="flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <h3 v-if="title" class="font-semibold tracking-tight">
            {{ title }}
          </h3>
          <button
            v-if="dismissible"
            type="button"
            class="rounded-full p-1 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            @click="close"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-sm leading-snug opacity-90">
          <slot>{{ message }}</slot>
        </p>

        <div v-if="$slots.footer" class="pt-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { CheckCircle, AlertTriangle, Info } from 'lucide-vue-next'

export interface BaseToastProps {
  modelValue: boolean
  title?: string
  message?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  dismissible?: boolean
  icon?: any
}

const props = withDefaults(defineProps<BaseToastProps>(), {
  modelValue: false,
  variant: 'default',
  duration: 4500,
  dismissible: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const visible = ref(props.modelValue)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const defaultIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
}

const icon = computed(() => props.icon ?? defaultIcons[props.variant as keyof typeof defaultIcons])

const variantClasses = computed(() => {
  const base = 'text-white backdrop-blur bg-gray-900/90 dark:bg-gray-800/90'
  const mapping = {
    default: `${base}`,
    success: 'bg-success-600 text-white',
    error: 'bg-error-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-primary-500 text-white'
  }
  return mapping[props.variant]
})

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}

const startTimer = () => {
  if (!props.duration || props.duration <= 0) return
  clearTimer()
  timeoutId = setTimeout(() => {
    close()
  }, props.duration)
}

const clearTimer = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value
    if (value) {
      startTimer()
    } else {
      clearTimer()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTimer()
})

defineExpose({ close })
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}
</style>
