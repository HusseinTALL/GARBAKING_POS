<script setup lang="ts">
/**
 * Profile - User profile and settings (Page 11 - UI/UX 4.4)
 *
 * Features:
 * - User profile card with photo and stats
 * - Account settings menu
 * - Help & support options
 * - Logout button
 * - Bottom navigation
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

// Mock user data - replace with actual auth store
const user = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  photo: 'https://i.pravatar.cc/150?img=12',
  stats: {
    orders: 24,
    points: 1250,
    vouchers: 3
  }
})

// Menu items
const accountMenuItems = [
  {
    id: 'edit-profile',
    icon: 'fa-user-edit',
    label: 'Edit Profile',
    route: '/profile/edit'
  },
  {
    id: 'addresses',
    icon: 'fa-location-dot',
    label: 'My Addresses',
    route: '/addresses'
  },
  {
    id: 'payment',
    icon: 'fa-credit-card',
    label: 'Payment Methods',
    route: '/payment-methods'
  },
  {
    id: 'notifications',
    icon: 'fa-bell',
    label: 'Notifications',
    route: '/notifications'
  }
]

const supportMenuItems = [
  {
    id: 'help',
    icon: 'fa-circle-question',
    label: 'Help Center',
    route: '/help'
  },
  {
    id: 'contact',
    icon: 'fa-headset',
    label: 'Contact Us',
    route: '/contact'
  },
  {
    id: 'about',
    icon: 'fa-info-circle',
    label: 'About',
    route: '/about'
  },
  {
    id: 'terms',
    icon: 'fa-file-contract',
    label: 'Terms & Privacy',
    route: '/terms'
  }
]

function navigateTo(route: string) {
  router.push(route)
}

function logout() {
  // TODO: Implement logout
  console.log('Logout')
  // authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <h2 class="text-black font-bold text-lg text-center">Profile</h2>
    </div>

    <!-- Content -->
    <div class="px-6 py-6 space-y-6">
      <!-- User Profile Card -->
      <div class="bg-gradient-primary rounded-3xl p-6 shadow-xl">
        <div class="flex items-center gap-4 mb-5">
          <div class="relative">
            <img
              :src="user.photo"
              :alt="user.name"
              class="w-20 h-20 rounded-full object-cover border-4 border-white"
            />
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div class="flex-1">
            <h3 class="text-white font-bold text-xl mb-1">{{ user.name }}</h3>
            <p class="text-white opacity-90 text-sm mb-1">{{ user.email }}</p>
            <p class="text-white opacity-80 text-xs">{{ user.phone }}</p>
          </div>

          <button
            @click="navigateTo('/profile/edit')"
            class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <i class="fas fa-pen text-white"></i>
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 pt-5 border-t border-white/20">
          <div class="text-center">
            <p class="text-white font-bold text-2xl mb-1">{{ user.stats.orders }}</p>
            <p class="text-white opacity-80 text-xs">Orders</p>
          </div>
          <div class="text-center">
            <p class="text-white font-bold text-2xl mb-1">{{ user.stats.points }}</p>
            <p class="text-white opacity-80 text-xs">Points</p>
          </div>
          <div class="text-center">
            <p class="text-white font-bold text-2xl mb-1">{{ user.stats.vouchers }}</p>
            <p class="text-white opacity-80 text-xs">Vouchers</p>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white rounded-3xl p-5 shadow-md">
        <h3 class="text-black font-bold mb-4">Account Settings</h3>

        <div class="space-y-1">
          <button
            v-for="item in accountMenuItems"
            :key="item.id"
            @click="navigateTo(item.route)"
            class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <i :class="`fas ${item.icon} text-primary-500 text-lg`"></i>
            </div>
            <span class="flex-1 text-left text-black font-semibold">{{ item.label }}</span>
            <i class="fas fa-chevron-right text-black opacity-30 text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Help & Support -->
      <div class="bg-white rounded-3xl p-5 shadow-md">
        <h3 class="text-black font-bold mb-4">Help & Support</h3>

        <div class="space-y-1">
          <button
            v-for="item in supportMenuItems"
            :key="item.id"
            @click="navigateTo(item.route)"
            class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i :class="`fas ${item.icon} text-black opacity-60 text-lg`"></i>
            </div>
            <span class="flex-1 text-left text-black font-semibold">{{ item.label }}</span>
            <i class="fas fa-chevron-right text-black opacity-30 text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Logout Button -->
      <button
        @click="logout"
        class="w-full bg-white border-2 border-red-500 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
      >
        <i class="fas fa-right-from-bracket"></i>
        Logout
      </button>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
