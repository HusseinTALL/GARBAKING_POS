<!--
  BaseInput Component
  Accessible input field that aligns with the customer app design system.
  Supports prefixes/suffixes, hint and error messaging, and multiple sizes.
-->

<template>
  <div class="w-full space-y-2">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="text-xs text-primary-500 font-semibold">Obligatoire</span>
    </label>

    <!-- Input wrapper -->
    <div
      :class="[
        'group flex w-full items-center rounded-xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-400',
        inputSizeClasses,
        inputStateClasses,
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
      ]"
    >
      <!-- Prefix slot / icon -->
      <span v-if="$slots.prefix || prefixIcon" class="pl-3 text-gray-400 dark:text-gray-500 flex items-center">
        <slot name="prefix">
          <component :is="prefixIcon" class="w-5 h-5" />
        </slot>
      </span>

      <!-- Input element -->
      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :minlength="minlength"
        :step="step"
        @input="handleInput"
        @focus="event => emit('focus', event)"
        @blur="handleBlur"
        class="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder-gray-600"
        :class="[
          inputPaddingClasses,
          disabled ? 'cursor-not-allowed' : 'cursor-text'
        ]"
      />

      <!-- Suffix slot / icon -->
      <span v-if="$slots.suffix || suffixIcon" class="pr-3 text-gray-400 dark:text-gray-500 flex items-center">
        <slot name="suffix">
          <component :is="suffixIcon" class="w-5 h-5" />
        </slot>
      </span>
    </div>

    <!-- Hint / helper text -->
    <p
      v-if="showHint"
      :class="[
        'text-xs leading-snug',
        error ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'
      ]"
    >
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const generatedId = `base-input-${Math.random().toString(36).slice(2, 9)}`

export interface BaseInputProps {
  modelValue: string | number | null
  type?: string
  label?: string
  name?: string
  id?: string
  placeholder?: string
  hint?: string
  error?: string
  prefixIcon?: any
  suffixIcon?: any
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  inputmode?: string
  maxlength?: number
  minlength?: number
  step?: number | string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const inputId = computed(() => props.id ?? generatedId)

const inputSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm'
    case 'lg':
      return 'text-lg'
    default:
      return 'text-base'
  }
})

const inputPaddingClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'py-2 px-3'
    case 'lg':
      return 'py-3 px-4'
    default:
      return 'py-3 px-4'
  }
})

const inputStateClasses = computed(() => {
  if (props.error) {
    return 'border-error-400 focus-within:ring-error-200 focus-within:border-error-400 dark:border-error-500 dark:focus-within:ring-error-500/40'
  }
  return 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
})

const showHint = computed(() => Boolean(props.hint || props.error))

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number | null = target.value

  if (props.type === 'number') {
    const parsed = target.value === '' ? null : Number(target.value)
    value = Number.isNaN(parsed) ? null : parsed
  }

  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  inputRef
})
</script>
