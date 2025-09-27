<!--
  Order status tracking page for customer app
  Real-time order status updates with beautiful progress indicator
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="$router.push('/')"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="text-xl text-gray-600" />
          </button>

          <div class="text-center">
            <h1 class="text-xl font-bold text-gray-900">Suivi de commande</h1>
            <div v-if="isConnected" class="flex items-center justify-center space-x-1 text-xs text-green-600">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Temps réel</span>
            </div>
          </div>

          <button
            @click="refreshOrder"
            :disabled="isLoading"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon
              :icon="['fas', 'sync-alt']"
              :class="['text-xl text-gray-600', { 'animate-spin': isLoading }]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && !order" class="flex items-center justify-center py-20">
      <div class="text-center">
        <FontAwesomeIcon :icon="['fas', 'spinner']" class="animate-spin text-3xl text-primary-600 mb-4" />
        <p class="text-gray-600">Chargement du statut...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="text-center px-6">
        <FontAwesomeIcon :icon="['fas', 'exclamation-triangle']" class="text-3xl text-red-500 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Commande introuvable</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <div class="space-y-3">
          <button
            @click="refreshOrder"
            class="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            @click="$router.push('/')"
            class="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>

    <!-- Order content -->
    <div v-else-if="order" class="px-4 py-6">
      <!-- Order header -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon :icon="getStatusIcon(order.status)" class="text-2xl text-primary-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Commande #{{ order.orderNumber }}</h2>
          <p class="text-lg text-gray-600">{{ getStatusMessage(order.status) }}</p>
        </div>

        <!-- Progress indicator -->
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progression</span>
            <span class="text-sm text-gray-500">{{ getProgressText(order.status) }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="getProgressColor(order.status)"
              :style="{ width: `${getProgressPercentage(order.status)}%` }"
            ></div>
          </div>
        </div>

        <!-- Status timeline -->
        <div class="space-y-4">
          <div
            v-for="(status, index) in statusTimeline"
            :key="status.value"
            class="flex items-center space-x-4"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                getTimelineItemStatus(status.value, order.status)
              ]"
            >
              <FontAwesomeIcon
                :icon="status.icon"
                class="text-sm"
              />
            </div>
            <div class="flex-1">
              <p :class="[
                'font-medium',
                isStatusCompleted(status.value, order.status) ? 'text-gray-900' : 'text-gray-500'
              ]">
                {{ status.label }}
              </p>
              <p class="text-sm text-gray-500">{{ status.description }}</p>
            </div>
            <div v-if="isStatusCompleted(status.value, order.status)" class="text-sm text-gray-500">
              <FontAwesomeIcon :icon="['fas', 'check']" class="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Estimated time -->
      <div v-if="order.status !== 'SERVED' && order.status !== 'CANCELLED'" class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon :icon="['fas', 'clock']" class="text-xl text-blue-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Temps estimé</h3>
            <p class="text-gray-600">
              <span v-if="remainingTime > 0">
                Encore {{ remainingTime }} minute{{ remainingTime > 1 ? 's' : '' }}
              </span>
              <span v-else>
                Votre commande devrait être prête
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Kitchen notes -->
      <div v-if="order.kitchenNotes" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div class="flex space-x-3">
          <FontAwesomeIcon :icon="['fas', 'sticky-note']" class="text-amber-600 mt-1" />
          <div>
            <h3 class="font-medium text-amber-800 mb-1">Message de la cuisine</h3>
            <p class="text-amber-700">{{ order.kitchenNotes }}</p>
          </div>
        </div>
      </div>

      <!-- Order details -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Détails de la commande</h3>

        <div class="space-y-4">
          <!-- Customer info -->
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon :icon="['fas', 'user']" class="text-gray-400" />
            <div>
              <p class="font-medium text-gray-900">{{ order.customerName || 'Client' }}</p>
              <p v-if="order.customerPhone" class="text-sm text-gray-600">{{ order.customerPhone }}</p>
            </div>
          </div>

          <!-- Order type -->
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon :icon="getOrderTypeIcon(order.orderType)" class="text-gray-400" />
            <div>
              <p class="font-medium text-gray-900">{{ getOrderTypeLabel(order.orderType) }}</p>
              <p v-if="order.tableNumber" class="text-sm text-gray-600">Table {{ order.tableNumber }}</p>
            </div>
          </div>

          <!-- Order time -->
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon :icon="['fas', 'calendar-alt']" class="text-gray-400" />
            <div>
              <p class="font-medium text-gray-900">{{ formatDateTime(order.createdAt) }}</p>
              <p class="text-sm text-gray-600">{{ formatTime(order.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order items -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h3>

        <div class="space-y-3 mb-4">
          <div
            v-for="item in order.orderItems"
            :key="item.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
          >
            <img
              v-if="item.menuItem.imageUrl"
              :src="item.menuItem.imageUrl"
              :alt="item.menuItem.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div
              v-else
              class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-primary-400" />
            </div>

            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ item.menuItem.name }}</h4>
              <p class="text-sm text-gray-600">
                {{ formatPrice(item.unitPrice) }} × {{ item.quantity }}
              </p>
              <p v-if="item.notes" class="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded mt-1">
                {{ item.notes }}
              </p>
            </div>

            <div class="text-right">
              <p class="font-semibold text-primary-600">{{ formatPrice(item.totalPrice) }}</p>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="border-t pt-4">
          <div class="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span class="text-primary-600">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div v-if="order && canShowActions" class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
      <div class="flex space-x-3">
        <button
          v-if="canCancelOrder"
          @click="showCancelConfirm = true"
          class="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
        >
          Annuler
        </button>
        <button
          @click="contactSupport"
          class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
        >
          Contacter
        </button>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <div
      v-if="showCancelConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showCancelConfirm = false"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        @click.stop
      >
        <div class="text-center mb-6">
          <FontAwesomeIcon :icon="['fas', 'exclamation-triangle']" class="text-4xl text-red-500 mb-4" />
          <h3 class="text-lg font-bold text-gray-900 mb-2">Annuler la commande ?</h3>
          <p class="text-gray-600">
            Êtes-vous sûr de vouloir annuler votre commande #{{ order?.orderNumber }} ?
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="showCancelConfirm = false"
            class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Non
          </button>
          <button
            @click="cancelOrder"
            class="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
          >
            Oui, annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAppStore } from '@/stores/app'
