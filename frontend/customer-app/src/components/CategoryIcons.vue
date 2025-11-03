<!--
  Enhanced category icons with smooth animations
  Features: active indicators, smooth scrolling, better visual hierarchy
-->

<template>
  <div class="relative">
    <!-- Fade edges for scroll indication -->
    <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
    <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
    
    <div 
      ref="scrollContainer"
      class="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-smooth"
      @scroll="handleScroll"
    >
      <div class="flex gap-5 py-3">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'flex flex-col items-center flex-shrink-0 transition-all duration-300 relative group',
            selectedCategory === category.id ? 'scale-105' : 'hover:scale-105'
          ]"
        >
          <!-- Icon Container -->
          <div class="relative">
            <div
              :class="[
                'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2.5 transition-all duration-300 relative overflow-hidden',
                selectedCategory === category.id
                  ? 'bg-primary-500 shadow-lg shadow-primary-500/30'
                  : 'bg-white border-2 border-gray-100 shadow-sm group-hover:border-primary-200 group-hover:shadow-md'
              ]"
            >
              <!-- Background Pattern -->
              <div 
                v-if="selectedCategory === category.id"
                class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              ></div>
              
              <!-- Emoji -->
              <span class="relative z-10 transform transition-transform group-hover:scale-110">
                {{ category.emoji }}
              </span>
              
              <!-- Pulse effect on active -->
              <div 
                v-if="selectedCategory === category.id"
                class="absolute inset-0 rounded-2xl bg-primary-400 animate-ping opacity-20"
              ></div>
            </div>
            
            <!-- Active Indicator Dot -->
            <div 
              v-if="selectedCategory === category.id"
              class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"
            ></div>
          </div>

          <!-- Label -->
          <span
            :class="[
              'text-xs font-semibold transition-all duration-300',
              selectedCategory === category.id 
                ? 'text-text-DEFAULT' 
                : 'text-text-secondary group-hover:text-text-DEFAULT'
            ]"
          >
            {{ category.name }}
          </span>
          
          <!-- Count Badge (optional) -->
          <span 
            v-if="category.count"
            :class="[
              'text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full transition-all',
              selectedCategory === category.id
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ category.count }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Scroll Indicators (optional dots) -->
    <div 
      v-if="showScrollIndicators && totalPages > 1"
      class="flex justify-center gap-1.5 mt-3"
    >
      <div
        v-for="page in totalPages"
        :key="page"
        :class="[
          'h-1 rounded-full transition-all duration-300',
          currentPage === page - 1 ? 'w-6 bg-primary-500' : 'w-1 bg-gray-300'
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Category {
  id: string
  name: string
  emoji: string
  count?: number
}

interface Props {
  categories: Category[]
  selectedCategory: string
  showScrollIndicators?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showScrollIndicators: true
})

const emit = defineEmits<{
  'select': [categoryId: string]
}>()

// Refs
const scrollContainer = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const totalPages = ref(1)

// Methods
const selectCategory = (categoryId: string) => {
  emit('select', categoryId)
  
  // Smooth scroll to selected category
  if (scrollContainer.value) {
    const selectedButton = scrollContainer.value.querySelector(`button:has([data-category="${categoryId}"])`)
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }
}

const handleScroll = () => {
  if (!scrollContainer.value) return
  
  const container = scrollContainer.value
  const scrollWidth = container.scrollWidth - container.clientWidth
  const scrollPosition = container.scrollLeft
  
  // Calculate current page
  const pageWidth = container.clientWidth * 0.8
  currentPage.value = Math.round(scrollPosition / pageWidth)
}

const calculatePages = () => {
  if (!scrollContainer.value) return
  
  const container = scrollContainer.value
  const contentWidth = container.scrollWidth
  const containerWidth = container.clientWidth
  
  totalPages.value = Math.ceil(contentWidth / (containerWidth * 0.8))
}

// Lifecycle
onMounted(() => {
  calculatePages()
  window.addEventListener('resize', calculatePages)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculatePages)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>