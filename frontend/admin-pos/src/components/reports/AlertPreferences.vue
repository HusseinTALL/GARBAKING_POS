<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, RotateCcw, Bell, DollarSign, Percent, Mail } from 'lucide-vue-next'
import { alertPreferencesApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'

const toast = useToast()

const isLoading = ref(false)
const isSaving = ref(false)

const preferences = ref({
  lowThreshold: 10,
  mediumThreshold: 50,
  highThreshold: 100,
  criticalThreshold: 500,
  lowPercentage: 2,
  mediumPercentage: 5,
  highPercentage: 10,
  emailNotifications: false,
  emailAddress: '',
  notifyCriticalOnly: false,
  autoAcknowledgeLow: false,
  acknowledgmentTimeoutHours: 24
})

const loadPreferences = async () => {
  isLoading.value = true
  try {
    const prefs = await alertPreferencesApi.getGlobalPreferences()
    preferences.value = {
      lowThreshold: prefs.lowThreshold || 10,
      mediumThreshold: prefs.mediumThreshold || 50,
      highThreshold: prefs.highThreshold || 100,
      criticalThreshold: prefs.criticalThreshold || 500,
      lowPercentage: prefs.lowPercentage || 2,
      mediumPercentage: prefs.mediumPercentage || 5,
      highPercentage: prefs.highPercentage || 10,
      emailNotifications: prefs.emailNotifications || false,
      emailAddress: prefs.emailAddress || '',
      notifyCriticalOnly: prefs.notifyCriticalOnly || false,
      autoAcknowledgeLow: prefs.autoAcknowledgeLow || false,
      acknowledgmentTimeoutHours: prefs.acknowledgmentTimeoutHours || 24
    }
  } catch (error: any) {
    console.error('Failed to load preferences:', error)
    toast.error('Failed to load alert preferences')
  } finally {
    isLoading.value = false
  }
}

const savePreferences = async () => {
  isSaving.value = true
  try {
    await alertPreferencesApi.updateGlobalPreferences(preferences.value)
    toast.success('Alert preferences saved successfully')
  } catch (error: any) {
    console.error('Failed to save preferences:', error)
    toast.error('Failed to save alert preferences')
  } finally {
    isSaving.value = false
  }
}

const resetToDefaults = async () => {
  if (!confirm('Reset all alert preferences to default values?')) return

  isLoading.value = true
  try {
    const prefs = await alertPreferencesApi.resetToDefaults()
    preferences.value = {
      lowThreshold: prefs.lowThreshold,
      mediumThreshold: prefs.mediumThreshold,
      highThreshold: prefs.highThreshold,
      criticalThreshold: prefs.criticalThreshold,
      lowPercentage: prefs.lowPercentage,
      mediumPercentage: prefs.mediumPercentage,
      highPercentage: prefs.highPercentage,
      emailNotifications: prefs.emailNotifications,
      emailAddress: prefs.emailAddress || '',
      notifyCriticalOnly: prefs.notifyCriticalOnly,
      autoAcknowledgeLow: prefs.autoAcknowledgeLow,
      acknowledgmentTimeoutHours: prefs.acknowledgmentTimeoutHours
    }
    toast.success('Preferences reset to defaults')
  } catch (error: any) {
    console.error('Failed to reset preferences:', error)
    toast.error('Failed to reset preferences')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPreferences()
})
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-white">Alert Preferences</h3>
      <div class="flex gap-2">
        <button
          @click="resetToDefaults"
          :disabled="isLoading || isSaving"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCcw :size="16" />
          Reset to Defaults
        </button>
        <button
          @click="savePreferences"
          :disabled="isLoading || isSaving"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save :size="16" />
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-400">Loading preferences...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Amount Thresholds -->
      <div class="bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <DollarSign :size="20" class="text-green-400" />
          <h4 class="text-lg font-semibold text-white">Amount Thresholds</h4>
        </div>
        <p class="text-sm text-gray-400 mb-4">
          Alert severity levels based on absolute variance amount
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Low ($)</label>
            <input
              v-model.number="preferences.lowThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Medium ($)</label>
            <input
              v-model.number="preferences.mediumThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">High ($)</label>
            <input
              v-model.number="preferences.highThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Critical ($)</label>
            <input
              v-model.number="preferences.criticalThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <!-- Percentage Thresholds -->
      <div class="bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <Percent :size="20" class="text-blue-400" />
          <h4 class="text-lg font-semibold text-white">Percentage Thresholds</h4>
        </div>
        <p class="text-sm text-gray-400 mb-4">
          Alert severity levels based on variance percentage
        </p>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Low (%)</label>
            <input
              v-model.number="preferences.lowPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Medium (%)</label>
            <input
              v-model.number="preferences.mediumPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">High (%)</label>
            <input
              v-model.number="preferences.highPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      <!-- Email Notifications -->
      <div class="bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <Mail :size="20" class="text-purple-400" />
          <h4 class="text-lg font-semibold text-white">Email Notifications</h4>
        </div>
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              v-model="preferences.emailNotifications"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
            />
            <label class="ml-2 text-sm font-medium text-gray-300">
              Enable email notifications
            </label>
          </div>
          <div v-if="preferences.emailNotifications">
            <label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              v-model="preferences.emailAddress"
              type="email"
              placeholder="admin@example.com"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex items-center">
            <input
              v-model="preferences.notifyCriticalOnly"
              type="checkbox"
              :disabled="!preferences.emailNotifications"
              class="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <label class="ml-2 text-sm font-medium text-gray-300">
              Send emails for critical alerts only
            </label>
          </div>
        </div>
      </div>

      <!-- Alert Behavior -->
      <div class="bg-gray-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <Bell :size="20" class="text-yellow-400" />
          <h4 class="text-lg font-semibold text-white">Alert Behavior</h4>
        </div>
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              v-model="preferences.autoAcknowledgeLow"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
            />
            <label class="ml-2 text-sm font-medium text-gray-300">
              Auto-acknowledge low severity alerts
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Alert acknowledgment timeout (hours)
            </label>
            <input
              v-model.number="preferences.acknowledgmentTimeoutHours"
              type="number"
              min="1"
              max="168"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p class="text-xs text-gray-400 mt-1">
              Alerts will escalate if not acknowledged within this time
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
