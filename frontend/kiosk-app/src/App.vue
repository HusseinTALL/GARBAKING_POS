<!--
  Main App Component for Garbaking Kiosk App
  Handles global layout, idle detection, and screen transitions
-->
<template>
  <div id="app" class="antialiased" :dir="currentDirection">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Global Idle Detection -->
    <IdleDetector v-if="!isWelcomeScreen" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IdleDetector from '@/components/IdleDetector.vue'
import { SUPPORTED_LANGUAGES } from '@/i18n'

const route = useRoute()
const { locale } = useI18n()

const isWelcomeScreen = computed(() => route.name === 'welcome')

const currentDirection = computed(() => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === locale.value)
  return lang?.dir || 'ltr'
})
</script>

<style>
@import './assets/main.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
