<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Payroll Management
        </h1>
        <button
          @click="showCreatePeriodModal = true"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          Create Payroll Period
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Payroll Periods List -->
      <div class="max-w-7xl mx-auto">
        <div v-if="periods.length > 0" class="space-y-4">
          <div
            v-for="period in periods"
            :key="period.id"
            class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border-l-4"
            :class="getStatusBorderClass(period.status)"
            @click="viewPeriodDetails(period)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <Calendar class="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 class="text-xl font-bold text-white">{{ period.periodName }}</h3>
                    <p class="text-sm text-gray-400">
                      {{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}
                      • Pay Date: {{ formatDate(period.payDate) }}
                    </p>
                  </div>
                </div>
              </div>
              <span
                class="px-3 py-1 rounded text-sm font-semibold"
                :class="getStatusClass(period.status)"
              >
                {{ period.status }}
              </span>
            </div>

            <div class="grid grid-cols-5 gap-4">
              <div class="bg-gray-700 rounded p-3">
                <p class="text-xs text-gray-400 mb-1">Employees</p>
                <p class="text-xl font-bold text-white">{{ period.employeeCount || 0 }}</p>
              </div>
              <div class="bg-gray-700 rounded p-3">
                <p class="text-xs text-gray-400 mb-1">Total Hours</p>
                <p class="text-xl font-bold text-white">{{ formatNumber(period.totalHours) }}</p>
              </div>
              <div class="bg-gray-700 rounded p-3">
                <p class="text-xs text-gray-400 mb-1">Overtime Hours</p>
                <p class="text-xl font-bold text-yellow-400">{{ formatNumber(period.totalOvertimeHours) }}</p>
              </div>
              <div class="bg-gray-700 rounded p-3">
                <p class="text-xs text-gray-400 mb-1">Gross Pay</p>
                <p class="text-xl font-bold text-green-400">${{ formatCurrency(period.totalGrossPay) }}</p>
              </div>
              <div class="bg-gray-700 rounded p-3">
                <p class="text-xs text-gray-400 mb-1">Net Pay</p>
                <p class="text-xl font-bold text-blue-400">${{ formatCurrency(period.totalNetPay) }}</p>
              </div>
            </div>

            <div v-if="period.status === 'DRAFT'" class="mt-4 flex gap-2">
              <button
                @click.stop="generateEntries(period.id)"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Generate Entries
              </button>
            </div>
            <div v-else-if="period.status === 'PROCESSING'" class="mt-4 flex gap-2">
              <button
                @click.stop="approvePeriod(period.id)"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Approve Payroll
              </button>
            </div>
            <div v-else-if="period.status === 'APPROVED'" class="mt-4 flex gap-2">
              <button
                @click.stop="markPaid(period.id)"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <DollarSign class="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p class="text-gray-400">No payroll periods found</p>
        </div>
      </div>
    </div>

    <!-- Create Period Modal -->
    <div
      v-if="showCreatePeriodModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreatePeriodModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Create Payroll Period</h2>
          <button
            @click="showCreatePeriodModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="createPeriod" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              v-model="periodForm.startDate"
              type="date"
              required
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              v-model="periodForm.endDate"
              type="date"
              required
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Pay Date</label>
            <input
              v-model="periodForm.payDate"
              type="date"
              required
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCreatePeriodModal = false"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Create Period
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Period Details Modal -->
    <div
      v-if="selectedPeriod"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      @click.self="selectedPeriod = null"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-6xl w-full m-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">{{ selectedPeriod.periodName }}</h2>
          <button
            @click="selectedPeriod = null"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Entries Table -->
          <div v-if="periodEntries.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Employee</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Reg Hours</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">OT Hours</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Tips</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Gross Pay</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Deductions</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Net Pay</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr v-for="entry in periodEntries" :key="entry.id" class="hover:bg-gray-750">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-white">{{ entry.employeeName }}</div>
                    <div class="text-xs text-gray-400">{{ entry.positionTitle }}</div>
                  </td>
                  <td class="px-4 py-3 text-right text-white">{{ formatNumber(entry.regularHours) }}</td>
                  <td class="px-4 py-3 text-right text-yellow-400">{{ formatNumber(entry.overtimeHours) }}</td>
                  <td class="px-4 py-3 text-right text-green-400">${{ formatCurrency(entry.tips) }}</td>
                  <td class="px-4 py-3 text-right text-green-400">${{ formatCurrency(entry.grossPay) }}</td>
                  <td class="px-4 py-3 text-right text-red-400">${{ formatCurrency(entry.totalDeductions) }}</td>
                  <td class="px-4 py-3 text-right text-blue-400 font-bold">${{ formatCurrency(entry.netPay) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8 text-gray-400">
            No payroll entries generated yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Calendar, DollarSign, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const periods = ref<any[]>([])
const periodEntries = ref<any[]>([])
const selectedPeriod = ref<any>(null)
const showCreatePeriodModal = ref(false)
const isSubmitting = ref(false)

const periodForm = ref({
  startDate: '',
  endDate: '',
  payDate: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Methods
function getStatusClass(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-600 text-gray-200'
    case 'PROCESSING':
      return 'bg-yellow-600 text-yellow-200'
    case 'APPROVED':
      return 'bg-green-600 text-green-200'
    case 'PAID':
      return 'bg-blue-600 text-blue-200'
    default:
      return 'bg-gray-600 text-gray-200'
  }
}

function getStatusBorderClass(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'border-gray-500'
    case 'PROCESSING':
      return 'border-yellow-500'
    case 'APPROVED':
      return 'border-green-500'
    case 'PAID':
      return 'border-blue-500'
    default:
      return 'border-gray-500'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNumber(value: any): string {
  if (!value) return '0'
  return parseFloat(value).toFixed(2)
}

function formatCurrency(value: any): string {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

async function loadPeriods() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/payroll/periods`)
    periods.value = response.data
  } catch (error: any) {
    console.error('Failed to load payroll periods:', error)
    toast.error('Failed to load payroll periods')
  }
}

async function createPeriod() {
  isSubmitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/payroll/periods`, null, {
      params: {
        startDate: periodForm.value.startDate,
        endDate: periodForm.value.endDate,
        payDate: periodForm.value.payDate
      }
    })

    toast.success('Payroll period created successfully!')
    showCreatePeriodModal.value = false

    periodForm.value = {
      startDate: '',
      endDate: '',
      payDate: ''
    }

    loadPeriods()
  } catch (error: any) {
    console.error('Failed to create payroll period:', error)
    toast.error(error.response?.data?.message || 'Failed to create payroll period')
  } finally {
    isSubmitting.value = false
  }
}

async function generateEntries(periodId: number) {
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/payroll/periods/${periodId}/generate`)
    toast.success('Payroll entries generated successfully!')
    loadPeriods()
  } catch (error: any) {
    console.error('Failed to generate entries:', error)
    toast.error(error.response?.data?.message || 'Failed to generate payroll entries')
  }
}

async function approvePeriod(periodId: number) {
  try {
    // Use fixed manager ID for now
    const managerId = 1
    await axios.post(`${API_GATEWAY_URL}/api/employees/payroll/periods/${periodId}/approve`, null, {
      params: { managerId }
    })
    toast.success('Payroll period approved successfully!')
    loadPeriods()
  } catch (error: any) {
    console.error('Failed to approve period:', error)
    toast.error(error.response?.data?.message || 'Failed to approve payroll period')
  }
}

async function markPaid(periodId: number) {
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/payroll/periods/${periodId}/mark-paid`)
    toast.success('Payroll marked as paid successfully!')
    loadPeriods()
  } catch (error: any) {
    console.error('Failed to mark as paid:', error)
    toast.error(error.response?.data?.message || 'Failed to mark payroll as paid')
  }
}

async function viewPeriodDetails(period: any) {
  selectedPeriod.value = period

  try {
    const response = await axios.get(
      `${API_GATEWAY_URL}/api/employees/payroll/periods/${period.id}/entries`
    )
    periodEntries.value = response.data
  } catch (error: any) {
    console.error('Failed to load period entries:', error)
    periodEntries.value = []
  }
}

// Lifecycle
onMounted(() => {
  loadPeriods()
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
</style>
