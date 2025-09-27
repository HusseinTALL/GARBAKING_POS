<!--
  Receipt management interface for POS system
  Manages print queue, templates, and printer settings
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gestion des Reçus
          </h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              printerStatus.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ printerStatus.connected ? 'Imprimante connectée' : 'Imprimante déconnectée' }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Print Queue Actions -->
          <button
            v-if="queuedJobs.length > 0"
            @click="processQueue"
            :disabled="isProcessingQueue"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Play class="w-4 h-4 mr-2 inline-block" :class="{ 'animate-spin': isProcessingQueue }" />
            Traiter la file
          </button>

          <button
            v-if="failedJobs.length > 0"
            @click="retryFailedJobs"
            class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <RotateCcw class="w-4 h-4 mr-2 inline-block" />
            Réessayer
          </button>

          <!-- Settings -->
          <button
            @click="showSettings = true"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-blue-400">{{ queuedJobs.length }}</div>
          <div class="text-sm text-gray-400">En attente</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-green-400">{{ completedJobsToday }}</div>
          <div class="text-sm text-gray-400">Imprimés aujourd'hui</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-red-400">{{ failedJobs.length }}</div>
          <div class="text-sm text-gray-400">Échecs</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-indigo-400">{{ templates.length }}</div>
          <div class="text-sm text-gray-400">Modèles</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-gray-400">{{ printerStatus.totalPrints }}</div>
          <div class="text-sm text-gray-400">Total imprimé</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Print Queue Panel -->
      <div class="flex-1 flex flex-col bg-gray-900">
        <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-100">File d'impression</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="refreshQueue"
                :disabled="isProcessingQueue"
                class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isProcessingQueue }" />
              </button>

              <select
                v-model="queueFilter"
                class="border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tous</option>
                <option value="queued">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminés</option>
                <option value="failed">Échecs</option>
              </select>

              <button
                v-if="printQueue.length > 0"
                @click="clearQueue"
                class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-300"
              >
                Vider la file
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <!-- Print Queue List -->
          <div v-if="filteredQueue.length === 0" class="flex items-center justify-center h-64">
            <div class="text-center">
              <Printer class="w-16 h-16 text-gray-500 mb-4 mx-auto" />
              <h3 class="text-lg font-semibold text-gray-300 mb-2">Aucune tâche d'impression</h3>
              <p class="text-gray-500">Les tâches d'impression apparaîtront ici</p>
            </div>
          </div>

          <div v-else class="divide-y divide-gray-700">
            <PrintJobCard
              v-for="job in filteredQueue"
              :key="job.id"
              :job="job"
              :template="getTemplate(job.templateId)"
              @retry="retryJob"
              @cancel="cancelJob"
              @view="viewJobDetails"
              class="hover:bg-gray-800 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Templates & Settings Panel -->
      <div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <!-- Printer Status -->
        <div class="flex-none p-6 border-b border-gray-700">
          <h4 class="font-medium text-gray-100 mb-3">État de l'imprimante</h4>

          <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-300">Connexion</span>
              <div :class="[
                'w-3 h-3 rounded-full',
                printerStatus.connected ? 'bg-green-400' : 'bg-red-400'
              ]"></div>
            </div>

            <div v-if="printerStatus.connected" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Modèle:</span>
                <span class="text-gray-100">{{ printerStatus.model || 'Inconnu' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Papier:</span>
                <span :class="{
                  'text-green-400': printerStatus.paperStatus === 'OK',
                  'text-yellow-400': printerStatus.paperStatus === 'LOW',
                  'text-red-400': printerStatus.paperStatus === 'EMPTY'
                }">
                  {{ getPaperStatusLabel(printerStatus.paperStatus) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Température:</span>
                <span :class="{
                  'text-green-400': printerStatus.temperature === 'OK',
                  'text-red-400': printerStatus.temperature === 'HIGH'
                }">
                  {{ printerStatus.temperature === 'OK' ? 'Normale' : 'Élevée' }}
                </span>
              </div>
            </div>

            <button
              @click="checkPrinterStatus"
              class="w-full mt-3 bg-gray-700 text-gray-100 px-3 py-2 rounded text-sm font-medium hover:bg-gray-600 transition-all duration-300"
            >
              <RefreshCw class="w-4 h-4 mr-2 inline-block" />
              Vérifier le statut
            </button>
          </div>
        </div>

        <!-- Receipt Templates -->
        <div class="flex-1 overflow-auto p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium text-gray-100">Modèles de reçus</h4>
            <button
              @click="showTemplateEditor = true"
              class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300"
            >
              <Plus class="w-4 h-4 mr-1 inline-block" />
              Nouveau
            </button>
          </div>

          <div class="space-y-3">
            <ReceiptTemplateCard
              v-for="template in templates"
              :key="template.id"
              :template="template"
              @edit="editTemplate"
              @duplicate="duplicateTemplate"
              @test="testTemplate"
              @delete="deleteTemplate"
              class="hover:bg-gray-700 transition-all duration-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <PrintJobDetailsModal
    v-if="selectedJob"
    :job="selectedJob"
    :template="getTemplate(selectedJob.templateId)"
    @close="selectedJob = null"
    @retry="retryJob"
    @reprint="reprintJob"
    class="bg-gray-800 text-gray-100"
  />

  <ReceiptTemplateEditor
    v-if="showTemplateEditor"
    :template="editingTemplate"
    @close="showTemplateEditor = false"
    @save="saveTemplate"
    class="bg-gray-800 text-gray-100"
  />

  <PrintSettingsModal
    v-if="showSettings"
    :settings="settings"
    @close="showSettings = false"
    @update="updateSettings"
    class="bg-gray-800 text-gray-100"
  />

  <TestPrintModal
    v-if="showTestPrint"
    :template="testingTemplate"
    @close="showTestPrint = false"
    @print="performTestPrint"
    class="bg-gray-800 text-gray-100"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReceiptsStore, ReceiptType, type PrintJob, type ReceiptTemplate } from '@/stores/receipts'
import { storeToRefs } from 'pinia'
import {
  Play,
  RotateCcw,
  Settings,
  RotateCw,
  Printer,
  RefreshCw,
  Plus
} from 'lucide-vue-next'

// Store
const receiptsStore = useReceiptsStore()

// Destructure store state
const {
  templates,
  printQueue,
  printerStatus,
  settings,
  isProcessingQueue,
  queuedJobs,
  failedJobs,
  completedJobsToday
} = storeToRefs(receiptsStore)

// Local state
const queueFilter = ref('all')
const selectedJob = ref<PrintJob | null>(null)
const editingTemplate = ref<ReceiptTemplate | null>(null)
const testingTemplate = ref<ReceiptTemplate | null>(null)
const showTemplateEditor = ref(false)
const showSettings = ref(false)
const showTestPrint = ref(false)

// Computed
const filteredQueue = computed(() => {
  let filtered = printQueue.value

  switch (queueFilter.value) {
    case 'queued':
      filtered = filtered.filter(job => job.status === 'QUEUED')
      break
    case 'processing':
      filtered = filtered.filter(job => job.status === 'PRINTING')
      break
    case 'completed':
      filtered = filtered.filter(job => job.status === 'COMPLETED')
      break
    case 'failed':
      filtered = filtered.filter(job => job.status === 'FAILED')
      break
  }

  return filtered.slice(0, 100) // Limit for performance
})

// Methods
const getTemplate = (templateId: string): ReceiptTemplate | undefined => {
  return templates.value.find(t => t.id === templateId)
}

const getPaperStatusLabel = (status: string): string => {
  const labels = {
    'OK': 'Suffisant',
    'LOW': 'Faible',
    'EMPTY': 'Vide'
  }
  return labels[status] || status
}

const processQueue = async () => {
  await receiptsStore.processQueue()
}

const retryFailedJobs = async () => {
  await receiptsStore.retryFailedJobs()
}

const retryJob = async (jobId: string) => {
  const job = printQueue.value.find(j => j.id === jobId)
  if (job) {
    job.status = 'QUEUED'
    job.attempts = 0
    job.error = undefined

    if (printerStatus.value.connected) {
      await processQueue()
    }
  }
}

const cancelJob = async (jobId: string) => {
  await receiptsStore.cancelJob(jobId)
}

const clearQueue = () => {
  if (confirm('Êtes-vous sûr de vouloir vider la file d\'impression ?')) {
    receiptsStore.clearQueue()
  }
}

const refreshQueue = async () => {
  await receiptsStore.checkPrinterStatus()
}

const viewJobDetails = (job: PrintJob) => {
  selectedJob.value = job
}

const editTemplate = (template: ReceiptTemplate) => {
  editingTemplate.value = template
  showTemplateEditor.value = true
}

const duplicateTemplate = async (template: ReceiptTemplate) => {
  const duplicated = {
    ...template,
    id: '',
    name: `${template.name} (Copie)`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  editingTemplate.value = duplicated
  showTemplateEditor.value = true
}

const testTemplate = (template: ReceiptTemplate) => {
  testingTemplate.value = template
  showTestPrint.value = true
}

const deleteTemplate = async (templateId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
    console.log('Delete template:', templateId)
  }
}

const saveTemplate = async (template: ReceiptTemplate) => {
  console.log('Save template:', template)
  showTemplateEditor.value = false
  editingTemplate.value = null
}

const updateSettings = (newSettings: any) => {
  Object.assign(settings.value, newSettings)
  localStorage.setItem('pos-receipt-settings', JSON.stringify(settings.value))
}

const checkPrinterStatus = async () => {
  await receiptsStore.checkPrinterStatus()
}

const reprintJob = async (jobId: string) => {
  await receiptsStore.reprintReceipt(jobId)
  selectedJob.value = null
}

const performTestPrint = async (sampleData: any) => {
  if (testingTemplate.value) {
    await receiptsStore.printReceipt(
      ReceiptType.SALE,
      sampleData,
      testingTemplate.value.id,
      { immediate: true }
    )
  }
  showTestPrint.value = false
}

// Lifecycle
onMounted(async () => {
  const savedSettings = localStorage.getItem('pos-receipt-settings')
  if (savedSettings) {
    Object.assign(settings.value, JSON.parse(savedSettings))
  }

  await Promise.all([
    receiptsStore.fetchTemplates(),
    receiptsStore.checkPrinterStatus()
  ])
})
</script>

<style scoped>
/* Custom animations for print status updates */
@keyframes printProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

.print-progress {
  animation: printProgress 2s ease-out;
}

/* Queue item animations */
.queue-item-enter-active,
.queue-item-leave-active {
  transition: all 0.3s ease;
}

.queue-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.queue-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

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

/* Responsive adjustments */
@media (max-width: 768px) {
  .w-80 {
    @apply w-full max-w-[300px];
  }
}

/* Hover effects */
.print-job-card,
.receipt-template-card {
  transition: all 0.3s ease;
}

.print-job-card:hover,
.receipt-template-card:hover {
  transform: translateY(-2px);
}

/* Select styling */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A1A1AA'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
}
</style>