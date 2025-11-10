<!--
  Audit Logs Panel Component - Activity tracking and monitoring
  Displays comprehensive audit trail of user actions
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-slate-200">
      <div class="flex items-center space-x-3">
        <Shield class="w-6 h-6 text-blue-600" />
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Activity Audit Log</h2>
          <p class="text-sm text-slate-600">Track all user actions and system changes</p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="refreshLogs"
          :disabled="isLoading"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
        </button>

        <button
          @click="showFilters = !showFilters"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Filters"
        >
          <Filter class="w-5 h-5" />
        </button>

        <button
          @click="exportLogs"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Export"
        >
          <Download class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="p-6 bg-slate-50 border-b border-slate-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">User</label>
          <select
            v-model="filters.userId"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Action</label>
          <select
            v-model="filters.action"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option v-for="action in actionTypes" :key="action" :value="action">
              {{ formatActionName(action) }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Severity</label>
          <select
            v-model="filters.severity"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Resource</label>
          <select
            v-model="filters.resource"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Resources</option>
            <option value="users">Users</option>
            <option value="orders">Orders</option>
            <option value="time-tracking">Time Tracking</option>
            <option value="settings">Settings</option>
            <option value="cash">Cash Management</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">End Date</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div class="flex items-center justify-end space-x-3 mt-4">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors"
        >
          Clear Filters
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
      <div class="text-center">
        <div class="text-2xl font-bold text-slate-900">{{ stats.total }}</div>
        <div class="text-xs text-slate-600">Total Events</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.info }}</div>
        <div class="text-xs text-slate-600">Info</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.warning }}</div>
        <div class="text-xs text-slate-600">Warnings</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-red-600">{{ stats.critical }}</div>
        <div class="text-xs text-slate-600">Critical</div>
      </div>
    </div>

    <!-- Logs List -->
    <div class="overflow-auto" style="max-height: 600px">
      <div v-if="filteredLogs.length === 0" class="text-center py-12">
        <AlertCircle class="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-slate-900 mb-2">No audit logs found</h3>
        <p class="text-slate-600">
          {{ hasFilters ? 'Try adjusting your filters' : 'Activity will appear here as it happens' }}
        </p>
      </div>

      <div v-else class="divide-y divide-slate-200">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="selectedLog = log"
        >
          <div class="flex items-start space-x-3">
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getSeverityClass(log.severity)"
            >
              <component :is="getActionIcon(log.action)" class="w-5 h-5" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm font-medium text-slate-900">
                  {{ formatActionName(log.action) }}
                </h4>
                <span class="text-xs text-slate-500">
                  {{ formatTimestamp(log.timestamp) }}
                </span>
              </div>

              <p class="text-sm text-slate-600 mb-2">
                <span class="font-medium">{{ log.userName }}</span>
                {{ getActionDescription(log) }}
              </p>

              <div class="flex items-center space-x-4 text-xs text-slate-500">
                <span class="flex items-center space-x-1">
                  <Tag class="w-3 h-3" />
                  <span>{{ log.resource }}</span>
                </span>
                <span
                  class="px-2 py-0.5 rounded-full"
                  :class="getSeverityBadgeClass(log.severity)"
                >
                  {{ log.severity }}
                </span>
                <span v-if="log.ipAddress" class="flex items-center space-x-1">
                  <MapPin class="w-3 h-3" />
                  <span>{{ log.ipAddress }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Detail Modal -->
    <div v-if="selectedLog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedLog = null">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-900">Audit Log Details</h3>
            <button
              @click="selectedLog = null"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X class="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">User</label>
                <p class="text-sm text-slate-900">{{ selectedLog.userName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Action</label>
                <p class="text-sm text-slate-900">{{ formatActionName(selectedLog.action) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Resource</label>
                <p class="text-sm text-slate-900">{{ selectedLog.resource }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="getSeverityBadgeClass(selectedLog.severity)"
                >
                  {{ selectedLog.severity }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Timestamp</label>
                <p class="text-sm text-slate-900">{{ formatFullTimestamp(selectedLog.timestamp) }}</p>
              </div>
              <div v-if="selectedLog.ipAddress">
                <label class="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                <p class="text-sm text-slate-900">{{ selectedLog.ipAddress }}</p>
              </div>
            </div>

            <div v-if="selectedLog.details">
              <label class="block text-sm font-medium text-slate-700 mb-2">Details</label>
              <pre class="bg-slate-50 rounded-lg p-4 text-xs text-slate-900 overflow-auto">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
            </div>

            <div v-if="selectedLog.userAgent">
              <label class="block text-sm font-medium text-slate-700 mb-1">User Agent</label>
              <p class="text-xs text-slate-600">{{ selectedLog.userAgent }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore, AuditAction, type AuditLog } from '@/stores/users'
import {
  Shield,
  RefreshCw,
  Filter,
  Download,
  AlertCircle,
  X,
  Tag,
  MapPin,
  LogIn,
  LogOut,
  User,
  Settings,
  ShoppingCart,
  Clock,
  DollarSign,
  Key,
  Info
} from 'lucide-vue-next'

const usersStore = useUsersStore()

// State
const isLoading = ref(false)
const showFilters = ref(false)
const selectedLog = ref<AuditLog | null>(null)
const filters = ref({
  userId: '',
  action: '',
  resource: '',
  severity: '',
  startDate: '',
  endDate: ''
})

// Computed
const actionTypes = computed(() => {
  return Object.values(AuditAction)
})

const filteredLogs = computed(() => {
  return usersStore.recentAudits
})

const stats = computed(() => {
  const logs = usersStore.auditLogs
  return {
    total: logs.length,
    info: logs.filter(l => l.severity === 'INFO').length,
    warning: logs.filter(l => l.severity === 'WARNING').length,
    critical: logs.filter(l => l.severity === 'ERROR' || l.severity === 'CRITICAL').length
  }
})

const hasFilters = computed(() => {
  return Object.values(filters.value).some(v => v !== '')
})

// Methods
const refreshLogs = async () => {
  isLoading.value = true
  try {
    await usersStore.fetchAuditLogs()
  } finally {
    isLoading.value = false
  }
}

const applyFilters = async () => {
  isLoading.value = true
  try {
    await usersStore.fetchAuditLogs(filters.value)
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    userId: '',
    action: '',
    resource: '',
    severity: '',
    startDate: '',
    endDate: ''
  }
  refreshLogs()
}

const exportLogs = () => {
  const csv = convertToCSV(filteredLogs.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const convertToCSV = (logs: AuditLog[]): string => {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'IP Address', 'Details']
  const rows = logs.map(log => [
    log.timestamp,
    log.userName,
    formatActionName(log.action),
    log.resource,
    log.severity,
    log.ipAddress || '',
    JSON.stringify(log.details || {})
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
}

const formatActionName = (action: string): string => {
  return action.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getActionDescription = (log: AuditLog): string => {
  const descriptions: Record<string, string> = {
    [AuditAction.USER_LOGIN]: 'logged into the system',
    [AuditAction.USER_LOGOUT]: 'logged out of the system',
    [AuditAction.USER_CREATED]: `created a new user`,
    [AuditAction.USER_UPDATED]: `updated user information`,
    [AuditAction.USER_DELETED]: `deleted a user`,
    [AuditAction.PASSWORD_CHANGED]: 'changed their password',
    [AuditAction.PASSWORD_RESET_REQUESTED]: 'requested a password reset',
    [AuditAction.PASSWORD_RESET_COMPLETED]: 'completed password reset',
    [AuditAction.ROLE_CHANGED]: 'changed user role',
    [AuditAction.PERMISSION_CHANGED]: 'modified user permissions',
    [AuditAction.CLOCK_IN]: 'clocked in',
    [AuditAction.CLOCK_OUT]: 'clocked out',
    [AuditAction.BREAK_START]: 'started a break',
    [AuditAction.BREAK_END]: 'ended a break',
    [AuditAction.ORDER_CREATED]: 'created an order',
    [AuditAction.ORDER_UPDATED]: 'updated an order',
    [AuditAction.ORDER_CANCELLED]: 'cancelled an order',
    [AuditAction.REFUND_PROCESSED]: 'processed a refund',
    [AuditAction.CASH_DRAWER_OPENED]: 'opened the cash drawer',
    [AuditAction.SETTINGS_CHANGED]: 'modified system settings'
  }

  return descriptions[log.action] || 'performed an action'
}

const getActionIcon = (action: string) => {
  const icons: Record<string, any> = {
    [AuditAction.USER_LOGIN]: LogIn,
    [AuditAction.USER_LOGOUT]: LogOut,
    [AuditAction.USER_CREATED]: User,
    [AuditAction.USER_UPDATED]: User,
    [AuditAction.USER_DELETED]: User,
    [AuditAction.PASSWORD_CHANGED]: Key,
    [AuditAction.PASSWORD_RESET_REQUESTED]: Key,
    [AuditAction.PASSWORD_RESET_COMPLETED]: Key,
    [AuditAction.ROLE_CHANGED]: Settings,
    [AuditAction.PERMISSION_CHANGED]: Settings,
    [AuditAction.CLOCK_IN]: Clock,
    [AuditAction.CLOCK_OUT]: Clock,
    [AuditAction.BREAK_START]: Clock,
    [AuditAction.BREAK_END]: Clock,
    [AuditAction.ORDER_CREATED]: ShoppingCart,
    [AuditAction.ORDER_UPDATED]: ShoppingCart,
    [AuditAction.ORDER_CANCELLED]: ShoppingCart,
    [AuditAction.REFUND_PROCESSED]: DollarSign,
    [AuditAction.CASH_DRAWER_OPENED]: DollarSign,
    [AuditAction.SETTINGS_CHANGED]: Settings
  }

  return icons[action] || Info
}

const getSeverityClass = (severity: string): string => {
  const classes: Record<string, string> = {
    INFO: 'bg-blue-100 text-blue-600',
    WARNING: 'bg-yellow-100 text-yellow-600',
    ERROR: 'bg-red-100 text-red-600',
    CRITICAL: 'bg-red-200 text-red-700'
  }

  return classes[severity] || 'bg-slate-100 text-slate-600'
}

const getSeverityBadgeClass = (severity: string): string => {
  const classes: Record<string, string> = {
    INFO: 'bg-blue-100 text-blue-700',
    WARNING: 'bg-yellow-100 text-yellow-700',
    ERROR: 'bg-red-100 text-red-700',
    CRITICAL: 'bg-red-200 text-red-800'
  }

  return classes[severity] || 'bg-slate-100 text-slate-700'
}

const formatTimestamp = (timestamp: string): string => {
  const now = new Date()
  const logTime = new Date(timestamp)
  const diff = now.getTime() - logTime.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return logTime.toLocaleDateString()
}

const formatFullTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  refreshLogs()
})
</script>
