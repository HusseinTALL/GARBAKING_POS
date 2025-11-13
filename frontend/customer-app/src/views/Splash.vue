<!--
  Splash.vue
  Initial loading screen shown on app startup
  Checks authentication and onboarding status, then navigates to appropriate screen
-->
<template>
  <div class="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
    <!-- Animated radiating lines (bottom right) -->
    <div class="absolute bottom-0 right-0 w-64 h-64 opacity-20">
      <div
        v-for="i in 12"
        :key="i"
        class="absolute bottom-0 right-0 w-1 bg-gradient-to-t from-orange-500 to-transparent origin-bottom-right"
        :style="{
          height: '100%',
          transform: `rotate(${i * 15}deg)`,
          animation: `radiateIn 1.5s ease-out ${i * 0.05}s forwards`
        }"
      ></div>
    </div>

    <!-- Animated radiating lines (top left) -->
    <div class="absolute top-0 left-0 w-64 h-64 opacity-10 rotate-180">
      <div
        v-for="i in 12"
        :key="i"
        class="absolute bottom-0 right-0 w-1 bg-gradient-to-t from-orange-400 to-transparent origin-bottom-right"
        :style="{
          height: '100%',
          transform: `rotate(${i * 15}deg)`,
          animation: `radiateIn 1.5s ease-out ${i * 0.05}s forwards`
        }"
      ></div>
    </div>

    <!-- Logo -->
    <div class="relative z-10 text-center animate-fadeIn">
      <div class="mb-4">
        <!-- Food Logo -->
        <div class="inline-flex items-center justify-center">
          <svg class="w-24 h-24 text-orange-500" fill="currentColor" viewBox="0 0 100 100">
            <!-- Chef hat -->
            <path d="M 30 40 Q 30 25 50 25 Q 70 25 70 40 L 70 50 L 30 50 Z" />
            <rect x="28" y="48" width="44" height="8" rx="2" />
            <!-- Letter F -->
            <text x="42" y="72" font-size="28" font-weight="bold" fill="#2C2F3E">F</text>
          </svg>
        </div>

        <!-- Brand Name -->
        <h1 class="text-4xl font-bold mt-4">
          <span class="text-gray-900">Food</span>
        </h1>

        <!-- Tagline -->
        <p class="text-gray-500 text-sm mt-2">Delicious meals, delivered fast</p>
      </div>

      <!-- Loading indicator -->
      <div class="flex justify-center mt-8">
        <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const checkAppState = async () => {
  // Wait minimum time for splash screen
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed')
    const authToken = authStore.token

    // Check onboarding first
    if (!hasSeenOnboarding) {
      router.replace('/onboarding')
      return
    }

    // Check authentication
    if (!authToken) {
      router.replace('/login')
      return
    }

    // Validate token
    const isValid = await authStore.validateToken()

    if (isValid) {
      // Fetch user data
      await authStore.fetchUser()
      router.replace('/home')
    } else {
      // Token invalid, logout and go to login
      authStore.logout()
      router.replace('/login')
    }
  } catch (error) {
    console.error('Splash screen error:', error)
    // On error, go to login
    router.replace('/login')
  }
}

onMounted(() => {
  checkAppState()
})
</script>

<style scoped>
@keyframes radiateIn {
  from {
    transform-origin: bottom right;
    scale: 0;
    opacity: 0;
  }
  to {
    transform-origin: bottom right;
    scale: 1;
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
</style>
