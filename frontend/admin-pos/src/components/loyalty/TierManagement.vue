<!--
  Tier Management Component - Create, edit, and manage loyalty program tiers
  Handles tier configuration with benefits and multipliers
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Loyalty Tiers</h2>
        <p class="text-sm text-gray-600 mt-1">Manage tier levels and benefits</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Add Tier</span>
      </button>
    </div>

    <!-- Tiers List -->
    <div class="p-6">
      <div v-if="isLoading" class="text-center py-12">
        <Loader2 class="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
        <p class="text-gray-600">Loading tiers...</p>
      </div>

      <div v-else-if="tiers.length === 0" class="text-center py-12">
        <Trophy class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No tiers configured</h3>
        <p class="text-gray-600 mb-4">Create tiers to reward your most loyal customers</p>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
        >
          <Plus class="w-4 h-4" />
          <span>Create First Tier</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="tier in sortedTiers"
          :key="tier.id"
          class="bg-gradient-to-br rounded-lg shadow-md p-6 relative overflow-hidden"
          :class="getTierGradient(tier.name)"
        >
          <!-- Tier Badge -->
          <div class="absolute top-3 right-3">
            <div
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="getTierBadgeClass(tier.name)"
            >
              {{ tier.name }}
            </div>
          </div>

          <!-- Tier Icon -->
          <div class="mb-4">
            <Trophy class="w-12 h-12 text-white opacity-80" />
          </div>

          <!-- Tier Details -->
          <h3 class="text-xl font-bold text-white mb-2">{{ tier.name }}</h3>

          <div class="space-y-2 text-white/90 text-sm mb-4">
            <div class="flex items-center justify-between">
              <span>Min Spent:</span>
              <span class="font-semibold">{{ formatCurrency(tier.minSpent) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Points Multiplier:</span>
              <span class="font-semibold">{{ tier.pointsMultiplier }}x</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Discount:</span>
              <span class="font-semibold">{{ tier.discountPercent }}%</span>
            </div>
          </div>

          <!-- Benefits -->
          <div v-if="tier.benefits && tier.benefits.length > 0" class="mb-4">
            <div class="text-xs font-semibold text-white/70 mb-2">BENEFITS</div>
            <ul class="space-y-1">
              <li
                v-for="(benefit, index) in tier.benefits"
                :key="index"
                class="flex items-start text-xs text-white/90"
              >
                <Check class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 mt-4 pt-4 border-t border-white/20">
            <button
              @click="editTier(tier)"
              class="flex-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Edit2 class="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              @click="confirmDeleteTier(tier)"
              class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 class="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingTier ? 'Edit Tier' : 'Create New Tier' }}
            </h3>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveTier" class="space-y-4">
            <!-- Tier Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tier Name
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g., Bronze, Silver, Gold"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Min Spent -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Minimum Spent (FCFA)
              </label>
              <input
                v-model.number="form.minSpent"
                type="number"
                required
                min="0"
                step="100"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Total amount customer must spend to reach this tier
              </p>
            </div>

            <!-- Points Multiplier -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Points Multiplier
              </label>
              <input
                v-model.number="form.pointsMultiplier"
                type="number"
                required
                min="1"
                step="0.1"
                placeholder="1.0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Points earned multiplier (e.g., 1.5x means 50% more points)
              </p>
            </div>

            <!-- Discount Percent -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                v-model.number="form.discountPercent"
                type="number"
                required
                min="0"
                max="100"
                step="0.5"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Automatic discount on all purchases (0-100%)
              </p>
            </div>

            <!-- Benefits -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              <div class="space-y-2">
                <div
                  v-for="(benefit, index) in form.benefits"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <input
                    v-model="form.benefits[index]"
                    type="text"
                    placeholder="Enter benefit..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    @click="removeBenefit(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click="addBenefit"
                class="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <Plus class="w-4 h-4" />
                <span>Add Benefit</span>
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                :disabled="isSaving"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
                {{ editingTier ? 'Update Tier' : 'Create Tier' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showDeleteModal = false"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Delete Tier</h3>
            <p class="text-sm text-gray-600 mt-1">This action cannot be undone</p>
          </div>
        </div>

        <p class="text-gray-700 mb-6">
          Are you sure you want to delete the <strong>{{ tierToDelete?.name }}</strong> tier?
          Customers in this tier will be moved to the default tier.
        </p>

        <div class="flex items-center space-x-3">
          <button
            @click="deleteTier"
            :disabled="isDeleting"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin inline" />
            Delete Tier
          </button>
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import type { LoyaltyTier } from '@/services/loyalty'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Trophy,
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-vue-next'

const loyaltyStore = useLoyaltyStore()

// State
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingTier = ref<LoyaltyTier | null>(null)
const tierToDelete = ref<LoyaltyTier | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const form = ref({
  name: '',
  minSpent: 0,
  pointsMultiplier: 1.0,
  discountPercent: 0,
  benefits: [] as string[]
})

// Computed
const tiers = computed(() => {
  const program = loyaltyStore.defaultProgram
  return program?.tiers || []
})

const sortedTiers = computed(() => {
  return [...tiers.value].sort((a, b) => a.minSpent - b.minSpent)
})

// Methods
const openCreateModal = () => {
  editingTier.value = null
  form.value = {
    name: '',
    minSpent: 0,
    pointsMultiplier: 1.0,
    discountPercent: 0,
    benefits: []
  }
  showModal.value = true
}

const editTier = (tier: LoyaltyTier) => {
  editingTier.value = tier
  form.value = {
    name: tier.name,
    minSpent: tier.minSpent,
    pointsMultiplier: tier.pointsMultiplier,
    discountPercent: tier.discountPercent,
    benefits: tier.benefits ? [...tier.benefits] : []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTier.value = null
}

const saveTier = async () => {
  isSaving.value = true
  try {
    const program = loyaltyStore.defaultProgram
    if (!program) {
      alert('No active loyalty program found')
      return
    }

    const tierData = {
      name: form.value.name,
      minSpent: form.value.minSpent,
      pointsMultiplier: form.value.pointsMultiplier,
      discountPercent: form.value.discountPercent,
      benefits: form.value.benefits.filter(b => b.trim() !== '')
    }

    if (editingTier.value) {
      await loyaltyStore.updateTier(editingTier.value.id, tierData)
    } else {
      await loyaltyStore.createTier(program.id, tierData)
    }

    closeModal()
  } catch (error) {
    console.error('Failed to save tier:', error)
    alert('Failed to save tier. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const confirmDeleteTier = (tier: LoyaltyTier) => {
  tierToDelete.value = tier
  showDeleteModal.value = true
}

const deleteTier = async () => {
  if (!tierToDelete.value) return

  isDeleting.value = true
  try {
    await loyaltyStore.deleteTier(tierToDelete.value.id)
    showDeleteModal.value = false
    tierToDelete.value = null
  } catch (error) {
    console.error('Failed to delete tier:', error)
    alert('Failed to delete tier. Please try again.')
  } finally {
    isDeleting.value = false
  }
}

const addBenefit = () => {
  form.value.benefits.push('')
}

const removeBenefit = (index: number) => {
  form.value.benefits.splice(index, 1)
}

const getTierGradient = (name: string): string => {
  const gradients: Record<string, string> = {
    'Bronze': 'from-amber-600 to-amber-800',
    'Silver': 'from-gray-400 to-gray-600',
    'Gold': 'from-yellow-500 to-yellow-700',
    'Platinum': 'from-cyan-600 to-cyan-800',
    'Diamond': 'from-purple-600 to-purple-800'
  }
  return gradients[name] || 'from-blue-600 to-blue-800'
}

const getTierBadgeClass = (name: string): string => {
  const classes: Record<string, string> = {
    'Bronze': 'bg-amber-900/30 text-amber-100',
    'Silver': 'bg-gray-700/30 text-gray-100',
    'Gold': 'bg-yellow-900/30 text-yellow-100',
    'Platinum': 'bg-cyan-900/30 text-cyan-100',
    'Diamond': 'bg-purple-900/30 text-purple-100'
  }
  return classes[name] || 'bg-blue-900/30 text-blue-100'
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  await loyaltyStore.fetchPrograms()
  isLoading.value = false
})
</script>
