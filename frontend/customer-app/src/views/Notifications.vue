<script setup lang="ts">
/**
 * Notifications - View app notifications (Page 14)
 *
 * Features:
 * - Grouped notifications by date
 * - Color-coded notification types
 * - Mark as read/unread
 * - Delete notifications
 */

import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const notificationsStore = useNotificationsStore()

function goBack() {
  router.back()
}

function handleNotificationClick(id: string, actionUrl?: string) {
  notificationsStore.markAsRead(id)
  if (actionUrl) {
    router.push(actionUrl)
  }
}

function deleteNotification(id: string, event: Event) {
  event.stopPropagation()
  notificationsStore.deleteNotification(id)
}

function markAllAsRead() {
  notificationsStore.markAllAsRead()
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    order: 'green',
    promo: 'amber',
    delivery: 'blue',
    system: 'gray'
  }
  return colors[type] || 'gray'
}

function getTypeColorClass(type: string): string {
  const colorMap: Record<string, string> = {
    green: 'text-accent-green-500',
    amber: 'text-primary-500',
    blue: 'text-accent-blue-500',
    gray: 'text-gray-500'
  }
  return colorMap[getTypeColor(type)] || 'text-gray-500'
}

function getTypeBgClass(type: string): string {
  const colorMap: Record<string, string> = {
    green: 'bg-accent-green-50',
    amber: 'bg-primary-50',
    blue: 'bg-accent-blue-50',
    gray: 'bg-gray-50'
  }
  return colorMap[getTypeColor(type)] || 'bg-gray-50'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Notifications</h2>
        <button
          @click="markAllAsRead"
          class="text-primary-500 text-sm font-semibold"
        >
          Mark all read
        </button>
      </div>

      <!-- Unread Badge -->
      <div
        v-if="notificationsStore.unreadCount > 0"
        class="bg-primary-50 rounded-2xl p-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">{{ notificationsStore.unreadCount }}</span>
          </div>
          <span class="text-black text-sm font-semibold">Unread notifications</span>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="px-6 py-6">
      <div
        v-for="(group, date) in notificationsStore.groupedByDate"
        :key="date"
        class="mb-6"
      >
        <!-- Date Header -->
        <h3
          v-if="group.length > 0"
          class="text-black opacity-60 text-xs font-semibold uppercase tracking-wide mb-3"
        >
          {{ date }}
        </h3>

        <!-- Notification Cards -->
        <div class="space-y-3">
          <div
            v-for="notification in group"
            :key="notification.id"
            @click="handleNotificationClick(notification.id, notification.actionUrl)"
            :class="[
              'bg-white rounded-3xl p-4 shadow-md flex items-start gap-4 cursor-pointer transition-all',
              !notification.read ? 'border-2 border-primary-200' : 'border-2 border-transparent'
            ]"
          >
            <!-- Icon -->
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                getTypeBgClass(notification.type)
              ]"
            >
              <i
                :class="[
                  `fas ${notification.icon}`,
                  'text-xl',
                  getTypeColorClass(notification.type)
                ]"
              ></i>
            </div>

            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-1">
                <h4 class="text-black font-bold text-sm">{{ notification.title }}</h4>
                <button
                  @click="deleteNotification(notification.id, $event)"
                  class="text-black opacity-40 hover:opacity-100 transition-opacity"
                >
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>
              <p class="text-black opacity-70 text-sm mb-2">{{ notification.message }}</p>
              <div class="flex items-center gap-2">
                <i class="fas fa-clock text-black opacity-40 text-xs"></i>
                <span class="text-black opacity-60 text-xs">{{ notification.time }}</span>
                <span
                  v-if="!notification.read"
                  class="w-2 h-2 bg-primary-500 rounded-full ml-2"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="notificationsStore.notifications.length === 0"
        class="text-center py-12"
      >
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-bell text-3xl text-gray-400"></i>
        </div>
        <h3 class="text-black font-bold text-lg mb-2">No notifications</h3>
        <p class="text-black opacity-60 text-sm">You're all caught up!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
