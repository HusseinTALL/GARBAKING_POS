<!--
  Promotional banner component
  Dark gradient card with promo content
-->

<template>
  <div class="bg-gradient-to-br from-green-800 to-green-600 rounded-2xl p-5 shadow-lg overflow-hidden relative">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
    </div>

    <div class="relative z-10 flex items-center justify-between">
      <div class="flex-1">
        <h3 class="text-white font-bold text-lg mb-1">{{ title }}</h3>
        <p class="text-white/90 text-sm mb-3">{{ description }}</p>
        <button
          @click="$emit('click')"
          class="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-1"
        >
          {{ ctaText }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div v-if="image" class="ml-4">
        <img :src="image" :alt="title" class="w-24 h-24 object-contain" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  ctaText: string
  image?: string
}

defineProps<Props>()

defineEmits<{
  'click': []
}>()
</script>
