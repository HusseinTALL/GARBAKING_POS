<!--
  Enhanced Menu item management modal with comprehensive features
  - Image upload (file + URL)
  - Variant management (sizes, extras)
  - Nutritional information
  - Inventory/stock tracking
  - Preparation time
  - Menu scheduling
-->

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[95vh] overflow-hidden my-4">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50 sticky top-0 z-10">
        <div>
          <h2 class="text-2xl font-bold text-white">
            {{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}
          </h2>
          <p class="text-sm text-gray-400 mt-1">{{ isEditing ? 'Update' : 'Create' }} menu item with full details</p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-700 bg-gray-800/30">
        <div class="flex px-6 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4 inline-block mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="handleSubmit" class="flex flex-col max-h-[calc(95vh-160px)]">
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Basic Information Tab -->
          <div v-show="activeTab === 'basic'" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-6">
                <!-- Item Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="input w-full"
                    placeholder="e.g., Classic Burger, Cappuccino"
                    :class="{ 'border-red-500': errors.name }"
                  />
                  <p v-if="errors.name" class="text-red-400 text-sm mt-1">{{ errors.name }}</p>
                </div>

                <!-- SKU -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    SKU *
                  </label>
                  <input
                    v-model="form.sku"
                    type="text"
                    required
                    class="input w-full"
                    placeholder="e.g., BRG001, COF002"
                    :class="{ 'border-red-500': errors.sku }"
                  />
                  <p class="text-gray-400 text-sm mt-1">Unique product identifier</p>
                  <p v-if="errors.sku" class="text-red-400 text-sm mt-1">{{ errors.sku }}</p>
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    v-model="form.categoryId"
                    required
                    class="input w-full"
                    :class="{ 'border-red-500': errors.categoryId }"
                  >
                    <option value="">Select a category</option>
                    <option
                      v-for="category in menuStore.categoriesForSelect"
                      :key="category.value"
                      :value="category.value"
                    >
                      {{ category.label }}
                    </option>
                  </select>
                  <p v-if="errors.categoryId" class="text-red-400 text-sm mt-1">{{ errors.categoryId }}</p>
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    class="input w-full resize-none"
                    placeholder="Describe the item, ingredients, preparation method..."
                    :class="{ 'border-red-500': errors.description }"
                  ></textarea>
                  <p v-if="errors.description" class="text-red-400 text-sm mt-1">{{ errors.description }}</p>
                </div>

                <!-- Preparation Time -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <input
                    v-model.number="form.prepTime"
                    type="number"
                    min="0"
                    class="input w-full"
                    placeholder="15"
                  />
                  <p class="text-gray-400 text-sm mt-1">Estimated time to prepare this item</p>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-6">
                <!-- Pricing -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-white">Pricing</h3>

                  <!-- Sale Price -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Sale Price *
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        v-model.number="form.price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        class="input w-full pl-8"
                        placeholder="0.00"
                        :class="{ 'border-red-500': errors.price }"
                      />
                    </div>
                    <p v-if="errors.price" class="text-red-400 text-sm mt-1">{{ errors.price }}</p>
                  </div>

                  <!-- Cost Price -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Cost Price (Optional)
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        v-model.number="form.cost"
                        type="number"
                        step="0.01"
                        min="0"
                        class="input w-full pl-8"
                        placeholder="0.00"
                        :class="{ 'border-red-500': errors.cost }"
                      />
                    </div>
                    <p class="text-gray-400 text-sm mt-1">For profit margin calculations</p>
                    <p v-if="errors.cost" class="text-red-400 text-sm mt-1">{{ errors.cost }}</p>
                  </div>

                  <!-- Profit Margin Display -->
                  <div v-if="form.price && form.cost" class="p-3 bg-gray-700 rounded-lg">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-300">Profit Margin:</span>
                      <span :class="profitMarginColor">{{ profitMarginText }}</span>
                    </div>
                  </div>
                </div>

                <!-- Status Toggles -->
                <div class="space-y-3">
                  <label class="flex items-center gap-3">
                    <input
                      v-model="form.isAvailable"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm font-medium text-gray-300">
                      Available for ordering
                    </span>
                  </label>
                  <label class="flex items-center gap-3">
                    <input
                      v-model="form.isFeatured"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm font-medium text-gray-300">
                      Featured item
                    </span>
                  </label>
                </div>

                <!-- Dietary Flags -->
                <div>
                  <h4 class="text-sm font-medium text-gray-300 mb-3">Dietary Information</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.isVegetarian"
                        type="checkbox"
                        class="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span class="text-sm text-gray-300">Vegetarian</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.isVegan"
                        type="checkbox"
                        class="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span class="text-sm text-gray-300">Vegan</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.isGlutenFree"
                        type="checkbox"
                        class="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span class="text-sm text-gray-300">Gluten-Free</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        v-model="form.isSpicy"
                        type="checkbox"
                        class="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span class="text-sm text-gray-300">Spicy</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Image Tab -->
          <div v-show="activeTab === 'image'" class="space-y-6">
            <div class="max-w-2xl mx-auto">
              <!-- Image Preview -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-300 mb-3">
                  Item Image
                </label>
                <div v-if="form.imageUrl || imagePreview" class="relative">
                  <img
                    :src="imagePreview || form.imageUrl"
                    alt="Item preview"
                    class="w-full h-80 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    @click="clearImage"
                    class="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </div>
                <div
                  v-else
                  class="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-700/50"
                >
                  <div class="text-center">
                    <ImageIcon class="w-16 h-16 text-gray-500 mx-auto mb-3" />
                    <p class="text-gray-400 text-sm">No image uploaded</p>
                  </div>
                </div>
              </div>

              <!-- Upload Methods -->
              <div class="space-y-4">
                <!-- File Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Upload Image File
                  </label>
                  <div class="flex items-center gap-3">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      @change="handleFileSelect"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.fileInput.click()"
                      class="btn btn-secondary flex-1"
                    >
                      <Upload class="w-4 h-4 mr-2" />
                      Choose File
                    </button>
                    <span v-if="selectedFile" class="text-sm text-gray-400">
                      {{ selectedFile.name }}
                    </span>
                  </div>
                  <p class="text-gray-400 text-sm mt-1">JPG, PNG, or WebP (max 5MB)</p>
                </div>

                <div class="text-center text-gray-500 text-sm">OR</div>

                <!-- Image URL Input -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    v-model="form.imageUrl"
                    type="url"
                    class="input w-full"
                    placeholder="https://example.com/image.jpg"
                    :class="{ 'border-red-500': errors.imageUrl }"
                  />
                  <p v-if="errors.imageUrl" class="text-red-400 text-sm mt-1">{{ errors.imageUrl }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Variants Tab -->
          <div v-show="activeTab === 'variants'" class="space-y-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-white">Size Variants</h3>
                <p class="text-sm text-gray-400">Define different sizes and pricing</p>
              </div>
              <button
                type="button"
                @click="addVariant"
                class="btn btn-primary"
              >
                <Plus class="w-4 h-4 mr-2" />
                Add Variant
              </button>
            </div>

            <!-- Variants List -->
            <div v-if="form.variants.length > 0" class="space-y-3">
              <div
                v-for="(variant, index) in form.variants"
                :key="index"
                class="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-400 mb-1">
                      Variant Name *
                    </label>
                    <input
                      v-model="variant.name"
                      type="text"
                      required
                      class="input w-full"
                      placeholder="e.g., Small, Medium, Large"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-400 mb-1">
                      Price Modifier
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        v-model.number="variant.priceModifier"
                        type="number"
                        step="0.01"
                        class="input w-full pl-8"
                        placeholder="0.00"
                      />
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Add/subtract from base price</p>
                  </div>
                  <div class="flex items-end gap-2">
                    <label class="flex items-center gap-2 flex-1">
                      <input
                        v-model="variant.isDefault"
                        type="checkbox"
                        @change="setDefaultVariant(index)"
                        class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                      />
                      <span class="text-xs text-gray-300">Default</span>
                    </label>
                    <button
                      type="button"
                      @click="removeVariant(index)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
              <Layers class="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p class="text-gray-400 text-sm">No variants defined</p>
              <p class="text-gray-500 text-xs mt-1">Add size options like Small, Medium, Large</p>
            </div>
          </div>

          <!-- Nutrition Tab -->
          <div v-show="activeTab === 'nutrition'" class="space-y-6">
            <div class="max-w-3xl mx-auto">
              <h3 class="text-lg font-semibold text-white mb-4">Nutritional Information</h3>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Calories
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.calories"
                    type="number"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Protein (g)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.protein"
                    type="number"
                    step="0.1"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.carbs"
                    type="number"
                    step="0.1"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Fat (g)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.fat"
                    type="number"
                    step="0.1"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Fiber (g)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.fiber"
                    type="number"
                    step="0.1"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Sugar (g)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.sugar"
                    type="number"
                    step="0.1"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Sodium (mg)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.sodium"
                    type="number"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Cholesterol (mg)
                  </label>
                  <input
                    v-model.number="form.nutritionInfo.cholesterol"
                    type="number"
                    min="0"
                    class="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Serving Size
                  </label>
                  <input
                    v-model="form.nutritionInfo.servingSize"
                    type="text"
                    class="input w-full"
                    placeholder="e.g., 1 cup, 250g"
                  />
                </div>
              </div>

              <!-- Allergens -->
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Allergens
                </label>
                <textarea
                  v-model="form.allergens"
                  rows="2"
                  class="input w-full resize-none"
                  placeholder="List allergens: dairy, nuts, shellfish, etc."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Inventory Tab -->
          <div v-show="activeTab === 'inventory'" class="space-y-6">
            <div class="max-w-2xl mx-auto">
              <h3 class="text-lg font-semibold text-white mb-4">Inventory & Stock Management</h3>

              <div class="space-y-6">
                <!-- Stock Tracking Toggle -->
                <div class="bg-gray-700 rounded-lg p-4">
                  <label class="flex items-center gap-3">
                    <input
                      v-model="form.stockTracking.enabled"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span class="text-sm font-medium text-gray-300">
                        Enable Stock Tracking
                      </span>
                      <p class="text-xs text-gray-400">Track inventory levels for this item</p>
                    </div>
                  </label>
                </div>

                <!-- Stock Fields -->
                <div v-if="form.stockTracking.enabled" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Current Stock *
                      </label>
                      <input
                        v-model.number="form.stockTracking.currentStock"
                        type="number"
                        min="0"
                        required
                        class="input w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Stock Alert
                      </label>
                      <input
                        v-model.number="form.stockTracking.minStock"
                        type="number"
                        min="0"
                        class="input w-full"
                        placeholder="5"
                      />
                      <p class="text-xs text-gray-400 mt-1">Alert when stock falls below this</p>
                    </div>
                  </div>

                  <!-- Low Stock Warning -->
                  <div
                    v-if="form.stockTracking.enabled && form.stockTracking.currentStock <= form.stockTracking.minStock"
                    class="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg flex items-center gap-3"
                  >
                    <AlertTriangle class="w-5 h-5 text-yellow-400" />
                    <div>
                      <p class="text-sm font-medium text-yellow-300">Low Stock Warning</p>
                      <p class="text-xs text-yellow-400">Current stock is at or below minimum threshold</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scheduling Tab -->
          <div v-show="activeTab === 'scheduling'" class="space-y-6">
            <div class="max-w-2xl mx-auto">
              <h3 class="text-lg font-semibold text-white mb-4">Menu Scheduling</h3>

              <div class="space-y-6">
                <!-- Scheduling Toggle -->
                <div class="bg-gray-700 rounded-lg p-4">
                  <label class="flex items-center gap-3">
                    <input
                      v-model="form.scheduling.enabled"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span class="text-sm font-medium text-gray-300">
                        Enable Time-Based Availability
                      </span>
                      <p class="text-xs text-gray-400">Set specific times when this item is available</p>
                    </div>
                  </label>
                </div>

                <!-- Schedule Fields -->
                <div v-if="form.scheduling.enabled" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Available From
                      </label>
                      <input
                        v-model="form.scheduling.availableFrom"
                        type="time"
                        class="input w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        Available Until
                      </label>
                      <input
                        v-model="form.scheduling.availableUntil"
                        type="time"
                        class="input w-full"
                      />
                    </div>
                  </div>

                  <!-- Days of Week -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Available Days
                    </label>
                    <div class="grid grid-cols-7 gap-2">
                      <button
                        v-for="day in daysOfWeek"
                        :key="day.value"
                        type="button"
                        @click="toggleDay(day.value)"
                        :class="[
                          'px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                          form.scheduling.days.includes(day.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        ]"
                      >
                        {{ day.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Preview -->
                  <div class="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p class="text-sm text-blue-300">
                      <Clock class="w-4 h-4 inline-block mr-1" />
                      Available {{ schedulePreview }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p class="text-red-300 text-sm">{{ submitError }}</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            v-if="activeTab !== 'basic'"
            type="button"
            @click="previousTab"
            class="btn btn-secondary"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Previous
          </button>
          <div class="flex-1"></div>
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            v-if="activeTab !== tabs[tabs.length - 1].id"
            type="button"
            @click="nextTab"
            class="btn btn-primary"
          >
            Next
            <ArrowRight class="w-4 h-4 ml-2" />
          </button>
          <button
            v-else
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              <Save class="w-4 h-4 inline-block mr-2" />
              {{ isEditing ? 'Update Item' : 'Create Item' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  X, Plus, Trash2, Upload, Save, ArrowLeft, ArrowRight,
  Info, ImageIcon, Layers, Apple, Package, Clock, AlertTriangle
} from 'lucide-vue-next'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { useToast } from 'vue-toastification'
import { uploadService } from '@/services/uploadService'

interface Props {
  item?: MenuItem | null
}

const props = withDefaults(defineProps<Props>(), {
  item: null
})

const emit = defineEmits<{
  close: []
  success: [item: MenuItem]
}>()

const menuStore = useMenuStore()
const toast = useToast()

// Tab navigation
const activeTab = ref('basic')
const tabs = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'variants', label: 'Variants', icon: Layers },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'scheduling', label: 'Scheduling', icon: Clock }
]

const daysOfWeek = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
]

// Form state
interface MenuItemFormExtended {
  name: string
  sku: string
  description: string
  price: number
  cost: number
  categoryId: string
  imageUrl: string
  isAvailable: boolean
  isFeatured: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  prepTime: number | null
  allergens: string
  nutritionInfo: {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    fiber: number | null
    sugar: number | null
    sodium: number | null
    cholesterol: number | null
    servingSize: string
  }
  variants: Array<{
    name: string
    priceModifier: number
    isDefault: boolean
  }>
  stockTracking: {
    enabled: boolean
    currentStock: number
    minStock: number
  }
  scheduling: {
    enabled: boolean
    availableFrom: string
    availableUntil: string
    days: number[]
  }
}

const form = ref<MenuItemFormExtended>({
  name: '',
  sku: '',
  description: '',
  price: 0,
  cost: 0,
  categoryId: '',
  imageUrl: '',
  isAvailable: true,
  isFeatured: false,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isSpicy: false,
  prepTime: null,
  allergens: '',
  nutritionInfo: {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    fiber: null,
    sugar: null,
    sodium: null,
    cholesterol: null,
    servingSize: ''
  },
  variants: [],
  stockTracking: {
    enabled: false,
    currentStock: 0,
    minStock: 5
  },
  scheduling: {
    enabled: false,
    availableFrom: '',
    availableUntil: '',
    days: [0, 1, 2, 3, 4, 5, 6]
  }
})

const errors = ref<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)

// Image upload
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>('')

// Computed
const isEditing = computed(() => !!props.item)

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length > 0 &&
    form.value.sku.trim().length > 0 &&
    form.value.categoryId.length > 0 &&
    form.value.price > 0 &&
    Object.keys(errors.value).length === 0
  )
})

