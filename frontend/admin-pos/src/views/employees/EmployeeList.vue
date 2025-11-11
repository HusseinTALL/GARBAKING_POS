<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Employees
        </h1>
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search employees..."
              class="w-64 px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <select
            v-model="filterStatus"
            @change="loadEmployees"
            class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus class="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Employee Grid -->
      <div v-else-if="filteredEmployees.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="employee in filteredEmployees"
          :key="employee.id"
          class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
          @click="viewEmployee(employee)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {{ getInitials(employee.fullName) }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ employee.fullName }}</h3>
                <p class="text-sm text-gray-400">{{ employee.employeeNumber }}</p>
              </div>
            </div>
            <span :class="getStatusColor(employee.status)" class="px-2 py-1 text-xs rounded-full">
              {{ employee.status }}
            </span>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center text-gray-300">
              <Briefcase class="w-4 h-4 mr-2 text-purple-400" />
              {{ employee.positionTitle }}
            </div>
            <div class="flex items-center text-gray-300">
              <Building2 class="w-4 h-4 mr-2 text-blue-400" />
              {{ employee.departmentName }}
            </div>
            <div v-if="employee.email" class="flex items-center text-gray-300">
              <Mail class="w-4 h-4 mr-2 text-green-400" />
              {{ employee.email }}
            </div>
            <div v-if="employee.phone" class="flex items-center text-gray-300">
              <Phone class="w-4 h-4 mr-2 text-yellow-400" />
              {{ employee.phone }}
            </div>
            <div class="flex items-center text-gray-300">
              <Calendar class="w-4 h-4 mr-2 text-indigo-400" />
              Hired: {{ formatDate(employee.hireDate) }}
            </div>
            <div v-if="employee.yearsOfService" class="flex items-center text-gray-300">
              <Award class="w-4 h-4 mr-2 text-orange-400" />
              {{ employee.yearsOfService }} year(s) of service
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
            <button
              @click.stop="openEditModal(employee)"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
            >
              <Edit2 class="w-3 h-3" />
              Edit
            </button>
            <button
              v-if="employee.status !== 'TERMINATED'"
              @click.stop="confirmDelete(employee)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
            >
              <Trash2 class="w-3 h-3" />
              Terminate
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-64">
        <Users class="w-16 h-16 text-gray-600 mb-4" />
        <p class="text-xl text-gray-400 mb-2">No employees found</p>
        <p class="text-sm text-gray-500">Add your first employee to get started</p>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">
            {{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveEmployee" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Personal Information -->
            <div class="md:col-span-2">
              <h3 class="text-lg font-bold text-white mb-4">Personal Information</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
              <input
                v-model="formData.firstName"
                type="text"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
              <input
                v-model="formData.lastName"
                type="text"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
              <input
                v-model="formData.dateOfBirth"
                type="date"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Employment Information -->
            <div class="md:col-span-2 mt-4">
              <h3 class="text-lg font-bold text-white mb-4">Employment Information</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Position *</label>
              <select
                v-model="formData.positionId"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                <option v-for="position in positions" :key="position.id" :value="position.id">
                  {{ position.title }} ({{ position.departmentName }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Hire Date *</label>
              <input
                v-model="formData.hireDate"
                type="date"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Status *</label>
              <select
                v-model="formData.status"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            <!-- Compensation -->
            <div class="md:col-span-2 mt-4">
              <h3 class="text-lg font-bold text-white mb-4">Compensation</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Pay Type *</label>
              <select
                v-model="formData.payType"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HOURLY">Hourly</option>
                <option value="SALARY">Salary</option>
                <option value="COMMISSION">Commission</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Pay Rate</label>
              <input
                v-model="formData.payRate"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Address -->
            <div class="md:col-span-2 mt-4">
              <h3 class="text-lg font-bold text-white mb-4">Address</h3>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
              <input
                v-model="formData.address"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">City</label>
              <input
                v-model="formData.city"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">State</label>
              <input
                v-model="formData.state"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Postal Code</label>
              <input
                v-model="formData.postalCode"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Emergency Contact -->
            <div class="md:col-span-2 mt-4">
              <h3 class="text-lg font-bold text-white mb-4">Emergency Contact</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Contact Name</label>
              <input
                v-model="formData.emergencyContactName"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
              <input
                v-model="formData.emergencyContactPhone"
                type="tel"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Relationship</label>
              <input
                v-model="formData.emergencyContactRelationship"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Notes -->
            <div class="md:col-span-2 mt-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Saving...' : 'Save Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Search, Plus, Users, Briefcase, Building2, Mail, Phone, Calendar,
  Award, Edit2, Trash2, X
} from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const employees = ref<any[]>([])
const positions = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const editingEmployee = ref<any>(null)
const searchQuery = ref('')
const filterStatus = ref('')

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'USA',
  positionId: '',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
  payType: 'HOURLY',
  payRate: null,
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  notes: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Computed
const filteredEmployees = computed(() => {
  let filtered = employees.value

  if (filterStatus.value) {
    filtered = filtered.filter(e => e.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e =>
      e.fullName.toLowerCase().includes(query) ||
      e.employeeNumber.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query) ||
      e.phone?.includes(query)
    )
  }

  return filtered
})

// Methods
const loadEmployees = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  } finally {
    isLoading.value = false
  }
}

