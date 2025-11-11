<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Employee Dashboard
        </h1>
        <div class="flex items-center space-x-3">
          <button
            @click="refresh"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Summary Cards -->
      <div v-if="dashboard" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Employees -->
        <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-400 text-sm font-medium mb-1">Total Employees</p>
              <p class="text-3xl font-bold text-blue-400">{{ dashboard.totalEmployees }}</p>
              <p class="text-xs text-blue-300 mt-1">All registered staff</p>
            </div>
            <Users class="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <!-- Active Employees -->
        <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-400 text-sm font-medium mb-1">Active</p>
              <p class="text-3xl font-bold text-green-400">{{ dashboard.activeEmployees }}</p>
              <p class="text-xs text-green-300 mt-1">Currently working</p>
            </div>
            <UserCheck class="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <!-- On Leave -->
        <div class="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-400 text-sm font-medium mb-1">On Leave</p>
              <p class="text-3xl font-bold text-yellow-400">{{ dashboard.onLeaveEmployees }}</p>
              <p class="text-xs text-yellow-300 mt-1">Away from work</p>
            </div>
            <UserX class="w-12 h-12 text-yellow-400 opacity-50" />
          </div>
        </div>

        <!-- Departments -->
        <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-400 text-sm font-medium mb-1">Departments</p>
              <p class="text-3xl font-bold text-purple-400">{{ dashboard.totalDepartments }}</p>
              <p class="text-xs text-purple-300 mt-1">Active departments</p>
            </div>
            <Briefcase class="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Recent Hires -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus class="w-5 h-5 text-green-400" />
              Recent Hires
            </h3>
            <router-link
              to="/employees/list"
              class="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </router-link>
          </div>

          <div v-if="dashboard && dashboard.recentHires && dashboard.recentHires.length > 0" class="space-y-3">
            <div
              v-for="employee in dashboard.recentHires"
              :key="employee.id"
              class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer"
              @click="viewEmployee(employee.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-white font-medium">{{ employee.fullName }}</p>
                  <p class="text-sm text-gray-400">{{ employee.positionTitle }} • {{ employee.departmentName }}</p>
                  <p class="text-xs text-gray-500 mt-1">Hired: {{ formatDate(employee.hireDate) }}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full bg-green-600 text-green-200">
                  {{ employee.status }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <UserPlus class="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p class="text-gray-400">No recent hires</p>
          </div>
        </div>

        <!-- Department Breakdown -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase class="w-5 h-5 text-purple-400" />
              By Department
            </h3>
          </div>

          <div v-if="dashboard && dashboard.employeesByDepartment" class="space-y-3">
            <div
              v-for="(count, dept) in dashboard.employeesByDepartment"
              :key="dept"
              class="flex items-center justify-between bg-gray-700 rounded-lg p-3"
            >
              <span class="text-white font-medium">{{ dept }}</span>
              <span class="px-3 py-1 rounded-full bg-purple-600 text-purple-200 font-bold">
                {{ count }}
              </span>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-gray-400">No department data</p>
          </div>
        </div>
      </div>

      <!-- Document Alerts -->
      <div v-if="dashboard && (dashboard.documentsExpiringSoon > 0 || dashboard.documentsExpired > 0)"
           class="bg-gray-800 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-400" />
            Document Alerts
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-red-900/30 border border-red-500 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-red-400 text-sm font-medium">Expired Documents</p>
                <p class="text-2xl font-bold text-red-400">{{ dashboard.documentsExpired }}</p>
              </div>
              <AlertTriangle class="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div class="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-400 text-sm font-medium">Expiring Soon</p>
                <p class="text-2xl font-bold text-yellow-400">{{ dashboard.documentsExpiringSoon }}</p>
              </div>
              <Clock class="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            to="/employees/list?action=add"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <UserPlus class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Add Employee</p>
          </router-link>
          <router-link
            to="/employees/list"
            class="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <Users class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">View All</p>
          </router-link>
          <router-link
            to="/employees/departments"
            class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <Briefcase class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Departments</p>
          </router-link>
          <router-link
            to="/employees/schedules"
            class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <Calendar class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Schedules</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  RotateCw, Users, UserCheck, UserX, Briefcase, UserPlus,
  AlertTriangle, Clock, Calendar
} from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

// State
const dashboard = ref<any>(null)
const isLoading = ref(false)

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Methods
const loadDashboard = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/dashboard`)
    dashboard.value = response.data
  } catch (error: any) {
    console.error('Failed to load dashboard:', error)
    toast.error('Failed to load employee dashboard')
  } finally {
    isLoading.value = false
  }
}

const refresh = () => {
  loadDashboard()
  toast.success('Dashboard refreshed')
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewEmployee = (id: number) => {
  router.push(`/employees/list?id=${id}`)
}

// Lifecycle
onMounted(() => {
  loadDashboard()
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
