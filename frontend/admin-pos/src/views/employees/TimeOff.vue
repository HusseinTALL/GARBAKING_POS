<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Time Off Requests
        </h1>
        <div class="flex items-center space-x-3">
          <button
            @click="activeTab = 'pending'"
            :class="activeTab === 'pending' ? 'bg-yellow-600' : 'bg-gray-700'"
            class="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Clock class="w-4 h-4" />
            Pending ({{ pendingRequests.length }})
          </button>
          <button
            @click="activeTab = 'all'"
            :class="activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-700'"
            class="px-4 py-2 text-white rounded-lg transition-colors"
          >
            All Requests
          </button>
          <button
            @click="openCreateModal"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Request Time Off
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Pending Requests -->
      <div v-if="activeTab === 'pending'">
        <div v-if="isLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="pendingRequests.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="bg-gray-800 rounded-lg p-6 border border-yellow-500"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-white">{{ request.employeeName }}</h3>
                <p class="text-sm text-gray-400">{{ request.employeeNumber }}</p>
              </div>
              <span class="px-3 py-1 bg-yellow-600 text-yellow-200 rounded-full text-sm">
                Pending
              </span>
            </div>

            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Type:</span>
                <span class="text-white font-medium">{{ formatTimeOffType(request.timeOffType) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Dates:</span>
                <span class="text-white">{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Total Days:</span>
                <span class="text-white font-bold">{{ request.totalDays }} day(s)</span>
              </div>
              <div v-if="request.reason" class="pt-2 border-t border-gray-700">
                <p class="text-sm text-gray-400 mb-1">Reason:</p>
                <p class="text-white">{{ request.reason }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <button
                @click="reviewRequest(request, true)"
                class="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check class="w-4 h-4" />
                Approve
              </button>
              <button
                @click="reviewRequest(request, false)"
                class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X class="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-64">
          <Clock class="w-16 h-16 text-gray-600 mb-4" />
          <p class="text-xl text-gray-400 mb-2">No pending requests</p>
          <p class="text-sm text-gray-500">All time off requests have been reviewed</p>
        </div>
      </div>

      <!-- All Requests -->
      <div v-if="activeTab === 'all'">
        <div v-if="isLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="allRequests.length > 0" class="bg-gray-800 rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Days
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr v-for="request in allRequests" :key="request.id" class="hover:bg-gray-750">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p class="text-white font-medium">{{ request.employeeName }}</p>
                      <p class="text-sm text-gray-400">{{ request.employeeNumber }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-white">
                    {{ formatTimeOffType(request.timeOffType) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <p class="text-white">{{ formatDate(request.startDate) }}</p>
                    <p class="text-sm text-gray-400">to {{ formatDate(request.endDate) }}</p>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-white font-bold">
                    {{ request.totalDays }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(request.status)" class="px-2 py-1 text-xs rounded-full">
                      {{ request.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <p v-if="request.reviewerName" class="text-white text-sm">{{ request.reviewerName }}</p>
                    <p v-else class="text-gray-400 text-sm">-</p>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button
                      @click="viewDetails(request)"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-64">
          <Calendar class="w-16 h-16 text-gray-600 mb-4" />
          <p class="text-xl text-gray-400 mb-2">No time off requests</p>
          <p class="text-sm text-gray-500">Create your first time off request to get started</p>
        </div>
      </div>

      <!-- Create Request Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full">
          <div class="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Request Time Off</h2>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="createRequest" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Employee *</label>
                <select
                  v-model="createForm.employeeId"
                  required
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.fullName }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <select
                  v-model="createForm.timeOffType"
                  required
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="VACATION">Vacation</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  <option value="BEREAVEMENT">Bereavement</option>
                  <option value="JURY_DUTY">Jury Duty</option>
                  <option value="MATERNITY">Maternity</option>
                  <option value="PATERNITY">Paternity</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                  <input
                    v-model="createForm.startDate"
                    type="date"
                    required
                    :min="new Date().toISOString().split('T')[0]"
                    class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">End Date *</label>
                  <input
                    v-model="createForm.endDate"
                    type="date"
                    required
                    :min="createForm.startDate"
                    class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                <textarea
                  v-model="createForm.reason"
                  rows="3"
                  placeholder="Optional reason for time off..."
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full">
          <div class="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Time Off Details</h2>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="selectedRequest" class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">Employee</p>
                <p class="text-white font-medium">{{ selectedRequest.employeeName }}</p>
                <p class="text-sm text-gray-400">{{ selectedRequest.employeeNumber }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Status</p>
                <span :class="getStatusColor(selectedRequest.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ selectedRequest.status }}
                </span>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Type</p>
                <p class="text-white">{{ formatTimeOffType(selectedRequest.timeOffType) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Total Days</p>
                <p class="text-white font-bold">{{ selectedRequest.totalDays }} day(s)</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Start Date</p>
                <p class="text-white">{{ formatDate(selectedRequest.startDate) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">End Date</p>
                <p class="text-white">{{ formatDate(selectedRequest.endDate) }}</p>
              </div>

              <div v-if="selectedRequest.reviewerName" class="col-span-2">
                <p class="text-sm text-gray-400 mb-1">Reviewed By</p>
                <p class="text-white">{{ selectedRequest.reviewerName }}</p>
                <p class="text-sm text-gray-400">{{ formatDateTime(selectedRequest.reviewedAt) }}</p>
              </div>

              <div v-if="selectedRequest.reviewNotes" class="col-span-2">
                <p class="text-sm text-gray-400 mb-1">Review Notes</p>
                <p class="text-white">{{ selectedRequest.reviewNotes }}</p>
              </div>

              <div v-if="selectedRequest.reason" class="col-span-2">
                <p class="text-sm text-gray-400 mb-1">Reason</p>
                <p class="text-white">{{ selectedRequest.reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Clock, Plus, Check, X, Calendar } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const activeTab = ref('pending')
const employees = ref<any[]>([])
const pendingRequests = ref<any[]>([])
const allRequests = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const selectedRequest = ref<any>(null)

const createForm = ref({
  employeeId: '',
  timeOffType: '',
  startDate: '',
  endDate: '',
  reason: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Methods
const loadEmployees = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees?activeOnly=true`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  }
}

const loadPendingRequests = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/time-off/pending`)
    pendingRequests.value = response.data
  } catch (error: any) {
    console.error('Failed to load pending requests:', error)
    toast.error('Failed to load pending requests')
  } finally {
    isLoading.value = false
  }
}

const loadAllRequests = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/time-off`)
    allRequests.value = response.data
  } catch (error: any) {
    console.error('Failed to load requests:', error)
    toast.error('Failed to load time off requests')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  createForm.value = {
    employeeId: '',
    timeOffType: '',
    startDate: '',
    endDate: '',
    reason: ''
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const createRequest = async () => {
  isSaving.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/time-off`, {
      employeeId: Number(createForm.value.employeeId),
      timeOffType: createForm.value.timeOffType,
      startDate: createForm.value.startDate,
      endDate: createForm.value.endDate,
      reason: createForm.value.reason || null
    })

    toast.success('Time off request submitted successfully')
    closeCreateModal()
    loadPendingRequests()
    loadAllRequests()
  } catch (error: any) {
    console.error('Failed to create request:', error)
    toast.error(error.response?.data?.message || 'Failed to create time off request')
  } finally {
    isSaving.value = false
  }
}

const reviewRequest = async (request: any, approved: boolean) => {
  const action = approved ? 'approve' : 'reject'
  if (confirm(`Are you sure you want to ${action} this time off request?`)) {
    try {
      await axios.post(`${API_GATEWAY_URL}/api/employees/time-off/review`, {
        timeOffRequestId: request.id,
        reviewerId: 1, // TODO: Use actual logged-in manager ID
        approved: approved,
        notes: null
      })

      toast.success(`Time off request ${approved ? 'approved' : 'rejected'}`)
      loadPendingRequests()
      loadAllRequests()
    } catch (error: any) {
      console.error('Failed to review request:', error)
      toast.error('Failed to review time off request')
    }
  }
}

const viewDetails = (request: any) => {
  selectedRequest.value = request
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRequest.value = null
}

const getStatusColor = (status: string) => {
  const colors: any = {
    PENDING: 'bg-yellow-600 text-yellow-200',
    APPROVED: 'bg-green-600 text-green-200',
    REJECTED: 'bg-red-600 text-red-200',
    CANCELLED: 'bg-gray-600 text-gray-200'
  }
  return colors[status] || 'bg-gray-600 text-gray-200'
}

const formatTimeOffType = (type: string) => {
  return type.replace(/_/g, ' ')
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadEmployees()
  loadPendingRequests()
  loadAllRequests()
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
