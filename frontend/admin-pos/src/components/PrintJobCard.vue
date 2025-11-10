<!--
  Print job card component for receipt queue display
  Shows job status, progress, and available actions
-->

<template>
  <div class="p-4 hover:bg-gray-50 transition-colors">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Status Icon -->
        <div :class="[
          'w-10 h-10 rounded-full flex items-center justify-center',
          statusClasses
        ]">
          <component :is="statusIcon" :class="{ 'animate-spin': job.status === 'PRINTING', 'w-5 h-5': true }" />
        </div>

        <!-- Job Info -->
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <h4 class="font-medium text-gray-900">{{ getJobTypeLabel(job.type) }}</h4>
            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {{ job.type }}
            </span>
            <span v-if="job.priority > 1" class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
              Priorité {{ job.priority }}
            </span>
          </div>

          <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{{ formatTimestamp(job.createdAt) }}</span>
            <span v-if="template">{{ template.name }}</span>
            <span v-if="job.attempts > 0">Tentative {{ job.attempts }}/{{ job.maxAttempts }}</span>
          </div>

          <!-- Job Details -->
          <div class="mt-2 text-sm">
            <div v-if="job.type === 'SALE' && job.data.order" class="text-gray-700">
              Commande #{{ job.data.order.orderNumber }} - {{ formatAmount(job.data.order.total) }}
              <span v-if="job.data.order.tableNumber" class="ml-2">
                (Table {{ job.data.order.tableNumber }})
              </span>
            </div>
            <div v-else-if="job.type === 'KITCHEN' && job.data.order" class="text-gray-700">
              Cuisine - Commande #{{ job.data.order.orderNumber }}
              <span class="ml-2">({{ job.data.items?.length || 0 }} articles)</span>
            </div>
            <div v-else-if="job.type === 'REFUND'" class="text-gray-700">
              Remboursement - {{ formatAmount(job.data.refundAmount) }}
            </div>
            <div v-else class="text-gray-700">
              {{ getJobDescription(job) }}
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="job.error" class="mt-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle class="mr-1 w-4 h-4" />
            {{ job.error }}
          </div>

          <!-- Processing Progress -->
          <div v-if="job.status === 'PRINTING'" class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-1">
              <div class="bg-blue-600 h-1 rounded-full print-progress"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <!-- Status Badge -->
        <span :class="[
          'px-2 py-1 rounded-full text-xs font-medium',
          statusBadgeClasses
        ]">
          {{ getStatusLabel(job.status) }}
        </span>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-1">
          <button
            v-if="job.status === 'FAILED'"
            @click="$emit('retry', job.id)"
            class="p-1 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
            title="Réessayer"
          >
            <RotateCcw class="w-4 h-4" />
          </button>

          <button
            v-if="job.status === 'QUEUED'"
            @click="$emit('cancel', job.id)"
            class="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
            title="Annuler"
          >
            <X class="w-4 h-4" />
          </button>

          <button
            @click="$emit('view', job)"
            class="p-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
            title="Voir les détails"
          >
            <Eye class="w-4 h-4" />
          </button>

          <!-- Dropdown Menu -->
          <div class="relative">
            <button
              @click="showMenu = !showMenu"
              class="p-1 rounded text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical class="w-4 h-4" />
            </button>

            <div
              v-if="showMenu"
              class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              @click.stop
            >
              <button
                v-if="job.status === 'COMPLETED'"
                @click="handleReprint"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Printer class="mr-3 w-4 h-4" />
                Réimprimer
              </button>

              <button
                @click="handleViewData"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Code class="mr-3 w-4 h-4" />
                Voir les données
              </button>

              <button
                v-if="job.status === 'FAILED'"
                @click="handleCopyError"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Copy class="mr-3 w-4 h-4" />
                Copier l'erreur
              </button>

              <div class="border-t border-gray-100 my-1"></div>

              <button
                v-if="job.status !== 'PRINTING'"
                @click="handleDelete"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash class="mr-3 w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PrintJob, ReceiptTemplate } from '@/stores/receipts'
import { Clock, Printer, Check, AlertTriangle, X, RotateCcw, Eye, MoreVertical, Code, Copy, Trash } from 'lucide-vue-next'

// Props
interface Props {
  job: PrintJob
  template?: ReceiptTemplate
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  retry: [jobId: string]
  cancel: [jobId: string]
  view: [job: PrintJob]
}>()

// Local state
const showMenu = ref(false)

// Computed
const statusClasses = computed(() => {
  const classes = {
    'QUEUED': 'bg-gray-100 text-gray-600',
    'PRINTING': 'bg-blue-100 text-blue-600',
    'COMPLETED': 'bg-green-100 text-green-600',
    'FAILED': 'bg-red-100 text-red-600',
    'CANCELLED': 'bg-gray-100 text-gray-400'
  }
  return classes[props.job.status] || classes['QUEUED']
})

const statusBadgeClasses = computed(() => {
  const classes = {
    'QUEUED': 'bg-gray-100 text-gray-600',
    'PRINTING': 'bg-blue-100 text-blue-600',
    'COMPLETED': 'bg-green-100 text-green-600',
    'FAILED': 'bg-red-100 text-red-600',
    'CANCELLED': 'bg-gray-100 text-gray-400'
  }
  return classes[props.job.status] || classes['QUEUED']
})

const statusIcon = computed(() => {
  const icons = {
    'QUEUED': Clock,
    'PRINTING': Printer,
    'COMPLETED': Check,
    'FAILED': AlertTriangle,
    'CANCELLED': X
  }
  return icons[props.job.status] || icons['QUEUED']
})

// Methods
const getJobTypeLabel = (type: string): string => {
  const labels = {
    'SALE': 'Reçu de vente',
    'REFUND': 'Reçu de remboursement',
    'REPRINT': 'Réimpression',
    'KITCHEN': 'Commande cuisine',
    'BAR': 'Commande bar',
    'CUSTOMER_COPY': 'Copie client',
    'MERCHANT_COPY': 'Copie commerçant'
  }
  return labels[type] || type
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'QUEUED': 'En attente',
    'PRINTING': 'Impression',
    'COMPLETED': 'Terminé',
    'FAILED': 'Échec',
    'CANCELLED': 'Annulé'
  }
  return labels[status] || status
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) {
    return 'À l\'instant'
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} min`
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60)
    return `Il y a ${hours}h`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const formatAmount = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const getJobDescription = (job: PrintJob): string => {
  if (job.data.receiptNumber) {
    return `Reçu #${job.data.receiptNumber}`
  }
  if (job.data.ticketNumber) {
    return `Ticket #${job.data.ticketNumber}`
  }
  return 'Impression en cours'
}

const handleReprint = () => {
  showMenu.value = false
  emit('retry', props.job.id)
}

const handleViewData = () => {
  showMenu.value = false
  emit('view', props.job)
}

const handleCopyError = async () => {
  showMenu.value = false
  if (props.job.error) {
    try {
      await navigator.clipboard.writeText(props.job.error)
      // Show success notification
    } catch (err) {
      console.error('Failed to copy error:', err)
    }
  }
}

const handleDelete = () => {
  showMenu.value = false
  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    emit('cancel', props.job.id)
  }
}

// Close menu when clicking outside
document.addEventListener('click', () => {
  showMenu.value = false
})
</script>

<style scoped>
@keyframes printProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

.print-progress {
  animation: printProgress 3s ease-out;
}
</style>
