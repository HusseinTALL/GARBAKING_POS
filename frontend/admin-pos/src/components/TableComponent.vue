<!--
  Visual table component for floor plan display
  Interactive, draggable table with real-time status updates
-->

<template>
  <div
    :class="[
      'absolute cursor-pointer transition-all duration-200 select-none',
      'rounded-lg border-2 flex items-center justify-center text-white font-bold',
      tableClasses,
      {
        'shadow-xl scale-105': selected,
        'hover:scale-102': !isDragging,
        'cursor-grabbing z-50': isDragging
      }
    ]"
    :style="tableStyle"
    @mousedown="startDrag"
    @click="handleClick"
    @contextmenu="showContextMenu"
  >
    <!-- Table Number -->
    <div class="text-center">
      <div class="text-lg font-bold">{{ table.number }}</div>
      <div v-if="table.capacity" class="text-xs opacity-75">{{ table.capacity }} pers.</div>
    </div>

    <!-- Status Indicator -->
    <div
      :class="[
        'absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white',
        'flex items-center justify-center text-xs',
        statusIndicatorClass
      ]"
    >
      <component :is="statusIcon" class="w-3 h-3" />
    </div>

    <!-- Order Info -->
    <div v-if="table.currentOrder" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
      <div class="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        #{{ table.currentOrder.orderNumber }}
      </div>
    </div>

    <!-- Reservation Info -->
    <div v-if="hasUpcomingReservation" class="absolute -top-8 left-1/2 transform -translate-x-1/2">
      <div class="bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {{ formatReservationTime(upcomingReservation.reservationTime) }}
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="showMenu"
      class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      @click.stop
    >
      <button
        v-for="action in contextMenuActions"
        :key="action.label"
        @click="handleAction(action.action)"
        :disabled="action.disabled"
        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <component :is="action.icon" class="mr-3 w-4 h-4" />
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TableStatus, type Table } from '@/stores/tables'
import { Check, User, Clock, Broom, Wrench, Utensils, Calendar, LogOut, UserCheck, X, Printer, Info, Minus } from 'lucide-vue-next'

// Props
interface Props {
  table: Table
  selected?: boolean
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  scale: 1
})

// Emits
const emit = defineEmits<{
  'click': [table: Table]
  'status-change': [tableId: string, status: TableStatus, notes?: string]
  'move': [tableId: string, position: { x: number; y: number }]
  'assign-order': [table: Table]
}>()

// Local state
const isDragging = ref(false)
const showMenu = ref(false)
const dragStart = ref({ x: 0, y: 0, tableX: 0, tableY: 0 })

// Computed
const tableStyle = computed(() => ({
  left: `${props.table.position.x}px`,
  top: `${props.table.position.y}px`,
  width: `${props.table.size.width * props.scale}px`,
  height: `${props.table.size.height * props.scale}px`,
  transform: props.scale !== 1 ? `scale(${props.scale})` : undefined,
  transformOrigin: 'top left'
}))

const tableClasses = computed(() => {
  const baseClasses = {
    [TableStatus.AVAILABLE]: 'bg-green-500 border-green-600 hover:bg-green-600',
    [TableStatus.OCCUPIED]: 'bg-red-500 border-red-600 hover:bg-red-600',
    [TableStatus.RESERVED]: 'bg-blue-500 border-blue-600 hover:bg-blue-600',
    [TableStatus.NEEDS_CLEANING]: 'bg-yellow-500 border-yellow-600 hover:bg-yellow-600',
    [TableStatus.OUT_OF_ORDER]: 'bg-gray-500 border-gray-600 hover:bg-gray-600'
  }

  return baseClasses[props.table.status] || baseClasses[TableStatus.AVAILABLE]
})

const statusIndicatorClass = computed(() => {
  const classes = {
    [TableStatus.AVAILABLE]: 'bg-green-500',
    [TableStatus.OCCUPIED]: 'bg-red-500',
    [TableStatus.RESERVED]: 'bg-blue-500',
    [TableStatus.NEEDS_CLEANING]: 'bg-yellow-500',
    [TableStatus.OUT_OF_ORDER]: 'bg-gray-500'
  }

  return classes[props.table.status] || classes[TableStatus.AVAILABLE]
})

const statusIcon = computed(() => {
  const icons = {
    [TableStatus.AVAILABLE]: Check,
    [TableStatus.OCCUPIED]: User,
    [TableStatus.RESERVED]: Clock,
    [TableStatus.NEEDS_CLEANING]: Broom,
    [TableStatus.OUT_OF_ORDER]: Wrench
  }

  return icons[props.table.status] || icons[TableStatus.AVAILABLE]
})

