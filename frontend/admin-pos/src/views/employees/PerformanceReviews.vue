<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Performance Reviews
          </h1>
          <p class="text-gray-400 mt-1">Manage employee performance evaluations</p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus class="w-5 h-5" />
          Create Review
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-3 flex flex-wrap gap-4 items-center">
      <select
        v-model="filterStatus"
        class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="COMPLETED">Completed</option>
        <option value="ACKNOWLEDGED">Acknowledged</option>
      </select>

      <select
        v-model="filterEmployee"
        class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Employees</option>
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">
          {{ emp.fullName }} ({{ emp.employeeNumber }})
        </option>
      </select>

      <button
        @click="loadReviews"
        class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
      </button>

      <div class="ml-auto text-sm text-gray-400">
        {{ filteredReviews.length }} review(s)
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-400 mt-4">Loading reviews...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredReviews.length === 0" class="text-center py-16">
          <Award class="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h2 class="text-xl font-bold text-white mb-2">No Performance Reviews Found</h2>
          <p class="text-gray-400">Create your first performance review to get started</p>
        </div>

        <!-- Reviews Table -->
        <div v-else class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-700 border-b border-gray-600">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reviewer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Review Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Period</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Overall Rating</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="review in filteredReviews" :key="review.id" class="hover:bg-gray-750 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-white">{{ review.employeeName }}</div>
                      <div class="text-sm text-gray-400">{{ review.employeeNumber }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ review.reviewerName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(review.reviewDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(review.reviewPeriodStart) }} - {{ formatDate(review.reviewPeriodEnd) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="review.overallRating" class="flex items-center gap-2">
                    <div class="flex">
                      <Star v-for="i in 5" :key="i"
                        :class="i <= Math.round(review.overallRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'"
                        class="w-4 h-4"
                      />
                    </div>
                    <span class="text-sm text-gray-300">{{ review.overallRating.toFixed(1) }}</span>
                  </div>
                  <span v-else class="text-sm text-gray-500">N/A</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(review.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ review.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="viewReview(review)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    v-if="review.status === 'DRAFT'"
                    @click="completeReview(review.id)"
                    class="text-green-400 hover:text-green-300 transition-colors"
                    title="Complete Review"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button
                    v-if="review.status === 'COMPLETED'"
                    @click="openAcknowledgeModal(review)"
                    class="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Acknowledge Review"
                  >
                    <FileCheck class="w-4 h-4" />
                  </button>
                  <button
                    v-if="review.status === 'DRAFT'"
                    @click="deleteReview(review.id)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Review Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Create Performance Review</h2>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <form @submit.prevent="createReview" class="space-y-6">
            <!-- Employee & Reviewer Selection -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Employee *</label>
                <select
                  v-model="reviewForm.employeeId"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.fullName }} ({{ emp.employeeNumber }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Reviewer *</label>
                <select
                  v-model="reviewForm.reviewerId"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reviewer</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.fullName }} ({{ emp.employeeNumber }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Review Dates -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Review Date *</label>
                <input
                  v-model="reviewForm.reviewDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Period Start *</label>
                <input
                  v-model="reviewForm.reviewPeriodStart"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Period End *</label>
                <input
                  v-model="reviewForm.reviewPeriodEnd"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Performance Ratings -->
            <div class="border-t border-gray-700 pt-4">
              <h3 class="text-lg font-semibold text-white mb-4">Performance Ratings (1-5)</h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="metric in performanceMetrics" :key="metric.key" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300">{{ metric.label }}</label>
                  <div class="flex gap-2">
                    <button
                      v-for="rating in [1, 2, 3, 4, 5]"
                      :key="rating"
                      type="button"
                      @click="reviewForm[metric.key] = rating"
                      :class="reviewForm[metric.key] >= rating ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                      class="flex-1 py-2 rounded transition-colors font-medium"
                    >
                      {{ rating }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div class="space-y-4 border-t border-gray-700 pt-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Strengths</label>
                <textarea
                  v-model="reviewForm.strengths"
                  rows="3"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What does this employee do well?"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Areas for Improvement</label>
                <textarea
                  v-model="reviewForm.areasForImprovement"
                  rows="3"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What areas need development?"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Goals</label>
                <textarea
                  v-model="reviewForm.goals"
                  rows="3"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Goals for next review period"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Reviewer Comments</label>
                <textarea
                  v-model="reviewForm.reviewerComments"
                  rows="3"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional comments"
                ></textarea>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {{ submitting ? 'Creating...' : 'Create Review' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Review Modal -->
    <div v-if="showViewModal && selectedReview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Performance Review Details</h2>
          <button @click="closeViewModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <!-- Employee Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Employee</label>
              <p class="text-white">{{ selectedReview.employeeName }} ({{ selectedReview.employeeNumber }})</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Reviewer</label>
              <p class="text-white">{{ selectedReview.reviewerName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Review Date</label>
              <p class="text-white">{{ formatDate(selectedReview.reviewDate) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Review Period</label>
              <p class="text-white">{{ formatDate(selectedReview.reviewPeriodStart) }} - {{ formatDate(selectedReview.reviewPeriodEnd) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <span :class="getStatusClass(selectedReview.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ selectedReview.status }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Overall Rating</label>
              <div v-if="selectedReview.overallRating" class="flex items-center gap-2">
                <div class="flex">
                  <Star v-for="i in 5" :key="i"
                    :class="i <= Math.round(selectedReview.overallRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'"
                    class="w-5 h-5"
                  />
                </div>
                <span class="text-white font-semibold">{{ selectedReview.overallRating.toFixed(1) }}</span>
              </div>
              <span v-else class="text-gray-500">N/A</span>
            </div>
          </div>

          <!-- Performance Ratings Grid -->
          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-white mb-4">Performance Ratings</h3>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="metric in performanceMetrics" :key="metric.key" class="bg-gray-700 rounded-lg p-3">
                <label class="block text-sm font-medium text-gray-300 mb-2">{{ metric.label }}</label>
                <div class="flex items-center gap-2">
                  <div class="flex">
                    <Star v-for="i in 5" :key="i"
                      :class="i <= (selectedReview[metric.key] || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'"
                      class="w-4 h-4"
                    />
                  </div>
                  <span class="text-white font-semibold">{{ selectedReview[metric.key] || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="space-y-4 border-t border-gray-700 pt-4">
            <div v-if="selectedReview.strengths">
              <label class="block text-sm font-medium text-gray-400 mb-1">Strengths</label>
              <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedReview.strengths }}</p>
            </div>
            <div v-if="selectedReview.areasForImprovement">
              <label class="block text-sm font-medium text-gray-400 mb-1">Areas for Improvement</label>
              <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedReview.areasForImprovement }}</p>
            </div>
            <div v-if="selectedReview.goals">
              <label class="block text-sm font-medium text-gray-400 mb-1">Goals</label>
              <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedReview.goals }}</p>
            </div>
            <div v-if="selectedReview.reviewerComments">
              <label class="block text-sm font-medium text-gray-400 mb-1">Reviewer Comments</label>
              <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedReview.reviewerComments }}</p>
            </div>
            <div v-if="selectedReview.employeeComments">
              <label class="block text-sm font-medium text-gray-400 mb-1">Employee Comments</label>
              <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedReview.employeeComments }}</p>
            </div>
          </div>

          <!-- Timestamps -->
          <div v-if="selectedReview.completedAt || selectedReview.acknowledgedAt" class="border-t border-gray-700 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div v-if="selectedReview.completedAt">
              <label class="block text-gray-400 mb-1">Completed At</label>
              <p class="text-white">{{ formatDateTime(selectedReview.completedAt) }}</p>
            </div>
            <div v-if="selectedReview.acknowledgedAt">
              <label class="block text-gray-400 mb-1">Acknowledged At</label>
              <p class="text-white">{{ formatDateTime(selectedReview.acknowledgedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acknowledge Modal -->
    <div v-if="showAcknowledgeModal && selectedReview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Acknowledge Performance Review</h2>
          <button @click="closeAcknowledgeModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <p class="text-gray-300 mb-4">
            Employee: <span class="font-semibold text-white">{{ selectedReview.employeeName }}</span>
          </p>
          <p class="text-gray-300 mb-4">
            Overall Rating: <span class="font-semibold text-white">{{ selectedReview.overallRating?.toFixed(1) || 'N/A' }}</span>
          </p>

          <form @submit.prevent="acknowledgeReview" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Employee Comments (Optional)</label>
              <textarea
                v-model="acknowledgeComments"
                rows="4"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any comments or feedback..."
              ></textarea>
            </div>

            <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="closeAcknowledgeModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {{ submitting ? 'Acknowledging...' : 'Acknowledge Review' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Award, Plus, RefreshCw, Eye, CheckCircle, FileCheck, Trash2, X, Star } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// State
const loading = ref(false)
const submitting = ref(false)
const reviews = ref<any[]>([])
const employees = ref<any[]>([])

// Filters
const filterStatus = ref('')
const filterEmployee = ref('')

// Modals
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showAcknowledgeModal = ref(false)
const selectedReview = ref<any>(null)
const acknowledgeComments = ref('')

// Performance Metrics
const performanceMetrics = [
  { key: 'qualityOfWork', label: 'Quality of Work' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'attendancePunctuality', label: 'Attendance & Punctuality' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'communication', label: 'Communication' },
  { key: 'customerService', label: 'Customer Service' },
  { key: 'initiative', label: 'Initiative' },
  { key: 'leadership', label: 'Leadership' }
]

// Review Form
const reviewForm = ref({
  employeeId: '',
  reviewerId: '',
  reviewDate: new Date().toISOString().split('T')[0],
  reviewPeriodStart: '',
  reviewPeriodEnd: '',
  qualityOfWork: null,
  productivity: null,
  attendancePunctuality: null,
  teamwork: null,
  communication: null,
  customerService: null,
  initiative: null,
  leadership: null,
  strengths: '',
  areasForImprovement: '',
  goals: '',
  reviewerComments: ''
})

// Computed
const filteredReviews = computed(() => {
  let filtered = reviews.value

  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }

  if (filterEmployee.value) {
    filtered = filtered.filter(r => r.employeeId === parseInt(filterEmployee.value))
  }

  return filtered
})

// Methods
async function loadEmployees() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees`)
    employees.value = response.data
  } catch (error) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  }
}

async function loadReviews() {
  loading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/performance-reviews/recent`)
    reviews.value = response.data
  } catch (error) {
    console.error('Failed to load reviews:', error)
    toast.error('Failed to load performance reviews')
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  resetForm()
}

function resetForm() {
  reviewForm.value = {
    employeeId: '',
    reviewerId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    qualityOfWork: null,
    productivity: null,
    attendancePunctuality: null,
    teamwork: null,
    communication: null,
    customerService: null,
    initiative: null,
    leadership: null,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    reviewerComments: ''
  }
}

async function createReview() {
  submitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/performance-reviews`, reviewForm.value)
    toast.success('Performance review created successfully')
    closeCreateModal()
    await loadReviews()
  } catch (error: any) {
    console.error('Failed to create review:', error)
    toast.error(error.response?.data?.message || 'Failed to create performance review')
  } finally {
    submitting.value = false
  }
}

async function completeReview(reviewId: number) {
  if (!confirm('Mark this review as completed? This will calculate the overall rating.')) return

  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/performance-reviews/${reviewId}/complete`)
    toast.success('Review completed successfully')
    await loadReviews()
  } catch (error) {
    console.error('Failed to complete review:', error)
    toast.error('Failed to complete review')
  }
}

function openAcknowledgeModal(review: any) {
  selectedReview.value = review
  acknowledgeComments.value = ''
  showAcknowledgeModal.value = true
}

function closeAcknowledgeModal() {
  showAcknowledgeModal.value = false
  selectedReview.value = null
  acknowledgeComments.value = ''
}

async function acknowledgeReview() {
  if (!selectedReview.value) return

  submitting.value = true
  try {
    await axios.post(
      `${API_GATEWAY_URL}/api/employees/performance-reviews/${selectedReview.value.id}/acknowledge`,
      null,
      { params: { employeeComments: acknowledgeComments.value || undefined } }
    )
    toast.success('Review acknowledged successfully')
    closeAcknowledgeModal()
    await loadReviews()
  } catch (error) {
    console.error('Failed to acknowledge review:', error)
    toast.error('Failed to acknowledge review')
  } finally {
    submitting.value = false
  }
}

function viewReview(review: any) {
  selectedReview.value = review
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  selectedReview.value = null
}

async function deleteReview(reviewId: number) {
  if (!confirm('Are you sure you want to delete this review?')) return

  try {
    await axios.delete(`${API_GATEWAY_URL}/api/employees/performance-reviews/${reviewId}`)
    toast.success('Review deleted successfully')
    await loadReviews()
  } catch (error) {
    console.error('Failed to delete review:', error)
    toast.error('Failed to delete review')
  }
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    DRAFT: 'bg-gray-600 text-gray-100',
    COMPLETED: 'bg-blue-600 text-blue-100',
    ACKNOWLEDGED: 'bg-green-600 text-green-100'
  }
  return classes[status] || 'bg-gray-600 text-gray-100'
}

function formatDate(date: string) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(dateTime: string) {
  if (!dateTime) return 'N/A'
  return new Date(dateTime).toLocaleString()
}

// Lifecycle
onMounted(() => {
  loadEmployees()
  loadReviews()
})
</script>