const profitMarginText = computed(() => {
  if (!form.value.price || !form.value.cost) return ''
  const margin = ((form.value.price - form.value.cost) / form.value.price) * 100
  return `${margin.toFixed(1)}% ($${(form.value.price - form.value.cost).toFixed(2)})`
})

const profitMarginColor = computed(() => {
  if (!form.value.price || !form.value.cost) return 'text-gray-300'
  const margin = ((form.value.price - form.value.cost) / form.value.price) * 100
  if (margin >= 30) return 'text-green-400'
  if (margin >= 15) return 'text-yellow-400'
  return 'text-red-400'
})

const schedulePreview = computed(() => {
  if (!form.value.scheduling.enabled) return ''

  const days = form.value.scheduling.days.sort().map(d => daysOfWeek[d].label).join(', ')
  const from = form.value.scheduling.availableFrom || '00:00'
  const until = form.value.scheduling.availableUntil || '23:59'

  return `${days} from ${from} to ${until}`
})

// Methods
const nextTab = () => {
  const currentIndex = tabs.findIndex(t => t.id === activeTab.value)
  if (currentIndex < tabs.length - 1) {
    activeTab.value = tabs[currentIndex + 1].id
  }
}

const previousTab = () => {
  const currentIndex = tabs.findIndex(t => t.id === activeTab.value)
  if (currentIndex > 0) {
    activeTab.value = tabs[currentIndex - 1].id
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    selectedFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  form.value.imageUrl = ''
  imagePreview.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const addVariant = () => {
  form.value.variants.push({
    name: '',
    priceModifier: 0,
    isDefault: form.value.variants.length === 0
  })
}

const removeVariant = (index: number) => {
  form.value.variants.splice(index, 1)
}

const setDefaultVariant = (index: number) => {
  form.value.variants.forEach((v, i) => {
    v.isDefault = i === index
  })
}

const toggleDay = (day: number) => {
  const index = form.value.scheduling.days.indexOf(day)
  if (index > -1) {
    form.value.scheduling.days.splice(index, 1)
  } else {
    form.value.scheduling.days.push(day)
  }
}

// Form validation
const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Item name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Item name must be at least 2 characters'
  }

  if (!form.value.sku.trim()) {
    errors.value.sku = 'SKU is required'
  } else if (form.value.sku.trim().length < 2) {
    errors.value.sku = 'SKU must be at least 2 characters'
  }

  if (!form.value.categoryId) {
    errors.value.categoryId = 'Category selection is required'
  }

  if (form.value.price <= 0) {
    errors.value.price = 'Price must be greater than 0'
  }

  if (form.value.cost && form.value.cost < 0) {
    errors.value.cost = 'Cost cannot be negative'
  }

  if (form.value.cost && form.value.price && form.value.cost >= form.value.price) {
    errors.value.cost = 'Cost should be less than the sale price'
  }

  if (form.value.description && form.value.description.length > 1000) {
    errors.value.description = 'Description must be less than 1000 characters'
  }

  if (form.value.imageUrl && !isValidUrl(form.value.imageUrl)) {
    errors.value.imageUrl = 'Please enter a valid URL'
  }
}

