<!--
  Backend Status Indicator Component
  Shows real-time backend connectivity status with reconnection info
-->

<template>
  <div v-if="!status.isHealthy" class="fixed top-4 right-4 z-[9999]">
    <div class="bg-red-900/95 border border-red-700 rounded-lg shadow-2xl p-4 min-w-[320px] animate-slide-in">
      <div class="flex items-start gap-3">
        <!-- Animated Icon -->
        <div class="flex-shrink-0">
          <div class="relative">
            <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative bg-red-600 rounded-full p-2">
              <WifiOff class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-white font-semibold text-sm">Backend Disconnected</h3>
            <button
              @click="retryNow"
              class="text-red-300 hover:text-white transition-colors"
              :disabled="isRetrying"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRetrying }" />
            </button>
          </div>

          <p class="text-red-200 text-xs mb-2">
            {{ status.error || 'Unable to reach backend server' }}
          </p>

          <!-- Retry Info -->
          <div class="flex items-center gap-2 text-xs text-red-300">
            <Clock class="w-3 h-3" />
            <span v-if="status.retryCount > 0">
              Retry attempt {{ status.retryCount }} / {{ maxRetries }}
            </span>
            <span v-else>
              Checking connection...
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="mt-2 h-1 bg-red-950 rounded-full overflow-hidden">
            <div
              class="h-full bg-red-500 transition-all duration-1000 ease-out"
              :style="{ width: `${retryProgress}%` }"
            ></div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-3 flex gap-2">
            <button
              @click="startBackend"
              class="flex-1 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded transition-colors"
            >
              Start Backend
            </button>
            <button
              @click="openTroubleshooting"
              class="flex-1 px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Connected Toast (brief notification) -->
  <Transition name="fade">
    <div v-if="showConnectedToast" class="fixed top-4 right-4 z-[9999]">
      <div class="bg-green-900/95 border border-green-700 rounded-lg shadow-2xl p-4 min-w-[320px] animate-slide-in">
        <div class="flex items-center gap-3">
          <div class="bg-green-600 rounded-full p-2">
            <Wifi class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-white font-semibold text-sm">Backend Connected</h3>
            <p class="text-green-200 text-xs">
              Connection restored ({{ status.responseTime }}ms)
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WifiOff, Wifi, RefreshCw, Clock } from 'lucide-vue-next'
import { healthCheckService, type HealthStatus } from '@/services/healthCheckService'

const status = ref<HealthStatus>({
  isHealthy: true,
  lastCheck: new Date(),
  retryCount: 0
})

const isRetrying = ref(false)
const showConnectedToast = ref(false)
const maxRetries = 10
const retryProgress = ref(0)

let unsubscribe: (() => void) | null = null
let progressInterval: NodeJS.Timeout | null = null

// Watch for status changes
onMounted(() => {
  unsubscribe = healthCheckService.onStatusChange((newStatus: HealthStatus) => {
    const wasDown = !status.value.isHealthy
    const isNowUp = newStatus.isHealthy

    status.value = newStatus

    // Show connected toast when reconnected
    if (wasDown && isNowUp) {
      showConnectedToast.value = true
      setTimeout(() => {
        showConnectedToast.value = false
      }, 5000)
    }

    // Update progress bar
    if (!newStatus.isHealthy && newStatus.retryCount > 0) {
      retryProgress.value = (newStatus.retryCount / maxRetries) * 100
    } else {
      retryProgress.value = 0
    }
  })

  // Start monitoring
  healthCheckService.startMonitoring()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})

const retryNow = async () => {
  isRetrying.value = true
  await healthCheckService.forceCheck()
  setTimeout(() => {
    isRetrying.value = false
  }, 1000)
}

const startBackend = () => {
  // Open instructions modal
  alert(
    'To start the backend:\n\n' +
    '1. Open Terminal\n' +
    '2. Navigate to project root\n' +
    '3. Run: ./start-backend.sh\n\n' +
    'Or use: ./start-all.sh to start everything'
  )
}

const openTroubleshooting = () => {
  window.open('http://localhost:3001/health', '_blank')
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
