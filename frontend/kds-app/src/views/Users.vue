<!--
  User Management View - Admin interface for managing staff and roles
  Provides CRUD operations for users with role-based permissions
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">User Management</h1>
        <p class="text-slate-600 mt-2">Manage staff accounts, roles, and permissions</p>
      </div>

      <PermissionGuard permission="users:create">
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <UserPlus class="w-5 h-5" />
          <span>Add User</span>
        </button>
      </PermissionGuard>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Search Users</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, email, or employee ID..."
              class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Role</label>
          <select
            v-model="selectedRole"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left py-3 px-6 font-medium text-slate-700">User</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Role</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Status</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Last Login</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50">
              <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :style="{ backgroundColor: getRoleColor(user.role) }"
                  >
                    {{ getInitials(user.name) }}
                  </div>
                  <div>
                    <div class="font-medium text-slate-900">{{ user.name }}</div>
                    <div class="text-sm text-slate-500">{{ user.email }}</div>
                    <div class="text-xs text-slate-400">ID: {{ user.employeeId || user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="{
                    backgroundColor: `${getRoleColor(user.role)}20`,
                    color: getRoleColor(user.role)
                  }"
                >
                  {{ getRoleDisplayName(user.role) }}
                </span>
              </td>
              <td class="py-4 px-6">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': user.isActive,
                    'bg-red-100 text-red-800': !user.isActive
                  }"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-slate-600">
                {{ formatDate(user.lastLoginAt) }}
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                  <PermissionGuard permission="users:read">
                    <button
                      @click="viewUser(user)"
                      class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission="users:update">
                    <button
                      @click="editUser(user)"
                      class="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit User"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission="users:reset_password">
                    <button
                      @click="resetPassword(user)"
                      class="p-2 text-slate-400 hover:text-yellow-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Reset Password"
                    >
                      <Key class="w-4 h-4" />
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission="users:delete">
                    <button
                      @click="confirmDelete(user)"
                      class="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Delete User"
                      :disabled="user.id === authStore.currentUser?.id"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </PermissionGuard>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="text-center py-12">
        <Users class="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-slate-900 mb-2">No users found</h3>
        <p class="text-slate-600">
          {{ searchQuery || selectedRole || selectedStatus ? 'Try adjusting your filters' : 'Get started by adding your first user' }}
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-slate-600">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalUsers) }} of {{ totalUsers }} users
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="px-3 py-2 text-sm font-medium">{{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>

  <!-- Create/Edit User Modal -->
  <UserModal
    v-if="showCreateModal || showEditModal"
    :user="selectedUser"
    :is-edit="showEditModal"
    @close="closeModal"
    @save="handleUserSave"
  />

  <!-- User Detail Modal -->
  <UserDetailModal
    v-if="showDetailModal"
    :user="selectedUser"
    @close="showDetailModal = false"
    @edit="editUser"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getRoleColor, getRoleDisplayName } from '@/constants/permissions'
import PermissionGuard from '@/components/PermissionGuard.vue'
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  Key,
  Trash2
} from 'lucide-vue-next'

// Lazy load modals
const UserModal = defineAsyncComponent(() => import('@/components/UserModal.vue'))
const UserDetailModal = defineAsyncComponent(() => import('@/components/UserDetailModal.vue'))

interface User {
  id: string
  name: string
  email: string
  employeeId?: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  permissions: string[]
  storeId: string
}

// State
const authStore = useAuthStore()

const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Filters
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const selectedUser = ref<User | null>(null)

// Available roles for filtering
const availableRoles = [
  { value: 'KITCHEN', label: 'Kitchen Staff' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.employeeId?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Status filter
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active'
    filtered = filtered.filter(user => user.isActive === isActive)
  }

  return filtered
})

const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value))

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

const viewUser = (user: User) => {
  selectedUser.value = user
  showDetailModal.value = true
}

const editUser = (user: User) => {
  selectedUser.value = user
  showEditModal.value = true
}

const resetPassword = async (user: User) => {
  if (!confirm(`Reset password for ${user.name}?`)) return

  try {
    // Implementation would call API to reset password
    console.log('Reset password for:', user.email)
    alert('Password reset email sent!')
  } catch (err) {
    console.error('Failed to reset password:', err)
    alert('Failed to reset password')
  }
}

const confirmDelete = async (user: User) => {
  if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return

  try {
    // Implementation would call API to delete user
    console.log('Delete user:', user.id)
    users.value = users.value.filter(u => u.id !== user.id)
    alert('User deleted successfully!')
  } catch (err) {
    console.error('Failed to delete user:', err)
    alert('Failed to delete user')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserSave = (userData: any) => {
  if (showEditModal.value && selectedUser.value) {
    // Update existing user
    const index = users.value.findIndex(u => u.id === selectedUser.value!.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userData }
    }
  } else {
    // Add new user
    users.value.push({
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    })
  }
  closeModal()
}

const loadUsers = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Mock data for now - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    users.value = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@garbaking.com',
        employeeId: 'EMP001',
        role: 'MANAGER',
        isActive: true,
        lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
        permissions: [],
        storeId: 'store1'
      },
      {
        id: '2',
        name: 'Sarah Connor',
        email: 'sarah.connor@garbaking.com',
        employeeId: 'EMP002',
        role: 'CASHIER',
        isActive: true,
        lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
        permissions: [],
        storeId: 'store1'
      },
      {
        id: '3',
        name: 'Mike Kitchen',
        email: 'mike.kitchen@garbaking.com',
        employeeId: 'EMP003',
        role: 'KITCHEN',
        isActive: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        permissions: [],
        storeId: 'store1'
      }
    ]
  } catch (err) {
    error.value = 'Failed to load users'
    console.error('Failed to load users:', err)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>
