/**
 * Receipt printing store for POS system
 * Handles receipt templates, printing queue, and thermal printer communication
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { Transaction } from './payment'
import type { Order } from './orders'

// Types
export interface ReceiptTemplate {
  id: string
  name: string
  type: ReceiptType
  isDefault: boolean
  config: ReceiptConfig
  customFields?: CustomField[]
  createdAt: string
  updatedAt: string
}

export enum ReceiptType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  REPRINT = 'REPRINT',
  KITCHEN = 'KITCHEN',
  BAR = 'BAR',
  CUSTOMER_COPY = 'CUSTOMER_COPY',
  MERCHANT_COPY = 'MERCHANT_COPY'
}

export interface ReceiptConfig {
  width: number // Paper width in characters (typically 48 for 80mm)
  header: {
    logo?: string
    businessName: string
    address: string[]
    phone?: string
    email?: string
    website?: string
    taxNumber?: string
  }
  footer: {
    thankYouMessage: string
    returnPolicy?: string
    customMessage?: string
    socialMedia?: string[]
  }
  formatting: {
    fontSize: 'small' | 'normal' | 'large'
    alignment: 'left' | 'center' | 'right'
    cutPaper: boolean
    openDrawer: boolean
    copies: number
  }
  barcode?: {
    enabled: boolean
    type: 'CODE128' | 'QR'
    position: 'top' | 'bottom'
  }
}

export interface CustomField {
  id: string
  label: string
  value: string
  position: 'header' | 'items' | 'footer'
  required: boolean
}

export interface PrintJob {
  id: string
  type: ReceiptType
  templateId: string
  data: any
  status: PrintJobStatus
  priority: number
  attempts: number
  maxAttempts: number
  createdAt: string
  processedAt?: string
  error?: string
}

export enum PrintJobStatus {
  QUEUED = 'QUEUED',
  PRINTING = 'PRINTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PrinterStatus {
  connected: boolean
  name: string
  model?: string
  paperStatus: 'OK' | 'LOW' | 'EMPTY'
  temperature: 'OK' | 'HIGH'
  lastPrint?: string
  totalPrints: number
}

export interface Printer {
  id: string
  name: string
  type: 'THERMAL' | 'RECEIPT' | 'KITCHEN' | 'BAR'
  ipAddress?: string
  port?: number
  serialPort?: string
  isDefault: boolean
  isActive: boolean
  assignedTo: 'ALL' | 'KITCHEN' | 'BAR' | 'REGISTER'
  capabilities: {
    cutter: boolean
    drawer: boolean
    barcode: boolean
    qrCode: boolean
    logo: boolean
    maxWidth: number // characters
  }
  status: PrinterStatus
  lastConnected?: string
  createdAt: string
}

export interface ReceiptArchive {
  id: string
  receiptNumber: string
  type: ReceiptType
  orderId?: string
  transactionId?: string
  printedAt: string
  printedBy: string
  printerId: string
  data: any
  templateId: string
  status: 'PRINTED' | 'REPRINTED' | 'ARCHIVED'
  reprintCount: number
  searchableText: string
}

export const useReceiptsStore = defineStore('receipts', () => {
  // State
  const templates = ref<ReceiptTemplate[]>([])
  const printQueue = ref<PrintJob[]>([])
  const printers = ref<Printer[]>([])
  const receiptArchive = ref<ReceiptArchive[]>([])
  const printerStatus = ref<PrinterStatus>({
    connected: false,
    name: '',
    paperStatus: 'OK',
    temperature: 'OK',
    totalPrints: 0
  })
  const isProcessingQueue = ref(false)
  const settings = ref({
    autoPrint: true,
    printKitchenOrders: true,
    printCustomerReceipt: true,
    defaultCopies: 1,
    paperWidth: 80, // mm
    characterWidth: 48,
    archiveReceipts: true,
    archiveRetentionDays: 90
  })

  // Computed
  const activeTemplate = computed(() =>
    templates.value.find(t => t.type === ReceiptType.SALE && t.isDefault)
  )

  const queuedJobs = computed(() =>
    printQueue.value.filter(job => job.status === PrintJobStatus.QUEUED)
  )

  const failedJobs = computed(() =>
    printQueue.value.filter(job => job.status === PrintJobStatus.FAILED)
  )

  const completedJobsToday = computed(() => {
    const today = new Date().toDateString()
    return printQueue.value.filter(job =>
      job.status === PrintJobStatus.COMPLETED &&
      new Date(job.createdAt).toDateString() === today
    ).length
  })

  // Actions
  const fetchTemplates = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/receipts/templates')

      if (response.data.success) {
        templates.value = response.data.data.templates || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch templates')
    } catch (err: any) {
      console.error('Failed to fetch receipt templates:', err)
      return false
    }
  }

  const printReceipt = async (
    type: ReceiptType,
    data: any,
    templateId?: string,
    options: {
      copies?: number
      priority?: number
      immediate?: boolean
    } = {}
  ): Promise<string | null> => {
    try {
      const template = templateId
        ? templates.value.find(t => t.id === templateId)
        : templates.value.find(t => t.type === type && t.isDefault)

      if (!template) {
        throw new Error(`No template found for receipt type: ${type}`)
      }

      const printJob: Omit<PrintJob, 'id' | 'createdAt'> = {
        type,
        templateId: template.id,
        data,
        status: PrintJobStatus.QUEUED,
        priority: options.priority || 1,
        attempts: 0,
        maxAttempts: 3
      }

      const response = await axios.post('/api/receipts/print', {
        ...printJob,
        copies: options.copies || template.config.formatting.copies,
        immediate: options.immediate || settings.value.autoPrint
      })

      if (response.data.success) {
        const job = response.data.data.job
        printQueue.value.unshift(job)

        if (options.immediate && printerStatus.value.connected) {
          await processQueue()
        }

        return job.id
      }

      throw new Error(response.data.error || 'Failed to queue print job')
    } catch (err: any) {
      console.error('Failed to print receipt:', err)
      return null
    }
  }

  const printSaleReceipt = async (
    transaction: Transaction,
    order: Order,
    copies: number = 1
  ): Promise<string | null> => {
    const receiptData = {
      transaction,
      order,
      timestamp: new Date().toISOString(),
      receiptNumber: generateReceiptNumber(),
      cashier: 'Current User', // Get from auth store
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        modifiers: item.modifiers?.map(m => m.name).join(', ') || ''
      })),
      totals: {
        subtotal: order.subtotal,
        tax: order.taxAmount,
        discount: order.discountAmount,
        total: order.total,
        paid: transaction.amount,
        change: transaction.changeAmount || 0
      },
      payment: {
        method: transaction.paymentMethod.displayName,
        reference: transaction.reference,
        authCode: transaction.authCode
      }
    }

    return await printReceipt(ReceiptType.SALE, receiptData, undefined, { copies })
  }

  const printKitchenOrder = async (order: Order): Promise<string | null> => {
    if (!settings.value.printKitchenOrders) return null

    const kitchenData = {
      order,
      timestamp: new Date().toISOString(),
      ticketNumber: order.orderNumber,
      table: order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway',
      items: order.items.filter(item => item.category !== 'Beverage').map(item => ({
        name: item.productName,
        quantity: item.quantity,
        modifiers: item.modifiers?.map(m => m.name).join(', ') || '',
        notes: item.notes || ''
      })),
      specialInstructions: order.notes || ''
    }

    return await printReceipt(ReceiptType.KITCHEN, kitchenData, undefined, {
      priority: 2,
      immediate: true
    })
  }

  const printRefundReceipt = async (
    originalTransaction: Transaction,
    refundAmount: number,
    reason: string
  ): Promise<string | null> => {
    const refundData = {
      originalTransaction,
      refundAmount,
      reason,
      timestamp: new Date().toISOString(),
      receiptNumber: generateReceiptNumber(),
      cashier: 'Current User'
    }

    return await printReceipt(ReceiptType.REFUND, refundData)
  }

  const reprintReceipt = async (jobId: string): Promise<string | null> => {
    const originalJob = printQueue.value.find(job => job.id === jobId)
    if (!originalJob) {
      throw new Error('Original print job not found')
    }

    return await printReceipt(
      ReceiptType.REPRINT,
      originalJob.data,
      originalJob.templateId,
      { priority: 0, immediate: true }
    )
  }

  const processQueue = async (): Promise<void> => {
    if (isProcessingQueue.value || !printerStatus.value.connected) return

    isProcessingQueue.value = true

    try {
      const jobsToProcess = queuedJobs.value
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5) // Process max 5 jobs at once

      for (const job of jobsToProcess) {
        await processJob(job)
      }
    } catch (err) {
      console.error('Error processing print queue:', err)
    } finally {
      isProcessingQueue.value = false
    }
  }

  const processJob = async (job: PrintJob): Promise<void> => {
    try {
      job.status = PrintJobStatus.PRINTING
      job.attempts++

      const template = templates.value.find(t => t.id === job.templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      const receiptContent = await generateReceiptContent(job.data, template)

      const response = await axios.post('/api/receipts/print-direct', {
        content: receiptContent,
        config: template.config.formatting
      })

      if (response.data.success) {
        job.status = PrintJobStatus.COMPLETED
        job.processedAt = new Date().toISOString()
        printerStatus.value.totalPrints++
        printerStatus.value.lastPrint = new Date().toISOString()
      } else {
        throw new Error(response.data.error || 'Print failed')
      }
    } catch (err: any) {
      job.status = job.attempts >= job.maxAttempts
        ? PrintJobStatus.FAILED
        : PrintJobStatus.QUEUED
      job.error = err.message
    }
  }

  const generateReceiptContent = async (
    data: any,
    template: ReceiptTemplate
  ): Promise<string> => {
    const { config } = template
    const width = config.width
    let content = ''

    // ESC/POS commands
    const ESC = '\x1B'
    const commands = {
      init: ESC + '@',
      alignLeft: ESC + 'a0',
      alignCenter: ESC + 'a1',
      alignRight: ESC + 'a2',
      boldOn: ESC + 'E1',
      boldOff: ESC + 'E0',
      cut: ESC + 'd3' + ESC + 'i',
      openDrawer: ESC + 'p0' + String.fromCharCode(25, 250)
    }

    // Initialize printer
    content += commands.init

    // Header
    content += commands.alignCenter + commands.boldOn
    content += centerText(config.header.businessName, width) + '\n'
    content += commands.boldOff

    config.header.address.forEach(line => {
      content += centerText(line, width) + '\n'
    })

    if (config.header.phone) {
      content += centerText(`Tel: ${config.header.phone}`, width) + '\n'
    }

    content += '='.repeat(width) + '\n'
    content += commands.alignLeft

    // Receipt details based on type
    if (template.type === ReceiptType.SALE) {
      content += formatSaleReceipt(data, width)
    } else if (template.type === ReceiptType.KITCHEN) {
      content += formatKitchenOrder(data, width)
    } else if (template.type === ReceiptType.REFUND) {
      content += formatRefundReceipt(data, width)
    }

    // Footer
    content += '='.repeat(width) + '\n'
    content += commands.alignCenter
    content += centerText(config.footer.thankYouMessage, width) + '\n'

    if (config.footer.returnPolicy) {
      content += '\n' + wrapText(config.footer.returnPolicy, width) + '\n'
    }

    // Barcode (if enabled)
    if (config.barcode?.enabled && data.receiptNumber) {
      content += '\n' + commands.alignCenter
      if (config.barcode.type === 'CODE128') {
        content += ESC + 'k4' + String.fromCharCode(data.receiptNumber.length) + data.receiptNumber
      }
      content += '\n'
    }

    // Spacing before cut
    content += '\n\n\n'

    // Cut paper and open drawer
    if (config.formatting.cutPaper) {
      content += commands.cut
    }

    if (config.formatting.openDrawer) {
      content += commands.openDrawer
    }

    return content
  }

  const formatSaleReceipt = (data: any, width: number): string => {
    let content = ''

    // Receipt info
    content += `Reçu #: ${data.receiptNumber}\n`
    content += `Date: ${new Date(data.timestamp).toLocaleString('fr-FR')}\n`
    content += `Caissier: ${data.cashier}\n`
    if (data.order.tableNumber) {
      content += `Table: ${data.order.tableNumber}\n`
    }
    content += '-'.repeat(width) + '\n'

    // Items
    data.items.forEach((item: any) => {
      const namePrice = formatLine(item.name, formatAmount(item.unitPrice), width)
      content += namePrice + '\n'

      if (item.quantity > 1) {
        content += `  ${item.quantity} x ${formatAmount(item.unitPrice)} = ${formatAmount(item.total)}\n`
      }

      if (item.modifiers) {
        content += `  + ${item.modifiers}\n`
      }
    })

    content += '-'.repeat(width) + '\n'

    // Totals
    content += formatLine('Sous-total:', formatAmount(data.totals.subtotal), width) + '\n'

    if (data.totals.discount > 0) {
      content += formatLine('Remise:', `-${formatAmount(data.totals.discount)}`, width) + '\n'
    }

    if (data.totals.tax > 0) {
      content += formatLine('TVA:', formatAmount(data.totals.tax), width) + '\n'
    }

    content += '='.repeat(width) + '\n'
    content += formatLine('TOTAL:', formatAmount(data.totals.total), width, true) + '\n'
    content += '='.repeat(width) + '\n'

    // Payment
    content += formatLine(data.payment.method + ':', formatAmount(data.totals.paid), width) + '\n'

    if (data.totals.change > 0) {
      content += formatLine('Monnaie:', formatAmount(data.totals.change), width) + '\n'
    }

    if (data.payment.reference) {
      content += `Ref: ${data.payment.reference}\n`
    }

    return content
  }

  const formatKitchenOrder = (data: any, width: number): string => {
    let content = ''

    content += `COMMANDE CUISINE\n`
    content += `Ticket #: ${data.ticketNumber}\n`
    content += `${data.table}\n`
    content += `${new Date(data.timestamp).toLocaleTimeString('fr-FR')}\n`
    content += '='.repeat(width) + '\n'

    data.items.forEach((item: any) => {
      content += `${item.quantity}x ${item.name}\n`
      if (item.modifiers) {
        content += `   ${item.modifiers}\n`
      }
      if (item.notes) {
        content += `   Note: ${item.notes}\n`
      }
      content += '\n'
    })

    if (data.specialInstructions) {
      content += 'INSTRUCTIONS SPECIALES:\n'
      content += wrapText(data.specialInstructions, width) + '\n'
    }

    return content
  }

  const formatRefundReceipt = (data: any, width: number): string => {
    let content = ''

    content += `REMBOURSEMENT\n`
    content += `Reçu #: ${data.receiptNumber}\n`
    content += `Date: ${new Date(data.timestamp).toLocaleString('fr-FR')}\n`
    content += `Caissier: ${data.cashier}\n`
    content += '-'.repeat(width) + '\n'

    content += `Reçu original: ${data.originalTransaction.receiptNumber}\n`
    content += `Montant remboursé: ${formatAmount(data.refundAmount)}\n`
    content += `Motif: ${data.reason}\n`

    return content
  }

  const checkPrinterStatus = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/receipts/printer/status')

      if (response.data.success) {
        printerStatus.value = response.data.data.status
        return true
      }

      return false
    } catch (err) {
      printerStatus.value.connected = false
      return false
    }
  }

  const retryFailedJobs = async (): Promise<void> => {
    const failed = failedJobs.value
    failed.forEach(job => {
      job.status = PrintJobStatus.QUEUED
      job.attempts = 0
      job.error = undefined
    })

    if (printerStatus.value.connected) {
      await processQueue()
    }
  }

  const cancelJob = async (jobId: string): Promise<boolean> => {
    const job = printQueue.value.find(j => j.id === jobId)
    if (job && job.status === PrintJobStatus.QUEUED) {
      job.status = PrintJobStatus.CANCELLED
      return true
    }
    return false
  }

  const clearQueue = (): void => {
    printQueue.value = printQueue.value.filter(
      job => job.status === PrintJobStatus.PRINTING
    )
  }

  // Helper functions
  const generateReceiptNumber = (): string => {
    const date = new Date()
    const timestamp = date.getTime().toString().slice(-6)
    return `R${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${timestamp}`
  }

  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()} FCFA`
  }

  const formatLine = (left: string, right: string, width: number, bold: boolean = false): string => {
    const spacesNeeded = width - left.length - right.length
    const spaces = Math.max(1, spacesNeeded)
    return bold ? `${left}${' '.repeat(spaces)}${right}` : `${left}${' '.repeat(spaces)}${right}`
  }

  const centerText = (text: string, width: number): string => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(spaces) + text
  }

  const wrapText = (text: string, width: number): string => {
    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    words.forEach(word => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    })

    if (currentLine) lines.push(currentLine)
    return lines.join('\n')
  }

  // Printer Management
  const activePrinters = computed(() =>
    printers.value.filter(p => p.isActive)
  )

  const defaultPrinter = computed(() =>
    printers.value.find(p => p.isDefault)
  )

  const fetchPrinters = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/printers')

      if (response.data.success) {
        printers.value = response.data.data.printers || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch printers')
    } catch (err: any) {
      console.error('Failed to fetch printers:', err)
      return false
    }
  }

  const addPrinter = async (printer: Omit<Printer, 'id' | 'createdAt'>): Promise<Printer | null> => {
    try {
      const response = await axios.post('/api/printers', printer)

      if (response.data.success) {
        const newPrinter = response.data.data.printer
        printers.value.push(newPrinter)
        return newPrinter
      }

      throw new Error(response.data.error || 'Failed to add printer')
    } catch (err: any) {
      console.error('Failed to add printer:', err)
      return null
    }
  }

  const updatePrinter = async (printerId: string, updates: Partial<Printer>): Promise<boolean> => {
    try {
      const response = await axios.put(`/api/printers/${printerId}`, updates)

      if (response.data.success) {
        const index = printers.value.findIndex(p => p.id === printerId)
        if (index !== -1) {
          printers.value[index] = { ...printers.value[index], ...updates }
        }
        return true
      }

      throw new Error(response.data.error || 'Failed to update printer')
    } catch (err: any) {
      console.error('Failed to update printer:', err)
      return false
    }
  }

  const deletePrinter = async (printerId: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/api/printers/${printerId}`)

      if (response.data.success) {
        printers.value = printers.value.filter(p => p.id !== printerId)
        return true
      }

      throw new Error(response.data.error || 'Failed to delete printer')
    } catch (err: any) {
      console.error('Failed to delete printer:', err)
      return false
    }
  }

  const testPrinter = async (printerId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/printers/${printerId}/test`)

      if (response.data.success) {
        return true
      }

      throw new Error(response.data.error || 'Failed to test printer')
    } catch (err: any) {
      console.error('Failed to test printer:', err)
      return false
    }
  }

  const selectPrinterForJob = (receiptType: ReceiptType): Printer | undefined => {
    // Auto-select printer based on receipt type
    const typeMapping = {
      [ReceiptType.KITCHEN]: 'KITCHEN',
      [ReceiptType.BAR]: 'BAR',
      [ReceiptType.SALE]: 'REGISTER',
      [ReceiptType.REFUND]: 'REGISTER',
      [ReceiptType.REPRINT]: 'REGISTER',
      [ReceiptType.CUSTOMER_COPY]: 'REGISTER',
      [ReceiptType.MERCHANT_COPY]: 'REGISTER'
    }

    const assignment = typeMapping[receiptType]
    const printer = activePrinters.value.find(p =>
      p.assignedTo === assignment || p.assignedTo === 'ALL'
    )

    return printer || defaultPrinter.value
  }

  // Receipt Archival
  const archiveReceipt = async (job: PrintJob): Promise<void> => {
    if (!settings.value.archiveReceipts) return

    try {
      const searchableText = generateSearchableText(job.data)

      const archive: ReceiptArchive = {
        id: generateArchiveId(),
        receiptNumber: job.data.receiptNumber || generateReceiptNumber(),
        type: job.type,
        orderId: job.data.order?.id,
        transactionId: job.data.transaction?.id,
        printedAt: new Date().toISOString(),
        printedBy: 'Current User', // Get from auth store
        printerId: job.data.printerId || '',
        data: job.data,
        templateId: job.templateId,
        status: 'PRINTED',
        reprintCount: 0,
        searchableText
      }

      receiptArchive.value.unshift(archive)

      // Send to backend for persistent storage
      await axios.post('/api/receipts/archive', archive)

      // Clean up old archives based on retention policy
      await cleanupOldArchives()
    } catch (err) {
      console.error('Failed to archive receipt:', err)
    }
  }

  const generateSearchableText = (data: any): string => {
    const parts: string[] = []

    if (data.receiptNumber) parts.push(data.receiptNumber)
    if (data.order?.orderNumber) parts.push(data.order.orderNumber)
    if (data.transaction?.reference) parts.push(data.transaction.reference)
    if (data.cashier) parts.push(data.cashier)
    if (data.items) {
      data.items.forEach((item: any) => {
        parts.push(item.name)
      })
    }

    return parts.join(' ').toLowerCase()
  }

  const generateArchiveId = (): string => {
    return `ARC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const searchArchive = (query: string, filters?: {
    type?: ReceiptType
    startDate?: string
    endDate?: string
    printedBy?: string
  }): ReceiptArchive[] => {
    let results = receiptArchive.value

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(archive =>
        archive.searchableText.includes(lowerQuery) ||
        archive.receiptNumber.toLowerCase().includes(lowerQuery)
      )
    }

    // Apply filters
    if (filters) {
      if (filters.type) {
        results = results.filter(a => a.type === filters.type)
      }

      if (filters.startDate) {
        results = results.filter(a => a.printedAt >= filters.startDate!)
      }

      if (filters.endDate) {
        results = results.filter(a => a.printedAt <= filters.endDate!)
      }

      if (filters.printedBy) {
        results = results.filter(a => a.printedBy === filters.printedBy)
      }
    }

    return results
  }

  const fetchArchive = async (filters?: {
    startDate?: string
    endDate?: string
    type?: ReceiptType
    limit?: number
  }): Promise<boolean> => {
    try {
      const response = await axios.get('/api/receipts/archive', { params: filters })

      if (response.data.success) {
        receiptArchive.value = response.data.data.archive || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch archive')
    } catch (err: any) {
      console.error('Failed to fetch archive:', err)
      return false
    }
  }

  const reprintFromArchive = async (archiveId: string): Promise<string | null> => {
    try {
      const archive = receiptArchive.value.find(a => a.id === archiveId)
      if (!archive) {
        throw new Error('Archive entry not found')
      }

      // Increment reprint count
      archive.reprintCount++
      archive.status = 'REPRINTED'

      // Create new print job
      const jobId = await printReceipt(
        ReceiptType.REPRINT,
        archive.data,
        archive.templateId,
        { immediate: true }
      )

      return jobId
    } catch (err: any) {
      console.error('Failed to reprint from archive:', err)
      return null
    }
  }

  const cleanupOldArchives = async (): Promise<void> => {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - settings.value.archiveRetentionDays)

    receiptArchive.value = receiptArchive.value.filter(archive =>
      new Date(archive.printedAt) >= retentionDate
    )
  }

  const exportArchive = (archives: ReceiptArchive[]): string => {
    const headers = ['Receipt #', 'Type', 'Order ID', 'Printed At', 'Printed By', 'Status', 'Reprint Count']
    const rows = archives.map(archive => [
      archive.receiptNumber,
      archive.type,
      archive.orderId || '',
      new Date(archive.printedAt).toLocaleString(),
      archive.printedBy,
      archive.status,
      archive.reprintCount
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  }

  // Auto-process queue
  setInterval(() => {
    if (!isProcessingQueue.value && queuedJobs.value.length > 0) {
      processQueue()
    }
  }, 5000)

  return {
    // State
    templates,
    printQueue,
    printers,
    receiptArchive,
    printerStatus,
    settings,
    isProcessingQueue,

    // Computed
    activeTemplate,
    queuedJobs,
    failedJobs,
    completedJobsToday,
    activePrinters,
    defaultPrinter,

    // Actions - Templates
    fetchTemplates,

    // Actions - Printing
    printReceipt,
    printSaleReceipt,
    printKitchenOrder,
    printRefundReceipt,
    reprintReceipt,
    processQueue,
    checkPrinterStatus,
    retryFailedJobs,
    cancelJob,
    clearQueue,

    // Actions - Printer Management
    fetchPrinters,
    addPrinter,
    updatePrinter,
    deletePrinter,
    testPrinter,
    selectPrinterForJob,

    // Actions - Archival
    archiveReceipt,
    searchArchive,
    fetchArchive,
    reprintFromArchive,
    exportArchive
  }
})