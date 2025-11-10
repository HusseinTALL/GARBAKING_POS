<!--
  Printer Management Modal - Configure and manage multiple printers
  Supports thermal, kitchen, and bar printers with auto-assignment
-->

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div>
          <h2 class="text-xl font-semibold text-gray-100">Printer Management</h2>
          <p class="text-sm text-gray-400 mt-1">Configure thermal printers and receipt printing</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="addPrinter"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus class="w-4 h-4" />
            <span>Add Printer</span>
          </button>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <!-- Printers List -->
      <div class="p-6">
        <div v-if="receiptsStore.printers.length === 0" class="text-center py-12">
          <Printer class="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-300 mb-2">No Printers Configured</h3>
          <p class="text-gray-500 mb-4">Add your first printer to start printing receipts</p>
          <button
            @click="addPrinter"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add First Printer
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="printer in receiptsStore.printers"
            :key="printer.id"
            class="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="getPrinterIconClass(printer.type)"
                >
                  <Printer class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-100">{{ printer.name }}</h3>
                  <p class="text-sm text-gray-400">{{ getPrinterTypeLabel(printer.type) }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="printer.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'"
                >
                  {{ printer.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span
                  v-if="printer.isDefault"
                  class="px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-400"
                >
                  Default
                </span>
              </div>
            </div>

            <!-- Printer Status -->
            <div class="mb-4 p-4 bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Connection</span>
                <div class="flex items-center space-x-2">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="printer.status.connected ? 'bg-green-500' : 'bg-red-500'"
                  ></div>
                  <span class="text-sm text-gray-100">
                    {{ printer.status.connected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
              </div>

              <div v-if="printer.status.connected" class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Paper:</span>
                  <span
                    :class="{
                      'text-green-400': printer.status.paperStatus === 'OK',
                      'text-yellow-400': printer.status.paperStatus === 'LOW',
                      'text-red-400': printer.status.paperStatus === 'EMPTY'
                    }"
                  >
                    {{ getPaperStatusLabel(printer.status.paperStatus) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Prints:</span>
                  <span class="text-gray-100">{{ printer.status.totalPrints }}</span>
                </div>
              </div>
            </div>

            <!-- Connection Details -->
            <div class="space-y-2 text-sm mb-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Assigned To:</span>
                <span class="text-gray-100">{{ printer.assignedTo }}</span>
              </div>
              <div v-if="printer.ipAddress" class="flex items-center justify-between">
                <span class="text-gray-400">IP Address:</span>
                <span class="text-gray-100 font-mono">{{ printer.ipAddress }}:{{ printer.port }}</span>
              </div>
              <div v-if="printer.serialPort" class="flex items-center justify-between">
                <span class="text-gray-400">Serial Port:</span>
                <span class="text-gray-100 font-mono">{{ printer.serialPort }}</span>
              </div>
            </div>

            <!-- Capabilities -->
            <div class="mb-4">
              <div class="text-sm text-gray-400 mb-2">Capabilities:</div>
              <div class="flex flex-wrap gap-2">
                <span v-if="printer.capabilities.cutter" class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  <Scissors class="w-3 h-3 inline-block mr-1" />
                  Auto Cutter
                </span>
                <span v-if="printer.capabilities.drawer" class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  <DollarSign class="w-3 h-3 inline-block mr-1" />
                  Cash Drawer
                </span>
                <span v-if="printer.capabilities.barcode" class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  <Barcode class="w-3 h-3 inline-block mr-1" />
                  Barcode
                </span>
                <span v-if="printer.capabilities.qrCode" class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  <QrCode class="w-3 h-3 inline-block mr-1" />
                  QR Code
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <button
                @click="testPrinter(printer.id)"
                class="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-100 px-3 py-2 rounded text-sm transition-colors"
              >
                <TestTube class="w-4 h-4 inline-block mr-2" />
                Test Print
              </button>
              <button
                @click="editPrinter(printer)"
                class="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <Edit class="w-4 h-4 inline-block mr-2" />
                Edit
              </button>
              <button
                @click="togglePrinter(printer)"
                :class="printer.isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'"
                class="px-3 py-2 rounded text-sm transition-colors text-white"
              >
                {{ printer.isActive ? 'Disable' : 'Enable' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Printer Form -->
      <div v-if="showPrinterForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showPrinterForm = false">
        <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-100 mb-6">
              {{ editingPrinter ? 'Edit Printer' : 'Add New Printer' }}
            </h3>

            <form @submit.prevent="savePrinter" class="space-y-6">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Printer Name *</label>
                  <input
                    v-model="printerForm.name"
                    required
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Main Register Printer"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                  <select
                    v-model="printerForm.type"
                    required
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="THERMAL">Thermal Receipt</option>
                    <option value="KITCHEN">Kitchen Printer</option>
                    <option value="BAR">Bar Printer</option>
                    <option value="RECEIPT">Standard Receipt</option>
                  </select>
                </div>
              </div>

              <!-- Connection -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">IP Address</label>
                  <input
                    v-model="printerForm.ipAddress"
                    type="text"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Port</label>
                  <input
                    v-model.number="printerForm.port"
                    type="number"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="9100"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Serial Port</label>
                  <input
                    v-model="printerForm.serialPort"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="COM3 or /dev/ttyUSB0"
                  />
                </div>
              </div>

              <!-- Assignment -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Assigned To *</label>
                <select
                  v-model="printerForm.assignedTo"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Stations</option>
                  <option value="REGISTER">Register Only</option>
                  <option value="KITCHEN">Kitchen Only</option>
                  <option value="BAR">Bar Only</option>
                </select>
              </div>

              <!-- Capabilities -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-3">Capabilities</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="printerForm.capabilities.cutter" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm text-gray-300">Auto Cutter</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="printerForm.capabilities.drawer" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm text-gray-300">Cash Drawer</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="printerForm.capabilities.barcode" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm text-gray-300">Barcode</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="printerForm.capabilities.qrCode" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm text-gray-300">QR Code</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="printerForm.capabilities.logo" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm text-gray-300">Logo Printing</span>
                  </label>
                </div>

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-300 mb-2">Max Width (characters)</label>
                  <input
                    v-model.number="printerForm.capabilities.maxWidth"
                    type="number"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="48"
                  />
                </div>
              </div>

              <!-- Settings -->
              <div class="flex items-center space-x-6">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="printerForm.isDefault" class="w-4 h-4 text-blue-600 rounded" />
                  <span class="text-sm text-gray-300">Set as Default Printer</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="printerForm.isActive" class="w-4 h-4 text-blue-600 rounded" />
                  <span class="text-sm text-gray-300">Active</span>
                </label>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  @click="showPrinterForm = false"
                  class="px-4 py-2 text-gray-300 hover:text-gray-100 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {{ editingPrinter ? 'Update' : 'Add' }} Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReceiptsStore, type Printer } from '@/stores/receipts'
import {
  X,
  Plus,
  Edit,
  TestTube,
  Scissors,
  DollarSign,
  Barcode,
  QrCode
} from 'lucide-vue-next'

const receiptsStore = useReceiptsStore()

// State
const showPrinterForm = ref(false)
const editingPrinter = ref<Printer | null>(null)
const printerForm = ref({
  name: '',
  type: 'THERMAL' as any,
  ipAddress: '',
  port: 9100,
  serialPort: '',
  isDefault: false,
  isActive: true,
  assignedTo: 'ALL' as any,
  capabilities: {
    cutter: true,
    drawer: true,
    barcode: true,
    qrCode: false,
    logo: true,
    maxWidth: 48
  }
})

// Methods
const addPrinter = () => {
  editingPrinter.value = null
  printerForm.value = {
    name: '',
    type: 'THERMAL',
    ipAddress: '',
    port: 9100,
    serialPort: '',
    isDefault: false,
    isActive: true,
    assignedTo: 'ALL',
    capabilities: {
      cutter: true,
      drawer: true,
      barcode: true,
      qrCode: false,
      logo: true,
      maxWidth: 48
    }
  }
  showPrinterForm.value = true
}

const editPrinter = (printer: Printer) => {
  editingPrinter.value = printer
  printerForm.value = {
    name: printer.name,
    type: printer.type,
    ipAddress: printer.ipAddress || '',
    port: printer.port || 9100,
    serialPort: printer.serialPort || '',
    isDefault: printer.isDefault,
    isActive: printer.isActive,
    assignedTo: printer.assignedTo,
    capabilities: { ...printer.capabilities }
  }
  showPrinterForm.value = true
}

const savePrinter = async () => {
  if (editingPrinter.value) {
    await receiptsStore.updatePrinter(editingPrinter.value.id, printerForm.value as any)
  } else {
    await receiptsStore.addPrinter(printerForm.value as any)
  }

  showPrinterForm.value = false
}

const testPrinter = async (printerId: string) => {
  await receiptsStore.testPrinter(printerId)
}

const togglePrinter = async (printer: Printer) => {
  await receiptsStore.updatePrinter(printer.id, { isActive: !printer.isActive })
}

const getPrinterTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    THERMAL: 'Thermal Receipt Printer',
    KITCHEN: 'Kitchen Ticket Printer',
    BAR: 'Bar Ticket Printer',
    RECEIPT: 'Standard Receipt Printer'
  }
  return labels[type] || type
}

const getPrinterIconClass = (type: string): string => {
  const classes: Record<string, string> = {
    THERMAL: 'bg-blue-900/50 text-blue-400',
    KITCHEN: 'bg-orange-900/50 text-orange-400',
    BAR: 'bg-purple-900/50 text-purple-400',
    RECEIPT: 'bg-green-900/50 text-green-400'
  }
  return classes[type] || 'bg-gray-700 text-gray-400'
}

const getPaperStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    OK: 'OK',
    LOW: 'Low',
    EMPTY: 'Empty'
  }
  return labels[status] || status
}
</script>