import { ordersApi } from '@/services/api'
import websocketService from '@/services/websocket'
import { storeToRefs } from 'pinia'
import { OrderStatus, OrderType, Order } from '@/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Store
const appStore = useAppStore()
const { appConfig } = storeToRefs(appStore)

// Local state
const order = ref<Order | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCancelConfirm = ref(false)
const isConnected = ref(false)
let refreshInterval: ReturnType<typeof setInterval> | null = null
let unsubscribeFromOrder: (() => void) | null = null

// Computed
const orderNumber = computed(() => route.params.orderNumber as string)

const remainingTime = computed(() => {
  if (!order.value || !order.value.estimatedTime) return 0

  const createdAt = new Date(order.value.createdAt)
  const estimatedEndTime = new Date(createdAt.getTime() + order.value.estimatedTime * 60000)
  const now = new Date()
  const remainingMs = estimatedEndTime.getTime() - now.getTime()

  return Math.max(0, Math.ceil(remainingMs / 60000))
})

const canCancelOrder = computed(() => {
  if (!order.value) return false
  return ['PENDING', 'CONFIRMED'].includes(order.value.status)
})

const canShowActions = computed(() => {
  if (!order.value) return false
  return !['SERVED', 'CANCELLED'].includes(order.value.status)
})

const statusTimeline = computed(() => [
  {
    value: OrderStatus.PENDING,
    label: 'Commande reçue',
    description: 'Votre commande a été enregistrée',
    icon: ['fas', 'clock']
  },
  {
    value: OrderStatus.CONFIRMED,
    label: 'Confirmée',
    description: 'Commande acceptée par le restaurant',
    icon: ['fas', 'check-circle']
  },
  {
    value: OrderStatus.PREPARING,
    label: 'En préparation',
    description: 'Votre commande est en cours de préparation',
    icon: ['fas', 'fire']
  },
  {
    value: OrderStatus.READY,
    label: 'Prête',
    description: 'Votre commande est prête à être servie',
    icon: ['fas', 'bell']
  },
  {
    value: OrderStatus.SERVED,
    label: 'Servie',
    description: 'Commande livrée avec succès',
    icon: ['fas', 'utensils']
  }
])

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusIcon = (status: OrderStatus): string[] => {
  const icons = {
    [OrderStatus.PENDING]: ['fas', 'clock'],
    [OrderStatus.CONFIRMED]: ['fas', 'check-circle'],
    [OrderStatus.PREPARING]: ['fas', 'fire'],
    [OrderStatus.READY]: ['fas', 'bell'],
    [OrderStatus.SERVED]: ['fas', 'utensils'],
    [OrderStatus.CANCELLED]: ['fas', 'times-circle']
  }
  return icons[status] || ['fas', 'question']
}

const getStatusMessage = (status: OrderStatus): string => {
  const messages = {
    [OrderStatus.PENDING]: 'En attente de confirmation',
    [OrderStatus.CONFIRMED]: 'Commande confirmée',
    [OrderStatus.PREPARING]: 'En cours de préparation',
    [OrderStatus.READY]: 'Prête à être servie',
    [OrderStatus.SERVED]: 'Commande servie',
    [OrderStatus.CANCELLED]: 'Commande annulée'
  }
  return messages[status] || status
}

const getProgressPercentage = (status: OrderStatus): number => {
  const percentages = {
    [OrderStatus.PENDING]: 20,
    [OrderStatus.CONFIRMED]: 40,
    [OrderStatus.PREPARING]: 60,
    [OrderStatus.READY]: 80,
    [OrderStatus.SERVED]: 100,
    [OrderStatus.CANCELLED]: 0
  }
  return percentages[status] || 0
}

