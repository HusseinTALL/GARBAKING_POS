<!--
  LanguageModeScreen: Language selection and order mode (dine-in/takeaway) selection
  Second screen in the kiosk flow after welcome screen
-->
<template>
  <div class="language-mode-screen h-screen w-screen flex flex-col bg-brand-50">
    <KioskHeader
      :title="t('mode.title')"
      :show-back-button="false"
      :gradient="true"
      shadow-class="shadow-none"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-12 py-16 gap-16">
      <!-- Language Selection -->
      <div class="w-full max-w-4xl">
        <h2 class="text-3xl font-brand font-semibold mb-6 text-center text-neutral-900">
          {{ t('mode.selectLanguage') }}
        </h2>
        <div class="grid grid-cols-3 gap-6">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            :class="[
              'flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 bg-white shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200',
              selectedLanguage === lang.code
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <div class="text-6xl">{{ lang.flag }}</div>
            <div class="text-2xl font-brand font-semibold text-neutral-900">{{ lang.name }}</div>
          </button>
        </div>
      </div>

      <!-- Order Mode Selection -->
      <div class="w-full max-w-4xl">
        <h2 class="text-3xl font-brand font-semibold mb-6 text-center text-neutral-900">
          {{ t('mode.title') }}
        </h2>
        <div class="grid grid-cols-2 gap-8">
          <!-- Dine In -->
          <button
            @click="selectMode('dine-in')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-4',
              selectedMode === 'dine-in'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-24 h-24 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('mode.dineIn') }}</div>
          </button>

          <!-- Takeaway -->
          <button
            @click="selectMode('takeaway')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-4',
              selectedMode === 'takeaway'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-24 h-24 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('mode.takeaway') }}</div>
          </button>
        </div>
      </div>

      <!-- Continue Button -->
      <KioskButton
        size="xl"
        variant="primary"
        class="min-w-[360px]"
        :disabled="!canContinue"
        @click="handleContinue"
      >
        {{ t('mode.continue') }}
      </KioskButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { SUPPORTED_LANGUAGES } from '@/i18n'
import KioskHeader from '@/components/layout/KioskHeader.vue'
import KioskButton from '@/components/KioskButton.vue'
import type { OrderMode } from '@/types'

const router = useRouter()
const { t, locale } = useI18n({ inheritLocale: true, useScope: 'global' })
const settingsStore = useSettingsStore()

const languages = SUPPORTED_LANGUAGES
const selectedLanguage = ref(settingsStore.language)
const selectedMode = ref<OrderMode | null>(null)

const canContinue = computed(() => Boolean(selectedLanguage.value && selectedMode.value))

const selectLanguage = (code: string) => {
  selectedLanguage.value = code
  locale.value = code
  settingsStore.setLanguage(code)
}

const selectMode = (mode: OrderMode) => {
  selectedMode.value = mode
  settingsStore.setOrderMode(mode)
}

const handleContinue = () => {
  if (canContinue.value) {
    router.push('/menu')
  }
}
</script>
