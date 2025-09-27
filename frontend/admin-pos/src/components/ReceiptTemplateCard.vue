<!--
  Receipt template card component
  Displays template information and available actions
-->

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Template Header -->
        <div class="flex items-center space-x-2 mb-2">
          <h4 class="font-medium text-gray-900">{{ template.name }}</h4>
          <span v-if="template.isDefault" class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
            Par défaut
          </span>
          <span :class="[
            'text-xs px-2 py-1 rounded-full',
            getTypeClasses(template.type)
          ]">
            {{ getTypeLabel(template.type) }}
          </span>
        </div>

        <!-- Template Details -->
        <div class="space-y-1 text-sm text-gray-600">
          <div class="flex items-center space-x-4">
            <span>Largeur: {{ template.config.width }} car.</span>
            <span>Copies: {{ template.config.formatting.copies }}</span>
          </div>

          <div class="flex items-center space-x-4">
            <span>Taille: {{ template.config.formatting.fontSize }}</span>
            <span v-if="template.config.formatting.cutPaper">Découpe auto</span>
            <span v-if="template.config.formatting.openDrawer">Ouvre tiroir</span>
          </div>

          <div v-if="template.config.barcode?.enabled" class="flex items-center space-x-2">
            <Barcode class="w-4 h-4" />
            <span>Code-barres {{ template.config.barcode.type }}</span>
          </div>
        </div>

        <!-- Business Info Preview -->
        <div class="mt-3 p-2 bg-gray-50 rounded text-xs">
          <div class="font-medium">{{ template.config.header.businessName }}</div>
          <div class="text-gray-600">{{ template.config.header.address[0] }}</div>
        </div>

        <!-- Last Updated -->
        <div class="mt-2 text-xs text-gray-500">
          Modifié {{ formatDate(template.updatedAt) }}
        </div>
      </div>

      <!-- Actions Menu -->
      <div class="relative ml-3">
        <button
          @click="showMenu = !showMenu"
          class="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        <div
          v-if="showMenu"
          class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
          @click.stop
        >
          <button
            @click="handleEdit"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
          >
            <Edit class="mr-3 w-4 h-4" />
            Modifier
          </button>

          <button
            @click="handleDuplicate"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
          >
            <Copy class="mr-3 w-4 h-4" />
            Dupliquer
          </button>

          <button
            @click="handleTest"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
          >
            <Printer class="mr-3 w-4 h-4" />
            Test d'impression
          </button>

          <div class="border-t border-gray-100 my-1"></div>

          <button
            v-if="!template.isDefault"
            @click="handleSetDefault"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
          >
            <Star class="mr-3 w-4 h-4" />
            Définir par défaut
          </button>

          <button
            @click="handleExport"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
          >
            <Download class="mr-3 w-4 h-4" />
            Exporter
          </button>

          <div class="border-t border-gray-100 my-1"></div>

          <button
            v-if="!template.isDefault"
            @click="handleDelete"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash class="mr-3 w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="showPreview" class="mt-4 border-t border-gray-200 pt-4">
      <h5 class="text-sm font-medium text-gray-700 mb-2">Aperçu</h5>
      <div class="bg-black text-green-400 font-mono text-xs p-3 rounded overflow-x-auto">
        <div class="whitespace-pre">{{ generatePreview() }}</div>
      </div>
    </div>

    <!-- Toggle Preview -->
    <button
      @click="showPreview = !showPreview"
      class="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
    >
      {{ showPreview ? 'Masquer l\'aperçu' : 'Voir l\'aperçu' }}
      <component :is="showPreview ? ChevronUp : ChevronDown" class="ml-1 w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReceiptTemplate } from '@/stores/receipts'
import { Barcode, MoreVertical, Edit, Copy, Printer, Star, Download, Trash, ChevronUp, ChevronDown } from 'lucide-vue-next'

// Props
interface Props {
  template: ReceiptTemplate
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'edit': [template: ReceiptTemplate]
  'duplicate': [template: ReceiptTemplate]
  'test': [template: ReceiptTemplate]
  'delete': [templateId: string]
}>()

