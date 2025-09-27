<!--
  User Detail Modal Component - Display detailed user information
  Shows comprehensive user profile with permissions and activity
-->

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <div class="flex items-center space-x-4">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
            :style="{ backgroundColor: getRoleColor(user.role) }"
          >
            {{ getInitials(user.name) }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ user.name }}</h2>
            <p class="text-slate-600">{{ user.email }}</p>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
              :style="{
                backgroundColor: `${getRoleColor(user.role)}20`,
                color: getRoleColor(user.role)
              }"
            >
              {{ getRoleDisplayName(user.role) }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <PermissionGuard permission="users:update">
            <button
              @click="$emit('edit', user)"
              class="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit User"
            >
              <Edit class="w-5 h-5" />
            </button>
          </PermissionGuard>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-slate-900">Basic Information</h3>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-700">Employee ID</label>
                <p class="text-slate-900">{{ user.employeeId || user.id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Email</label>
                <p class="text-slate-900">{{ user.email }}</p>
              </div>

              <div v-if="user.phoneNumber">
                <label class="block text-sm font-medium text-slate-700">Phone</label>
                <p class="text-slate-900">{{ user.phoneNumber }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Store</label>
                <p class="text-slate-900">{{ getStoreName(user.storeId) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-medium text-slate-900">Account Status</h3>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-700">Status</label>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': user.isActive,
                    'bg-red-100 text-red-800': !user.isActive
                  }"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Member Since</label>
                <p class="text-slate-900">{{ formatDate(user.createdAt) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Last Login</label>
                <p class="text-slate-900">{{ formatDate(user.lastLoginAt) || 'Never' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Role Permissions -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Role Permissions</h3>

          <div class="bg-slate-50 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <h4 class="text-sm font-medium text-slate-700">Order Management</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center justify-between">
                    <span>Create Orders</span>
                    <span :class="hasPermission('orders:create') ? 'text-green-600' : 'text-red-600'">
                      {{ hasPermission('orders:create') ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Modify Orders</span>
                    <span :class="roleRestrictions.canModifyOrders ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canModifyOrders ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Void Orders</span>
                    <span :class="roleRestrictions.canVoidOrders ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canVoidOrders ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Refund Orders</span>
                    <span :class="roleRestrictions.canRefundOrders ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canRefundOrders ? '✓' : '✗' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="text-sm font-medium text-slate-700">System Access</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center justify-between">
                    <span>View Financials</span>
                    <span :class="roleRestrictions.canViewFinancials ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canViewFinancials ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Manage Users</span>
                    <span :class="roleRestrictions.canManageUsers ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canManageUsers ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Access Settings</span>
                    <span :class="roleRestrictions.canAccessSettings ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canAccessSettings ? '✓' : '✗' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Manage Menu</span>
                    <span :class="roleRestrictions.canManageMenu ? 'text-green-600' : 'text-red-600'">
                      {{ roleRestrictions.canManageMenu ? '✓' : '✗' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-200">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">Maximum Discount Allowed</span>
                <span class="text-slate-900 font-medium">{{ roleRestrictions.maxDiscountPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Summary -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Activity Summary</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ activityStats.ordersProcessed }}</div>
              <div class="text-sm text-blue-700">Orders Processed</div>
            </div>

            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ activityStats.hoursWorked }}</div>
              <div class="text-sm text-green-700">Hours Worked</div>
            </div>

            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ activityStats.shiftsCompleted }}</div>
              <div class="text-sm text-purple-700">Shifts Completed</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Recent Activity</h3>

          <div class="space-y-3">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="getActivityIconClass(activity.type)"
              >
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-slate-900">{{ activity.description }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 bg-slate-50 border-t border-slate-200">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors"
        >
          Close
        </button>
        <PermissionGuard permission="users:update">
          <button
            @click="$emit('edit', user)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Edit User
          </button>
        </PermissionGuard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import { getRoleColor, getRoleDisplayName, UI_RESTRICTIONS, type Role } from '@/constants/permissions'
import PermissionGuard from '@/components/PermissionGuard.vue'
import {
  X,
  Edit,
  LogIn,
  ShoppingCart,
  Clock,
  Settings
} from 'lucide-vue-next'

interface Props {
  user: any
}

interface Emits {
  (e: 'close'): void
  (e: 'edit', user: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const permissions = usePermissions()

// Computed
const roleRestrictions = computed(() => {
  return UI_RESTRICTIONS[props.user.role as Role] || {}
})

const activityStats = computed(() => ({
  ordersProcessed: Math.floor(Math.random() * 500) + 100,
  hoursWorked: Math.floor(Math.random() * 200) + 50,
  shiftsCompleted: Math.floor(Math.random() * 50) + 10
}))

const recentActivity = computed(() => [
  {
    id: 1,
    type: 'login',
    description: 'Logged into the system',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    type: 'order',
    description: 'Processed order #12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    type: 'shift',
    description: 'Started shift',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  }
])

// Methods
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStoreName = (storeId: string): string => {
  const stores = {
    'store1': 'Main Store',
    'store2': 'Downtown Branch'
  }
  return stores[storeId as keyof typeof stores] || 'Unknown Store'
}

const hasPermission = (permission: string): boolean => {
  // This would check if the user's role has this permission
  return permissions.hasPermission(permission)
}

const getActivityIcon = (type: string) => {
  const icons = {
    login: LogIn,
    order: ShoppingCart,
    shift: Clock,
    settings: Settings
  }
  return icons[type as keyof typeof icons] || Settings
}

const getActivityIconClass = (type: string): string => {
  const classes = {
    login: 'bg-green-100 text-green-600',
    order: 'bg-blue-100 text-blue-600',
    shift: 'bg-purple-100 text-purple-600',
    settings: 'bg-orange-100 text-orange-600'
  }
  return classes[type as keyof typeof classes] || 'bg-slate-100 text-slate-600'
}
</script>