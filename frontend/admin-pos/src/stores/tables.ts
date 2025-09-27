/**
 * Table management store for restaurant floor plan and table operations
 * Handles table status, assignments, and real-time updates
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// Types
export interface Table {
  id: string
  number: string
  name?: string
  capacity: number
  status: TableStatus
  currentOrder?: {
    id: string
    orderNumber: string
    customerName?: string
    startTime: string
    items: number
    total: number
  }
  assignedStaff?: {
    id: string
    name: string
  }
  section: string
  position: {
    x: number
    y: number
  }
  shape: 'round' | 'square' | 'rectangular'
  size: {
    width: number
    height: number
  }
  notes?: string
  reservations: Reservation[]
  lastCleaned?: string
  isActive: boolean
  createdAt: string
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  NEEDS_CLEANING = 'NEEDS_CLEANING',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export interface Reservation {
  id: string
  customerName: string
  customerPhone?: string
  partySize: number
  reservationTime: string
  duration: number
  status: 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  specialRequests?: string[]
  createdAt: string
}

export interface FloorPlan {
  id: string
  name: string
  isActive: boolean
  sections: Section[]
  lastModified: string
}

export interface Section {
  id: string
  name: string
  color: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

export const useTablesStore = defineStore('tables', () => {
  // State
  const tables = ref<Table[]>([])
  const floorPlan = ref<FloorPlan | null>(null)
  const selectedTable = ref<Table | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)

  // Computed
  const tablesByStatus = computed(() => {
    const grouped: Record<TableStatus, Table[]> = {
      [TableStatus.AVAILABLE]: [],
      [TableStatus.OCCUPIED]: [],
      [TableStatus.RESERVED]: [],
      [TableStatus.NEEDS_CLEANING]: [],
      [TableStatus.OUT_OF_ORDER]: []
    }

    tables.value.forEach(table => {
      if (grouped[table.status]) {
        grouped[table.status].push(table)
      }
    })

    return grouped
  })

  const tableStats = computed(() => ({
    total: tables.value.filter(t => t.isActive).length,
    available: tablesByStatus.value[TableStatus.AVAILABLE].length,
    occupied: tablesByStatus.value[TableStatus.OCCUPIED].length,
    reserved: tablesByStatus.value[TableStatus.RESERVED].length,
    needsCleaning: tablesByStatus.value[TableStatus.NEEDS_CLEANING].length,
    outOfOrder: tablesByStatus.value[TableStatus.OUT_OF_ORDER].length,
    occupancyRate: tables.value.filter(t => t.isActive).length > 0
      ? Math.round((tablesByStatus.value[TableStatus.OCCUPIED].length / tables.value.filter(t => t.isActive).length) * 100)
      : 0
  }))

  const sectionsWithTables = computed(() => {
    if (!floorPlan.value) return []

    return floorPlan.value.sections.map(section => ({
      ...section,
      tables: tables.value.filter(table => table.section === section.id)
    }))
  })

  const upcomingReservations = computed(() => {
    const now = new Date()
    const next4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    return tables.value
      .flatMap(table =>
        table.reservations.map(reservation => ({
          ...reservation,
          tableNumber: table.number,
          tableId: table.id
        }))
      )
      .filter(reservation => {
        const reservationTime = new Date(reservation.reservationTime)
        return reservation.status === 'CONFIRMED' &&
               reservationTime >= now &&
               reservationTime <= next4Hours
      })
      .sort((a, b) => new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime())
  })

  // Actions
  const fetchTables = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get('/api/tables')

      if (response.data.success) {
        tables.value = response.data.data.tables || []
        lastUpdate.value = new Date()
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch tables')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch tables'
      console.error('Error fetching tables:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchFloorPlan = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/floor-plans/active')

      if (response.data.success) {
        floorPlan.value = response.data.data.floorPlan
        return true
      }

      return false
    } catch (err: any) {
      console.error('Error fetching floor plan:', err)
      return false
    }
  }

  const updateTableStatus = async (tableId: string, status: TableStatus, notes?: string): Promise<boolean> => {
    try {
      const response = await axios.patch(`/api/tables/${tableId}/status`, {
        status,
        notes
      })

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].status = status
          if (notes !== undefined) {
            tables.value[tableIndex].notes = notes
          }

          // Special handling for status changes
          if (status === TableStatus.NEEDS_CLEANING) {
            tables.value[tableIndex].currentOrder = undefined
          } else if (status === TableStatus.AVAILABLE) {
            tables.value[tableIndex].lastCleaned = new Date().toISOString()
            tables.value[tableIndex].notes = undefined
          }
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to update status')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const assignOrderToTable = async (tableId: string, orderId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/tables/${tableId}/assign-order`, {
        orderId
      })

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].status = TableStatus.OCCUPIED
          tables.value[tableIndex].currentOrder = response.data.data.orderSummary
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to assign order')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const clearTable = async (tableId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/tables/${tableId}/clear`)

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].status = TableStatus.NEEDS_CLEANING
          tables.value[tableIndex].currentOrder = undefined
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to clear table')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const createReservation = async (tableId: string, reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/tables/${tableId}/reservations`, reservation)

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].reservations.push(response.data.data.reservation)

          // Check if reservation is soon and update table status
          const reservationTime = new Date(reservation.reservationTime)
          const now = new Date()
          const timeDiff = reservationTime.getTime() - now.getTime()

          if (timeDiff <= 30 * 60 * 1000 && tables.value[tableIndex].status === TableStatus.AVAILABLE) {
            tables.value[tableIndex].status = TableStatus.RESERVED
          }
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to create reservation')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const updateReservation = async (tableId: string, reservationId: string, updates: Partial<Reservation>): Promise<boolean> => {
    try {
      const response = await axios.patch(`/api/tables/${tableId}/reservations/${reservationId}`, updates)

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          const reservationIndex = tables.value[tableIndex].reservations.findIndex(r => r.id === reservationId)
          if (reservationIndex !== -1) {
            tables.value[tableIndex].reservations[reservationIndex] = {
              ...tables.value[tableIndex].reservations[reservationIndex],
              ...updates
            }
          }
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to update reservation')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const seatReservation = async (tableId: string, reservationId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`/api/tables/${tableId}/reservations/${reservationId}/seat`)

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].status = TableStatus.OCCUPIED

          const reservationIndex = tables.value[tableIndex].reservations.findIndex(r => r.id === reservationId)
          if (reservationIndex !== -1) {
            tables.value[tableIndex].reservations[reservationIndex].status = 'SEATED'
          }
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to seat reservation')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const moveTable = async (tableId: string, newPosition: { x: number; y: number }): Promise<boolean> => {
    try {
      const response = await axios.patch(`/api/tables/${tableId}/position`, {
        position: newPosition
      })

      if (response.data.success) {
        const tableIndex = tables.value.findIndex(t => t.id === tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex].position = newPosition
        }

        return true
      }

      throw new Error(response.data.error || 'Failed to move table')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const findAvailableTable = (partySize: number, sectionId?: string): Table | null => {
    const availableTables = tables.value.filter(table =>
      table.status === TableStatus.AVAILABLE &&
      table.capacity >= partySize &&
      table.isActive &&
      (!sectionId || table.section === sectionId)
    )

    if (availableTables.length === 0) return null

    // Find the best fit (smallest table that can accommodate the party)
    return availableTables.reduce((best, current) =>
      current.capacity < best.capacity ? current : best
    )
  }

  const getTableById = (tableId: string): Table | undefined => {
    return tables.value.find(t => t.id === tableId)
  }

  const getTableByNumber = (tableNumber: string): Table | undefined => {
    return tables.value.find(t => t.number === tableNumber)
  }

  const bulkUpdateStatus = async (tableIds: string[], status: TableStatus): Promise<boolean> => {
    try {
      const response = await axios.patch('/api/tables/bulk-status', {
        tableIds,
        status
      })

      if (response.data.success) {
        tableIds.forEach(tableId => {
          const tableIndex = tables.value.findIndex(t => t.id === tableId)
          if (tableIndex !== -1) {
            tables.value[tableIndex].status = status
          }
        })

        return true
      }

      throw new Error(response.data.error || 'Failed to bulk update')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const checkReservationsStatus = () => {
    const now = new Date()

    tables.value.forEach(table => {
      table.reservations.forEach(reservation => {
        if (reservation.status === 'CONFIRMED') {
          const reservationTime = new Date(reservation.reservationTime)
          const timeDiff = reservationTime.getTime() - now.getTime()

          // If reservation is within 30 minutes and table is available, mark as reserved
          if (timeDiff <= 30 * 60 * 1000 && timeDiff > 0 && table.status === TableStatus.AVAILABLE) {
            table.status = TableStatus.RESERVED
          }
          // If reservation time has passed by more than 15 minutes, mark as no-show
          else if (timeDiff < -15 * 60 * 1000) {
            reservation.status = 'NO_SHOW'
            if (table.status === TableStatus.RESERVED) {
              table.status = TableStatus.AVAILABLE
            }
          }
        }
      })
    })
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    tables,
    floorPlan,
    selectedTable,
    isLoading,
    error,
    lastUpdate,

    // Computed
    tablesByStatus,
    tableStats,
    sectionsWithTables,
    upcomingReservations,

    // Actions
    fetchTables,
    fetchFloorPlan,
    updateTableStatus,
    assignOrderToTable,
    clearTable,
    createReservation,
    updateReservation,
    seatReservation,
    moveTable,
    findAvailableTable,
    getTableById,
    getTableByNumber,
    bulkUpdateStatus,
    checkReservationsStatus,
    clearError
  }
})