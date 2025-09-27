<!--
  Settings modal for order management dashboard with dark theme
  Provides configuration options for auto-refresh, notifications, and display preferences
-->

<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-700">
        <h2 class="text-xl font-bold text-white">Order Dashboard Settings</h2>
        <button
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div class="space-y-8">
          <!-- Auto Refresh Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center">
              <RefreshCw class="w-5 h-5 mr-2" />
              Auto Refresh
            </h3>

            <div class="bg-slate-750 rounded-lg p-4 space-y-4">
              <!-- Enable Auto Refresh Toggle -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-slate-300 font-medium">Enable Auto Refresh</label>
                  <p class="text-sm text-slate-400">Automatically refresh orders data</p>
                </div>
                <button
                  @click="localSettings.autoRefresh = !localSettings.autoRefresh"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    localSettings.autoRefresh ? 'bg-blue-500' : 'bg-slate-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      localSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Refresh Interval -->
              <div v-if="localSettings.autoRefresh" class="space-y-2">
                <label class="text-slate-300 font-medium">Refresh Interval</label>
                <select
                  v-model="localSettings.autoRefreshInterval"
                  class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="10000">10 seconds</option>
                  <option :value="30000">30 seconds</option>
                  <option :value="60000">1 minute</option>
                  <option :value="300000">5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center">
              <Bell class="w-5 h-5 mr-2" />
              Notifications
            </h3>

            <div class="bg-slate-750 rounded-lg p-4 space-y-4">
              <!-- Sound Notifications -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-slate-300 font-medium">Sound Notifications</label>
                  <p class="text-sm text-slate-400">Play sound for new orders and status changes</p>
                </div>
                <button
                  @click="localSettings.soundEnabled = !localSettings.soundEnabled"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    localSettings.soundEnabled ? 'bg-blue-500' : 'bg-slate-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Browser Notifications -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-slate-300 font-medium">Browser Notifications</label>
                  <p class="text-sm text-slate-400">Show browser notifications for important events</p>
                </div>
                <button
                  @click="toggleBrowserNotifications"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    localSettings.browserNotifications ? 'bg-blue-500' : 'bg-slate-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      localSettings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Notification Events -->
              <div v-if="localSettings.soundEnabled || localSettings.browserNotifications">
                <label class="text-slate-300 font-medium block mb-2">Notify for:</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="localSettings.notifyEvents.newOrder"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div :class="[
                      'w-4 h-4 rounded border-2 mr-2 flex items-center justify-center',
                      localSettings.notifyEvents.newOrder ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    ]">
                      <Check v-if="localSettings.notifyEvents.newOrder" class="w-3 h-3 text-white" />
                    </div>
                    <span class="text-slate-300">New Orders</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      v-model="localSettings.notifyEvents.orderReady"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div :class="[
                      'w-4 h-4 rounded border-2 mr-2 flex items-center justify-center',
                      localSettings.notifyEvents.orderReady ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    ]">
                      <Check v-if="localSettings.notifyEvents.orderReady" class="w-3 h-3 text-white" />
                    </div>
                    <span class="text-slate-300">Order Ready</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      v-model="localSettings.notifyEvents.orderCancelled"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div :class="[
                      'w-4 h-4 rounded border-2 mr-2 flex items-center justify-center',
                      localSettings.notifyEvents.orderCancelled ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    ]">
                      <Check v-if="localSettings.notifyEvents.orderCancelled" class="w-3 h-3 text-white" />
                    </div>
                    <span class="text-slate-300">Order Cancelled</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Display Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center">
              <Monitor class="w-5 h-5 mr-2" />
              Display
            </h3>

            <div class="bg-slate-750 rounded-lg p-4 space-y-4">
              <!-- Default Filter -->
              <div class="space-y-2">
                <label class="text-slate-300 font-medium">Default Filter</label>
                <select
                  v-model="localSettings.defaultFilter"
                  class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Orders</option>
                  <option value="PENDING">Pending Orders</option>
                  <option value="CONFIRMED">Confirmed Orders</option>
                  <option value="PREPARING">Preparing Orders</option>
                  <option value="READY">Ready Orders</option>
                </select>
              </div>

              <!-- Max Orders Per Page -->
              <div class="space-y-2">
                <label class="text-slate-300 font-medium">Max Orders Per Page</label>
                <select
                  v-model="localSettings.maxOrdersPerPage"
                  class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="25">25 orders</option>
                  <option :value="50">50 orders</option>
                  <option :value="100">100 orders</option>
                  <option :value="200">200 orders</option>
                </select>
              </div>

              <!-- Show Completed Orders -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-slate-300 font-medium">Show Completed Orders</label>
                  <p class="text-sm text-slate-400">Include served orders in the list</p>
                </div>
                <button
                  @click="localSettings.showCompletedOrders = !localSettings.showCompletedOrders"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    localSettings.showCompletedOrders ? 'bg-blue-500' : 'bg-slate-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      localSettings.showCompletedOrders ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Card Size -->
              <div class="space-y-2">
                <label class="text-slate-300 font-medium">Card Size</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    @click="localSettings.cardSize = 'compact'"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      localSettings.cardSize === 'compact'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    ]"
                  >
                    Compact
                  </button>
                  <button
                    @click="localSettings.cardSize = 'normal'"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      localSettings.cardSize === 'normal'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    ]"
                  >
                    Normal
                  </button>
                  <button
                    @click="localSettings.cardSize = 'large'"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      localSettings.cardSize === 'large'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    ]"
                  >
                    Large
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center">
              <Settings class="w-5 h-5 mr-2" />
              Advanced
            </h3>

            <div class="bg-slate-750 rounded-lg p-4 space-y-4">
              <!-- Order Timeout Warning -->
              <div class="space-y-2">
                <label class="text-slate-300 font-medium">Order Timeout Warning (minutes)</label>
                <input
                  v-model.number="localSettings.orderTimeoutWarning"
                  type="number"
                  min="5"
                  max="120"
                  class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-sm text-slate-400">Highlight orders older than this time</p>
              </div>

              <!-- Kitchen Display Integration -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-slate-300 font-medium">Kitchen Display Sync</label>
                  <p class="text-sm text-slate-400">Automatically sync with kitchen display system</p>
                </div>
                <button
                  @click="localSettings.kdsSync = !localSettings.kdsSync"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    localSettings.kdsSync ? 'bg-blue-500' : 'bg-slate-600'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      localSettings.kdsSync ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Reset Settings -->
              <div class="pt-4 border-t border-slate-600">
                <button
                  @click="resetToDefaults"
                  class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <RotateCcw class="w-4 h-4 mr-2" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-slate-700">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveSettings"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  X,
  RefreshCw,
  Bell,
  Check,
  Monitor,
  Settings,
  RotateCcw
} from 'lucide-vue-next'

