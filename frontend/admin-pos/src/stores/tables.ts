import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { parseIsoDateTime } from '@/utils/datetime'
import {
  tablesApi,
  type DiningTableDto,
  type FloorSectionDto,
  type ReservationDto,
  type ReservationRequestDto
} from '@/services/api-spring'

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  DIRTY = 'DIRTY'
}

export enum ReservationStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Table {
  id: number
  label: string
  capacity: number
  status: TableStatus
  sectionId: number
  sectionName: string
}

export interface Reservation {
  id: number
  tableId: number
  customerName: string
  contact: string
  startTime: string
  endTime: string
  partySize: number
  status: ReservationStatus
}

export type CreateReservationPayload = ReservationRequestDto

const toTable = (section: FloorSectionDto, table: DiningTableDto): Table => ({
  id: table.id,
  label: table.label,
  capacity: table.capacity,
  status: table.status as TableStatus,
  sectionId: section.id,
  sectionName: section.name
})

const toReservation = (reservation: ReservationDto): Reservation => ({
  id: reservation.id,
  tableId: reservation.tableId,
  customerName: reservation.customerName,
  contact: reservation.contact,
  startTime: reservation.startTime,
  endTime: reservation.endTime,
  partySize: reservation.partySize,
  status: reservation.status as ReservationStatus
})

export const useTablesStore = defineStore('tables', () => {
  const sections = ref<FloorSectionDto[]>([])
  const tables = ref<Table[]>([])
  const reservations = ref<Reservation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)

  const tablesByStatus = computed(() => ({
    [TableStatus.AVAILABLE]: tables.value.filter(table => table.status === TableStatus.AVAILABLE),
    [TableStatus.OCCUPIED]: tables.value.filter(table => table.status === TableStatus.OCCUPIED),
    [TableStatus.RESERVED]: tables.value.filter(table => table.status === TableStatus.RESERVED),
    [TableStatus.DIRTY]: tables.value.filter(table => table.status === TableStatus.DIRTY)
  }))

  const tableStats = computed(() => {
    const total = tables.value.length
    const available = tablesByStatus.value[TableStatus.AVAILABLE].length
    const occupied = tablesByStatus.value[TableStatus.OCCUPIED].length
    const reserved = tablesByStatus.value[TableStatus.RESERVED].length
    const dirty = tablesByStatus.value[TableStatus.DIRTY].length

    return {
      total,
      available,
      occupied,
      reserved,
      dirty,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
    }
  })

  const upcomingReservations = computed(() => {
    const now = new Date()
    const nextFourHours = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    return reservations.value
      .map(reservation => ({
        reservation,
        start: parseIsoDateTime(reservation.startTime)
      }))
      .filter(item => {
        const { reservation, start } = item
        return (
          reservation.status === ReservationStatus.CONFIRMED &&
          start !== null &&
          start >= now &&
          start <= nextFourHours
        )
      })
      .sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0))
      .map(item => item.reservation)
  })

  const hydrateTables = (layout: FloorSectionDto[]) => {
    sections.value = layout
    tables.value = layout.flatMap(section => section.tables.map(table => toTable(section, table)))
  }

  const hydrateReservations = (data: ReservationDto[]) => {
    reservations.value = data
      .map(reservation => toReservation(reservation))
      .sort((a, b) => {
        const startA = parseIsoDateTime(a.startTime)?.getTime() || 0
        const startB = parseIsoDateTime(b.startTime)?.getTime() || 0
        return startA - startB
      })
  }

  const fetchTables = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const layout = await tablesApi.getLayout()
      hydrateTables(layout)

      const reservationData = await tablesApi.listReservations()
      hydrateReservations(reservationData)

      lastUpdate.value = new Date()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch tables'
      console.error('Error fetching table layout:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchReservations = async (): Promise<boolean> => {
    try {
      const reservationData = await tablesApi.listReservations()
      hydrateReservations(reservationData)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch reservations'
      console.error('Error fetching reservations:', err)
      return false
    }
  }

  const updateTableStatus = async (tableId: number, status: TableStatus): Promise<boolean> => {
    try {
      const updated = await tablesApi.updateStatus(tableId, { status })
      const index = tables.value.findIndex(table => table.id === tableId)
      if (index !== -1) {
        tables.value[index] = {
          ...tables.value[index],
          status: updated.status as TableStatus
        }
      }
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update table status'
      console.error('Error updating table status:', err)
      return false
    }
  }

  const createReservation = async (payload: ReservationRequestDto): Promise<boolean> => {
    try {
      const created = await tablesApi.createReservation(payload)
      const reservation = toReservation(created)
      reservations.value = [...reservations.value, reservation].sort((a, b) => {
        const startA = parseIsoDateTime(a.startTime)?.getTime() || 0
        const startB = parseIsoDateTime(b.startTime)?.getTime() || 0
        return startA - startB
      })

      const tableIndex = tables.value.findIndex(table => table.id === reservation.tableId)
      if (tableIndex !== -1) {
        tables.value[tableIndex] = {
          ...tables.value[tableIndex],
          status: TableStatus.RESERVED
        }
      }
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create reservation'
      console.error('Error creating reservation:', err)
      return false
    }
  }

  const updateReservationStatus = async (
    reservationId: number,
    status: ReservationStatus
  ): Promise<boolean> => {
    try {
      const updated = await tablesApi.updateReservationStatus(reservationId, { status })
      const reservation = toReservation(updated)
      const index = reservations.value.findIndex(item => item.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = reservation
      } else {
        reservations.value.push(reservation)
      }
      reservations.value.sort((a, b) => {
        const startA = parseIsoDateTime(a.startTime)?.getTime() || 0
        const startB = parseIsoDateTime(b.startTime)?.getTime() || 0
        return startA - startB
      })

      if (reservation.status === ReservationStatus.CANCELLED || reservation.status === ReservationStatus.COMPLETED) {
        const tableIndex = tables.value.findIndex(table => table.id === reservation.tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex] = {
            ...tables.value[tableIndex],
            status: TableStatus.AVAILABLE
          }
        }
      }

      if (reservation.status === ReservationStatus.CHECKED_IN) {
        const tableIndex = tables.value.findIndex(table => table.id === reservation.tableId)
        if (tableIndex !== -1) {
          tables.value[tableIndex] = {
            ...tables.value[tableIndex],
            status: TableStatus.OCCUPIED
          }
        }
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update reservation'
      console.error('Error updating reservation status:', err)
      return false
    }
  }

  const seatReservation = async (reservationId: number): Promise<boolean> => {
    return updateReservationStatus(reservationId, ReservationStatus.CHECKED_IN)
  }

  const getTableById = (tableId: number): Table | undefined => {
    return tables.value.find(table => table.id === tableId)
  }

  const getReservationsForTable = (tableId: number): Reservation[] => {
    return reservations.value.filter(reservation => reservation.tableId === tableId)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    sections,
    tables,
    reservations,
    isLoading,
    error,
    lastUpdate,

    // Computed
    tablesByStatus,
    tableStats,
    upcomingReservations,

    // Actions
    fetchTables,
    fetchReservations,
    updateTableStatus,
    createReservation,
    updateReservationStatus,
    seatReservation,
    getTableById,
    getReservationsForTable,
    clearError
  }
})