const isValidUrl = (string: string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Watch for form changes to validate
watch(form, validateForm, { deep: true })

// Initialize form
const initializeForm = () => {
  if (props.item) {
    // Parse existing data
    const nutritionInfo = props.item.nutritionInfo ?
      (typeof props.item.nutritionInfo === 'string' ? JSON.parse(props.item.nutritionInfo) : props.item.nutritionInfo) :
      {}

    form.value = {
      name: props.item.name,
      sku: props.item.sku,
      description: props.item.description || '',
      price: props.item.price,
      cost: props.item.cost || 0,
      categoryId: props.item.categoryId,
      imageUrl: props.item.imageUrl || '',
      isAvailable: props.item.isAvailable,
      isFeatured: (props.item as any).isFeatured || false,
      isVegetarian: (props.item as any).isVegetarian || false,
      isVegan: (props.item as any).isVegan || false,
      isGlutenFree: (props.item as any).isGlutenFree || false,
      isSpicy: (props.item as any).isSpicy || false,
      prepTime: (props.item as any).prepTime || null,
      allergens: (props.item as any).allergens || '',
      nutritionInfo: {
        calories: nutritionInfo.calories || null,
        protein: nutritionInfo.protein || null,
        carbs: nutritionInfo.carbs || null,
        fat: nutritionInfo.fat || null,
        fiber: nutritionInfo.fiber || null,
        sugar: nutritionInfo.sugar || null,
        sodium: nutritionInfo.sodium || null,
        cholesterol: nutritionInfo.cholesterol || null,
        servingSize: nutritionInfo.servingSize || ''
      },
      variants: [],
      stockTracking: {
        enabled: (props.item as any).stockCount !== null && (props.item as any).stockCount !== undefined,
        currentStock: (props.item as any).stockCount || 0,
        minStock: (props.item as any).minStock || 5
      },
      scheduling: {
        enabled: false,
        availableFrom: '',
        availableUntil: '',
        days: [0, 1, 2, 3, 4, 5, 6]
      }
    }
  } else {
    // Reset form
    form.value = {
      name: '',
      sku: '',
      description: '',
      price: 0,
      cost: 0,
      categoryId: '',
      imageUrl: '',
      isAvailable: true,
      isFeatured: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      prepTime: null,
      allergens: '',
      nutritionInfo: {
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        fiber: null,
        sugar: null,
        sodium: null,
        cholesterol: null,
        servingSize: ''
      },
      variants: [],
      stockTracking: {
        enabled: false,
        currentStock: 0,
        minStock: 5
      },
      scheduling: {
        enabled: false,
        availableFrom: '',
        availableUntil: '',
        days: [0, 1, 2, 3, 4, 5, 6]
      }
    }
  }
  errors.value = {}
  submitError.value = ''
  imagePreview.value = ''
  selectedFile.value = null
}

// Handle form submission
const handleSubmit = async () => {
  validateForm()
  if (!isFormValid.value) {
    toast.error('Please fix form errors before submitting')
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    // Handle file upload if selectedFile exists
    let uploadedImageUrl = form.value.imageUrl.trim()
    if (selectedFile.value) {
      toast.info('Uploading image...')
      const uploadResult = await uploadService.uploadImage(selectedFile.value, 'menu')

      if (uploadResult.success && uploadResult.data) {
        uploadedImageUrl = uploadResult.data.url
        toast.success(`Image uploaded (saved ${uploadResult.data.savedPercentage}% space)`)
      } else {
        throw new Error(uploadResult.error || 'Image upload failed')
      }
    }

    // Prepare the data
    const submitData: any = {
      name: form.value.name.trim(),
      sku: form.value.sku.trim(),
      description: form.value.description.trim(),
      price: form.value.price,
      cost: form.value.cost || undefined,
      categoryId: form.value.categoryId,
      imageUrl: uploadedImageUrl || undefined,
      isAvailable: form.value.isAvailable,
      isFeatured: form.value.isFeatured,
      isVegetarian: form.value.isVegetarian,
      isVegan: form.value.isVegan,
      isGlutenFree: form.value.isGlutenFree,
      isSpicy: form.value.isSpicy,
      prepTime: form.value.prepTime || undefined,
      allergens: form.value.allergens.trim() || undefined,
      nutritionInfo: JSON.stringify(form.value.nutritionInfo),
      stockCount: form.value.stockTracking.enabled ? form.value.stockTracking.currentStock : null,
      minStock: form.value.stockTracking.enabled ? form.value.stockTracking.minStock : null
    }

    let result: MenuItem

    if (isEditing.value && props.item) {
      result = await menuStore.updateMenuItem(props.item.id, submitData)
    } else {
      result = await menuStore.createMenuItem(submitData)
    }

    toast.success(`Menu item ${isEditing.value ? 'updated' : 'created'} successfully`)
    emit('success', result)
    emit('close')
  } catch (error: any) {
    submitError.value = error.message || 'An error occurred while saving the menu item'
    toast.error(submitError.value)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount
onMounted(() => {
  initializeForm()
})

// Re-initialize when item prop changes
watch(() => props.item, initializeForm, { immediate: true })
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.input {
  @apply block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>
