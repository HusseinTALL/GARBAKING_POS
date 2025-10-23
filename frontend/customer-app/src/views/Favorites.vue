<!--
  Favorites View - Placeholder for favorite menu items
  Will display user's saved favorite dishes
-->

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-text-DEFAULT">Favorites ❤️</h1>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-12">
      <!-- Empty state -->
      <div class="text-center py-20">
        <div class="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-text-DEFAULT mb-2">No Favorites Yet</h3>
        <p class="text-text-secondary mb-6 max-w-xs mx-auto">
          Start adding your favorite dishes to quickly find them later
        </p>
        <button
          @click="goToHome"
          class="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

const goToHome = () => {
  router.push('/home')
}
</script>
