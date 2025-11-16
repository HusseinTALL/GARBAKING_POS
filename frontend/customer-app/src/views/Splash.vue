<script setup lang="ts">
/**
 * Splash - App loading screen (Page 1 - UI/UX 4.4)
 *
 * Features:
 * - Animated logo with branding
 * - Loading indicator
 * - Auto-navigation based on app state
 */

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const checkAppState = async () => {
  // Wait minimum time for splash screen (2 seconds for animation)
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

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center relative overflow-hidden">
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Animated circles -->
      <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full animate-ping"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 text-center px-6">
      <!-- Logo Container with Animation -->
      <div class="animate-fadeInScale mb-8">
        <!-- Logo Circle -->
        <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <i class="fas fa-burger text-primary-500 text-6xl"></i>
        </div>

        <!-- App Name -->
        <h1 class="text-white font-bold text-5xl mb-2 tracking-tight">
          Garbaking
        </h1>

        <!-- Tagline -->
        <p class="text-white/90 text-lg">
          Delicious meals, delivered fast
        </p>
      </div>

      <!-- Loading Indicator -->
      <div class="flex justify-center mt-12 animate-fadeIn" style="animation-delay: 0.5s">
        <div class="flex gap-2">
          <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Version -->
      <p class="text-white/60 text-sm mt-8 animate-fadeIn" style="animation-delay: 1s">
        Version 1.0.0
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeInScale {
  animation: fadeInScale 0.8s ease-out forwards;
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes ping {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
