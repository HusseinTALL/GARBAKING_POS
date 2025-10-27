/**
 * Users store for comprehensive user management
 * Handles CRUD, clock in/out, audit logs, performance tracking, and password management
 * Updated to use Spring Boot microservices backend via api-spring.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi, clockEntriesApi, auditLogsApi, passwordApi } from '@/services/api-spring'
import type { Role } from '@/constants/permissions'

// Types
export interface User {
  id: string
  name: string
  email: string
  employeeId: string
  phoneNumber?: string
  role: Role
  permissions: string[]
  storeId: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
  profileImage?: string
  hourlyRate?: number
  department?: string
  shiftPreferences?: ShiftPreference[]
  emergencyContact?: EmergencyContact
}

export interface ShiftPreference {
  dayOfWeek: number // 0-6
  preferredStart: string // HH:MM
  preferredEnd: string // HH:MM
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface ClockEntry {
  id: string
  userId: string
  clockInTime: string
  clockOutTime?: string
  breakDuration?: number // minutes
  location?: string
  device?: string
  notes?: string
  status: 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT'
  totalHours?: number
  overtimeHours?: number
  shiftDate: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: AuditAction
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
}

export enum AuditAction {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  CASH_DRAWER_OPENED = 'CASH_DRAWER_OPENED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED'
}

export interface PasswordResetRequest {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
}

export interface StaffPerformance {
  userId: string
  period: {
    start: string
    end: string
  }
  metrics: {
    ordersProcessed: number
    averageOrderValue: number
    totalSales: number
    refundsProcessed: number
    refundAmount: number
    hoursWorked: number
    shiftsCompleted: number
    averageTransactionTime: number // seconds
    customerSatisfaction?: number // 0-5
    accuracy: number // percentage
    tardiness: number // minutes late
    overtimeHours: number
  }
  rankings: {
    salesRank?: number
    speedRank?: number
    accuracyRank?: number
  }
  achievements: string[]
  issues: PerformanceIssue[]
}

export interface PerformanceIssue {
  id: string
  type: 'TARDINESS' | 'ACCURACY' | 'CUSTOMER_COMPLAINT' | 'POLICY_VIOLATION'
  description: string
  date: string
  resolved: boolean
  resolvedAt?: string
}

export interface CustomPermission {
  resource: string
  actions: string[] // create, read, update, delete, etc.
  conditions?: Record<string, any>
}

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const clockEntries = ref<ClockEntry[]>([])
  const auditLogs = ref<AuditLog[]>([])
  const passwordResets = ref<PasswordResetRequest[]>([])
  const staffPerformance = ref<Map<string, StaffPerformance>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeUsers = computed(() =>
    users.value.filter(user => user.isActive)
  )

  const clockedInUsers = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const activeClock = clockEntries.value.filter(entry =>
      entry.shiftDate === today && entry.status === 'CLOCKED_IN'
    )
    return activeClock.map(entry => {
      const user = users.value.find(u => u.id === entry.userId)
      return { ...entry, user }
    })
  })

  const usersByRole = computed(() => {
    const grouped: Record<string, User[]> = {}
    users.value.forEach(user => {
      if (!grouped[user.role]) {
        grouped[user.role] = []
      }
      grouped[user.role].push(user)
    })
    return grouped
  })

  const recentAudits = computed(() =>
    auditLogs.value.slice(0, 100)
  )

  // Actions - User CRUD
  const fetchUsers = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const data = await usersApi.getAllUsers()
      users.value = Array.isArray(data) ? data : (data.users || [])
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Failed to fetch users:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: Partial<User>): Promise<User | null> => {
    try {
      const newUser = await usersApi.createUser(userData)

      if (newUser) {
        users.value.push(newUser)

        // Log audit
        await logAudit({
          action: AuditAction.USER_CREATED,
          resource: 'users',
          resourceId: newUser.id,
          details: { userName: newUser.name, role: newUser.role },
          severity: 'INFO'
        })

        return newUser
      }

      throw new Error('Failed to create user')
    } catch (err: any) {
      console.error('Failed to create user:', err)
      throw err
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    try {
      const updatedUser = await usersApi.updateUser(userId, updates)

      if (updatedUser) {
        const index = users.value.findIndex(u => u.id === userId)
        if (index !== -1) {
          users.value[index] = updatedUser
        }

        // Log audit
        await logAudit({
          action: AuditAction.USER_UPDATED,
          resource: 'users',
          resourceId: userId,
          details: updates,
          severity: 'INFO'
        })

        // Log role change if role was updated
        if (updates.role) {
          await logAudit({
            action: AuditAction.ROLE_CHANGED,
            resource: 'users',
            resourceId: userId,
            details: { newRole: updates.role },
            severity: 'WARNING'
          })
        }

        return updatedUser
      }

      throw new Error('Failed to update user')
    } catch (err: any) {
      console.error('Failed to update user:', err)
      throw err
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const user = users.value.find(u => u.id === userId)
      await usersApi.deleteUser(userId)

      users.value = users.value.filter(u => u.id !== userId)

      // Log audit
      await logAudit({
        action: AuditAction.USER_DELETED,
        resource: 'users',
        resourceId: userId,
        details: { userName: user?.name },
        severity: 'WARNING'
      })

      return true
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      throw err
    }
  }

  // Clock In/Out Management
  const clockIn = async (userId: string, location?: string): Promise<ClockEntry | null> => {
    try {
      const clockEntry = await clockEntriesApi.clockIn(userId, location)

      if (clockEntry) {
        clockEntries.value.unshift(clockEntry)

        // Log audit
        await logAudit({
          action: AuditAction.CLOCK_IN,
          resource: 'time-tracking',
          resourceId: clockEntry.id,
          details: { location },
          severity: 'INFO'
        })

        return clockEntry
      }

      throw new Error('Failed to clock in')
    } catch (err: any) {
      console.error('Failed to clock in:', err)
      throw err
    }
  }

  const clockOut = async (clockEntryId: string, notes?: string): Promise<ClockEntry | null> => {
    try {
      const updatedEntry = await clockEntriesApi.clockOut(clockEntryId, notes)

      if (updatedEntry) {
        const index = clockEntries.value.findIndex(e => e.id === clockEntryId)
        if (index !== -1) {
          clockEntries.value[index] = updatedEntry
        }

        // Log audit
        await logAudit({
          action: AuditAction.CLOCK_OUT,
          resource: 'time-tracking',
          resourceId: clockEntryId,
          details: { totalHours: updatedEntry.totalHours, notes },
          severity: 'INFO'
        })

        return updatedEntry
      }

      throw new Error('Failed to clock out')
    } catch (err: any) {
      console.error('Failed to clock out:', err)
      throw err
    }
  }

  const startBreak = async (clockEntryId: string): Promise<boolean> => {
    try {
      const entry = clockEntries.value.find(e => e.id === clockEntryId)
      if (entry) {
        entry.status = 'ON_BREAK'

        await logAudit({
          action: AuditAction.BREAK_START,
          resource: 'time-tracking',
          resourceId: clockEntryId,
          severity: 'INFO'
        })
      }
      return true
    } catch (err: any) {
      console.error('Failed to start break:', err)
      return false
    }
  }

  const endBreak = async (clockEntryId: string): Promise<boolean> => {
    try {
      const entry = clockEntries.value.find(e => e.id === clockEntryId)
      if (entry) {
        entry.status = 'CLOCKED_IN'

        await logAudit({
          action: AuditAction.BREAK_END,
          resource: 'time-tracking',
          resourceId: clockEntryId,
          severity: 'INFO'
        })
      }
      return true
    } catch (err: any) {
      console.error('Failed to end break:', err)
      return false
    }
  }

  const fetchClockEntries = async (userId?: string, startDate?: string, endDate?: string): Promise<boolean> => {
    try {
      const params: any = {}
      if (userId) params.userId = userId
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const entries = await clockEntriesApi.getEntries(params)
      clockEntries.value = Array.isArray(entries) ? entries : (entries.entries || [])
      return true
    } catch (err: any) {
      console.error('Failed to fetch clock entries:', err)
      return false
    }
  }

  // Audit Logs
  const logAudit = async (log: Omit<AuditLog, 'id' | 'userId' | 'userName' | 'timestamp'>): Promise<void> => {
    try {
      // Get current user from auth store (assuming it exists)
      const currentUser = { id: 'current-user', name: 'Current User' } // TODO: Get from auth store

      const auditEntry: AuditLog = {
        id: generateId(),
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        ...log
      }

      auditLogs.value.unshift(auditEntry)

      // Send to backend
      await auditLogsApi.create(auditEntry)
    } catch (err) {
      console.error('Failed to log audit:', err)
    }
  }

  const fetchAuditLogs = async (filters?: {
    userId?: string
    action?: AuditAction
    resource?: string
    startDate?: string
    endDate?: string
    severity?: string
  }): Promise<boolean> => {
    try {
      const data = await auditLogsApi.getLogs(filters)
      auditLogs.value = data.logs || []
      return true
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err)
      return false
    }
  }

  // Password Management
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const data = await passwordApi.requestReset(email)

      const resetRequest = data.resetRequest
      passwordResets.value.push(resetRequest)

      // Log audit
      await logAudit({
        action: AuditAction.PASSWORD_RESET_REQUESTED,
        resource: 'users',
        details: { email },
        severity: 'WARNING'
      })

      return true
    } catch (err: any) {
      console.error('Failed to request password reset:', err)
      throw err
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const data = await passwordApi.completeReset(token, newPassword)

      // Mark reset as used
      const reset = passwordResets.value.find(r => r.token === token)
      if (reset) {
        reset.used = true
      }

      // Log audit
      await logAudit({
        action: AuditAction.PASSWORD_RESET_COMPLETED,
        resource: 'users',
        severity: 'WARNING'
      })

      return true
    } catch (err: any) {
      console.error('Failed to reset password:', err)
      throw err
    }
  }

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const data = await passwordApi.changePassword(userId, currentPassword, newPassword)

      // Log audit
      await logAudit({
        action: AuditAction.PASSWORD_CHANGED,
        resource: 'users',
        resourceId: userId,
        severity: 'WARNING'
      })

      return true
    } catch (err: any) {
      console.error('Failed to change password:', err)
      throw err
    }
  }

  const sendPasswordResetEmail = async (userId: string): Promise<boolean> => {
    try {
      const user = users.value.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      return await requestPasswordReset(user.email)
    } catch (err: any) {
      console.error('Failed to send password reset email:', err)
      throw err
    }
  }

  // Performance Tracking
  const fetchStaffPerformance = async (userId: string, startDate: string, endDate: string): Promise<StaffPerformance | null> => {
    try {
      const data = await usersApi.getPerformance(userId, { startDate, endDate })

      const performance = data.performance
      staffPerformance.value.set(userId, performance)
      return performance
    } catch (err: any) {
      console.error('Failed to fetch staff performance:', err)
      return null
    }
  }

  const fetchAllStaffPerformance = async (startDate: string, endDate: string): Promise<boolean> => {
    try {
      const data = await usersApi.getAllPerformance({ startDate, endDate })

      const performances = data.performances || []
      performances.forEach((perf: StaffPerformance) => {
        staffPerformance.value.set(perf.userId, perf)
      })
      return true
    } catch (err: any) {
      console.error('Failed to fetch all staff performance:', err)
      return false
    }
  }

  const getPerformance = (userId: string): StaffPerformance | undefined => {
    return staffPerformance.value.get(userId)
  }

  // Permission Management
  const updateUserPermissions = async (userId: string, permissions: string[]): Promise<boolean> => {
    try {
      const data = await usersApi.updatePermissions(userId, permissions)

      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.permissions = permissions
      }

      // Log audit
      await logAudit({
        action: AuditAction.PERMISSION_CHANGED,
        resource: 'users',
        resourceId: userId,
        details: { permissions },
        severity: 'WARNING'
      })

      return true
    } catch (err: any) {
      console.error('Failed to update permissions:', err)
      throw err
    }
  }

  const addCustomPermission = async (userId: string, permission: CustomPermission): Promise<boolean> => {
    try {
      const user = users.value.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      const permissionString = `${permission.resource}:${permission.actions.join(',')}`
      if (!user.permissions.includes(permissionString)) {
        user.permissions.push(permissionString)
        await updateUserPermissions(userId, user.permissions)
      }

      return true
    } catch (err: any) {
      console.error('Failed to add custom permission:', err)
      return false
    }
  }

  const removeCustomPermission = async (userId: string, permissionString: string): Promise<boolean> => {
    try {
      const user = users.value.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      user.permissions = user.permissions.filter(p => p !== permissionString)
      await updateUserPermissions(userId, user.permissions)

      return true
    } catch (err: any) {
      console.error('Failed to remove custom permission:', err)
      return false
    }
  }

  // Helper functions
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const getUserById = (userId: string): User | undefined => {
    return users.value.find(u => u.id === userId)
  }

  const getCurrentClockEntry = (userId: string): ClockEntry | undefined => {
    const today = new Date().toISOString().split('T')[0]
    return clockEntries.value.find(entry =>
      entry.userId === userId &&
      entry.shiftDate === today &&
      entry.status !== 'CLOCKED_OUT'
    )
  }

  const isUserClockedIn = (userId: string): boolean => {
    return !!getCurrentClockEntry(userId)
  }

  const getTotalHoursWorked = (userId: string, startDate: string, endDate: string): number => {
    const userEntries = clockEntries.value.filter(entry =>
      entry.userId === userId &&
      entry.shiftDate >= startDate &&
      entry.shiftDate <= endDate &&
      entry.totalHours
    )

    return userEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0)
  }

  return {
    // State
    users,
    clockEntries,
    auditLogs,
    passwordResets,
    staffPerformance,
    isLoading,
    error,

    // Computed
    activeUsers,
    clockedInUsers,
    usersByRole,
    recentAudits,

    // Actions - User CRUD
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,

    // Clock In/Out
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    fetchClockEntries,

    // Audit Logs
    logAudit,
    fetchAuditLogs,

    // Password Management
    requestPasswordReset,
    resetPassword,
    changePassword,
    sendPasswordResetEmail,

    // Performance
    fetchStaffPerformance,
    fetchAllStaffPerformance,
    getPerformance,

    // Permissions
    updateUserPermissions,
    addCustomPermission,
    removeCustomPermission,

    // Helpers
    getUserById,
    getCurrentClockEntry,
    isUserClockedIn,
    getTotalHoursWorked
  }
})
