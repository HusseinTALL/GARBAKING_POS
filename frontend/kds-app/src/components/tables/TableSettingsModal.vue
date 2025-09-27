<!--
  Table Settings Modal - Configure floor plan layout and display settings
  Allows managers to adjust floor plan view, grid settings, and table display preferences
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          Floor Plan Settings
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSave" class="flex-1 overflow-y-auto">
        <div class="px-6 py-4 space-y-6">
          <!-- Layout Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Layout Settings</h4>

            <!-- Grid Size -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Grid Columns
                </label>
                <input
                  v-model.number="form.gridColumns"
                  type="number"
                  min="5"
                  max="20"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500">Number of columns in the floor plan grid</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Grid Rows
                </label>
                <input
                  v-model.number="form.gridRows"
                  type="number"
                  min="5"
                  max="20"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500">Number of rows in the floor plan grid</p>
              </div>
            </div>

            <!-- Show Grid Lines -->
            <div class="flex items-center mb-4">
              <input
                v-model="form.showGrid"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Show grid lines in floor plan
              </label>
            </div>

            <!-- Snap to Grid -->
            <div class="flex items-center">
              <input
                v-model="form.snapToGrid"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Snap tables to grid when moving
              </label>
            </div>
          </div>

          <!-- Display Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Display Settings</h4>

            <!-- Table Size -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Table Size
              </label>
              <select
                v-model="form.tableSize"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="small">Small (40x40px)</option>
                <option value="medium">Medium (50x50px)</option>
                <option value="large">Large (60x60px)</option>
                <option value="xlarge">Extra Large (70x70px)</option>
              </select>
            </div>

            <!-- Show Table Numbers -->
            <div class="flex items-center mb-4">
              <input
                v-model="form.showTableNumbers"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Show table numbers on floor plan
              </label>
            </div>

            <!-- Show Table Capacity -->
            <div class="flex items-center mb-4">
              <input
                v-model="form.showTableCapacity"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Show table capacity indicators
              </label>
            </div>

            <!-- Show Status Colors -->
            <div class="flex items-center">
              <input
                v-model="form.showStatusColors"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Use status colors for table backgrounds
              </label>
            </div>
          </div>

          <!-- Section Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Section Settings</h4>

            <!-- Show Section Labels -->
            <div class="flex items-center mb-4">
              <input
                v-model="form.showSectionLabels"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Show section labels on floor plan
              </label>
            </div>

            <!-- Section Label Position -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Section Label Position
              </label>
              <select
                v-model="form.sectionLabelPosition"
                :disabled="!form.showSectionLabels"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="center">Center</option>
              </select>
            </div>

            <!-- Highlight Empty Sections -->
            <div class="flex items-center">
              <input
                v-model="form.highlightEmptySections"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Highlight sections with no available tables
              </label>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h4>

            <!-- Auto Refresh -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Auto Refresh Interval
              </label>
              <select
                v-model.number="form.autoRefreshInterval"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option :value="0">Disabled</option>
                <option :value="5">5 seconds</option>
                <option :value="10">10 seconds</option>
                <option :value="30">30 seconds</option>
                <option :value="60">1 minute</option>
                <option :value="300">5 minutes</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">How often to refresh table status automatically</p>
            </div>

            <!-- Drag and Drop -->
            <div class="flex items-center mb-4">
              <input
                v-model="form.enableDragDrop"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Enable drag and drop table positioning
              </label>
            </div>

            <!-- Show Tooltips -->
            <div class="flex items-center">
              <input
                v-model="form.showTooltips"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">
                Show detailed tooltips on hover
              </label>
            </div>
          </div>

          <!-- Color Scheme Preview -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Status Color Preview</h4>
            <div class="grid grid-cols-5 gap-3">
              <div class="text-center">
                <div class="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2"></div>
                <span class="text-xs text-gray-600">Available</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-2"></div>
                <span class="text-xs text-gray-600">Occupied</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2"></div>
                <span class="text-xs text-gray-600">Reserved</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-2"></div>
                <span class="text-xs text-gray-600">Cleaning</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-gray-500 rounded-lg mx-auto mb-2"></div>
                <span class="text-xs text-gray-600">Out of Order</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            @click="resetToDefaults"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            :disabled="loading"
          >
            Reset to Defaults
          </button>
          <div class="flex space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2
                v-if="loading"
                class="animate-spin w-4 h-4 mr-2"
              />
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

interface FloorPlanSettings {
  gridColumns: number
  gridRows: number
  showGrid: boolean
  snapToGrid: boolean
  tableSize: 'small' | 'medium' | 'large' | 'xlarge'
  showTableNumbers: boolean
  showTableCapacity: boolean
  showStatusColors: boolean
  showSectionLabels: boolean
  sectionLabelPosition: 'top-left' | 'top-center' | 'top-right' | 'center'
  highlightEmptySections: boolean
  autoRefreshInterval: number
  enableDragDrop: boolean
  showTooltips: boolean
}

interface Props {
  settings: FloorPlanSettings
}

interface Emits {
  (e: 'close'): void
  (e: 'update', settings: FloorPlanSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)

const form = reactive<FloorPlanSettings>({
  gridColumns: 12,
  gridRows: 8,
  showGrid: true,
  snapToGrid: true,
  tableSize: 'medium',
  showTableNumbers: true,
  showTableCapacity: true,
  showStatusColors: true,
  showSectionLabels: true,
  sectionLabelPosition: 'top-left',
  highlightEmptySections: false,
  autoRefreshInterval: 30,
  enableDragDrop: true,
  showTooltips: true
})

const defaultSettings: FloorPlanSettings = {
  gridColumns: 12,
  gridRows: 8,
  showGrid: true,
  snapToGrid: true,
  tableSize: 'medium',
  showTableNumbers: true,
  showTableCapacity: true,
  showStatusColors: true,
  showSectionLabels: true,
  sectionLabelPosition: 'top-left',
  highlightEmptySections: false,
  autoRefreshInterval: 30,
  enableDragDrop: true,
  showTooltips: true
}

// Methods
const handleSave = async () => {
  loading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('update', { ...form })
  } catch (error) {
    console.error('Error saving settings:', error)
    // Handle error (could show notification)
  } finally {
    loading.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to their defaults?')) {
    Object.assign(form, defaultSettings)
  }
}

// Initialize form with current settings
onMounted(() => {
  Object.assign(form, props.settings)
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>