// Local state
const showMenu = ref(false)
const showPreview = ref(false)

// Methods
const getTypeLabel = (type: string): string => {
  const labels = {
    'SALE': 'Vente',
    'REFUND': 'Remboursement',
    'REPRINT': 'Réimpression',
    'KITCHEN': 'Cuisine',
    'BAR': 'Bar',
    'CUSTOMER_COPY': 'Copie client',
    'MERCHANT_COPY': 'Copie commerçant'
  }
  return labels[type] || type
}

const getTypeClasses = (type: string): string => {
  const classes = {
    'SALE': 'bg-green-100 text-green-600',
    'REFUND': 'bg-red-100 text-red-600',
    'REPRINT': 'bg-gray-100 text-gray-600',
    'KITCHEN': 'bg-orange-100 text-orange-600',
    'BAR': 'bg-purple-100 text-purple-600',
    'CUSTOMER_COPY': 'bg-blue-100 text-blue-600',
    'MERCHANT_COPY': 'bg-indigo-100 text-indigo-600'
  }
  return classes[type] || classes['SALE']
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'aujourd\'hui'
  } else if (diffDays === 1) {
    return 'hier'
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jours`
  } else {
    return date.toLocaleDateString('fr-FR')
  }
}

const generatePreview = (): string => {
  const { config } = props.template
  const width = config.width
  let preview = ''

  // Center text function
  const centerText = (text: string): string => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(spaces) + text
  }

  // Header
  preview += centerText(config.header.businessName) + '\n'
  preview += centerText(config.header.address[0]) + '\n'
  if (config.header.phone) {
    preview += centerText(`Tel: ${config.header.phone}`) + '\n'
  }
  preview += '='.repeat(width) + '\n'

  // Sample content based on type
  if (props.template.type === 'SALE') {
    preview += 'Reçu #: R240001234\n'
    preview += 'Date: 22/09/2024 14:30\n'
    preview += 'Caissier: Jean Dupont\n'
    preview += '-'.repeat(width) + '\n'
    preview += 'Café                           2,500 FCFA\n'
    preview += 'Croissant                      1,000 FCFA\n'
    preview += '-'.repeat(width) + '\n'
    preview += 'Sous-total:                    3,500 FCFA\n'
    preview += 'TVA:                             630 FCFA\n'
    preview += '='.repeat(width) + '\n'
    preview += 'TOTAL:                         4,130 FCFA\n'
  } else if (props.template.type === 'KITCHEN') {
    preview += 'COMMANDE CUISINE\n'
    preview += 'Ticket #: K240001\n'
    preview += 'Table 5\n'
    preview += '14:30\n'
    preview += '='.repeat(width) + '\n'
    preview += '2x Burger Royal\n'
    preview += '   Sans oignons\n'
    preview += '1x Salade César\n'
  }

  preview += '='.repeat(width) + '\n'
  preview += centerText(config.footer.thankYouMessage) + '\n'

  return preview
}

const handleEdit = () => {
  showMenu.value = false
  emit('edit', props.template)
}

const handleDuplicate = () => {
  showMenu.value = false
  emit('duplicate', props.template)
}

const handleTest = () => {
  showMenu.value = false
  emit('test', props.template)
}

const handleSetDefault = () => {
  showMenu.value = false
  // Implementation for setting default template
  console.log('Set default template:', props.template.id)
}

const handleExport = () => {
  showMenu.value = false

  // Export template as JSON
  const dataStr = JSON.stringify(props.template, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `template-${props.template.name.toLowerCase().replace(/\s+/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleDelete = () => {
  showMenu.value = false
  if (confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${props.template.name}" ?`)) {
    emit('delete', props.template.id)
  }
}

// Close menu when clicking outside
document.addEventListener('click', () => {
  showMenu.value = false
})
</script>

<style scoped>
/* Smooth transitions for interactive elements */
.transition-shadow {
  transition: box-shadow 0.2s ease;
}

/* Monospace font for receipt preview */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>