const hasUpcomingReservation = computed(() => {
  return props.table.reservations.some(r => {
    const reservationTime = new Date(r.reservationTime)
    const now = new Date()
    const timeDiff = reservationTime.getTime() - now.getTime()
    return r.status === 'CONFIRMED' && timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000 // Next 2 hours
  })
})

const upcomingReservation = computed(() => {
  return props.table.reservations.find(r => {
    const reservationTime = new Date(r.reservationTime)
    const now = new Date()
    const timeDiff = reservationTime.getTime() - now.getTime()
    return r.status === 'CONFIRMED' && timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000
  })
})

const contextMenuActions = computed(() => {
  const actions = []

  if (props.table.status === TableStatus.AVAILABLE) {
    actions.push(
      {
        label: 'Assigner une commande',
        action: 'assign-order',
        icon: Utensils,
        disabled: false
      },
      {
        label: 'Marquer réservée',
        action: 'mark-reserved',
        icon: Calendar,
        disabled: false
      },
      {
        label: 'Marquer hors service',
        action: 'mark-out-of-order',
        icon: Wrench,
        disabled: false
      }
    )
  }

  if (props.table.status === TableStatus.OCCUPIED) {
    actions.push(
      {
        label: 'Libérer la table',
        action: 'clear-table',
        icon: LogOut,
        disabled: false
      },
      {
        label: 'Imprimer l\'addition',
        action: 'print-bill',
        icon: Printer,
        disabled: !props.table.currentOrder
      }
    )
  }

  if (props.table.status === TableStatus.NEEDS_CLEANING) {
    actions.push(
      {
        label: 'Marquer nettoyée',
        action: 'mark-cleaned',
        icon: Check,
        disabled: false
      }
    )
  }

  if (props.table.status === TableStatus.RESERVED) {
    actions.push(
      {
        label: 'Installer les clients',
        action: 'seat-reservation',
        icon: UserCheck,
        disabled: false
      },
      {
        label: 'Annuler réservation',
        action: 'cancel-reservation',
        icon: X,
        disabled: false
      }
    )
  }

  if (props.table.status === TableStatus.OUT_OF_ORDER) {
    actions.push(
      {
        label: 'Remettre en service',
        action: 'mark-available',
        icon: Check,
        disabled: false
      }
    )
  }

  // Common actions
  actions.push(
    { label: '---', action: 'separator', icon: Minus, disabled: true },
    {
      label: 'Voir détails',
      action: 'view-details',
      icon: Info,
      disabled: false
    }
  )

  return actions.filter(a => a.action !== 'separator' || actions.length > 3)
})

// Methods
const handleClick = (event: MouseEvent) => {
  event.stopPropagation()

  if (!isDragging.value) {
    emit('click', props.table)
  }

  // Hide context menu
  showMenu.value = false
}

const showContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  showMenu.value = !showMenu.value
}

const startDrag = (event: MouseEvent) => {
  if (event.button !== 0) return // Only left mouse button

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    tableX: props.table.position.x,
    tableY: props.table.position.y
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y

    const newPosition = {
      x: Math.max(0, dragStart.value.tableX + deltaX / props.scale),
      y: Math.max(0, dragStart.value.tableY + deltaY / props.scale)
    }

    // Emit position change for real-time visual feedback
    emit('move', props.table.id, newPosition)
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleAction = (action: string) => {
  showMenu.value = false

  switch (action) {
    case 'assign-order':
      emit('assign-order', props.table)
      break

    case 'mark-reserved':
      emit('status-change', props.table.id, TableStatus.RESERVED)
      break

    case 'mark-out-of-order':
      emit('status-change', props.table.id, TableStatus.OUT_OF_ORDER)
      break

    case 'clear-table':
      emit('status-change', props.table.id, TableStatus.NEEDS_CLEANING)
      break

    case 'mark-cleaned':
      emit('status-change', props.table.id, TableStatus.AVAILABLE)
      break

    case 'mark-available':
      emit('status-change', props.table.id, TableStatus.AVAILABLE)
      break

    case 'seat-reservation':
      emit('status-change', props.table.id, TableStatus.OCCUPIED)
      break

    case 'cancel-reservation':
      emit('status-change', props.table.id, TableStatus.AVAILABLE)
      break

    case 'view-details':
      emit('click', props.table)
      break

    case 'print-bill':
      // Handle bill printing
      console.log('Print bill for table:', props.table.number)
      break
  }
}

const formatReservationTime = (timeString: string): string => {
  const time = new Date(timeString)
  return time.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Close context menu when clicking elsewhere
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.context-menu')) {
    showMenu.value = false
  }
})
</script>

<style scoped>
.hover\:scale-102:hover {
  transform: scale(1.02);
}

/* Smooth transitions for drag operations */
.table-transition {
  transition: transform 0.1s ease-out;
}

/* Context menu styling */
.context-menu {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>