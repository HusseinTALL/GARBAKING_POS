<!--
  Settings View - User account settings and preferences
  Comprehensive settings page with profile, addresses, preferences, and security
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40">
      <div class="px-4 py-4">
        <div class="flex items-center gap-3">
          <button
            @click="$router.back()"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t('profile.settings') }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-6 space-y-6 max-w-2xl mx-auto">
      <!-- Profile Section -->
      <section>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('profile.account') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <button
            @click="showProfileEdit = !showProfileEdit"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {{ getInitials(profileStore.profile.name) }}
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ profileStore.profile.name || $t('profile.guestUser') }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ profileStore.profile.email || profileStore.profile.phone || $t('profile.noEmail') }}
                </p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': showProfileEdit }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <transition name="slide-down">
            <div v-if="showProfileEdit" class="px-6 pb-6">
              <ProfileEdit @saved="showProfileEdit = false" @cancelled="showProfileEdit = false" />
            </div>
          </transition>
        </div>
      </section>

      <!-- Saved Addresses -->
      <section>
        <SavedAddresses />
      </section>

      <!-- Order Preferences -->
      <section>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('profile.orderPreferences') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
          <!-- Default Order Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.defaultOrderType') }}
            </label>
            <select
              v-model="profileStore.orderPreferences.defaultOrderType"
              @change="savePreferences"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="DINE_IN">{{ $t('orders.orderType.dine_in') }}</option>
              <option value="TAKEAWAY">{{ $t('orders.orderType.takeaway') }}</option>
              <option value="DELIVERY">{{ $t('orders.orderType.delivery') }}</option>
            </select>
          </div>

          <!-- Default Table Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.defaultTableNumber') }}
            </label>
            <input
              v-model="profileStore.orderPreferences.defaultTableNumber"
              @blur="savePreferences"
              type="text"
              :placeholder="$t('profile.defaultTablePlaceholder')"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Toggle Settings -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('profile.autoApplyVouchers') }}
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="profileStore.orderPreferences.autoApplyVouchers"
                  @change="savePreferences"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('profile.saveOrderHistory') }}
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="profileStore.orderPreferences.saveOrderHistory"
                  @change="savePreferences"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Notification Settings -->
      <section>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('profile.notifications') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('profile.emailNotifications') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                {{ $t('profile.emailNotificationsDesc') }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="profileStore.notificationSettings.emailNotifications"
                @change="saveNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('profile.smsNotifications') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                {{ $t('profile.smsNotificationsDesc') }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="profileStore.notificationSettings.smsNotifications"
                @change="saveNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('profile.pushNotifications') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                {{ $t('profile.pushNotificationsDesc') }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="profileStore.notificationSettings.pushNotifications"
                @change="saveNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.promotionalOffers') }}
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="profileStore.notificationSettings.promotionalOffers"
                @change="saveNotifications"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </section>

      <!-- Account Actions -->
      <section>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('profile.accountActions') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <button
            @click="clearData"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
          >
            <span class="text-gray-900 dark:text-white font-medium">{{ $t('profile.clearData') }}</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button
            @click="logout"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <span class="font-medium">{{ $t('profile.logout') }}</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- App Info -->
      <section class="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        <p>Garbaking v1.0.0</p>
        <p class="mt-1">© 2025 Garbaking. All rights reserved.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useProfileStore } from '@/stores/profile'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import ProfileEdit from '@/components/ProfileEdit.vue'
import SavedAddresses from '@/components/SavedAddresses.vue'

const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const profileStore = useProfileStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

// State
const showProfileEdit = ref(false)

// Methods
function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function savePreferences() {
  profileStore.saveToLocalStorage()
  toast.success(t('profile.preferencesSaved'))
}

function saveNotifications() {
  profileStore.saveToLocalStorage()
  toast.success(t('profile.notificationsSaved'))
}

function clearData() {
  if (confirm(t('profile.clearDataConfirm'))) {
    profileStore.clearAll()
    cartStore.clearCart()
    orderStore.clearOrders()
    toast.success(t('profile.dataCleared'))
    router.push('/home')
  }
}

function logout() {
  if (confirm(t('profile.logoutConfirm'))) {
    // Clear all data
    profileStore.clearAll()
    cartStore.clearCart()
    orderStore.clearOrders()
    toast.success(t('profile.loggedOut'))
    router.push('/welcome')
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
