<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Employee Analytics
          </h1>
          <p class="text-gray-400 mt-1">Performance, training, and certification insights</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="initializeSampleData"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Database class="w-5 h-5" />
            Init Sample Data
          </button>
          <button
            @click="loadAnalytics"
            class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            <RefreshCw class="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-400 mt-4">Loading analytics...</p>
        </div>

        <template v-else-if="analytics">
          <!-- Employee Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm font-medium">Total Employees</p>
                  <p class="text-white text-3xl font-bold mt-1">{{ analytics.employeeStats.totalEmployees }}</p>
                </div>
                <Users class="w-12 h-12 text-blue-200 opacity-50" />
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm font-medium">Active Employees</p>
                  <p class="text-white text-3xl font-bold mt-1">{{ analytics.employeeStats.activeEmployees }}</p>
                </div>
                <UserCheck class="w-12 h-12 text-green-200 opacity-50" />
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-purple-100 text-sm font-medium">With Reviews</p>
                  <p class="text-white text-3xl font-bold mt-1">{{ analytics.employeeStats.employeesWithReviews }}</p>
                </div>
                <Award class="w-12 h-12 text-purple-200 opacity-50" />
              </div>
            </div>

            <div class="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-yellow-100 text-sm font-medium">With Training</p>
                  <p class="text-white text-3xl font-bold mt-1">{{ analytics.employeeStats.employeesWithTraining }}</p>
                </div>
                <GraduationCap class="w-12 h-12 text-yellow-200 opacity-50" />
              </div>
            </div>

            <div class="bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-pink-100 text-sm font-medium">With Certifications</p>
                  <p class="text-white text-3xl font-bold mt-1">{{ analytics.employeeStats.employeesWithCertifications }}</p>
                </div>
                <Shield class="w-12 h-12 text-pink-200 opacity-50" />
              </div>
            </div>
          </div>

          <!-- Performance Analytics -->
          <div class="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp class="w-6 h-6 text-blue-400" />
              Performance Review Analytics
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gray-700 rounded-lg p-4">
                <p class="text-gray-400 text-sm">Total Reviews</p>
                <p class="text-white text-2xl font-bold">{{ analytics.performanceMetrics.totalReviews }}</p>
              </div>
              <div class="bg-blue-900 rounded-lg p-4">
                <p class="text-blue-200 text-sm">Draft</p>
                <p class="text-white text-2xl font-bold">{{ analytics.performanceMetrics.draftReviews }}</p>
              </div>
              <div class="bg-green-900 rounded-lg p-4">
                <p class="text-green-200 text-sm">Completed</p>
                <p class="text-white text-2xl font-bold">{{ analytics.performanceMetrics.completedReviews }}</p>
              </div>
              <div class="bg-purple-900 rounded-lg p-4">
                <p class="text-purple-200 text-sm">Average Rating</p>
                <p class="text-white text-2xl font-bold">{{ analytics.performanceMetrics.averageOverallRating.toFixed(2) }}</p>
                <div class="flex mt-1">
                  <Star v-for="i in 5" :key="i"
                    :class="i <= Math.round(analytics.performanceMetrics.averageOverallRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'"
                    class="w-4 h-4"
                  />
                </div>
              </div>
            </div>

            <!-- Average Ratings by Metric -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-white mb-3">Average Ratings by Metric</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(rating, metric) in analytics.performanceMetrics.averageRatingsByMetric" :key="metric"
                  class="bg-gray-700 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-300 text-sm">{{ metric }}</span>
                    <span class="text-white font-bold">{{ rating.toFixed(2) }}</span>
                  </div>
                  <div class="w-full bg-gray-600 rounded-full h-2">
                    <div
                      :style="{ width: (rating / 5 * 100) + '%' }"
                      class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rating Distribution -->
            <div>
              <h3 class="text-lg font-semibold text-white mb-3">Rating Distribution</h3>
              <div class="grid grid-cols-5 gap-3">
                <div v-for="(count, rating) in analytics.performanceMetrics.ratingDistribution" :key="rating"
                  class="bg-gray-700 rounded-lg p-3 text-center">
                  <div class="flex justify-center mb-2">
                    <Star v-for="i in parseInt(rating)" :key="i" class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p class="text-white text-2xl font-bold">{{ count }}</p>
                  <p class="text-gray-400 text-xs">{{ rating }} star{{ rating > 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Training Analytics -->
          <div class="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap class="w-6 h-6 text-green-400" />
              Training Analytics
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div class="bg-gray-700 rounded-lg p-4">
                <p class="text-gray-400 text-sm">Total Assignments</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.totalAssignments }}</p>
              </div>
              <div class="bg-gray-600 rounded-lg p-4">
                <p class="text-gray-300 text-sm">Not Started</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.notStarted }}</p>
              </div>
              <div class="bg-blue-900 rounded-lg p-4">
                <p class="text-blue-200 text-sm">In Progress</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.inProgress }}</p>
              </div>
              <div class="bg-green-900 rounded-lg p-4">
                <p class="text-green-200 text-sm">Completed</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.completed }}</p>
              </div>
              <div class="bg-red-900 rounded-lg p-4">
                <p class="text-red-200 text-sm">Overdue</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.overdueTraining }}</p>
              </div>
              <div class="bg-purple-900 rounded-lg p-4">
                <p class="text-purple-200 text-sm">Completion Rate</p>
                <p class="text-white text-2xl font-bold">{{ analytics.trainingMetrics.completionRate.toFixed(1) }}%</p>
              </div>
            </div>

            <!-- Completion Rate Progress Bar -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-300">Overall Completion Progress</span>
                <span class="text-white font-bold">{{ analytics.trainingMetrics.completionRate.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-4">
                <div
                  :style="{ width: analytics.trainingMetrics.completionRate + '%' }"
                  class="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>

            <!-- Training by Program -->
            <div>
              <h3 class="text-lg font-semibold text-white mb-3">Training by Program</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(count, program) in analytics.trainingMetrics.trainingByProgram" :key="program"
                  class="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <span class="text-gray-300 text-sm">{{ program }}</span>
                  <span class="text-white font-bold text-lg">{{ count }}</span>
                </div>
              </div>
            </div>

            <div v-if="analytics.trainingMetrics.averageScore > 0" class="mt-6 bg-yellow-900 rounded-lg p-4">
              <p class="text-yellow-200 text-sm">Average Training Score (Completed)</p>
              <p class="text-white text-3xl font-bold">{{ analytics.trainingMetrics.averageScore.toFixed(1) }}/100</p>
            </div>
          </div>

          <!-- Certification Analytics -->
          <div class="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield class="w-6 h-6 text-pink-400" />
              Certification Analytics
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div class="bg-gray-700 rounded-lg p-4">
                <p class="text-gray-400 text-sm">Total Certifications</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.totalCertifications }}</p>
              </div>
              <div class="bg-green-900 rounded-lg p-4">
                <p class="text-green-200 text-sm">Active</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.activeCertifications }}</p>
              </div>
              <div class="bg-yellow-900 rounded-lg p-4">
                <p class="text-yellow-200 text-sm">Expiring Soon</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.expiringSoon }}</p>
              </div>
              <div class="bg-red-900 rounded-lg p-4">
                <p class="text-red-200 text-sm">Expired</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.expiredCertifications }}</p>
              </div>
              <div class="bg-gray-600 rounded-lg p-4">
                <p class="text-gray-300 text-sm">Pending</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.pendingVerification }}</p>
              </div>
              <div class="bg-blue-900 rounded-lg p-4">
                <p class="text-blue-200 text-sm">Compliance Rate</p>
                <p class="text-white text-2xl font-bold">{{ analytics.certificationMetrics.complianceRate.toFixed(1) }}%</p>
              </div>
            </div>

            <!-- Compliance Rate Progress Bar -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-300">Certification Compliance</span>
                <span class="text-white font-bold">{{ analytics.certificationMetrics.complianceRate.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-4">
                <div
                  :style="{ width: analytics.certificationMetrics.complianceRate + '%' }"
                  :class="analytics.certificationMetrics.complianceRate >= 80 ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-yellow-500 to-red-500'"
                  class="h-4 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>

            <!-- Certifications by Type -->
            <div>
              <h3 class="text-lg font-semibold text-white mb-3">Certifications by Type</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(count, type) in analytics.certificationMetrics.certificationsByType" :key="type"
                  class="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <span class="text-gray-300 text-sm">{{ type }}</span>
                  <span class="text-white font-bold text-lg">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <BarChart3 class="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h2 class="text-xl font-bold text-white mb-2">No Analytics Data Available</h2>
          <p class="text-gray-400">Initialize sample data to see analytics in action</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, UserCheck, Award, GraduationCap, Shield, TrendingUp, RefreshCw, Database, Star, BarChart3 } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// State
const loading = ref(false)
const analytics = ref<any>(null)

// Methods
async function loadAnalytics() {
  loading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/analytics`)
    analytics.value = response.data
  } catch (error) {
    console.error('Failed to load analytics:', error)
    toast.error('Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

async function initializeSampleData() {
  if (!confirm('Initialize sample data? This will create training programs, certifications, reviews, and assignments.')) {
    return
  }

  loading.value = true
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/employees/sample-data/initialize`)
    toast.success('Sample data initialized successfully!')
    console.log('Sample data report:', response.data)

    // Reload analytics
    await loadAnalytics()
  } catch (error: any) {
    console.error('Failed to initialize sample data:', error)
    toast.error(error.response?.data?.message || 'Failed to initialize sample data')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAnalytics()
})
</script>
