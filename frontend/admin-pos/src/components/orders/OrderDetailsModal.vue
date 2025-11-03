<!--
  Comprehensive order details modal with dark theme design
  Provides detailed order information, timeline, and management capabilities
-->

<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h2 class="text-2xl font-bold text-white">Order #{{ order.orderNumber }}</h2>
          <div class="flex items-center space-x-4 mt-2">
            <span :class="[
              'px-3 py-1 text-sm font-medium rounded-full',
              order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
              order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
              order.status === 'PREPARING' ? 'bg-orange-500/20 text-orange-400' :
              order.status === 'READY' ? 'bg-green-500/20 text-green-400' :
              order.status === 'SERVED' ? 'bg-slate-500/20 text-slate-400' :
              'bg-red-500/20 text-red-400'
            ]">
              {{ order.status }}
            </span>
            <span class="text-slate-400 text-sm">{{ formatDateTime(order.createdAt) }}</span>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="flex h-[calc(90vh-100px)] overflow-hidden">
        <!-- Left Panel - Order Details -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Customer Information -->
          <div class="bg-slate-750 rounded-xl p-4 mb-6">
            <h3 class="text-lg font-semibold text-white mb-3 flex items-center">
              <User class="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-400">Name:</span>
                <span class="text-white ml-2">{{ order.customerName || 'Walk-in Customer' }}</span>
              </div>
              <div>
                <span class="text-slate-400">Phone:</span>
                <span class="text-white ml-2">{{ order.customerPhone || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-slate-400">Order Type:</span>
                <span class="text-white ml-2">{{ getOrderTypeLabel(order.orderType) }}</span>
              </div>
              <div v-if="order.tableNumber">
                <span class="text-slate-400">Table:</span>
                <span class="text-white ml-2">{{ order.tableNumber }}</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-slate-750 rounded-xl p-4 mb-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
              <ShoppingBag class="w-5 h-5 mr-2" />
              Order Items ({{ order.items.length }})
            </h3>

            <div class="space-y-3">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-start justify-between py-3 border-b border-slate-600 last:border-0"
              >
                <div class="flex-1">
                  <h4 class="font-medium text-white">{{ item.name }}</h4>
                  <p class="text-sm text-slate-400 mt-1">
                    {{ item.quantity }}x ${{ item.unitPrice.toFixed(2) }} each
                  </p>
                  <p v-if="item.notes" class="text-xs text-slate-500 italic mt-1">
                    Note: {{ item.notes }}
                  </p>
                  <div v-if="item.customizations && item.customizations.length" class="mt-1">
                    <span class="text-xs text-slate-500">Customizations:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span
                        v-for="customization in item.customizations"
                        :key="customization"
                        class="px-2 py-1 bg-slate-600 text-xs text-slate-300 rounded-full"
                      >
                        {{ customization }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <span class="font-bold text-white">${{ item.totalPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="mt-6 pt-4 border-t border-slate-600">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Subtotal:</span>
                  <span class="text-white">${{ order.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Tax:</span>
                  <span class="text-white">${{ order.tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between font-bold text-lg pt-2 border-t border-slate-600">
                  <span class="text-white">Total:</span>
                  <span class="text-green-400">${{ order.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="order.notes || order.kitchenNotes" class="bg-slate-750 rounded-xl p-4 mb-6">
            <h3 class="text-lg font-semibold text-white mb-3 flex items-center">
              <MessageSquare class="w-5 h-5 mr-2" />
              Notes
            </h3>
            <div class="space-y-3">
              <div v-if="order.notes" class="p-3 bg-slate-700 rounded-lg">
                <h4 class="text-sm font-medium text-slate-300 mb-1">Customer Notes:</h4>
                <p class="text-sm text-slate-400">{{ order.notes }}</p>
              </div>
              <div v-if="order.kitchenNotes" class="p-3 bg-slate-700 rounded-lg">
                <h4 class="text-sm font-medium text-slate-300 mb-1">Kitchen Notes:</h4>
                <p class="text-sm text-slate-400">{{ order.kitchenNotes }}</p>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="bg-slate-750 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-white mb-3 flex items-center">
              <CreditCard class="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-400">Payment Method:</span>
                <span class="text-white ml-2">{{ order.paymentMethod || 'Not Selected' }}</span>
              </div>
              <div>
                <span class="text-slate-400">Payment Status:</span>
                <span :class="[
                  'ml-2 font-medium',
                  order.paymentStatus === 'PAID' ? 'text-green-400' :
                  order.paymentStatus === 'REFUNDED' ? 'text-red-400' : 'text-yellow-400'
                ]">
                  {{ order.paymentStatus }}
                </span>
              </div>
              <div v-if="order.estimatedTime">
                <span class="text-slate-400">Est. Prep Time:</span>
                <span class="text-white ml-2">{{ order.estimatedTime }} minutes</span>
              </div>
              <div v-if="order.servedAt">
                <span class="text-slate-400">Served At:</span>
                <span class="text-white ml-2">{{ formatTime(order.servedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Actions & Timeline -->
        <div class="w-80 border-l border-slate-700 p-6 overflow-y-auto">
          <!-- Quick Actions -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div class="space-y-2">
              <!-- Status Change Buttons -->
              <button
                v-if="order.status === 'PENDING'"
                @click="$emit('status-change', order.id, 'CONFIRMED')"
                class="w-full btn-primary"
              >
                <CheckCircle class="w-4 h-4 mr-2" />
                Confirm Order
              </button>

              <button
                v-if="order.status === 'CONFIRMED'"
                @click="$emit('status-change', order.id, 'PREPARING')"
                class="w-full btn-warning"
              >
                <ChefHat class="w-4 h-4 mr-2" />
                Start Preparation
              </button>

              <button
                v-if="order.status === 'PREPARING'"
                @click="$emit('status-change', order.id, 'READY')"
                class="w-full btn-success"
              >
                <CheckCircle class="w-4 h-4 mr-2" />
                Mark Ready
              </button>

              <button
                v-if="order.status === 'READY'"
                @click="$emit('status-change', order.id, 'SERVED')"
                class="w-full btn-secondary"
              >
                <Utensils class="w-4 h-4 mr-2" />
                Mark Served
              </button>

              <!-- Print Receipt -->
              <button
                @click="$emit('print-receipt', order)"
                class="w-full btn-secondary"
              >
                <Printer class="w-4 h-4 mr-2" />
                Print Receipt
              </button>

              <!-- Add Kitchen Note -->
              <button
                @click="showNoteModal = true"
                class="w-full btn-secondary"
              >
                <MessageSquare class="w-4 h-4 mr-2" />
                Add Kitchen Note
              </button>

              <!-- Cancel Order (if not served) -->
              <button
                v-if="order.status !== 'SERVED' && order.status !== 'CANCELLED'"
                @click="$emit('status-change', order.id, 'CANCELLED')"
                class="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <X class="w-4 h-4 mr-2" />
                Cancel Order
              </button>
            </div>
          </div>

          <!-- Order Timeline -->
          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Order Timeline</h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Order Created</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(order.createdAt) }}</p>
                </div>
              </div>

              <div v-if="order.status !== 'PENDING'" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Order Confirmed</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(order.updatedAt) }}</p>
                </div>
              </div>

              <div v-if="['PREPARING', 'READY', 'SERVED'].includes(order.status)" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Preparation Started</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(order.updatedAt) }}</p>
                </div>
              </div>

              <div v-if="['READY', 'SERVED'].includes(order.status)" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Order Ready</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(order.updatedAt) }}</p>
                </div>
              </div>

              <div v-if="order.status === 'SERVED'" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Order Served</p>
                  <p class="text-xs text-slate-500">{{ order.servedAt ? formatDateTime(order.servedAt) : 'Just now' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kitchen Note Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
      <div class="bg-slate-800 rounded-xl p-6 w-96 border border-slate-700 m-4">
        <h3 class="text-lg font-semibold text-white mb-4">Add Kitchen Note</h3>
        <textarea
          v-model="noteText"
          placeholder="Add special instructions for the kitchen..."
          class="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="showNoteModal = false; noteText = ''"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            @click="addKitchenNote"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
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
  X,
  User,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ChefHat,
  Utensils,
  Printer
} from 'lucide-vue-next'

// Props & Emits
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

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'status-change': [orderId: string, newStatus: string]
  'print-receipt': [order: Order]
  'add-note': [orderId: string, note: string]
}>()

// Local state
const showNoteModal = ref(false)
const noteText = ref('')

// Methods
const getOrderTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'DINE_IN': 'Dine In',
    'TAKEAWAY': 'Takeaway',
    'DELIVERY': 'Delivery'
  }
  return labels[type] || type
}

const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

const addKitchenNote = () => {
  if (noteText.value.trim()) {
    emit('add-note', props.order.id, noteText.value.trim())
    noteText.value = ''
    showNoteModal.value = false
  }
}
</script>

<style scoped>
.btn-primary {
  @apply flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors;
}

.btn-secondary {
  @apply flex items-center justify-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-medium rounded-lg transition-colors;
}

.btn-warning {
  @apply flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors;
}

.btn-success {
  @apply flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors;
}

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
</style>