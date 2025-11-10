<!--
  Payment processing interface for POS transactions
  Handles multiple payment methods, cash drawer, and receipts
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gestion des Paiements
          </h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              cashDrawer?.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ cashDrawer?.isOpen ? 'Caisse ouverte' : 'Caisse fermée' }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Cash Drawer Actions -->
          <button
            v-if="!cashDrawer?.isOpen"
            @click="showOpenDrawerModal = true"
            class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <CreditCard class="w-4 h-4 mr-2 inline-block" />
            Ouvrir Caisse
          </button>

          <button
            v-else
            @click="showCloseDrawerModal = true"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Lock class="w-4 h-4 mr-2 inline-block" />
            Fermer Caisse
          </button>

          <!-- Quick Actions -->
          <button
            @click="showTransactionModal = true"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Plus class="w-4 h-4 mr-2 inline-block" />
            Transaction
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-green-400">{{ formatAmount(cashDrawerBalance) }}</div>
          <div class="text-sm text-gray-400">Solde Caisse</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div :class="['text-2xl font-bold', cashDrawerVariance >= 0 ? 'text-green-400' : 'text-red-400']">
            {{ formatAmount(Math.abs(cashDrawerVariance)) }}
          </div>
          <div class="text-sm text-gray-400">
            {{ cashDrawerVariance >= 0 ? 'Excédent' : 'Manquant' }}
          </div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-blue-400">{{ todaysTransactions.length }}</div>
          <div class="text-sm text-gray-400">Transactions</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-indigo-400">{{ formatAmount(todaysRevenue) }}</div>
          <div class="text-sm text-gray-400">Recettes</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-gray-400">{{ enabledPaymentMethods.length }}</div>
          <div class="text-sm text-gray-400">Méthodes</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Payment Methods Panel -->
      <div class="w-full md:w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div class="flex-none p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-gray-100">Méthodes de Paiement</h3>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <div class="space-y-4">
            <PaymentMethodCard
              v-for="method in enabledPaymentMethods"
              :key="method.id"
              :method="method"
              :selected="selectedPaymentMethod?.id === method.id"
              @select="selectPaymentMethod"
              @toggle="togglePaymentMethod"
              class="hover:bg-gray-700 transition-all duration-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="flex-1 flex flex-col bg-gray-900">
        <div class="flex-none p-6 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-100">Transactions Récentes</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="refreshTransactions"
                :disabled="isLoading"
                class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
              </button>

              <select
                v-model="transactionFilter"
                class="border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Toutes</option>
                <option value="today">Aujourd'hui</option>
                <option value="completed">Terminées</option>
                <option value="refunded">Remboursées</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <!-- Transaction List -->
          <div v-if="filteredTransactions.length === 0" class="flex items-center justify-center h-64">
            <div class="text-center">
              <FileText class="w-16 h-16 text-gray-500 mb-4 mx-auto" />
              <h3 class="text-lg font-semibold text-gray-300 mb-2">Aucune transaction</h3>
              <p class="text-gray-500">Les transactions apparaîtront ici</p>
            </div>
          </div>

          <div v-else class="divide-y divide-gray-700">
            <TransactionRow
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              :transaction="transaction"
              @view="viewTransaction"
              @refund="refundTransaction"
              @print="printReceipt"
              class="hover:bg-gray-800 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Cash Drawer Panel -->
      <div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div class="flex-none p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-gray-100">Caisse Enregistreuse</h3>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <CashDrawerPanel
            :cash-drawer="cashDrawer"
            @add-transaction="handleCashTransaction"
            @close-drawer="showCloseDrawerModal = true"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <OpenCashDrawerModal
    v-if="showOpenDrawerModal"
    @close="showOpenDrawerModal = false"
    @confirm="handleOpenDrawer"
    class="bg-gray-800 text-gray-100"
  />

  <CloseCashDrawerModal
    v-if="showCloseDrawerModal"
    :cash-drawer="cashDrawer"
    @close="showCloseDrawerModal = false"
    @confirm="handleCloseDrawer"
    class="bg-gray-800 text-gray-100"
  />

  <ProcessPaymentModal
    v-if="showPaymentModal"
    :order="selectedOrder"
    :payment-methods="enabledPaymentMethods"
    @close="showPaymentModal = false"
    @process="handleProcessPayment"
    class="bg-gray-800 text-gray-100"
  />

  <TransactionModal
    v-if="showTransactionModal"
    @close="showTransactionModal = false"
    @confirm="handleManualTransaction"
    class="bg-gray-800 text-gray-100"
  />

  <TransactionDetailsModal
    v-if="selectedTransaction"
    :transaction="selectedTransaction"
    @close="selectedTransaction = null"
    @refund="refundTransaction"
    @print="printReceipt"
    class="bg-gray-800 text-gray-100"
  />

  <RefundModal
    v-if="showRefundModal"
    :transaction="refundTransaction"
    @close="showRefundModal = false"
    @confirm="handleRefund"
    class="bg-gray-800 text-gray-100"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { storeToRefs } from 'pinia'
