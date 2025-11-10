<!--
  Component Showcase View
  Comprehensive demo of all base components
  Tests light/dark mode, variants, sizes, and interactions
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Component Showcase</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">Test all base components in action</p>
        </div>

        <!-- Theme toggle -->
        <button
          @click="toggleTheme"
          class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span v-if="isDark">🌞 Light</span>
          <span v-else>🌙 Dark</span>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <!-- BaseButton -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseButton</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <BaseButton variant="primary" label="Primary" />
              <BaseButton variant="secondary" label="Secondary" />
              <BaseButton variant="outline" label="Outline" />
              <BaseButton variant="ghost" label="Ghost" />
              <BaseButton variant="cta" label="CTA Button" />
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sizes</h3>
            <div class="flex flex-wrap items-end gap-3">
              <BaseButton size="sm" label="Small" />
              <BaseButton size="md" label="Medium" />
              <BaseButton size="lg" label="Large" />
              <BaseButton size="xl" label="Extra Large" />
            </div>
          </div>

          <!-- States -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">States</h3>
            <div class="flex flex-wrap gap-3">
              <BaseButton label="Normal" />
              <BaseButton label="Disabled" disabled />
              <BaseButton label="Loading" loading />
            </div>
          </div>
        </div>
      </section>

      <!-- BaseInput -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseInput</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="inputValue"
            label="Name"
            placeholder="Enter your name"
            hint="This is a helper text"
          />

          <BaseInput
            v-model="emailValue"
            type="email"
            label="Email"
            placeholder="your@email.com"
            required
          />

          <BaseInput
            v-model="passwordValue"
            type="password"
            label="Password"
            placeholder="Enter password"
          />

          <BaseInput
            v-model="phoneValue"
            type="tel"
            label="Phone"
            placeholder="+1 (555) 000-0000"
          />

          <BaseInput
            v-model="errorInput"
            label="With Error"
            placeholder="This has an error"
            error="This field is required"
          />

          <BaseInput
            v-model="successInput"
            label="With Success"
            placeholder="Looks good!"
          />
        </div>
      </section>

      <!-- BaseCard -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">BaseCard</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BaseCard variant="solid" title="Solid Card" subtitle="With subtitle">
            <p class="text-gray-600 dark:text-gray-400">This is a solid card variant with border and minimal shadow.</p>
          </BaseCard>

          <BaseCard variant="elevated" title="Elevated Card">
            <p class="text-gray-600 dark:text-gray-400">This card has more shadow for elevation effect.</p>
          </BaseCard>

          <BaseCard variant="outline" title="Outline Card">
            <p class="text-gray-600 dark:text-gray-400">Simple outline style without shadow.</p>
          </BaseCard>

          <BaseCard variant="ghost" title="Ghost Card">
            <p class="text-gray-600 dark:text-gray-400">Transparent background, no borders.</p>
          </BaseCard>
        </div>
      </section>

      <!-- BaseLoader -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseLoader</h2>

        <div class="space-y-8">
          <!-- Spinner -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Spinner</h3>
            <div class="flex flex-wrap items-center gap-8">
              <BaseLoader variant="spinner" size="sm" label="Small" />
              <BaseLoader variant="spinner" size="md" label="Medium" />
              <BaseLoader variant="spinner" size="lg" label="Large" />
              <BaseLoader variant="spinner" size="xl" />
            </div>
          </div>

          <!-- Dots -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Dots</h3>
            <div class="flex flex-wrap items-center gap-8">
              <BaseLoader variant="dots" size="sm" />
              <BaseLoader variant="dots" size="md" />
              <BaseLoader variant="dots" size="lg" />
            </div>
          </div>

          <!-- Pulse -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pulse</h3>
            <div class="flex flex-wrap items-center gap-8">
              <BaseLoader variant="pulse" size="md" label="Loading..." />
              <BaseLoader variant="pulse" size="lg" color="success" label="Processing..." />
            </div>
          </div>

          <!-- Progress -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Progress Bar</h3>
            <div class="space-y-4 max-w-md">
              <BaseLoader variant="progress" :progress="progressValue" label="Upload progress" />
              <BaseLoader variant="progress" :progress="75" color="success" />
              <BaseLoader variant="progress" :progress="30" color="error" />
            </div>
          </div>

          <!-- Skeleton -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Skeleton</h3>
            <div class="max-w-md">
              <BaseLoader variant="skeleton" />
            </div>
          </div>
        </div>
      </section>

      <!-- BaseBadge -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseBadge</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="default" label="Default" />
              <BaseBadge variant="primary" label="Primary" />
              <BaseBadge variant="success" label="Success" />
              <BaseBadge variant="error" label="Error" />
              <BaseBadge variant="warning" label="Warning" />
              <BaseBadge variant="info" label="Info" />
              <BaseBadge variant="outline" label="Outline" />
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <BaseBadge size="xs" label="XS" />
              <BaseBadge size="sm" label="SM" />
              <BaseBadge size="md" label="MD" />
              <BaseBadge size="lg" label="LG" />
            </div>
          </div>

          <!-- Notification badges -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Notifications</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="error" label="3" rounded />
              <BaseBadge variant="primary" label="12" rounded />
              <BaseBadge variant="success" label="99+" rounded size="sm" />
              <BaseBadge variant="primary" dot rounded size="xs" />
            </div>
          </div>

          <!-- With pulse -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pulse Animation</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBadge variant="error" label="Live" rounded pulse />
              <BaseBadge variant="success" label="New" pulse />
            </div>
          </div>
        </div>
      </section>

      <!-- BaseChip -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseChip</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <BaseChip variant="default" label="Default" />
              <BaseChip variant="primary" label="Primary" />
              <BaseChip variant="success" label="Success" />
              <BaseChip variant="error" label="Error" />
              <BaseChip variant="warning" label="Warning" />
              <BaseChip variant="info" label="Info" />
              <BaseChip variant="outline" label="Outline" />
            </div>
          </div>

          <!-- Selected state -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Selected State</h3>
            <div class="flex flex-wrap gap-3">
              <BaseChip label="Not Selected" />
              <BaseChip label="Selected" selected variant="primary" />
              <BaseChip label="Selected Success" selected variant="success" />
            </div>
          </div>

          <!-- Removable -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Removable Chips</h3>
            <div class="flex flex-wrap gap-3">
              <BaseChip label="Pizza" removable variant="primary" @remove="handleChipRemove('Pizza')" />
              <BaseChip label="Burger" removable variant="primary" @remove="handleChipRemove('Burger')" />
              <BaseChip label="Salad" removable variant="success" @remove="handleChipRemove('Salad')" />
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <BaseChip size="sm" label="Small" variant="primary" />
              <BaseChip size="md" label="Medium" variant="primary" />
              <BaseChip size="lg" label="Large" variant="primary" />
            </div>
          </div>
        </div>
      </section>

      <!-- BaseModal Demo -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseModal</h2>

        <div class="flex flex-wrap gap-3">
          <BaseButton @click="showModal = true" label="Open Modal" />
          <BaseButton @click="showModalWithFooter = true" label="Modal with Footer" variant="outline" />
        </div>
      </section>

      <!-- BaseToast Demo -->
      <section class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">BaseToast</h2>

        <div class="flex flex-wrap gap-3">
          <BaseButton @click="showToast('success')" label="Success Toast" variant="outline" />
          <BaseButton @click="showToast('error')" label="Error Toast" variant="outline" />
          <BaseButton @click="showToast('warning')" label="Warning Toast" variant="outline" />
          <BaseButton @click="showToast('info')" label="Info Toast" variant="outline" />
        </div>
      </section>
    </main>

    <!-- Modals -->
    <BaseModal v-model="showModal" title="Example Modal" subtitle="This is a modal dialog">
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          This is an example modal using the BaseModal component. It supports various features like:
        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Backdrop click to close</li>
          <li>ESC key to close</li>
          <li>Custom header and footer slots</li>
          <li>Multiple sizes</li>
          <li>Dark mode support</li>
        </ul>
      </div>
    </BaseModal>

    <BaseModal v-model="showModalWithFooter" title="Modal with Footer">
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        This modal demonstrates the footer slot feature.
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" label="Cancel" @click="showModalWithFooter = false" />
          <BaseButton variant="primary" label="Confirm" @click="showModalWithFooter = false" />
        </div>
      </template>
    </BaseModal>

    <!-- Toast Container -->
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <BaseToast
        v-model="toastVisible"
        :variant="toastVariant"
        :title="toastTitle"
        :message="toastMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseToast from '@/components/base/BaseToast.vue'

const { isDark, toggleTheme } = useTheme()

// Input values
const inputValue = ref('')
const emailValue = ref('')
const passwordValue = ref('')
const phoneValue = ref('')
const errorInput = ref('')
const successInput = ref('Valid input')

// Progress
const progressValue = ref(45)

// Modals
const showModal = ref(false)
const showModalWithFooter = ref(false)

// Toast
const toastVisible = ref(false)
const toastVariant = ref<'success' | 'error' | 'warning' | 'info'>('success')
const toastTitle = ref('')
const toastMessage = ref('')

// Methods
const handleChipRemove = (label: string) => {
  console.log(`Removed chip: ${label}`)
  showToast('info', 'Chip Removed', `${label} has been removed`)
}

const showToast = (variant: 'success' | 'error' | 'warning' | 'info', title?: string, message?: string) => {
  toastVisible.value = false
  setTimeout(() => {
    toastVariant.value = variant
    toastTitle.value = title || `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`
    toastMessage.value = message || `This is a ${variant} toast notification!`
    toastVisible.value = true
  }, 100)
}

// Simulate progress
setInterval(() => {
  progressValue.value = (progressValue.value + 5) % 100
}, 1000)
</script>
