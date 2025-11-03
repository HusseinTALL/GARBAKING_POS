<!--
  Receipt Archive Search Component - Search and reprint old receipts
  Full-text search with filters for date, type, and user
-->

<template>
  <div class="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-700">
      <div>
        <h2 class="text-lg font-semibold text-gray-100">Receipt Archive</h2>
        <p class="text-sm text-gray-400 mt-1">Search and reprint past receipts</p>
      </div>

      <button
        @click="exportResults"
        :disabled="searchResults.length === 0"
        class="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
      >
        <Download class="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="p-6 bg-gray-900 border-b border-gray-700">
      <!-- Search Box -->
      <div class="mb-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            @input="performSearch"
            type="text"
            placeholder="Search by receipt number, order ID, or item name..."
            class="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Receipt Type</label>
          <select
            v-model="filters.type"
            @change="performSearch"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="SALE">Sales</option>
            <option value="REFUND">Refunds</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="BAR">Bar</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            v-model="filters.startDate"
            @change="performSearch"
            type="date"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            v-model="filters.endDate"
            @change="performSearch"
            type="date"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="overflow-auto" style="max-height: 600px">
      <div v-if="isSearching" class="text-center py-12">
        <Loader2 class="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <p class="text-gray-400">Searching...</p>
      </div>

      <div v-else-if="searchResults.length === 0" class="text-center py-12">
        <FileSearch class="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-300 mb-2">No receipts found</h3>
        <p class="text-gray-500">
          {{ searchQuery || hasFilters ? 'Try adjusting your search or filters' : 'Search for receipts to get started' }}
        </p>
      </div>

      <div v-else class="divide-y divide-gray-700">
        <div
          v-for="receipt in paginatedResults"
          :key="receipt.id"
          class="p-6 hover:bg-gray-900/50 transition-colors cursor-pointer"
          @click="viewReceipt(receipt)"
        >
          <div class="flex items-start justify-between">
            <!-- Receipt Info -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="font-medium text-gray-100">{{ receipt.receiptNumber }}</h3>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="getTypeClass(receipt.type)"
                >
                  {{ receipt.type }}
                </span>
                <span
                  v-if="receipt.reprintCount > 0"
                  class="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded text-xs font-medium"
                >
                  Reprinted {{ receipt.reprintCount }}x
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">Date:</span>
                  <span class="text-gray-100 ml-2">{{ formatDate(receipt.printedAt) }}</span>
                </div>
                <div v-if="receipt.orderId">
                  <span class="text-gray-400">Order:</span>
                  <span class="text-gray-100 ml-2">{{ receipt.orderId }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Printed By:</span>
                  <span class="text-gray-100 ml-2">{{ receipt.printedBy }}</span>
                </div>
                <div v-if="receipt.transactionId">
                  <span class="text-gray-400">Transaction:</span>
                  <span class="text-gray-100 ml-2">{{ receipt.transactionId.slice(-8) }}</span>
                </div>
              </div>

              <!-- Items Preview -->
              <div v-if="receipt.data.items" class="mt-3">
                <div class="text-xs text-gray-400 mb-1">Items:</div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(item, index) in receipt.data.items.slice(0, 3)"
                    :key="index"
                    class="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {{ item.quantity }}x {{ item.name }}
                  </span>
                  <span
                    v-if="receipt.data.items.length > 3"
                    class="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs"
                  >
                    +{{ receipt.data.items.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4">
              <button
                @click.stop="viewReceipt(receipt)"
                class="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-700 transition-colors"
                title="View Details"
              >
                <Eye class="w-5 h-5" />
              </button>
              <button
                @click.stop="reprintReceipt(receipt)"
                class="p-2 text-gray-400 hover:text-green-400 rounded-lg hover:bg-gray-700 transition-colors"
                title="Reprint"
              >
                <Printer class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between p-6 border-t border-gray-700">
      <div class="text-sm text-gray-400">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, searchResults.length) }} of {{ searchResults.length }} results
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
        >
          Previous
        </button>
        <span class="px-3 py-2 text-sm font-medium text-gray-300">{{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Receipt Detail Modal -->
    <div v-if="selectedReceipt" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedReceipt = null">
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-100">Receipt Details</h3>
            <button
              @click="selectedReceipt = null"
              class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X class="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <!-- Receipt Preview -->
          <div class="bg-gray-900 rounded-lg p-6 mb-6 font-mono text-sm">
            <div class="text-center mb-4">
              <div class="text-lg font-bold text-gray-100">{{ selectedReceipt.data.transaction?.businessName || 'GARBAKING POS' }}</div>
              <div class="text-gray-400">{{ selectedReceipt.receiptNumber }}</div>
            </div>

            <div class="border-t border-b border-gray-700 py-4 my-4">
              <div v-if="selectedReceipt.data.items">
                <div v-for="(item, index) in selectedReceipt.data.items" :key="index" class="flex justify-between mb-2">
                  <span class="text-gray-300">{{ item.quantity }}x {{ item.name }}</span>
                  <span class="text-gray-100">{{ item.total }} FCFA</span>
                </div>
              </div>
            </div>

            <div v-if="selectedReceipt.data.totals" class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">Subtotal:</span>
                <span class="text-gray-100">{{ selectedReceipt.data.totals.subtotal }} FCFA</span>
              </div>
              <div v-if="selectedReceipt.data.totals.tax" class="flex justify-between">
                <span class="text-gray-400">Tax:</span>
                <span class="text-gray-100">{{ selectedReceipt.data.totals.tax }} FCFA</span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 mt-2">
                <span class="text-gray-100">TOTAL:</span>
                <span class="text-gray-100">{{ selectedReceipt.data.totals.total }} FCFA</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <button
              @click="reprintReceipt(selectedReceipt)"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Printer class="w-4 h-4" />
              <span>Reprint Receipt</span>
            </button>
            <button
              @click="selectedReceipt = null"
              class="px-4 py-2 text-gray-300 hover:text-gray-100 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReceiptsStore, type ReceiptArchive, ReceiptType } from '@/stores/receipts'
import {
  Search,
  Download,
  Eye,
  Printer,
  X,
  FileSearch,
  Loader2
} from 'lucide-vue-next'

const receiptsStore = useReceiptsStore()

// State
const searchQuery = ref('')
const filters = ref({
  type: '' as ReceiptType | '',
  startDate: '',
  endDate: ''
})
const searchResults = ref<ReceiptArchive[]>([])
const selectedReceipt = ref<ReceiptArchive | null>(null)
const isSearching = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Computed
const hasFilters = computed(() => {
  return filters.value.type || filters.value.startDate || filters.value.endDate
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return searchResults.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(searchResults.value.length / itemsPerPage.value)
})

// Methods
const performSearch = () => {
  isSearching.value = true

  setTimeout(() => {
    searchResults.value = receiptsStore.searchArchive(searchQuery.value, {
      type: filters.value.type || undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined
    })
    currentPage.value = 1
    isSearching.value = false
  }, 300)
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    type: '',
    startDate: '',
    endDate: ''
  }
  searchResults.value = []
}

const viewReceipt = (receipt: ReceiptArchive) => {
  selectedReceipt.value = receipt
}

const reprintReceipt = async (receipt: ReceiptArchive) => {
  await receiptsStore.reprintFromArchive(receipt.id)
  selectedReceipt.value = null
}

const exportResults = () => {
  const csv = receiptsStore.exportArchive(searchResults.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-archive-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    SALE: 'bg-green-900/50 text-green-400',
    REFUND: 'bg-red-900/50 text-red-400',
    KITCHEN: 'bg-orange-900/50 text-orange-400',
    BAR: 'bg-purple-900/50 text-purple-400',
    REPRINT: 'bg-blue-900/50 text-blue-400'
  }
  return classes[type] || 'bg-gray-700 text-gray-400'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  // Load recent receipts
  await receiptsStore.fetchArchive({ limit: 100 })
})
</script>
