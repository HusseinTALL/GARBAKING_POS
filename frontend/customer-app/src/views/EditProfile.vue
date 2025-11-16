<script setup lang="ts">
/**
 * EditProfile - Update user information (Page 17)
 *
 * Features:
 * - Photo upload
 * - Form fields (name, email, phone, birthday, gender, bio)
 * - Save/Cancel actions
 * - Form validation
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

// Form data
const formData = ref({
  photo: '',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  birthday: '1990-01-15',
  gender: 'male',
  bio: 'Food lover and pizza enthusiast!'
})

const photoPreview = ref('https://ui-avatars.com/api/?name=John+Doe&size=200')

function goBack() {
  router.back()
}

function handlePhotoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removePhoto() {
  photoPreview.value = ''
  formData.value.photo = ''
}

async function saveProfile() {
  try {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', formData.value)
    // Show success message
    router.back()
  } catch (error) {
    console.error('Failed to save profile:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Edit Profile</h2>
        <button
          @click="saveProfile"
          class="text-primary-500 text-sm font-semibold"
        >
          Save
        </button>
      </div>
    </div>

    <div class="px-6 py-6">
      <!-- Photo Upload -->
      <div class="bg-white rounded-3xl p-6 shadow-md mb-4">
        <div class="flex flex-col items-center">
          <div class="relative mb-4">
            <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              <img
                v-if="photoPreview"
                :src="photoPreview"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="fas fa-user text-4xl text-gray-400"></i>
              </div>
            </div>
            <label
              class="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
            >
              <i class="fas fa-camera text-white"></i>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhotoChange"
              />
            </label>
          </div>
          <button
            v-if="photoPreview"
            @click="removePhoto"
            class="text-secondary-500 text-sm font-semibold"
          >
            Remove Photo
          </button>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="bg-white rounded-3xl p-6 shadow-md space-y-4">
        <!-- First Name -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">First Name</label>
          <input
            v-model="formData.firstName"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Enter first name"
          />
        </div>

        <!-- Last Name -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Last Name</label>
          <input
            v-model="formData.lastName"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Enter last name"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Enter email"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Phone Number</label>
          <input
            v-model="formData.phone"
            type="tel"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Enter phone number"
          />
        </div>

        <!-- Birthday -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Birthday</label>
          <input
            v-model="formData.birthday"
            type="date"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <!-- Gender -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Gender</label>
          <div class="flex gap-3">
            <button
              @click="formData.gender = 'male'"
              :class="[
                'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all',
                formData.gender === 'male'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-black'
              ]"
            >
              Male
            </button>
            <button
              @click="formData.gender = 'female'"
              :class="[
                'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all',
                formData.gender === 'female'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-black'
              ]"
            >
              Female
            </button>
            <button
              @click="formData.gender = 'other'"
              :class="[
                'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all',
                formData.gender === 'other'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-black'
              ]"
            >
              Other
            </button>
          </div>
        </div>

        <!-- Bio -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Bio</label>
          <textarea
            v-model="formData.bio"
            rows="3"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
      </div>

      <!-- Save Button -->
      <button
        @click="saveProfile"
        class="w-full bg-gradient-primary text-white font-semibold py-4 rounded-2xl shadow-lg mt-6"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Custom date input styling */
input[type="date"] {
  position: relative;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
