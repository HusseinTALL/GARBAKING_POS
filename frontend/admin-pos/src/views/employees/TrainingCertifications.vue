<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Training & Certifications
      </h1>
      <p class="text-gray-400 mt-1">Manage employee training programs and certifications</p>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center py-16">
          <GraduationCap class="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h2 class="text-2xl font-bold text-white mb-2">Training & Certifications</h2>
          <p class="text-gray-400">Training and certification management is available via API</p>
          <p class="text-sm text-gray-500 mt-4">
            Training: POST /api/employees/training/assign<br />
            Certifications: POST /api/employees/training/certifications<br />
            Auto-expiration tracking with 30-day warnings<br />
            Complete workflow: Assign → In Progress → Complete
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
</script>
