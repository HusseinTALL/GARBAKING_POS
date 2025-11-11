<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Shift Swaps
        </h1>
        <button
          @click="showCreateSwapModal = true"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          Request Swap
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-3 font-semibold transition-colors relative"
          :class="activeTab === tab.id
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-gray-300'"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="ml-2 px-2 py-0.5 rounded-full text-xs"
            :class="tab.id === 'awaiting-approval' ? 'bg-yellow-600 text-yellow-200' : 'bg-blue-600 text-blue-200'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- All Requests Tab -->
      <div v-if="activeTab === 'all'" class="max-w-6xl mx-auto">
        <div v-if="allRequests.length > 0" class="space-y-4">
          <div
            v-for="request in allRequests"
            :key="request.id"
            class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
            @click="viewSwapDetails(request)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <RefreshCw class="w-5 h-5 text-blue-400" />
                  <div>
                    <p class="font-semibold text-white">
                      {{ request.requesterName }}
                      <span v-if="request.targetEmployeeName" class="text-gray-400">→ {{ request.targetEmployeeName }}</span>
                      <span v-else class="text-yellow-400">→ Open Request</span>
                    </p>
                    <p class="text-sm text-gray-400">{{ formatDateTime(request.createdAt) }}</p>
                  </div>
                </div>

                <div v-if="request.requesterShift" class="ml-8 text-sm text-gray-300">
                  <p>{{ formatShiftInfo(request.requesterShift) }}</p>
                </div>

                <p v-if="request.requestMessage" class="ml-8 mt-2 text-sm text-gray-400 italic">
                  "{{ request.requestMessage }}"
                </p>
              </div>

              <div class="text-right">
                <span
                  class="inline-block px-3 py-1 rounded text-sm font-semibold"
                  :class="getStatusClass(request.status)"
                >
                  {{ request.status }}
                </span>
                <div v-if="request.status === 'PENDING'" class="mt-2 text-xs text-yellow-400">
                  Awaiting response
                </div>
                <div v-else-if="request.status === 'ACCEPTED'" class="mt-2 text-xs text-green-400">
                  Awaiting manager approval
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <RefreshCw class="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p class="text-gray-400">No shift swap requests found</p>
        </div>
      </div>

      <!-- Awaiting Approval Tab (Manager View) -->
      <div v-if="activeTab === 'awaiting-approval'" class="max-w-6xl mx-auto">
        <div v-if="awaitingApproval.length > 0" class="space-y-4">
          <div
            v-for="request in awaitingApproval"
            :key="request.id"
            class="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <AlertCircle class="w-5 h-5 text-yellow-400" />
                  <div>
                    <p class="font-semibold text-white">
                      {{ request.requesterName }} ↔ {{ request.targetEmployeeName }}
                    </p>
                    <p class="text-sm text-gray-400">Accepted {{ formatDateTime(request.respondedAt) }}</p>
                  </div>
                </div>

                <div class="ml-8 space-y-2 text-sm text-gray-300">
                  <p><strong>Requester Shift:</strong> {{ formatShiftInfo(request.requesterShift) }}</p>
                  <p v-if="request.targetShift">
                    <strong>Target Shift:</strong> {{ formatShiftInfo(request.targetShift) }}
                  </p>
                </div>

                <p v-if="request.responseMessage" class="ml-8 mt-3 text-sm text-gray-400 italic bg-gray-700 p-3 rounded">
                  "{{ request.responseMessage }}"
                </p>
              </div>

              <span class="px-3 py-1 rounded text-sm font-semibold bg-yellow-600 text-yellow-200">
                ACCEPTED
              </span>
            </div>

            <!-- Manager Actions -->
            <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-700">
              <input
                v-model="approvalNotes[request.id]"
                type="text"
                placeholder="Approval notes (optional)"
                class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                @click="approveSwap(request.id)"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Check class="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <CheckCircle class="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p class="text-gray-400">No swap requests awaiting approval</p>
        </div>
      </div>
    </div>

    <!-- Create Swap Request Modal -->
    <div
      v-if="showCreateSwapModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateSwapModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Request Shift Swap</h2>
          <button
            @click="showCreateSwapModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="createSwapRequest" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Requesting Employee</label>
            <select
              v-model="swapForm.requesterId"
              @change="loadRequesterShifts"
              required
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }} ({{ emp.employeeNumber }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Shift to Swap</label>
            <select
              v-model="swapForm.requesterShiftId"
              required
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Shift</option>
              <option v-for="shift in requesterShifts" :key="shift.id" :value="shift.id">
                {{ formatShiftInfo(shift) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Target Employee (optional - leave empty for open request)
            </label>
            <select
              v-model="swapForm.targetEmployeeId"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Open Request (Any Employee)</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }} ({{ emp.employeeNumber }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea
              v-model="swapForm.requestMessage"
              rows="3"
              placeholder="Explain why you need this swap..."
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCreateSwapModal = false"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Request Swap
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Swap Details Modal -->
    <div
      v-if="selectedSwap"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="selectedSwap = null"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Swap Request Details</h2>
          <button
            @click="selectedSwap = null"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Requester</p>
              <p class="text-white font-semibold">{{ selectedSwap.requesterName }}</p>
              <p class="text-xs text-gray-500">{{ selectedSwap.requesterEmployeeNumber }}</p>
            </div>
            <div v-if="selectedSwap.targetEmployeeName">
              <p class="text-sm text-gray-400">Target Employee</p>
              <p class="text-white font-semibold">{{ selectedSwap.targetEmployeeName }}</p>
              <p class="text-xs text-gray-500">{{ selectedSwap.targetEmployeeNumber }}</p>
            </div>
            <div v-else>
              <p class="text-sm text-gray-400">Target</p>
              <p class="text-yellow-400 font-semibold">Open Request</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-400 mb-2">Requester's Shift</p>
            <div class="bg-gray-700 rounded p-3">
              <p class="text-white">{{ formatShiftInfo(selectedSwap.requesterShift) }}</p>
            </div>
          </div>

          <div v-if="selectedSwap.targetShift">
            <p class="text-sm text-gray-400 mb-2">Target Shift</p>
            <div class="bg-gray-700 rounded p-3">
              <p class="text-white">{{ formatShiftInfo(selectedSwap.targetShift) }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-400">Status</p>
            <span
              class="inline-block px-3 py-1 rounded text-sm font-semibold mt-1"
              :class="getStatusClass(selectedSwap.status)"
            >
              {{ selectedSwap.status }}
            </span>
          </div>

          <div v-if="selectedSwap.requestMessage">
            <p class="text-sm text-gray-400">Request Message</p>
            <p class="text-white bg-gray-700 p-3 rounded italic">"{{ selectedSwap.requestMessage }}"</p>
          </div>

          <div v-if="selectedSwap.responseMessage">
            <p class="text-sm text-gray-400">Response</p>
            <p class="text-white bg-gray-700 p-3 rounded">"{{ selectedSwap.responseMessage }}"</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatDateTime(selectedSwap.respondedAt) }}</p>
          </div>

          <div v-if="selectedSwap.approvalNotes">
            <p class="text-sm text-gray-400">Manager Approval Notes</p>
            <p class="text-white bg-gray-700 p-3 rounded">"{{ selectedSwap.approvalNotes }}"</p>
            <p class="text-xs text-gray-500 mt-1">
              Approved by {{ selectedSwap.approverName }} on {{ formatDateTime(selectedSwap.approvedAt) }}
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              v-if="selectedSwap.status === 'PENDING' || selectedSwap.status === 'ACCEPTED'"
              @click="cancelSwap(selectedSwap.id)"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Cancel Request
            </button>
            <button
              @click="selectedSwap = null"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ml-auto"
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
import { Plus, RefreshCw, AlertCircle, CheckCircle, Check, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const activeTab = ref('all')
const allRequests = ref<any[]>([])
const awaitingApproval = ref<any[]>([])
const employees = ref<any[]>([])
const requesterShifts = ref<any[]>([])
const showCreateSwapModal = ref(false)
const selectedSwap = ref<any>(null)
const isSubmitting = ref(false)
const approvalNotes = ref<Record<number, string>>({})

const swapForm = ref({
  requesterId: '',
  requesterShiftId: '',
  targetEmployeeId: '',
  requestMessage: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Computed
const tabs = computed(() => [
  { id: 'all', label: 'All Requests', count: allRequests.value.length },
  { id: 'awaiting-approval', label: 'Awaiting Approval', count: awaitingApproval.value.length }
])

// Methods
function getStatusClass(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-600 text-yellow-200'
    case 'ACCEPTED':
      return 'bg-green-600 text-green-200'
    case 'APPROVED':
      return 'bg-blue-600 text-blue-200'
    case 'REJECTED':
      return 'bg-red-600 text-red-200'
    case 'CANCELLED':
      return 'bg-gray-600 text-gray-200'
    default:
      return 'bg-gray-600 text-gray-200'
  }
}

function formatDateTime(dateTime: string): string {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatShiftInfo(shift: any): string {
  if (!shift) return 'N/A'
  const date = new Date(shift.shiftDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const startTime = formatTime(shift.startTime)
  const endTime = formatTime(shift.endTime)
  return `${date} • ${shift.positionTitle} • ${startTime} - ${endTime}`
}

function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function viewSwapDetails(swap: any) {
  selectedSwap.value = swap
}

async function loadAllRequests() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/shift-swaps`)
    allRequests.value = response.data
  } catch (error: any) {
    console.error('Failed to load swap requests:', error)
    toast.error('Failed to load swap requests')
  }
}

async function loadAwaitingApproval() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/shift-swaps/awaiting-approval`)
    awaitingApproval.value = response.data
  } catch (error: any) {
    console.error('Failed to load awaiting approval:', error)
  }
}

async function loadEmployees() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees?activeOnly=true`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
  }
}

async function loadRequesterShifts() {
  if (!swapForm.value.requesterId) {
    requesterShifts.value = []
    return
  }

  try {
    // Get upcoming shifts for the selected employee
    const response = await axios.get(
      `${API_GATEWAY_URL}/api/employees/shifts/employee/${swapForm.value.requesterId}/upcoming`
    )
    requesterShifts.value = response.data
  } catch (error: any) {
    console.error('Failed to load shifts:', error)
  }
}

async function createSwapRequest() {
  isSubmitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/shift-swaps`, {
      requesterId: Number(swapForm.value.requesterId),
      requesterShiftId: Number(swapForm.value.requesterShiftId),
      targetEmployeeId: swapForm.value.targetEmployeeId ? Number(swapForm.value.targetEmployeeId) : null,
      requestMessage: swapForm.value.requestMessage || null
    })

    toast.success('Swap request created successfully!')
    showCreateSwapModal.value = false

    // Reset form
    swapForm.value = {
      requesterId: '',
      requesterShiftId: '',
      targetEmployeeId: '',
      requestMessage: ''
    }
    requesterShifts.value = []

    loadAllRequests()
  } catch (error: any) {
    console.error('Failed to create swap request:', error)
    toast.error(error.response?.data?.message || 'Failed to create swap request')
  } finally {
    isSubmitting.value = false
  }
}

async function approveSwap(swapRequestId: number) {
  try {
    // Use a fixed manager ID for now (in production, this would come from logged-in user)
    const managerId = 1

    await axios.post(`${API_GATEWAY_URL}/api/employees/shift-swaps/approve`, {
      swapRequestId,
      managerId,
      approvalNotes: approvalNotes.value[swapRequestId] || null
    })

    toast.success('Swap request approved successfully!')
    delete approvalNotes.value[swapRequestId]

    loadAllRequests()
    loadAwaitingApproval()
  } catch (error: any) {
    console.error('Failed to approve swap:', error)
    toast.error(error.response?.data?.message || 'Failed to approve swap')
  }
}

async function cancelSwap(swapRequestId: number) {
  if (!confirm('Are you sure you want to cancel this swap request?')) return

  try {
    // Use requester ID (in production, this would come from logged-in user)
    const employeeId = selectedSwap.value.requesterId

    await axios.delete(
      `${API_GATEWAY_URL}/api/employees/shift-swaps/${swapRequestId}/cancel?employeeId=${employeeId}`
    )

    toast.success('Swap request cancelled successfully!')
    selectedSwap.value = null

    loadAllRequests()
    loadAwaitingApproval()
  } catch (error: any) {
    console.error('Failed to cancel swap:', error)
    toast.error(error.response?.data?.message || 'Failed to cancel swap')
  }
}

// Lifecycle
onMounted(() => {
  loadAllRequests()
  loadAwaitingApproval()
  loadEmployees()
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