// Props & Emits
interface DashboardSettings {
  autoRefresh: boolean
  autoRefreshInterval: number
  soundEnabled: boolean
  browserNotifications: boolean
  notifyEvents: {
    newOrder: boolean
    orderReady: boolean
    orderCancelled: boolean
  }
  showCompletedOrders: boolean
  maxOrdersPerPage: number
  defaultFilter: string
  cardSize: 'compact' | 'normal' | 'large'
  orderTimeoutWarning: number
  kdsSync: boolean
}

interface Props {
  settings: DashboardSettings
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  update: [settings: DashboardSettings]
}>()

// Local state
const localSettings = reactive<DashboardSettings>({ ...props.settings })

// Methods
const toggleBrowserNotifications = async () => {
  if (!localSettings.browserNotifications && 'Notification' in window) {
    const permission = await Notification.requestPermission()
    localSettings.browserNotifications = permission === 'granted'
  } else {
    localSettings.browserNotifications = !localSettings.browserNotifications
  }
}

const resetToDefaults = () => {
  Object.assign(localSettings, {
    autoRefresh: true,
    autoRefreshInterval: 30000,
    soundEnabled: true,
    browserNotifications: false,
    notifyEvents: {
      newOrder: true,
      orderReady: true,
      orderCancelled: true
    },
    showCompletedOrders: false,
    maxOrdersPerPage: 50,
    defaultFilter: 'PENDING',
    cardSize: 'normal',
    orderTimeoutWarning: 30,
    kdsSync: false
  })
}

const saveSettings = () => {
  $emit('update', { ...localSettings })
  $emit('close')
}
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1e293b;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Toggle switch animation */
.relative button span {
  transition: transform 0.2s ease-in-out;
}
</style>