#!/bin/bash

# Customer App Screen Generator
# Quick script to scaffold a new screen with boilerplate code

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Customer App Screen Generator${NC}\n"

# Get screen name
read -p "Enter screen name (e.g., SignIn, RestaurantDetail): " screen_name

if [ -z "$screen_name" ]; then
    echo -e "${YELLOW}❌ Screen name is required${NC}"
    exit 1
fi

# Convert to proper case if needed
screen_name="$(tr '[:lower:]' '[:upper:]' <<< ${screen_name:0:1})${screen_name:1}"

# Get screen type
echo -e "\nSelect screen type:"
echo "1) Full screen (default)"
echo "2) Modal"
echo "3) Bottom sheet"
read -p "Choice [1]: " screen_type
screen_type=${screen_type:-1}

# Get route path
read -p "Route path (e.g., /sign-in): " route_path

if [ -z "$route_path" ]; then
    route_path=$(echo "/$screen_name" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
fi

# Create view file
view_file="src/views/${screen_name}.vue"

echo -e "\n${BLUE}📝 Creating ${view_file}...${NC}"

cat > "$view_file" << 'EOF'
<!--
  <%= SCREEN_NAME %> View
  Description: [Add description here]
  Features: [List key features]
-->

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <!-- Back button -->
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Title -->
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          <%= SCREEN_NAME %>
        </h1>

        <!-- Right action (optional) -->
        <div class="w-10"></div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- TODO: Add your content here -->
      <div class="text-center py-16">
        <p class="text-gray-600 dark:text-gray-400">
          <%= SCREEN_NAME %> content goes here
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { isDark } = useTheme()

// State
const isLoading = ref(false)

// Methods

// Lifecycle
onMounted(() => {
  // Initialize screen
})
</script>

<style scoped>
/* Add custom styles here */
</style>
EOF

# Replace placeholders
sed -i '' "s/<%= SCREEN_NAME %>/${screen_name}/g" "$view_file"

echo -e "${GREEN}✅ View created${NC}"

# Add route
echo -e "\n${BLUE}🛣️  Adding route...${NC}"

route_name="$screen_name"
route_import="import ${route_name} from '@/views/${screen_name}.vue'"

# Create route object
route_object=$(cat <<EOF

  {
    path: '${route_path}',
    name: '${route_name}',
    component: ${route_name},
    meta: {
      title: '${screen_name}',
      showHeader: true,
      showBackButton: true,
      transition: 'slide-left'
    }
  },
EOF
)

echo -e "${YELLOW}⚠️  Manual step required:${NC}"
echo -e "Add this import to ${BLUE}src/router/index.ts${NC}:"
echo -e "${GREEN}${route_import}${NC}"
echo ""
echo -e "Add this route object to the routes array:"
echo -e "${GREEN}${route_object}${NC}"

# Create translation keys
echo -e "\n${BLUE}🌍 Creating translation keys...${NC}"

en_key="${screen_name,,}"
en_keys=$(cat <<EOF

  "$en_key": {
    "title": "$screen_name",
    "subtitle": "Subtitle here",
    "description": "Description here"
  },
EOF
)

echo -e "${YELLOW}⚠️  Manual step required:${NC}"
echo -e "Add these keys to ${BLUE}src/assets/i18n/en.json${NC} and ${BLUE}fr.json${NC}:"
echo -e "${GREEN}${en_keys}${NC}"

# Summary
echo -e "\n${GREEN}✨ Screen scaffolding complete!${NC}\n"
echo -e "Created:"
echo -e "  📄 ${view_file}"
echo -e "\nNext steps:"
echo -e "  1. Add route to src/router/index.ts"
echo -e "  2. Add translations to i18n files"
echo -e "  3. Implement screen logic and UI"
echo -e "  4. Test in light and dark modes\n"
echo -e "${BLUE}Happy coding! 🚀${NC}\n"
EOF

chmod +x "$file_path"
