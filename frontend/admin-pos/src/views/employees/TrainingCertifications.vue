<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Training & Certifications
          </h1>
          <p class="text-gray-400 mt-1">Manage employee training programs and certifications</p>
        </div>
        <button
          @click="openAssignModal"
          v-if="activeTab === 'training'"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus class="w-5 h-5" />
          Assign Training
        </button>
        <button
          @click="openAddCertModal"
          v-if="activeTab === 'certifications'"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus class="w-5 h-5" />
          Add Certification
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6">
      <div class="flex gap-4">
        <button
          @click="activeTab = 'training'"
          :class="activeTab === 'training' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'"
          class="px-4 py-3 border-b-2 font-medium transition-colors"
        >
          <div class="flex items-center gap-2">
            <GraduationCap class="w-5 h-5" />
            Training Programs
          </div>
        </button>
        <button
          @click="activeTab = 'certifications'"
          :class="activeTab === 'certifications' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-gray-300'"
          class="px-4 py-3 border-b-2 font-medium transition-colors"
        >
          <div class="flex items-center gap-2">
            <Award class="w-5 h-5" />
            Certifications
          </div>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-3 flex flex-wrap gap-4 items-center">
      <select
        v-if="activeTab === 'training'"
        v-model="trainingFilter"
        class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="NOT_STARTED">Not Started</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <select
        v-if="activeTab === 'certifications'"
        v-model="certificationFilter"
        class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="EXPIRING_SOON">Expiring Soon</option>
        <option value="EXPIRED">Expired</option>
        <option value="PENDING">Pending Verification</option>
      </select>

      <select
        v-model="employeeFilter"
        class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Employees</option>
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">
          {{ emp.fullName }} ({{ emp.employeeNumber }})
        </option>
      </select>

      <button
        @click="loadData"
        class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
      </button>

      <button
        v-if="activeTab === 'certifications'"
        @click="updateCertificationStatuses"
        class="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
      >
        Update Statuses
      </button>

      <div class="ml-auto text-sm text-gray-400">
        {{ filteredItems.length }} item(s)
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="text-gray-400 mt-4">Loading data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-16">
          <component :is="activeTab === 'training' ? GraduationCap : Award" class="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h2 class="text-xl font-bold text-white mb-2">
            No {{ activeTab === 'training' ? 'Training Assignments' : 'Certifications' }} Found
          </h2>
          <p class="text-gray-400">
            {{ activeTab === 'training' ? 'Assign training to employees' : 'Add certifications for employees' }} to get started
          </p>
        </div>

        <!-- Training Table -->
        <div v-else-if="activeTab === 'training'" class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-700 border-b border-gray-600">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Program</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="training in filteredItems" :key="training.id" class="hover:bg-gray-750 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ training.employeeName }}</div>
                  <div class="text-sm text-gray-400">{{ training.employeeNumber }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-white">{{ training.trainingProgramTitle }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ training.durationHours }}h
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTrainingStatusClass(training.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ training.status }}
                  </span>
                  <div v-if="training.isOverdue" class="text-xs text-red-400 mt-1">OVERDUE</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(training.dueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="training.completionDate" class="text-green-400">
                    ✓ Completed {{ formatDate(training.completionDate) }}
                  </div>
                  <div v-else-if="training.startDate" class="text-blue-400">
                    Started {{ formatDate(training.startDate) }}
                  </div>
                  <div v-else class="text-gray-500">Not started</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    v-if="training.status === 'NOT_STARTED' || training.status === 'IN_PROGRESS'"
                    @click="completeTraining(training)"
                    class="text-green-400 hover:text-green-300 transition-colors"
                    title="Complete Training"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Certifications Table -->
        <div v-else class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-700 border-b border-gray-600">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Certification</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Issue Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expiration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="cert in filteredItems" :key="cert.id" class="hover:bg-gray-750 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ cert.employeeName }}</div>
                  <div class="text-sm text-gray-400">{{ cert.employeeNumber }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-white">{{ cert.certificationTypeName }}</div>
                  <div class="text-xs text-gray-400">{{ cert.issuingOrganization }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ cert.certificationNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(cert.issueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-300">{{ formatDate(cert.expirationDate) }}</div>
                  <div v-if="cert.daysUntilExpiration !== null" class="text-xs" :class="cert.daysUntilExpiration < 30 ? 'text-red-400' : 'text-gray-500'">
                    {{ cert.daysUntilExpiration }} days left
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getCertStatusClass(cert.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ cert.status }}
                  </span>
                  <div v-if="cert.verifiedAt" class="text-xs text-green-400 mt-1">
                    ✓ Verified
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    v-if="cert.status === 'PENDING'"
                    @click="verifyCertification(cert.id)"
                    class="text-green-400 hover:text-green-300 transition-colors"
                    title="Verify Certification"
                  >
                    <Shield class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewCertDetails(cert)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assign Training Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Assign Training Program</h2>
          <button @click="closeAssignModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="assignTraining" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Employee *</label>
              <select
                v-model="assignForm.employeeId"
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
              <label class="block text-sm font-medium text-gray-300 mb-2">Training Program *</label>
              <select
                v-model="assignForm.programId"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Program</option>
                <option v-for="program in trainingPrograms" :key="program.id" :value="program.id">
                  {{ program.title }} ({{ program.durationHours }}h)
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Due Date *</label>
              <input
                v-model="assignForm.dueDate"
                type="date"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="closeAssignModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {{ submitting ? 'Assigning...' : 'Assign Training' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Complete Training Modal -->
    <div v-if="showCompleteModal && selectedTraining" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Complete Training</h2>
          <button @click="closeCompleteModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <p class="text-gray-300 mb-4">
            Employee: <span class="font-semibold text-white">{{ selectedTraining.employeeName }}</span>
          </p>
          <p class="text-gray-300 mb-4">
            Program: <span class="font-semibold text-white">{{ selectedTraining.trainingProgramTitle }}</span>
          </p>

          <form @submit.prevent="submitCompleteTraining" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Score (Optional)</label>
              <input
                v-model.number="completeForm.score"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter score (0-100)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Certificate URL (Optional)</label>
              <input
                v-model="completeForm.certificateUrl"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="closeCompleteModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {{ submitting ? 'Completing...' : 'Complete Training' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Certification Modal -->
    <div v-if="showAddCertModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Add Certification</h2>
          <button @click="closeAddCertModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="addCertification" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Employee *</label>
              <select
                v-model="certForm.employeeId"
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
              <label class="block text-sm font-medium text-gray-300 mb-2">Certification Type *</label>
              <select
                v-model="certForm.certificationTypeId"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option v-for="type in certificationTypes" :key="type.id" :value="type.id">
                  {{ type.name }} - {{ type.issuingOrganization }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Certification Number *</label>
              <input
                v-model="certForm.certificationNumber"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter certification number"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Issue Date *</label>
                <input
                  v-model="certForm.issueDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Expiration Date</label>
                <input
                  v-model="certForm.expirationDate"
                  type="date"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="closeAddCertModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {{ submitting ? 'Adding...' : 'Add Certification' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Certification Details Modal -->
    <div v-if="showCertDetailsModal && selectedCert" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Certification Details</h2>
          <button @click="closeCertDetailsModal" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Employee</label>
              <p class="text-white">{{ selectedCert.employeeName }} ({{ selectedCert.employeeNumber }})</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Certification Type</label>
              <p class="text-white">{{ selectedCert.certificationTypeName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Issuing Organization</label>
              <p class="text-white">{{ selectedCert.issuingOrganization }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Certification Number</label>
              <p class="text-white">{{ selectedCert.certificationNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Issue Date</label>
              <p class="text-white">{{ formatDate(selectedCert.issueDate) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Expiration Date</label>
              <p class="text-white">{{ formatDate(selectedCert.expirationDate) }}</p>
              <p v-if="selectedCert.daysUntilExpiration !== null" class="text-sm mt-1" :class="selectedCert.daysUntilExpiration < 30 ? 'text-red-400' : 'text-gray-400'">
                {{ selectedCert.daysUntilExpiration }} days remaining
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <span :class="getCertStatusClass(selectedCert.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ selectedCert.status }}
              </span>
            </div>
            <div v-if="selectedCert.verifiedByName">
              <label class="block text-sm font-medium text-gray-400 mb-1">Verified By</label>
              <p class="text-white">{{ selectedCert.verifiedByName }}</p>
              <p class="text-sm text-gray-400 mt-1">{{ formatDateTime(selectedCert.verifiedAt) }}</p>
            </div>
          </div>

          <div v-if="selectedCert.notes" class="pt-4 border-t border-gray-700">
            <label class="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <p class="text-white bg-gray-700 rounded-lg p-3">{{ selectedCert.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GraduationCap, Award, Plus, RefreshCw, CheckCircle, Shield, Eye, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// State
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('training')
const trainings = ref<any[]>([])
const certifications = ref<any[]>([])
const employees = ref<any[]>([])
const trainingPrograms = ref<any[]>([])
const certificationTypes = ref<any[]>([])

// Filters
const trainingFilter = ref('')
const certificationFilter = ref('')
const employeeFilter = ref('')

// Modals
const showAssignModal = ref(false)
const showCompleteModal = ref(false)
const showAddCertModal = ref(false)
const showCertDetailsModal = ref(false)
const selectedTraining = ref<any>(null)
const selectedCert = ref<any>(null)

// Forms
const assignForm = ref({
  employeeId: '',
  programId: '',
  dueDate: ''
})

const completeForm = ref({
  score: null as number | null,
  certificateUrl: ''
})

const certForm = ref({
  employeeId: '',
  certificationTypeId: '',
  certificationNumber: '',
  issueDate: '',
  expirationDate: ''
})

// Computed
const filteredItems = computed(() => {
  if (activeTab.value === 'training') {
    let filtered = trainings.value

    if (trainingFilter.value) {
      filtered = filtered.filter(t => t.status === trainingFilter.value)
    }

    if (employeeFilter.value) {
      filtered = filtered.filter(t => t.employeeId === parseInt(employeeFilter.value))
    }

    return filtered
  } else {
    let filtered = certifications.value

    if (certificationFilter.value) {
      filtered = filtered.filter(c => c.status === certificationFilter.value)
    }

    if (employeeFilter.value) {
      filtered = filtered.filter(c => c.employeeId === parseInt(employeeFilter.value))
    }

    return filtered
  }
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

async function loadTrainingPrograms() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/training/programs`)
    trainingPrograms.value = response.data
  } catch (error) {
    console.error('Failed to load training programs:', error)
    toast.error('Failed to load training programs')
  }
}

async function loadCertificationTypes() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/training/certifications/types`)
    certificationTypes.value = response.data
  } catch (error) {
    console.error('Failed to load certification types:', error)
    toast.error('Failed to load certification types')
  }
}

async function loadTrainings() {
  loading.value = true
  try {
    // Load all employee trainings
    const promises = employees.value.map(emp =>
      axios.get(`${API_GATEWAY_URL}/api/employees/training/employee/${emp.id}`)
        .then(res => res.data)
        .catch(() => [])
    )
    const results = await Promise.all(promises)
    trainings.value = results.flat()
  } catch (error) {
    console.error('Failed to load trainings:', error)
    toast.error('Failed to load trainings')
  } finally {
    loading.value = false
  }
}

async function loadCertifications() {
  loading.value = true
  try {
    // Load all employee certifications
    const promises = employees.value.map(emp =>
      axios.get(`${API_GATEWAY_URL}/api/employees/training/certifications/employee/${emp.id}`)
        .then(res => res.data)
        .catch(() => [])
    )
    const results = await Promise.all(promises)
    certifications.value = results.flat()
  } catch (error) {
    console.error('Failed to load certifications:', error)
    toast.error('Failed to load certifications')
  } finally {
    loading.value = false
  }
}

async function loadData() {
  if (activeTab.value === 'training') {
    await loadTrainings()
  } else {
    await loadCertifications()
  }
}

function openAssignModal() {
  assignForm.value = {
    employeeId: '',
    programId: '',
    dueDate: ''
  }
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
}

async function assignTraining() {
  submitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/training/assign`, null, {
      params: assignForm.value
    })
    toast.success('Training assigned successfully')
    closeAssignModal()
    await loadTrainings()
  } catch (error: any) {
    console.error('Failed to assign training:', error)
    toast.error(error.response?.data?.message || 'Failed to assign training')
  } finally {
    submitting.value = false
  }
}

function completeTraining(training: any) {
  selectedTraining.value = training
  completeForm.value = {
    score: null,
    certificateUrl: ''
  }
  showCompleteModal.value = true
}

function closeCompleteModal() {
  showCompleteModal.value = false
  selectedTraining.value = null
}

async function submitCompleteTraining() {
  if (!selectedTraining.value) return

  submitting.value = true
  try {
    await axios.post(
      `${API_GATEWAY_URL}/api/employees/training/${selectedTraining.value.id}/complete`,
      null,
      {
        params: {
          score: completeForm.value.score || undefined,
          certificateUrl: completeForm.value.certificateUrl || undefined
        }
      }
    )
    toast.success('Training completed successfully')
    closeCompleteModal()
    await loadTrainings()
  } catch (error) {
    console.error('Failed to complete training:', error)
    toast.error('Failed to complete training')
  } finally {
    submitting.value = false
  }
}

function openAddCertModal() {
  certForm.value = {
    employeeId: '',
    certificationTypeId: '',
    certificationNumber: '',
    issueDate: '',
    expirationDate: ''
  }
  showAddCertModal.value = true
}

function closeAddCertModal() {
  showAddCertModal.value = false
}

async function addCertification() {
  submitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/training/certifications`, null, {
      params: {
        employeeId: certForm.value.employeeId,
        certificationTypeId: certForm.value.certificationTypeId,
        certificationNumber: certForm.value.certificationNumber,
        issueDate: certForm.value.issueDate,
        expirationDate: certForm.value.expirationDate || undefined
      }
    })
    toast.success('Certification added successfully')
    closeAddCertModal()
    await loadCertifications()
  } catch (error: any) {
    console.error('Failed to add certification:', error)
    toast.error(error.response?.data?.message || 'Failed to add certification')
  } finally {
    submitting.value = false
  }
}

async function verifyCertification(certId: number) {
  if (!confirm('Verify this certification?')) return

  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/training/certifications/${certId}/verify`, null, {
      params: { verifierId: 1 } // TODO: Use actual logged-in user ID
    })
    toast.success('Certification verified successfully')
    await loadCertifications()
  } catch (error) {
    console.error('Failed to verify certification:', error)
    toast.error('Failed to verify certification')
  }
}

async function updateCertificationStatuses() {
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/training/certifications/update-statuses`)
    toast.success('Certification statuses updated successfully')
    await loadCertifications()
  } catch (error) {
    console.error('Failed to update statuses:', error)
    toast.error('Failed to update certification statuses')
  }
}

function viewCertDetails(cert: any) {
  selectedCert.value = cert
  showCertDetailsModal.value = true
}

function closeCertDetailsModal() {
  showCertDetailsModal.value = false
  selectedCert.value = null
}

function getTrainingStatusClass(status: string) {
  const classes: Record<string, string> = {
    NOT_STARTED: 'bg-gray-600 text-gray-100',
    IN_PROGRESS: 'bg-blue-600 text-blue-100',
    COMPLETED: 'bg-green-600 text-green-100'
  }
  return classes[status] || 'bg-gray-600 text-gray-100'
}

function getCertStatusClass(status: string) {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-green-600 text-green-100',
    EXPIRING_SOON: 'bg-yellow-600 text-yellow-100',
    EXPIRED: 'bg-red-600 text-red-100',
    PENDING: 'bg-gray-600 text-gray-100'
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
onMounted(async () => {
  await loadEmployees()
  await loadTrainingPrograms()
  await loadCertificationTypes()
  await loadTrainings()
  await loadCertifications()
})
</script>