const loadPositions = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/positions?activeOnly=true`)
    positions.value = response.data
  } catch (error: any) {
    console.error('Failed to load positions:', error)
    toast.error('Failed to load positions')
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const openAddModal = () => {
  editingEmployee.value = null
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    positionId: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    payType: 'HOURLY',
    payRate: null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  }
  showModal.value = true
}

const openEditModal = (employee: any) => {
  editingEmployee.value = employee
  formData.value = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email || '',
    phone: employee.phone || '',
    dateOfBirth: employee.dateOfBirth || '',
    address: employee.address || '',
    city: employee.city || '',
    state: employee.state || '',
    postalCode: employee.postalCode || '',
    country: employee.country || 'USA',
    positionId: employee.positionId,
    hireDate: employee.hireDate,
    status: employee.status,
    payType: employee.payType,
    payRate: employee.payRate,
    emergencyContactName: employee.emergencyContactName || '',
    emergencyContactPhone: employee.emergencyContactPhone || '',
    emergencyContactRelationship: employee.emergencyContactRelationship || '',
    notes: employee.notes || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEmployee.value = null
}

const saveEmployee = async () => {
  isSaving.value = true
  try {
    if (editingEmployee.value) {
      await axios.put(`${API_GATEWAY_URL}/api/employees/${editingEmployee.value.id}`, formData.value)
      toast.success('Employee updated successfully')
    } else {
      await axios.post(`${API_GATEWAY_URL}/api/employees`, formData.value)
      toast.success('Employee created successfully')
    }
    closeModal()
    loadEmployees()
  } catch (error: any) {
    console.error('Failed to save employee:', error)
    toast.error(error.response?.data?.message || 'Failed to save employee')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (employee: any) => {
  if (confirm(`Are you sure you want to terminate ${employee.fullName}?`)) {
    try {
      await axios.delete(`${API_GATEWAY_URL}/api/employees/${employee.id}`)
      toast.success('Employee terminated successfully')
      loadEmployees()
    } catch (error: any) {
      console.error('Failed to terminate employee:', error)
      toast.error('Failed to terminate employee')
    }
  }
}

const viewEmployee = (employee: any) => {
  openEditModal(employee)
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getStatusColor = (status: string) => {
  const colors: any = {
    ACTIVE: 'bg-green-600 text-green-200',
    ON_LEAVE: 'bg-yellow-600 text-yellow-200',
    SUSPENDED: 'bg-orange-600 text-orange-200',
    TERMINATED: 'bg-red-600 text-red-200',
    RETIRED: 'bg-gray-600 text-gray-200'
  }
  return colors[status] || 'bg-gray-600 text-gray-200'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadEmployees()
  loadPositions()
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
