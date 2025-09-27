<!--
  Individual order card component for displaying order information with dark theme
  Provides comprehensive order details, status management, and action buttons
-->

<template>
  <div class="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10">
    <!-- Order Header -->
    <div class="p-4 border-b border-slate-700">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h3 class="font-bold text-lg text-white">#{{ order.orderNumber }}</h3>
          <p v-if="order.customerName" class="text-sm text-slate-400">{{ order.customerName }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Order Type Badge -->
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            order.orderType === 'DINE_IN' ? 'bg-blue-500/20 text-blue-400' :
            order.orderType === 'TAKEAWAY' ? 'bg-orange-500/20 text-orange-400' :
            'bg-purple-500/20 text-purple-400'
          ]">
            {{ getOrderTypeLabel(order.orderType) }}
          </span>

          <!-- Status Badge -->
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
            order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
            order.status === 'PREPARING' ? 'bg-orange-500/20 text-orange-400' :
            order.status === 'READY' ? 'bg-green-500/20 text-green-400' :
            order.status === 'SERVED' ? 'bg-slate-500/20 text-slate-400' :
            'bg-red-500/20 text-red-400'
          ]">
            {{ order.status }}
          </span>
        </div>
      </div>

      <div class="flex items-center text-sm text-slate-400 space-x-4">
        <div class="flex items-center space-x-1">
          <Clock class="w-4 h-4" />
          <span>{{ formatTime(order.createdAt) }}</span>
        </div>
        <div v-if="order.tableNumber" class="flex items-center space-x-1">
          <MapPin class="w-4 h-4" />
          <span>Table {{ order.tableNumber }}</span>
        </div>
        <div v-if="order.estimatedTime" class="flex items-center space-x-1">
          <Timer class="w-4 h-4" />
          <span>{{ order.estimatedTime }}min</span>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="p-4 border-b border-slate-700">
      <h4 class="text-sm font-medium text-slate-300 mb-2">Items ({{ order.items.length }})</h4>
      <div class="space-y-1 max-h-32 overflow-y-auto">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between text-sm"
        >
          <span class="text-slate-400">{{ item.quantity }}x {{ item.name }}</span>
          <span class="text-slate-300 font-medium">${{ item.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <div v-if="order.notes" class="mt-3 p-2 bg-slate-750 rounded-lg">
        <p class="text-xs text-slate-400">
          <MessageSquare class="w-3 h-3 inline mr-1" />
          {{ order.notes }}
        </p>
      </div>
    </div>

    <!-- Order Total -->
    <div class="p-4 border-b border-slate-700">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 font-medium">Total</span>
        <span class="text-xl font-bold text-green-400">${{ order.total.toFixed(2) }}</span>
      </div>
      <div class="flex justify-between items-center text-sm mt-1">
        <span class="text-slate-500">Payment: {{ order.paymentMethod || 'Pending' }}</span>
        <span :class="[
          'font-medium',
          order.paymentStatus === 'PAID' ? 'text-green-400' :
          order.paymentStatus === 'REFUNDED' ? 'text-red-400' : 'text-yellow-400'
        ]">
          {{ order.paymentStatus }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="p-4">
      <div class="grid grid-cols-2 gap-2 mb-3">
        <!-- Status Change Buttons -->
        <button
          v-if="order.status === 'PENDING'"
          @click="$emit('status-change', order.id, 'CONFIRMED')"
          class="btn-primary"
        >
          <CheckCircle class="w-4 h-4 mr-1" />
          Confirm
        </button>

        <button
          v-if="order.status === 'CONFIRMED'"
          @click="$emit('status-change', order.id, 'PREPARING')"
          class="btn-warning"
        >
          <ChefHat class="w-4 h-4 mr-1" />
          Start Prep
        </button>

        <button
          v-if="order.status === 'PREPARING'"
          @click="$emit('status-change', order.id, 'READY')"
          class="btn-success"
        >
          <CheckCircle class="w-4 h-4 mr-1" />
          Ready
        </button>

        <button
          v-if="order.status === 'READY'"
          @click="$emit('status-change', order.id, 'SERVED')"
          class="btn-secondary"
        >
          <Utensils class="w-4 h-4 mr-1" />
          Served
        </button>

        <!-- View Details Button -->
        <button
          @click="$emit('view-details', order)"
          class="btn-secondary"
        >
          <Eye class="w-4 h-4 mr-1" />
          Details
        </button>
      </div>

      <!-- Secondary Actions -->
      <div class="grid grid-cols-3 gap-1">
        <button
          @click="$emit('print-receipt', order)"
          class="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
        >
          <Printer class="w-3 h-3 mr-1" />
          Print
        </button>

        <button
          @click="showNoteModal = true"
          class="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
        >
          <MessageSquare class="w-3 h-3 mr-1" />
          Note
        </button>

        <button
          v-if="order.status !== 'SERVED' && order.status !== 'CANCELLED'"
          @click="$emit('status-change', order.id, 'CANCELLED')"
          class="btn-sm bg-red-500/20 hover:bg-red-500/30 text-red-400"
        >
          <X class="w-3 h-3 mr-1" />
          Cancel
        </button>
      </div>
    </div>

    <!-- Note Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-slate-800 rounded-xl p-6 w-96 border border-slate-700">
        <h3 class="text-lg font-semibold text-white mb-4">Add Kitchen Note</h3>
        <textarea
          v-model="noteText"
          placeholder="Add instructions for the kitchen..."
          class="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="showNoteModal = false"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="addNote"
            class="btn-primary"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Clock,
  MapPin,
  Timer,
  MessageSquare,
  CheckCircle,
  ChefHat,
  Utensils,
  Eye,
  Printer,
  X
} from 'lucide-vue-next'

// Props
interface Order {
  id: string
  orderNumber: string
  customerName?: string
  customerPhone?: string
  tableNumber?: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  kitchenNotes?: string
  estimatedTime?: number
  createdAt: string
  updatedAt: string
  servedAt?: string
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  paymentMethod?: 'CASH' | 'CARD' | 'MOBILE'
}

interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  customizations?: string[]
}

interface Props {
  order: Order
}

defineProps<Props>()

// Emits
defineEmits<{
  'status-change': [orderId: string, newStatus: string]
  'view-details': [order: Order]
  'print-receipt': [order: Order]
  'add-note': [orderId: string, note: string]
}>()

// Local state
const showNoteModal = ref(false)
const noteText = ref('')

// Methods
const getOrderTypeLabel = (type: string) => {
  const labels = {
    'DINE_IN': 'Dine In',
    'TAKEAWAY': 'Takeaway',
    'DELIVERY': 'Delivery'
  }
  return labels[type] || type
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

const addNote = () => {
  if (noteText.value.trim()) {
    $emit('add-note', props.order.id, noteText.value.trim())
    noteText.value = ''
    showNoteModal.value = false
  }
}
</script>

<style scoped>
.btn-primary {
  @apply flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm;
}

.btn-secondary {
  @apply flex items-center justify-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-medium rounded-lg transition-colors text-sm;
}

.btn-warning {
  @apply flex items-center justify-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm;
}

.btn-success {
  @apply flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm;
}

.btn-sm {
  @apply flex items-center justify-center px-2 py-1.5 font-medium rounded-lg transition-colors text-xs;
}

/* Custom scrollbar for order items */
.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
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
</style>