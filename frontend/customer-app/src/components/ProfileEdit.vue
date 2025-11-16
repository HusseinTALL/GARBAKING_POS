<!--
  ProfileEdit Component - Edit user profile information
  Form for updating name, email, phone, and avatar
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
      {{ $t('profile.editProfile') }}
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Avatar Upload -->
      <div class="flex flex-col items-center mb-6">
        <div class="relative">
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden"
          >
            <img
              v-if="formData.avatar"
              :src="formData.avatar"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>
              {{ getInitials(formData.name) }}
            </span>
          </div>

          <!-- Change Avatar Button -->
          <button
            type="button"
            @click="triggerFileInput"
            class="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>

          <!-- Hidden File Input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('profile.clickToChangeAvatar') }}
        </p>
      </div>

      <!-- Full Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('profile.fullName') }} *
        </label>
        <input
          v-model="formData.name"
          type="text"
          required
          :placeholder="$t('profile.fullNamePlaceholder')"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('profile.email') }}
        </label>
        <input
          v-model="formData.email"
          type="email"
          :placeholder="$t('profile.emailPlaceholder')"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('profile.phone') }}
        </label>
        <input
          v-model="formData.phone"
          type="tel"
          :placeholder="$t('profile.phonePlaceholder')"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <!-- Date of Birth -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('profile.dateOfBirth') }}
        </label>
        <input
          v-model="formData.dateOfBirth"
          type="date"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="handleCancel"
          class="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {{ $t('buttons.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isSaving ? $t('profile.saving') : $t('buttons.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useProfileStore } from '@/stores/profile'

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancelled'): void
}>()

const { t } = useI18n()
const toast = useToast()
const profileStore = useProfileStore()

// State
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  avatar: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)

// Methods
function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidImageType'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'))
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  // Validate required fields
  if (!formData.name.trim()) {
    toast.error(t('errors.name_required'))
    return
  }

  isSaving.value = true

  try {
    // Update profile in store
    profileStore.updateProfile({
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      avatar: formData.avatar || undefined
    })

    toast.success(t('profile.profileUpdated'))
    emit('saved')
  } catch (error: any) {
    console.error('Error saving profile:', error)
    toast.error(t('profile.updateFailed'))
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  // Reset form to original values
  loadProfileData()
  emit('cancelled')
}

function loadProfileData() {
  formData.name = profileStore.profile.name || ''
  formData.email = profileStore.profile.email || ''
  formData.phone = profileStore.profile.phone || ''
  formData.dateOfBirth = profileStore.profile.dateOfBirth || ''
  formData.avatar = profileStore.profile.avatar || ''
}

// Lifecycle
onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
/* Custom date input styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
}

@media (prefers-color-scheme: dark) {
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
  }
}
</style>
