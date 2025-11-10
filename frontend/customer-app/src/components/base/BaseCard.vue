<!--
  BaseCard Component
  Versatile container with variants and slots for header, body, and footer.
  Follows the design system spacing, radius, and shadow tokens.
-->

<template>
  <component
    :is="as"
    :class="cardClasses"
    v-bind="attrs"
  >
    <!-- Header -->
    <header
      v-if="$slots.header || title || subtitle"
      class="mb-4 flex flex-col gap-1"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">
            {{ subtitle }}
          </p>
        </div>

        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>

      <slot name="header" />
    </header>

    <!-- Body -->
    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <footer v-if="$slots.footer" class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

export interface BaseCardProps {
  variant?: 'solid' | 'elevated' | 'outline' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  title?: string
  subtitle?: string
  as?: string | object
}

const props = withDefaults(defineProps<BaseCardProps>(), {
  variant: 'elevated',
  padding: 'md',
  as: 'div'
})

const attrs = useAttrs()

const cardClasses = computed(() => {
  const classes: string[] = [
    'flex flex-col',
    'rounded-2xl transition-shadow duration-200',
    'bg-white dark:bg-gray-900'
  ]

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  classes.push(paddingClasses[props.padding])

  const variantClasses = {
    solid: 'border border-gray-100 dark:border-gray-800 shadow-sm',
    elevated: 'shadow-lg shadow-gray-200/60 dark:shadow-black/40 border border-transparent',
    outline: 'border border-gray-200 dark:border-gray-700',
    ghost: 'border border-transparent bg-transparent dark:bg-transparent shadow-none'
  }

  classes.push(variantClasses[props.variant])

  return classes.join(' ')
})
</script>
