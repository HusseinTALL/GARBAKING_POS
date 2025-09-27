<!--
  Print Job Details Modal - View detailed information about a specific print job
  Shows job status, data, template details, and allows retry/reprint actions
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div :class="getStatusBadgeClass(job.status)" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ getStatusLabel(job.status) }}
          </div>
          <h3 class="text-xl font-semibold text-gray-900">
            Print Job Details
          </h3>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <div class="grid grid-cols-2 h-full">
          <!-- Job Information Panel -->
          <div class="flex flex-col overflow-hidden border-r border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Job Information</h4>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Basic Info -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Basic Information</h5>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Job ID:</span>
                    <code class="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{{ job.id.slice(0, 8) }}...</code>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Type:</span>
                    <span class="text-sm font-medium">{{ getReceiptTypeLabel(job.type) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Template:</span>
                    <span class="text-sm font-medium">{{ template?.name || 'Unknown Template' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Priority:</span>
                    <div class="flex items-center">
                      <div class="flex space-x-1">
                        <div
                          v-for="i in 5"
                          :key="i"
                          :class="[
                            'w-2 h-2 rounded-full',
                            i <= job.priority ? 'bg-blue-500' : 'bg-gray-200'
                          ]"
                        ></div>
                      </div>
                      <span class="ml-2 text-sm text-gray-600">({{ job.priority }}/5)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timing Information -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Timing</h5>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Created:</span>
                    <span class="text-sm">{{ formatDateTime(job.createdAt) }}</span>
                  </div>
                  <div v-if="job.processedAt" class="flex justify-between">
                    <span class="text-sm text-gray-600">Processed:</span>
                    <span class="text-sm">{{ formatDateTime(job.processedAt) }}</span>
                  </div>
                  <div v-if="job.processedAt" class="flex justify-between">
                    <span class="text-sm text-gray-600">Duration:</span>
                    <span class="text-sm">{{ calculateDuration(job.createdAt, job.processedAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Attempts & Error -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Execution</h5>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Attempts:</span>
                    <span class="text-sm">{{ job.attempts }} / {{ job.maxAttempts }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      :style="{ width: `${(job.attempts / job.maxAttempts) * 100}%` }"
                    ></div>
                  </div>
                  <div v-if="job.error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h6 class="text-sm font-medium text-red-800 mb-1">Error Details</h6>
                    <p class="text-sm text-red-700">{{ job.error }}</p>
                  </div>
                </div>
              </div>

              <!-- Order Data -->
              <div v-if="job.data">
                <h5 class="font-medium text-gray-900 mb-3">Order Information</h5>
                <div class="space-y-3">
                  <div v-if="job.data.orderNumber" class="flex justify-between">
                    <span class="text-sm text-gray-600">Order #:</span>
                    <span class="text-sm font-medium">#{{ job.data.orderNumber }}</span>
                  </div>
                  <div v-if="job.data.customerName" class="flex justify-between">
                    <span class="text-sm text-gray-600">Customer:</span>
                    <span class="text-sm">{{ job.data.customerName }}</span>
                  </div>
                  <div v-if="job.data.total" class="flex justify-between">
                    <span class="text-sm text-gray-600">Total:</span>
                    <span class="text-sm font-semibold">{{ formatPrice(job.data.total) }}</span>
                  </div>
                  <div v-if="job.data.items && job.data.items.length" class="space-y-1">
                    <span class="text-sm text-gray-600">Items ({{ job.data.items.length }}):</span>
                    <div class="max-h-32 overflow-y-auto space-y-1">
                      <div
                        v-for="item in job.data.items"
                        :key="item.id"
                        class="flex justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span>{{ item.quantity }}x {{ item.name }}</span>
                        <span>{{ formatPrice(item.price * item.quantity) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Receipt Preview Panel -->
          <div class="flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Receipt Preview</h4>
            </div>

            <div class="flex-1 overflow-y-auto p-6">
              <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                <!-- Receipt Paper Simulation -->
                <div class="bg-white shadow-lg max-w-sm mx-auto" style="font-family: 'Courier New', monospace;">
                  <div class="border border-gray-200 p-4 text-xs">
                    <!-- Header -->
                    <div class="text-center mb-4">
                      <div class="font-bold text-lg">{{ template?.config.header.businessName || 'GARBAKING POS' }}</div>
                      <div v-if="template?.config.header.address" class="mt-1">
                        <div v-for="line in template.config.header.address" :key="line" class="text-gray-600">
                          {{ line }}
                        </div>
                      </div>
                      <div v-if="template?.config.header.phone" class="text-gray-600 mt-1">
                        Tel: {{ template.config.header.phone }}
                      </div>
                    </div>

                    <!-- Order Info -->
                    <div class="border-t border-b border-dashed border-gray-400 py-2 mb-4">
                      <div class="flex justify-between">
                        <span>Order #:</span>
                        <span>{{ job.data?.orderNumber || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Date:</span>
                        <span>{{ formatReceiptDate(job.createdAt) }}</span>
                      </div>
                      <div v-if="job.data?.customerName" class="flex justify-between">
                        <span>Customer:</span>
                        <span>{{ job.data.customerName }}</span>
                      </div>
                    </div>

                    <!-- Items -->
                    <div v-if="job.data?.items" class="mb-4">
                      <div v-for="item in job.data.items" :key="item.id" class="mb-2">
                        <div class="flex justify-between">
                          <span>{{ item.name }}</span>
                          <span>{{ formatPrice(item.price * item.quantity) }}</span>
                        </div>
                        <div class="text-gray-600 text-xs pl-2">
                          {{ item.quantity }} x {{ formatPrice(item.price) }}
                        </div>
                      </div>
                    </div>

                    <!-- Total -->
                    <div class="border-t border-dashed border-gray-400 pt-2 mb-4">
                      <div class="flex justify-between font-bold text-base">
                        <span>TOTAL</span>
                        <span>{{ formatPrice(job.data?.total || 0) }}</span>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div class="text-center text-gray-600">
                      <div>{{ template?.config.footer.thankYouMessage || 'Thank you for your business!' }}</div>
                      <div v-if="template?.config.footer.customMessage" class="mt-1">
                        {{ template.config.footer.customMessage }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
        <div class="flex space-x-3">
          <button
            v-if="job.status === 'FAILED'"
            @click="$emit('retry', job.id)"
            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <RotateCcw class="w-4 h-4 mr-2" />
            Retry Job
          </button>
          <button
            v-if="job.status === 'COMPLETED'"
            @click="$emit('reprint', job.id)"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <Printer class="w-4 h-4 mr-2" />
            Reprint
          </button>
        </div>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  X,
  RotateCcw,
  Printer
} from 'lucide-vue-next'
import { type PrintJob, type ReceiptTemplate, PrintJobStatus, ReceiptType } from '@/stores/receipts'

interface Props {
  job: PrintJob
  template?: ReceiptTemplate
}

interface Emits {
  (e: 'close'): void
  (e: 'retry', jobId: string): void
  (e: 'reprint', jobId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Methods
const getStatusLabel = (status: PrintJobStatus): string => {
  const labels = {
    [PrintJobStatus.QUEUED]: 'Queued',
    [PrintJobStatus.PRINTING]: 'Printing',
    [PrintJobStatus.COMPLETED]: 'Completed',
    [PrintJobStatus.FAILED]: 'Failed',
    [PrintJobStatus.CANCELLED]: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: PrintJobStatus): string => {
  const classes = {
    [PrintJobStatus.QUEUED]: 'bg-blue-100 text-blue-800',
    [PrintJobStatus.PRINTING]: 'bg-yellow-100 text-yellow-800',
    [PrintJobStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [PrintJobStatus.FAILED]: 'bg-red-100 text-red-800',
    [PrintJobStatus.CANCELLED]: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getReceiptTypeLabel = (type: ReceiptType): string => {
  const labels = {
    [ReceiptType.SALE]: 'Sale Receipt',
    [ReceiptType.REFUND]: 'Refund Receipt',
    [ReceiptType.REPRINT]: 'Reprint',
    [ReceiptType.KITCHEN]: 'Kitchen Ticket',
    [ReceiptType.BAR]: 'Bar Ticket',
    [ReceiptType.CUSTOMER_COPY]: 'Customer Copy',
    [ReceiptType.MERCHANT_COPY]: 'Merchant Copy'
  }
  return labels[type] || type
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatReceiptDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const duration = end - start

  if (duration < 1000) return `${duration}ms`
  if (duration < 60000) return `${Math.round(duration / 1000)}s`
  return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`
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

/* Thermal printer paper style */
.receipt-paper {
  width: 80mm;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style>