import type { PaymentMethod, Transaction, CashTransaction } from '@/stores/payment'
import {
  CreditCard,
  Lock,
  Plus,
  RotateCw,
  FileText
} from 'lucide-vue-next'

// Stores
const paymentStore = usePaymentStore()

// Destructure store state
const {
  enabledPaymentMethods,
  cashDrawer,
  recentTransactions,
  todaysTransactions,
  todaysRevenue,
  cashDrawerBalance,
  cashDrawerVariance,
  isProcessing
} = storeToRefs(paymentStore)

// Local state
const selectedPaymentMethod = ref<PaymentMethod | null>(null)
const selectedTransaction = ref<Transaction | null>(null)
const selectedOrder = ref<any>(null)
const refundTransactionRef = ref<Transaction | null>(null)
const transactionFilter = ref('all')
const isLoading = ref(false)

// Modal states
const showOpenDrawerModal = ref(false)
const showCloseDrawerModal = ref(false)
const showPaymentModal = ref(false)
const showTransactionModal = ref(false)
const showRefundModal = ref(false)

// Computed
const filteredTransactions = computed(() => {
  let filtered = recentTransactions.value

  switch (transactionFilter.value) {
    case 'today':
      filtered = todaysTransactions.value
      break
    case 'completed':
      filtered = filtered.filter(t => t.status === 'COMPLETED')
      break
    case 'refunded':
      filtered = filtered.filter(t => t.status === 'REFUNDED' || t.status === 'PARTIALLY_REFUNDED')
      break
  }

  return filtered.slice(0, 100) // Limit to 100 for performance
})

// Methods
const selectPaymentMethod = (method: PaymentMethod) => {
  selectedPaymentMethod.value = method
}

const togglePaymentMethod = async (methodId: string, enabled: boolean) => {
  console.log(`Toggle payment method ${methodId}: ${enabled}`)
}

const handleOpenDrawer = async (startingAmount: number) => {
  const success = await paymentStore.openCashDrawer(startingAmount)
  if (success) {
    showOpenDrawerModal.value = false
  }
}

const handleCloseDrawer = async (countedAmount: number, notes?: string) => {
  const result = await paymentStore.closeCashDrawer(countedAmount, notes)
  if (result) {
    showCloseDrawerModal.value = false
    console.log('Cash drawer closed:', result)
  }
}

const handleProcessPayment = async (paymentData: any) => {
  const transaction = await paymentStore.processPayment(
    paymentData.orderId,
    paymentData.amount,
    paymentData.methodId,
    paymentData.options
  )

  if (transaction) {
    showPaymentModal.value = false
    console.log('Payment processed:', transaction)
  }
}

const handleManualTransaction = async (transactionData: any) => {
  const success = await paymentStore.addCashTransaction(
    transactionData.type,
    transactionData.amount,
    transactionData.description,
    transactionData.reference
  )

  if (success) {
    showTransactionModal.value = false
  }
}

const handleCashTransaction = async (
  type: CashTransaction['type'],
  amount: number,
  description: string,
  reference?: string
) => {
  await paymentStore.addCashTransaction(type, amount, description, reference)
}

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
}

const refundTransaction = (transaction: Transaction) => {
  refundTransactionRef.value = transaction
  showRefundModal.value = true
}

const handleRefund = async (transactionId: string, amount: number, reason: string) => {
  const success = await paymentStore.refundPayment(transactionId, amount, reason)
  if (success) {
    showRefundModal.value = false
    refundTransactionRef.value = null
  }
}

const printReceipt = async (transaction: Transaction) => {
  await paymentStore.printReceipt(transaction.id)
}

const refreshTransactions = async () => {
  isLoading.value = true
  await paymentStore.fetchRecentTransactions()
  isLoading.value = false
}

const formatAmount = (amount: number): string => {
  return paymentStore.formatAmount(amount)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    paymentStore.fetchPaymentMethods(),
    paymentStore.fetchCashDrawerStatus(),
    paymentStore.fetchRecentTransactions()
  ])

  setInterval(() => {
    if (!isProcessing.value) {
      paymentStore.fetchRecentTransactions()
    }
  }, 30000)
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .w-80 {
    @apply w-full max-w-[300px];
  }

  .md\:w-1\/3 {
    @apply w-full;
  }
}

/* Hover effects */
.payment-method-card {
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  transform: translateY(-2px);
}

/* Select styling */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A1A1AA'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
}
</style>
