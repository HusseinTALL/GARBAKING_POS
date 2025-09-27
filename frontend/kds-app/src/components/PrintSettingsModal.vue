<!--
  Print Settings Modal - Configure printer and system print settings
  Handles printer connection, paper size, quality settings, and automation preferences
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
          Print Settings
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
          <!-- Printer Connection -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Printer Connection</h4>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type
                </label>
                <select
                  v-model="form.connectionType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USB">USB</option>
                  <option value="NETWORK">Network (Ethernet/WiFi)</option>
                  <option value="BLUETOOTH">Bluetooth</option>
                  <option value="SERIAL">Serial Port</option>
                </select>
              </div>

              <div v-if="form.connectionType === 'NETWORK'">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      IP Address
                    </label>
                    <input
                      v-model="form.networkSettings.ipAddress"
                      type="text"
                      placeholder="192.168.1.100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      v-model.number="form.networkSettings.port"
                      type="number"
                      placeholder="9100"
                      min="1"
                      max="65535"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div v-if="form.connectionType === 'USB'">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    USB Device Path
                  </label>
                  <select
                    v-model="form.usbSettings.devicePath"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">[Auto-detect]</option>
                    <option value="/dev/usb/lp0">/dev/usb/lp0</option>
                    <option value="/dev/usb/lp1">/dev/usb/lp1</option>
                    <option value="COM1">COM1 (Windows)</option>
                    <option value="COM2">COM2 (Windows)</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'w-3 h-3 rounded-full',
                    connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'
                  ]"></div>
                  <span class="text-sm font-medium">
                    {{ connectionStatus.connected ? 'Connected' : 'Disconnected' }}
                  </span>
                  <span v-if="connectionStatus.model" class="text-sm text-gray-600">
                    {{ connectionStatus.model }}
                  </span>
                </div>
                <button
                  type="button"
                  @click="testConnection"
                  :disabled="testingConnection"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Loader2 v-if="testingConnection" class="w-4 h-4 animate-spin" />
                  <span v-else>Test Connection</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Paper Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Paper Settings</h4>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Paper Width
                  </label>
                  <select
                    v-model="form.paperSettings.width"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="58mm">58mm (2.3")</option>
                    <option value="80mm">80mm (3.1")</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Character Width
                  </label>
                  <input
                    v-model.number="form.paperSettings.charactersPerLine"
                    type="number"
                    min="20"
                    max="60"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Paper Type
                </label>
                <select
                  v-model="form.paperSettings.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="thermal">Thermal Paper</option>
                  <option value="regular">Regular Paper</option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.paperSettings.autoCut"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Automatically cut paper after printing
                </label>
              </div>
            </div>
          </div>

          <!-- Print Quality -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Print Quality</h4>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Print Density
                  </label>
                  <select
                    v-model="form.qualitySettings.density"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="normal">Normal</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Print Speed
                  </label>
                  <select
                    v-model="form.qualitySettings.speed"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="slow">Slow (High Quality)</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Heat Temperature: {{ form.qualitySettings.temperature }}
                </label>
                <input
                  v-model.number="form.qualitySettings.temperature"
                  type="range"
                  min="80"
                  max="200"
                  step="5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (80)</span>
                  <span>High (200)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Automation Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Automation</h4>

            <div class="space-y-4">
              <div class="flex items-center">
                <input
                  v-model="form.automationSettings.autoPrint"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Automatically print receipts when orders are completed
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.automationSettings.openCashDrawer"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Open cash drawer after printing receipts
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.automationSettings.printKitchenTickets"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Automatically print kitchen tickets for food items
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.automationSettings.printBarTickets"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Automatically print bar tickets for beverages
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Retry Failed Prints
                </label>
                <select
                  v-model.number="form.automationSettings.retryAttempts"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option :value="0">Never retry</option>
                  <option :value="1">1 attempt</option>
                  <option :value="2">2 attempts</option>
                  <option :value="3">3 attempts</option>
                  <option :value="5">5 attempts</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Print Queue Processing
                </label>
                <select
                  v-model="form.automationSettings.queueProcessing"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manual">Manual processing</option>
                  <option value="auto">Automatic processing</option>
                  <option value="scheduled">Process every 30 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Advanced</h4>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Command Language
                </label>
                <select
                  v-model="form.advancedSettings.commandLanguage"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ESC/POS">ESC/POS (Standard)</option>
                  <option value="Star">Star Printer Commands</option>
                  <option value="Citizen">Citizen Commands</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Character Encoding
                </label>
                <select
                  v-model="form.advancedSettings.encoding"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UTF-8">UTF-8</option>
                  <option value="ISO-8859-1">ISO-8859-1</option>
                  <option value="Windows-1252">Windows-1252</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Connection Timeout (ms)
                  </label>
                  <input
                    v-model.number="form.advancedSettings.timeout"
                    type="number"
                    min="1000"
                    max="30000"
                    step="1000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Keep Alive Interval (s)
                  </label>
                  <input
                    v-model.number="form.advancedSettings.keepAlive"
                    type="number"
                    min="10"
                    max="300"
                    step="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.advancedSettings.debugMode"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">
                  Enable debug logging for troubleshooting
                </label>
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

interface PrintSettings {
  connectionType: string
  networkSettings: {
    ipAddress: string
    port: number
  }
  usbSettings: {
    devicePath: string
  }
  paperSettings: {
    width: string
    charactersPerLine: number
    type: string
    autoCut: boolean
  }
  qualitySettings: {
    density: string
    speed: string
    temperature: number
  }
  automationSettings: {
    autoPrint: boolean
    openCashDrawer: boolean
    printKitchenTickets: boolean
    printBarTickets: boolean
    retryAttempts: number
    queueProcessing: string
  }
  advancedSettings: {
    commandLanguage: string
    encoding: string
    timeout: number
    keepAlive: number
    debugMode: boolean
  }
}

interface Props {
  settings: PrintSettings
}

interface Emits {
  (e: 'close'): void
  (e: 'update', settings: PrintSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const testingConnection = ref(false)

const connectionStatus = reactive({
  connected: false,
  model: ''
})

const form = reactive<PrintSettings>({
  connectionType: 'USB',
  networkSettings: {
    ipAddress: '192.168.1.100',
    port: 9100
  },
  usbSettings: {
    devicePath: ''
  },
  paperSettings: {
    width: '80mm',
    charactersPerLine: 48,
    type: 'thermal',
    autoCut: true
  },
  qualitySettings: {
    density: 'normal',
    speed: 'normal',
    temperature: 120
  },
  automationSettings: {
    autoPrint: true,
    openCashDrawer: false,
    printKitchenTickets: true,
    printBarTickets: true,
    retryAttempts: 2,
    queueProcessing: 'auto'
  },
  advancedSettings: {
    commandLanguage: 'ESC/POS',
    encoding: 'UTF-8',
    timeout: 5000,
    keepAlive: 60,
    debugMode: false
  }
})

const defaultSettings: PrintSettings = {
  connectionType: 'USB',
  networkSettings: {
    ipAddress: '192.168.1.100',
    port: 9100
  },
  usbSettings: {
    devicePath: ''
  },
  paperSettings: {
    width: '80mm',
    charactersPerLine: 48,
    type: 'thermal',
    autoCut: true
  },
  qualitySettings: {
    density: 'normal',
    speed: 'normal',
    temperature: 120
  },
  automationSettings: {
    autoPrint: true,
    openCashDrawer: false,
    printKitchenTickets: true,
    printBarTickets: true,
    retryAttempts: 2,
    queueProcessing: 'auto'
  },
  advancedSettings: {
    commandLanguage: 'ESC/POS',
    encoding: 'UTF-8',
    timeout: 5000,
    keepAlive: 60,
    debugMode: false
  }
}

// Methods
const testConnection = async () => {
  testingConnection.value = true

  try {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock connection success
    connectionStatus.connected = Math.random() > 0.3
    if (connectionStatus.connected) {
      connectionStatus.model = 'Epson TM-T88V'
    } else {
      connectionStatus.model = ''
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    connectionStatus.connected = false
    connectionStatus.model = ''
  } finally {
    testingConnection.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to their defaults?')) {
    Object.assign(form, defaultSettings)
  }
}

const handleSave = async () => {
  loading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('update', { ...form })
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    loading.value = false
  }
}

// Initialize form with current settings
onMounted(() => {
  Object.assign(form, props.settings)

  // Mock connection status
  connectionStatus.connected = true
  connectionStatus.model = 'Epson TM-T88V'
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