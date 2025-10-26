<!--
  Campaign Management Component - Create and manage loyalty campaigns
  Supports multiple campaign types with date ranges and usage tracking
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Loyalty Campaigns</h2>
        <p class="text-sm text-gray-600 mt-1">Boost engagement with targeted promotions</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>New Campaign</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="p-6 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div class="flex-1">
          <select
            v-model="filterType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="DOUBLE_POINTS">Double Points</option>
            <option value="BONUS_POINTS">Bonus Points</option>
            <option value="CATEGORY_MULTIPLIER">Category Multiplier</option>
            <option value="SPEND_THRESHOLD">Spend Threshold</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Campaigns List -->
    <div class="p-6">
      <div v-if="isLoading" class="text-center py-12">
        <Loader2 class="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
        <p class="text-gray-600">Loading campaigns...</p>
      </div>

      <div v-else-if="filteredCampaigns.length === 0" class="text-center py-12">
        <Zap class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
        <p class="text-gray-600 mb-4">Create campaigns to boost customer engagement</p>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
        >
          <Plus class="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="campaign in filteredCampaigns"
          :key="campaign.id"
          class="border rounded-lg p-6 hover:shadow-md transition-shadow"
          :class="getCampaignBorderClass(campaign)"
        >
          <div class="flex items-start justify-between">
            <!-- Campaign Info -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ campaign.name }}</h3>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="getStatusBadgeClass(campaign)"
                >
                  {{ getCampaignStatus(campaign) }}
                </span>
                <span
                  class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                >
                  {{ getCampaignTypeLabel(campaign.type) }}
                </span>
              </div>

              <p v-if="campaign.description" class="text-gray-600 text-sm mb-4">
                {{ campaign.description }}
              </p>

              <!-- Campaign Details -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div class="text-xs text-gray-500 mb-1">Start Date</div>
                  <div class="text-sm font-medium text-gray-900">{{ formatDate(campaign.startDate) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-1">End Date</div>
                  <div class="text-sm font-medium text-gray-900">{{ formatDate(campaign.endDate) }}</div>
                </div>
                <div v-if="campaign.multiplier">
                  <div class="text-xs text-gray-500 mb-1">Multiplier</div>
                  <div class="text-sm font-medium text-blue-600">{{ campaign.multiplier }}x</div>
                </div>
                <div v-if="campaign.pointsBonus">
                  <div class="text-xs text-gray-500 mb-1">Bonus Points</div>
                  <div class="text-sm font-medium text-green-600">+{{ campaign.pointsBonus }}</div>
                </div>
                <div v-if="campaign.minSpend">
                  <div class="text-xs text-gray-500 mb-1">Min Spend</div>
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(campaign.minSpend) }}</div>
                </div>
                <div v-if="campaign.categoryIds && campaign.categoryIds.length > 0">
                  <div class="text-xs text-gray-500 mb-1">Categories</div>
                  <div class="text-sm font-medium text-gray-900">{{ campaign.categoryIds.length }} selected</div>
                </div>
                <div v-if="campaign.maxUses">
                  <div class="text-xs text-gray-500 mb-1">Usage</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ campaign.usageCount || 0 }} / {{ campaign.maxUses }}
                  </div>
                </div>
                <div v-if="campaign.targetTiers && campaign.targetTiers.length > 0">
                  <div class="text-xs text-gray-500 mb-1">Target Tiers</div>
                  <div class="text-sm font-medium text-gray-900">{{ campaign.targetTiers.join(', ') }}</div>
                </div>
              </div>

              <!-- Progress Bar (if applicable) -->
              <div v-if="campaign.maxUses" class="mb-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    :style="{ width: `${getCampaignUsagePercent(campaign)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-6">
              <button
                @click="toggleCampaignStatus(campaign)"
                :disabled="isExpired(campaign)"
                class="p-2 rounded-lg transition-colors"
                :class="campaign.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'"
                :title="campaign.isActive ? 'Active' : 'Inactive'"
              >
                <component :is="campaign.isActive ? Power : PowerOff" class="w-5 h-5" />
              </button>
              <button
                @click="editCampaign(campaign)"
                class="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit Campaign"
              >
                <Edit2 class="w-5 h-5" />
              </button>
              <button
                @click="confirmDeleteCampaign(campaign)"
                class="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Campaign"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
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
        class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingCampaign ? 'Edit Campaign' : 'Create New Campaign' }}
            </h3>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveCampaign" class="space-y-4">
            <!-- Campaign Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g., Weekend Double Points"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Describe the campaign..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Campaign Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <select
                v-model="form.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type...</option>
                <option value="DOUBLE_POINTS">Double Points</option>
                <option value="BONUS_POINTS">Bonus Points</option>
                <option value="CATEGORY_MULTIPLIER">Category Multiplier</option>
                <option value="SPEND_THRESHOLD">Spend Threshold</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                {{ getCampaignTypeDescription(form.type) }}
              </p>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  v-model="form.startDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  v-model="form.endDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Campaign-specific fields -->
            <div v-if="form.type === 'DOUBLE_POINTS' || form.type === 'CATEGORY_MULTIPLIER'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Points Multiplier *
                </label>
                <input
                  v-model.number="form.multiplier"
                  type="number"
                  :required="form.type === 'DOUBLE_POINTS' || form.type === 'CATEGORY_MULTIPLIER'"
                  min="1"
                  step="0.5"
                  placeholder="2.0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div v-if="form.type === 'BONUS_POINTS' || form.type === 'SPEND_THRESHOLD'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Points *
                </label>
                <input
                  v-model.number="form.pointsBonus"
                  type="number"
                  :required="form.type === 'BONUS_POINTS' || form.type === 'SPEND_THRESHOLD'"
                  min="0"
                  placeholder="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div v-if="form.type === 'SPEND_THRESHOLD'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Spend (FCFA) *
                </label>
                <input
                  v-model.number="form.minSpend"
                  type="number"
                  :required="form.type === 'SPEND_THRESHOLD'"
                  min="0"
                  placeholder="10000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Optional Settings -->
            <div class="border-t border-gray-200 pt-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-4">Optional Settings</h4>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Max Uses (Leave empty for unlimited)
                  </label>
                  <input
                    v-model.number="form.maxUses"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Per Customer Limit
                  </label>
                  <input
                    v-model.number="form.maxUsesPerCustomer"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                :disabled="isSaving"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
                {{ editingCampaign ? 'Update Campaign' : 'Create Campaign' }}
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
            <h3 class="text-lg font-semibold text-gray-900">Delete Campaign</h3>
            <p class="text-sm text-gray-600 mt-1">This action cannot be undone</p>
          </div>
        </div>

        <p class="text-gray-700 mb-6">
          Are you sure you want to delete the <strong>{{ campaignToDelete?.name }}</strong> campaign?
        </p>

        <div class="flex items-center space-x-3">
          <button
            @click="deleteCampaign"
            :disabled="isDeleting"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin inline" />
            Delete Campaign
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
import type { LoyaltyCampaign } from '@/services/loyalty'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Zap,
  Loader2,
  AlertTriangle,
  Power,
  PowerOff
} from 'lucide-vue-next'

const loyaltyStore = useLoyaltyStore()

// State
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCampaign = ref<LoyaltyCampaign | null>(null)
const campaignToDelete = ref<LoyaltyCampaign | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const filterStatus = ref('all')
const filterType = ref('')

const form = ref({
  name: '',
  description: '',
  type: '' as LoyaltyCampaign['type'] | '',
  startDate: '',
  endDate: '',
  pointsBonus: 0,
  multiplier: 2.0,
  minSpend: 0,
  maxUses: null as number | null,
  maxUsesPerCustomer: null as number | null,
  isActive: true
})

// Computed
const filteredCampaigns = computed(() => {
  let campaigns = loyaltyStore.campaigns

  // Filter by status
  if (filterStatus.value !== 'all') {
    campaigns = campaigns.filter(c => {
      const status = getCampaignStatus(c)
      return status.toLowerCase() === filterStatus.value
    })
  }

  // Filter by type
  if (filterType.value) {
    campaigns = campaigns.filter(c => c.type === filterType.value)
  }

  // Sort by start date (newest first)
  return [...campaigns].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
})

// Methods
const openCreateModal = () => {
  editingCampaign.value = null
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  form.value = {
    name: '',
    description: '',
    type: '',
    startDate: today,
    endDate: nextWeek,
    pointsBonus: 0,
    multiplier: 2.0,
    minSpend: 0,
    maxUses: null,
    maxUsesPerCustomer: null,
    isActive: true
  }
  showModal.value = true
}

const editCampaign = (campaign: LoyaltyCampaign) => {
  editingCampaign.value = campaign
  form.value = {
    name: campaign.name,
    description: campaign.description || '',
    type: campaign.type,
    startDate: campaign.startDate.split('T')[0],
    endDate: campaign.endDate.split('T')[0],
    pointsBonus: campaign.pointsBonus || 0,
    multiplier: campaign.multiplier || 2.0,
    minSpend: campaign.minSpend || 0,
    maxUses: campaign.maxUses || null,
    maxUsesPerCustomer: campaign.maxUsesPerCustomer || null,
    isActive: campaign.isActive
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCampaign.value = null
}

const saveCampaign = async () => {
  isSaving.value = true
  try {
    const campaignData: any = {
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      isActive: form.value.isActive
    }

    // Add type-specific fields
    if (form.value.pointsBonus > 0) {
      campaignData.pointsBonus = form.value.pointsBonus
    }
    if (form.value.multiplier > 0) {
      campaignData.multiplier = form.value.multiplier
    }
    if (form.value.minSpend > 0) {
      campaignData.minSpend = form.value.minSpend
    }
    if (form.value.maxUses) {
      campaignData.maxUses = form.value.maxUses
    }
    if (form.value.maxUsesPerCustomer) {
      campaignData.maxUsesPerCustomer = form.value.maxUsesPerCustomer
    }

    if (editingCampaign.value) {
      await loyaltyStore.updateCampaign(editingCampaign.value.id, campaignData)
    } else {
      await loyaltyStore.createCampaign({ ...campaignData, usageCount: 0 })
    }

    closeModal()
  } catch (error) {
    console.error('Failed to save campaign:', error)
    alert('Failed to save campaign. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const toggleCampaignStatus = async (campaign: LoyaltyCampaign) => {
  await loyaltyStore.updateCampaign(campaign.id, { isActive: !campaign.isActive })
}

const confirmDeleteCampaign = (campaign: LoyaltyCampaign) => {
  campaignToDelete.value = campaign
  showDeleteModal.value = true
}

const deleteCampaign = async () => {
  if (!campaignToDelete.value) return

  isDeleting.value = true
  try {
    await loyaltyStore.deleteCampaign(campaignToDelete.value.id)
    showDeleteModal.value = false
    campaignToDelete.value = null
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    alert('Failed to delete campaign. Please try again.')
  } finally {
    isDeleting.value = false
  }
}

const getCampaignStatus = (campaign: LoyaltyCampaign): string => {
  const now = new Date()
  const start = new Date(campaign.startDate)
  const end = new Date(campaign.endDate)

  if (!campaign.isActive) return 'Inactive'
  if (now < start) return 'Scheduled'
  if (now > end) return 'Expired'
  return 'Active'
}

const isExpired = (campaign: LoyaltyCampaign): boolean => {
  return new Date() > new Date(campaign.endDate)
}

const getStatusBadgeClass = (campaign: LoyaltyCampaign): string => {
  const status = getCampaignStatus(campaign)
  const classes: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Expired': 'bg-gray-100 text-gray-600',
    'Inactive': 'bg-yellow-100 text-yellow-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const getCampaignBorderClass = (campaign: LoyaltyCampaign): string => {
  const status = getCampaignStatus(campaign)
  if (status === 'Active') return 'border-green-200 bg-green-50/30'
  if (status === 'Scheduled') return 'border-blue-200 bg-blue-50/30'
  return 'border-gray-200'
}

const getCampaignTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'DOUBLE_POINTS': 'Double Points',
    'BONUS_POINTS': 'Bonus Points',
    'CATEGORY_MULTIPLIER': 'Category Multiplier',
    'SPEND_THRESHOLD': 'Spend Threshold'
  }
  return labels[type] || type
}

const getCampaignTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    'DOUBLE_POINTS': 'Award double points on all purchases during campaign period',
    'BONUS_POINTS': 'Award fixed bonus points on any purchase',
    'CATEGORY_MULTIPLIER': 'Apply points multiplier to specific product categories',
    'SPEND_THRESHOLD': 'Award bonus points when customer spends above threshold'
  }
  return descriptions[type] || ''
}

const getCampaignUsagePercent = (campaign: LoyaltyCampaign): number => {
  if (!campaign.maxUses) return 0
  const used = campaign.usageCount || 0
  return Math.min((used / campaign.maxUses) * 100, 100)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  await loyaltyStore.fetchCampaigns()
  isLoading.value = false
})
</script>
