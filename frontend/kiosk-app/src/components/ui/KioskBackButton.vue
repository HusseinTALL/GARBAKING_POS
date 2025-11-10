/**
 * KioskBackButton Component
 *
 * Professional standalone back button with consistent styling and accessibility.
 * Can be used independently or as part of KioskHeader.
 */
<template>
  <button
    @click="handleClick"
    class="min-h-touch min-w-touch flex items-center justify-center rounded-full transition-all duration-fast hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    :class="variantClasses"
    :aria-label="label"
    :disabled="disabled"
  >
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Component Props
 */
interface Props {
  label?: string
  variant?: 'light' | 'dark' | 'ghost' | 'primary'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Go back',
  variant: 'ghost',
  disabled: false
})

/**
 * Component Emits
 */
const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

/**
 * Variant Classes
 */
const variantClasses = computed(() => {
  const classes = {
    light: 'bg-white/15 hover:bg-white/25 text-white focus-visible:ring-white',
    dark: 'bg-neutral-900 hover:bg-neutral-800 text-white focus-visible:ring-neutral-700',
    ghost: 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-300',
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus-visible:ring-brand-500'
  }

  return `${classes[props.variant]} ${props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`
})

const instance = getCurrentInstance()
const hasClickListener = computed(() => {
  const listeners = instance?.vnode.props?.onClick
  if (!listeners) return false
  if (Array.isArray(listeners)) {
    return listeners.length > 0
  }
  return true
})

/**
 * Handle click event
 */
const handleClick = () => {
  if (props.disabled) return

  emit('click')

  if (!hasClickListener.value) {
    router.back()
  }
}
</script>
