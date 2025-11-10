<!--
  User Modal Component - Create and edit user interface
  Provides form for user management with role and permission configuration
-->

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ isEdit ? 'Edit User' : 'Create New User' }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Basic Information</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Employee ID
              </label>
              <input
                v-model="form.employeeId"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Email Address *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              v-model="form.phoneNumber"
              type="tel"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          <div v-if="!isEdit">
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Password *
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
        </div>

        <!-- Role and Permissions -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Role and Permissions</h3>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Role *
            </label>
            <select
              v-model="form.role"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="onRoleChange"
            >
              <option value="">Select Role</option>
              <option
                v-for="role in availableRoles"
                :key="role.value"
                :value="role.value"
                :disabled="!canAssignRole(role.value)"
              >
                {{ role.label }}
              </option>
            </select>
            <p v-if="form.role" class="text-sm text-slate-600 mt-1">
              {{ getRoleDescription(form.role) }}
            </p>
          </div>

          <!-- UI Restrictions Preview -->
          <div v-if="form.role" class="bg-slate-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-slate-700 mb-3">Role Permissions Preview</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center justify-between">
                <span>Modify Orders</span>
                <span :class="roleRestrictions.canModifyOrders ? 'text-green-600' : 'text-red-600'">
                  {{ roleRestrictions.canModifyOrders ? '✓' : '✗' }}
                </span>
              </div>
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
                <span>Max Discount</span>
                <span class="text-slate-600">{{ roleRestrictions.maxDiscountPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Store Assignment -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Store Assignment</h3>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Store
            </label>
            <select
              v-model="form.storeId"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Store</option>
              <option
                v-for="store in availableStores"
                :key="store.id"
                :value="store.id"
              >
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-slate-900">Account Status</h3>

          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label for="isActive" class="ml-2 text-sm text-slate-700">
              Account is active
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isEdit ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { UI_RESTRICTIONS, type Role } from '@/constants/permissions'
import { X } from 'lucide-vue-next'

interface Props {
  user?: any
  isEdit?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', userData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const permissions = usePermissions()

// Form data
const form = ref({
  name: '',
  email: '',
  employeeId: '',
  phoneNumber: '',
  password: '',
  role: '',
  storeId: '',
  isActive: true
})

// Available options
const availableRoles = [
  { value: 'KITCHEN', label: 'Kitchen Staff' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' }
]

const availableStores = ref([
  { id: 'store1', name: 'Main Store' },
  { id: 'store2', name: 'Downtown Branch' }
])

// Computed
const isFormValid = computed(() => {
  return form.value.name &&
         form.value.email &&
         form.value.role &&
         (!props.isEdit ? form.value.password : true)
})

const roleRestrictions = computed(() => {
  if (!form.value.role) return {}
  return UI_RESTRICTIONS[form.value.role as Role] || {}
})

// Methods
const canAssignRole = (role: string): boolean => {
  // Super Admin can assign any role
  if (permissions.isSuperAdmin) return true

  // Admin can assign roles below Admin level
  if (permissions.isAdmin && !['ADMIN', 'SUPER_ADMIN'].includes(role)) return true

  // Manager can assign Kitchen and Cashier roles
  if (permissions.isManager && ['KITCHEN', 'CASHIER'].includes(role)) return true

  return false
}

const getRoleDescription = (role: string): string => {
  const descriptions = {
    KITCHEN: 'Can view and update kitchen orders, access kitchen display',
    CASHIER: 'Can process orders, handle payments, basic order management',
    MANAGER: 'Can view analytics, manage menu, supervise operations',
    ADMIN: 'Can manage users, access system settings, full store control',
    SUPER_ADMIN: 'Full system access, can manage multiple stores and administrators'
  }
  return descriptions[role as keyof typeof descriptions] || ''
}

const onRoleChange = () => {
  // Auto-assign store if not selected
  if (!form.value.storeId && authStore.currentUser?.storeId) {
    form.value.storeId = authStore.currentUser.storeId
  }
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  const userData = {
    ...form.value,
    employeeId: form.value.employeeId || generateEmployeeId()
  }

  emit('save', userData)
}

const generateEmployeeId = (): string => {
  const prefix = 'EMP'
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}${timestamp}`
}

// Watchers
watch(() => props.user, (newUser) => {
  if (newUser && props.isEdit) {
    form.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      employeeId: newUser.employeeId || '',
      phoneNumber: newUser.phoneNumber || '',
      password: '',
      role: newUser.role || '',
      storeId: newUser.storeId || '',
      isActive: newUser.isActive !== undefined ? newUser.isActive : true
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Set default store
  if (!props.isEdit && authStore.currentUser?.storeId) {
    form.value.storeId = authStore.currentUser.storeId
  }
})
</script>
