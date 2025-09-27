<!--
  Assign Order Modal - Assign existing orders to tables
  Allows staff to move orders to specific tables
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          Assign Order to Table {{ table?.number }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Table Info -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid3X3 class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Table {{ table?.number }}</h4>
              <p class="text-sm text-gray-600">Capacity: {{ table?.capacity }} people</p>
            </div>
          </div>
        </div>

        <!-- Order Selection -->
        <div class="px-6 py-4">
          <div class="mb-4">
            <h4 class="text-lg font-medium text-gray-900 mb-2">Select Order</h4>
            <p class="text-sm text-gray-600">Choose an order to assign to this table</p>
          </div>

          <!-- Search -->
          <div class="mb-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by order number or customer name..."
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Order List -->
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-if="filteredOrders.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <ShoppingBag class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No available orders found</p>
            </div>

            <div
              v-for="order in filteredOrders"
              :key="order.id"
              @click="selectedOrderId = order.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all',
                selectedOrderId === order.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <!-- Order Header -->
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h5 class="font-medium text-gray-900">#{{ order.orderNumber }}</h5>
                  <p class="text-sm text-gray-600">{{ order.customerName || 'Walk-in Customer' }}</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">{{ formatPrice(order.total) }}</div>
                  <div :class="getStatusBadgeClass(order.status)" class="inline-block px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusLabel(order.status) }}
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="item in order.items.slice(0, 3)"
                    :key="item.id"
                    class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {{ item.quantity }}x {{ item.name }}
                  </span>
                  <span
                    v-if="order.items.length > 3"
                    class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    +{{ order.items.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Order Details -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-1">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatTime(order.createdAt) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Users class="w-3 h-3" />
                    <span>{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} items</span>
                  </div>
                </div>
                <div v-if="order.customerPhone" class="flex items-center space-x-1">
                  <Phone class="w-3 h-3" />
                  <span>{{ order.customerPhone }}</span>
                </div>
              </div>

              <!-- Special Instructions -->
              <div v-if="order.specialRequests || order.kitchenNotes" class="mt-2 pt-2 border-t border-gray-100">
                <p class="text-sm text-blue-600">
                  {{ order.specialRequests || order.kitchenNotes }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          @click="handleAssign"
          :disabled="loading || !selectedOrderId"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2
            v-if="loading"
            class="animate-spin w-4 h-4 mr-2"
          />
          Assign Order
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  Grid3X3,
  Search,
  ShoppingBag,
  Clock,
  Users,
  Phone,
  Loader2
} from 'lucide-vue-next'

interface Table {
  id: string
  number: string
  capacity: number
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName?: string
  customerPhone?: string
  status: string
  items: OrderItem[]
  total: number
  createdAt: string
  specialRequests?: string
  kitchenNotes?: string
}

interface Props {
  table: Table | null
}

interface Emits {
  (e: 'close'): void
  (e: 'assigned', tableId: string, orderId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedOrderId = ref<string | null>(null)

// Mock orders data (in real app this would come from a store or API)
const mockOrders = ref<Order[]>([
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    status: 'CONFIRMED',
    items: [
      { id: '1-1', name: 'Burger Deluxe', quantity: 2, price: 15.99 },
      { id: '1-2', name: 'French Fries', quantity: 1, price: 6.99 }
    ],
    total: 38.97,
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    specialRequests: 'No onions'
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Jane Smith',
    status: 'PENDING',
    items: [
      { id: '2-1', name: 'Caesar Salad', quantity: 1, price: 12.99 },
      { id: '2-2', name: 'Grilled Chicken', quantity: 1, price: 18.99 }
    ],
    total: 31.98,
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerPhone: '+0987654321',
    status: 'CONFIRMED',
    items: [
      { id: '3-1', name: 'Margherita Pizza', quantity: 1, price: 18.99 },
      { id: '3-2', name: 'Coca Cola', quantity: 2, price: 2.99 }
    ],
    total: 24.97,
    createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    kitchenNotes: 'Extra cheese'
  }
])

// Computed
const availableOrders = computed(() => {
  // Filter orders that can be assigned to tables (not already assigned, not served, not cancelled)
  return mockOrders.value.filter(order =>
    ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
  )
})

const filteredOrders = computed(() => {
  if (!searchQuery.value) return availableOrders.value

  const query = searchQuery.value.toLowerCase()
  return availableOrders.value.filter(order =>
    order.orderNumber.toLowerCase().includes(query) ||
    order.customerName?.toLowerCase().includes(query) ||
    order.customerPhone?.includes(query)
  )
})

// Methods
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'PREPARING': 'Preparing',
    'READY': 'Ready',
    'SERVED': 'Served',
    'CANCELLED': 'Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-green-100 text-green-800',
    'SERVED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const handleAssign = async () => {
  if (!selectedOrderId.value || !props.table) return

  loading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('assigned', props.table.id, selectedOrderId.value)
  } catch (error) {
    console.error('Error assigning order:', error)
    // Handle error (could show notification)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
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