const getProgressColor = (status: OrderStatus): string => {
  if (status === OrderStatus.CANCELLED) return 'bg-red-500'
  if (status === OrderStatus.SERVED) return 'bg-green-500'
  return 'bg-primary-500'
}

const getProgressText = (status: OrderStatus): string => {
  const percentage = getProgressPercentage(status)
  return `${percentage}%`
}

const getTimelineItemStatus = (timelineStatus: OrderStatus, currentStatus: OrderStatus): string => {
  if (isStatusCompleted(timelineStatus, currentStatus)) {
    return 'bg-green-500 text-white'
  } else if (timelineStatus === currentStatus) {
    return 'bg-primary-500 text-white'
  } else {
    return 'bg-gray-200 text-gray-400'
  }
}

const isStatusCompleted = (timelineStatus: OrderStatus, currentStatus: OrderStatus): boolean => {
  const statusOrder = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED
  ]

  const timelineIndex = statusOrder.indexOf(timelineStatus)
  const currentIndex = statusOrder.indexOf(currentStatus)

  return timelineIndex <= currentIndex && currentStatus !== OrderStatus.CANCELLED
}

const getOrderTypeLabel = (orderType: OrderType): string => {
  const labels = {
    [OrderType.DINE_IN]: 'Sur place',
    [OrderType.TAKEAWAY]: 'À emporter',
    [OrderType.DELIVERY]: 'Livraison'
  }
  return labels[orderType] || orderType
}

const getOrderTypeIcon = (orderType: OrderType): string[] => {
  const icons = {
    [OrderType.DINE_IN]: ['fas', 'utensils'],
    [OrderType.TAKEAWAY]: ['fas', 'shopping-bag'],
    [OrderType.DELIVERY]: ['fas', 'motorcycle']
  }
  return icons[orderType] || ['fas', 'utensils']
}

const fetchOrderStatus = async () => {
  if (!orderNumber.value) return

  isLoading.value = true
  error.value = null

  try {
    const response = await ordersApi.trackOrder(orderNumber.value)

    if (response.success && response.data?.order) {
      order.value = response.data.order
    } else {
      throw new Error(response.error || 'Commande introuvable')
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement du statut'
    console.error('Order status fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

const refreshOrder = async () => {
  await fetchOrderStatus()
}

const cancelOrder = async () => {
  // Implementation would depend on backend API
  showCancelConfirm.value = false
  toast.info('Demande d\'annulation envoyée')
}

const contactSupport = () => {
  const phone = appConfig.value.supportPhone
  if (phone) {
    window.open(`tel:${phone}`)
  } else {
    toast.info('Numéro de support non disponible')
  }
}

const connectToRealTimeUpdates = async () => {
  try {
    // Connect to WebSocket
    await websocketService.connect(orderNumber.value)
    isConnected.value = true

    // Subscribe to order updates
    unsubscribeFromOrder = websocketService.subscribeToOrder(
      orderNumber.value,
      (updateData) => {
        console.log('Real-time order update:', updateData)

        if (order.value) {
          // Update order status
          order.value.status = updateData.status

          // Update estimated time if provided
          if (updateData.estimatedTime !== undefined) {
            order.value.estimatedTime = updateData.estimatedTime
          }

          // Update kitchen notes if provided
          if (updateData.kitchenNotes !== undefined) {
            order.value.kitchenNotes = updateData.kitchenNotes
          }

          // Clear polling interval if order is completed
          if (['SERVED', 'CANCELLED'].includes(updateData.status) && refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
          }
        }
      }
    )

    console.log('Connected to real-time order updates')
  } catch (error) {
    console.error('Failed to connect to real-time updates:', error)
    isConnected.value = false

    // Fallback to polling
    if (order.value && !['SERVED', 'CANCELLED'].includes(order.value.status)) {
      refreshInterval = setInterval(fetchOrderStatus, 30000)
    }
  }
}

const disconnectFromRealTimeUpdates = () => {
  if (unsubscribeFromOrder) {
    unsubscribeFromOrder()
    unsubscribeFromOrder = null
  }

  websocketService.disconnect()
  isConnected.value = false
}

// Lifecycle
onMounted(async () => {
  // Set page title
  document.title = `Commande #${orderNumber.value} - Garbaking`

  // Request notification permission for real-time updates
  await websocketService.constructor.requestNotificationPermission()

  // Initial fetch
  await fetchOrderStatus()

  // Connect to real-time updates
  await connectToRealTimeUpdates()

  // Set up fallback polling for active orders (if WebSocket fails)
  if (order.value && !['SERVED', 'CANCELLED'].includes(order.value.status) && !isConnected.value) {
    refreshInterval = setInterval(fetchOrderStatus, 30000)
  }
})

onUnmounted(() => {
  // Clean up polling
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  // Clean up WebSocket connection
  disconnectFromRealTimeUpdates()
})
</script>

<style scoped>
/* Scale animation for modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>