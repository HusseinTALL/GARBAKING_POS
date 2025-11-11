<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Performance Reviews
      </h1>
      <p class="text-gray-400 mt-1">Manage employee performance evaluations</p>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center py-16">
          <Award class="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h2 class="text-2xl font-bold text-white mb-2">Performance Reviews</h2>
          <p class="text-gray-400">Performance review functionality is available via API</p>
          <p class="text-sm text-gray-500 mt-4">
            Endpoints: POST /api/employees/performance-reviews<br />
            Complete workflow: Create → Complete → Acknowledge<br />
            8 performance metrics: Quality, Productivity, Attendance, Teamwork, Communication, Customer Service, Initiative, Leadership
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Award } from 'lucide-vue-next'
</script>
