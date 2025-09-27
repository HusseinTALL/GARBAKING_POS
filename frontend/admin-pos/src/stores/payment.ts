/**
 * Payment processing store for POS transactions
 * Handles multiple payment methods, receipts, and transaction management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// Types
export interface PaymentMethod {
  id: string
  name: string
  type: PaymentType
  displayName: string
  icon: string[]
  color: string
  enabled: boolean
  requiresAuth: boolean
  processingFee?: number
  minAmount?: number
  maxAmount?: number
  config?: Record<string, any>
}

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT = 'CREDIT',
  VOUCHER = 'VOUCHER'
}

export interface Transaction {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  paymentMethod: PaymentMethod
  status: TransactionStatus
  reference?: string
  authCode?: string
  receiptNumber: string
  cashGiven?: number
  changeAmount?: number
  tip?: number
  notes?: string
  staffId: string
  staffName: string
  customerId?: string
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
  metadata?: Record<string, any>
  createdAt: string
  processedAt?: string
  refundedAt?: string
  refundReason?: string
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export interface CashDrawer {
  id: string
  shiftId: string
  staffId: string
  startingAmount: number
  currentAmount: number
  expectedAmount: number
  variance: number
  transactions: CashTransaction[]
  isOpen: boolean
  openedAt: string
  closedAt?: string
  notes?: string
}

export interface CashTransaction {
  id: string
  type: 'SALE' | 'REFUND' | 'PAYOUT' | 'DEPOSIT' | 'CORRECTION'
  amount: number
  description: string
  reference?: string
  timestamp: string
}

export interface PaymentSplit {
  paymentMethodId: string
  amount: number
  reference?: string
}

export const usePaymentStore = defineStore('payment', () => {
  // State
  const paymentMethods = ref<PaymentMethod[]>([])
  const currentTransaction = ref<Transaction | null>(null)
  const cashDrawer = ref<CashDrawer | null>(null)
  const recentTransactions = ref<Transaction[]>([])
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const enabledPaymentMethods = computed(() =>
    paymentMethods.value.filter(method => method.enabled)
  )

  const cashPaymentMethod = computed(() =>
    paymentMethods.value.find(method => method.type === PaymentType.CASH)
  )

  const cardPaymentMethods = computed(() =>
    paymentMethods.value.filter(method => method.type === PaymentType.CARD && method.enabled)
  )

  const mobileMoneyMethods = computed(() =>
    paymentMethods.value.filter(method => method.type === PaymentType.MOBILE_MONEY && method.enabled)
  )

  const cashDrawerBalance = computed(() => {
    if (!cashDrawer.value) return 0
    return cashDrawer.value.currentAmount
  })

  const cashDrawerVariance = computed(() => {
    if (!cashDrawer.value) return 0
    return cashDrawer.value.currentAmount - cashDrawer.value.expectedAmount
  })

  const todaysTransactions = computed(() => {
    const today = new Date().toDateString()
    return recentTransactions.value.filter(transaction =>
      new Date(transaction.createdAt).toDateString() === today
    )
  })

  const todaysRevenue = computed(() => {
    return todaysTransactions.value
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((total, t) => total + t.amount, 0)
  })

  // Actions
  const fetchPaymentMethods = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/payment/methods')

      if (response.data.success) {
        paymentMethods.value = response.data.data.methods || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch payment methods')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const processPayment = async (
    orderId: string,
    amount: number,
    methodId: string,
    options: {
      cashGiven?: number
      tip?: number
      splits?: PaymentSplit[]
      customerInfo?: any
      notes?: string
    } = {}
  ): Promise<Transaction | null> => {
    isProcessing.value = true
    error.value = null

    try {
      const paymentMethod = paymentMethods.value.find(m => m.id === methodId)
      if (!paymentMethod) {
        throw new Error('Payment method not found')
      }

      const payload = {
        orderId,
        amount,
        paymentMethodId: methodId,
        ...options
      }

      const response = await axios.post('/api/payment/process', payload)

      if (response.data.success) {
        const transaction = response.data.data.transaction
        currentTransaction.value = transaction
        recentTransactions.value.unshift(transaction)

        // Update cash drawer if cash payment
        if (paymentMethod.type === PaymentType.CASH && cashDrawer.value) {
          cashDrawer.value.currentAmount += amount
          cashDrawer.value.transactions.push({
            id: transaction.id,
            type: 'SALE',
            amount,
            description: `Sale - Order #${transaction.orderNumber}`,
            reference: transaction.orderNumber,
            timestamp: new Date().toISOString()
          })
        }

        return transaction
      }

      throw new Error(response.data.error || 'Payment processing failed')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    } finally {
      isProcessing.value = false
    }
  }

  const processSplitPayment = async (
    orderId: string,
    totalAmount: number,
    splits: PaymentSplit[],
    options: {
      tip?: number
      customerInfo?: any
      notes?: string
    } = {}
  ): Promise<Transaction[] | null> => {
    isProcessing.value = true
    error.value = null

    try {
      // Validate splits
      const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0)
      if (Math.abs(splitTotal - totalAmount) > 0.01) {
        throw new Error('Split amounts do not match total')
      }

      const payload = {
        orderId,
        totalAmount,
        splits,
        ...options
      }

      const response = await axios.post('/api/payment/process-split', payload)

      if (response.data.success) {
        const transactions = response.data.data.transactions

        transactions.forEach((transaction: Transaction) => {
          recentTransactions.value.unshift(transaction)
        })

        return transactions
      }

      throw new Error(response.data.error || 'Split payment processing failed')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    } finally {
      isProcessing.value = false
    }
  }

  const refundPayment = async (
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/payment/refund/${transactionId}`, {
        amount,
        reason
      })

      if (response.data.success) {
        // Update transaction status
        const transactionIndex = recentTransactions.value.findIndex(t => t.id === transactionId)
        if (transactionIndex !== -1) {
          recentTransactions.value[transactionIndex].status =
            amount >= recentTransactions.value[transactionIndex].amount
              ? TransactionStatus.REFUNDED
              : TransactionStatus.PARTIALLY_REFUNDED
          recentTransactions.value[transactionIndex].refundedAt = new Date().toISOString()
          recentTransactions.value[transactionIndex].refundReason = reason
        }

        return true
      }

      throw new Error(response.data.error || 'Refund failed')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const openCashDrawer = async (startingAmount: number): Promise<boolean> => {
    try {
      const response = await axios.post('/api/payment/cash-drawer/open', {
        startingAmount
      })

      if (response.data.success) {
        cashDrawer.value = response.data.data.cashDrawer
        return true
      }

      throw new Error(response.data.error || 'Failed to open cash drawer')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const closeCashDrawer = async (
    countedAmount: number,
    notes?: string
  ): Promise<{ variance: number; report: any } | null> => {
    try {
      const response = await axios.post('/api/payment/cash-drawer/close', {
        countedAmount,
        notes
      })

      if (response.data.success) {
        const result = response.data.data

        if (cashDrawer.value) {
          cashDrawer.value.isOpen = false
          cashDrawer.value.closedAt = new Date().toISOString()
          cashDrawer.value.currentAmount = countedAmount
          cashDrawer.value.variance = result.variance
          cashDrawer.value.notes = notes
        }

        return result
      }

      throw new Error(response.data.error || 'Failed to close cash drawer')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    }
  }

  const addCashTransaction = async (
    type: CashTransaction['type'],
    amount: number,
    description: string,
    reference?: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post('/api/payment/cash-drawer/transaction', {
        type,
        amount,
        description,
        reference
      })

      if (response.data.success && cashDrawer.value) {
        const transaction = response.data.data.transaction
        cashDrawer.value.transactions.push(transaction)

        // Update current amount
        if (type === 'DEPOSIT' || type === 'CORRECTION') {
          cashDrawer.value.currentAmount += amount
        } else if (type === 'PAYOUT') {
          cashDrawer.value.currentAmount -= amount
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to add cash transaction')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const printReceipt = async (transactionId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/payment/receipt/${transactionId}`)

      if (response.data.success) {
        return true
      }

      throw new Error(response.data.error || 'Failed to print receipt')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const validatePaymentMethod = (
    methodId: string,
    amount: number
  ): { valid: boolean; message?: string } => {
    const method = paymentMethods.value.find(m => m.id === methodId)

    if (!method) {
      return { valid: false, message: 'Payment method not found' }
    }

    if (!method.enabled) {
      return { valid: false, message: 'Payment method is disabled' }
    }

    if (method.minAmount && amount < method.minAmount) {
      return { valid: false, message: `Minimum amount: ${method.minAmount} FCFA` }
    }

    if (method.maxAmount && amount > method.maxAmount) {
      return { valid: false, message: `Maximum amount: ${method.maxAmount} FCFA` }
    }

    return { valid: true }
  }

  const calculateChange = (totalAmount: number, cashGiven: number): number => {
    return Math.max(0, cashGiven - totalAmount)
  }

  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()} FCFA`
  }

  const getTransactionById = (transactionId: string): Transaction | undefined => {
    return recentTransactions.value.find(t => t.id === transactionId)
  }

  const fetchCashDrawerStatus = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/payment/cash-drawer/status')

      if (response.data.success) {
        cashDrawer.value = response.data.data.cashDrawer
        return true
      }

      return false
    } catch (err: any) {
      console.error('Failed to fetch cash drawer status:', err)
      return false
    }
  }

  const fetchRecentTransactions = async (limit: number = 50): Promise<boolean> => {
    try {
      const response = await axios.get(`/api/payment/transactions/recent?limit=${limit}`)

      if (response.data.success) {
        recentTransactions.value = response.data.data.transactions || []
        return true
      }

      return false
    } catch (err: any) {
      console.error('Failed to fetch recent transactions:', err)
      return false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    paymentMethods,
    currentTransaction,
    cashDrawer,
    recentTransactions,
    isProcessing,
    error,

    // Computed
    enabledPaymentMethods,
    cashPaymentMethod,
    cardPaymentMethods,
    mobileMoneyMethods,
    cashDrawerBalance,
    cashDrawerVariance,
    todaysTransactions,
    todaysRevenue,

    // Actions
    fetchPaymentMethods,
    processPayment,
    processSplitPayment,
    refundPayment,
    openCashDrawer,
    closeCashDrawer,
    addCashTransaction,
    printReceipt,
    validatePaymentMethod,
    calculateChange,
    formatAmount,
    getTransactionById,
    fetchCashDrawerStatus,
    fetchRecentTransactions,
    clearError
  }
})