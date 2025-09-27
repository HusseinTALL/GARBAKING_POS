<!--
  Settings view for system configuration and preferences
  Complete admin settings panel for POS system configuration
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gray-700 rounded-lg">
            <Settings class="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Settings
            </h1>
            <p class="text-sm text-gray-400">Configure your POS system settings and preferences</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            v-if="hasUnsavedChanges"
            @click="saveAllSettings"
            :disabled="saving"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            <Save v-else class="w-4 h-4 mr-2" />
            Save All Changes
          </button>
          <span v-if="lastSaved" class="text-sm text-gray-400">
            Last saved: {{ formatTime(lastSaved) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-4 h-full">
        <!-- Settings Navigation -->
        <div class="col-span-1 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div class="p-4">
            <nav class="space-y-2">
              <button
                v-for="category in settingsCategories"
                :key="category.id"
                @click="activeCategory = category.id"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-3',
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                ]"
              >
                <component :is="category.icon" class="w-5 h-5" />
                <span>{{ category.name }}</span>
                <div
                  v-if="hasChanges(category.id)"
                  class="w-2 h-2 bg-orange-400 rounded-full ml-auto"
                ></div>
              </button>
            </nav>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="col-span-3 overflow-y-auto bg-gray-900">
          <div class="p-6">
            <!-- General Settings -->
            <div v-if="activeCategory === 'general'" class="space-y-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Business Information</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Business Name
                    </label>
                    <input
                      v-model="settings.general.businessName"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Business Type
                    </label>
                    <select
                      v-model="settings.general.businessType"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Café</option>
                      <option value="bakery">Bakery</option>
                      <option value="bar">Bar/Pub</option>
                      <option value="food_truck">Food Truck</option>
                      <option value="retail">Retail</option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      v-model="settings.general.address"
                      rows="3"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-100"
                      placeholder="Enter your business address"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      v-model="settings.general.phone"
                      type="tel"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      v-model="settings.general.email"
                      type="email"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Operating Hours</h3>
                <div class="space-y-4">
                  <div
                    v-for="day in daysOfWeek"
                    :key="day.id"
                    class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300"
                  >
                    <div class="flex items-center space-x-3">
                      <input
                        v-model="settings.general.operatingHours[day.id].enabled"
                        type="checkbox"
                        class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <span class="font-medium text-gray-100">{{ day.name }}</span>
                    </div>
                    <div
                      v-if="settings.general.operatingHours[day.id].enabled"
                      class="flex items-center space-x-2"
                    >
                      <input
                        v-model="settings.general.operatingHours[day.id].open"
                        type="time"
                        class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100"
                      />
                      <span class="text-gray-400">to</span>
                      <input
                        v-model="settings.general.operatingHours[day.id].close"
                        type="time"
                        class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100"
                      />
                    </div>
                    <span v-else class="text-gray-400 text-sm">Closed</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Localization</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      v-model="settings.general.language"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      v-model="settings.general.currency"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option value="XOF">XOF (West African Franc)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      v-model="settings.general.timezone"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option value="Africa/Abidjan">Africa/Abidjan</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- POS Settings -->
            <div v-if="activeCategory === 'pos'" class="space-y-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Order Management</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Auto-assign Order Numbers</h4>
                      <p class="text-sm text-gray-400">Automatically generate sequential order numbers</p>
                    </div>
                    <input
                      v-model="settings.pos.autoAssignOrderNumbers"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Require Customer Information</h4>
                      <p class="text-sm text-gray-400">Ask for customer name and phone for all orders</p>
                    </div>
                    <input
                      v-model="settings.pos.requireCustomerInfo"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Enable Table Service</h4>
                      <p class="text-sm text-gray-400">Allow orders to be assigned to specific tables</p>
                    </div>
                    <input
                      v-model="settings.pos.enableTableService"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Payment Settings</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Default Tax Rate (%)
                    </label>
                    <input
                      v-model.number="settings.pos.defaultTaxRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Service Charge (%)
                    </label>
                    <input
                      v-model.number="settings.pos.serviceCharge"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>
                </div>

                <div class="mt-6">
                  <h4 class="font-medium text-gray-100 mb-3">Accepted Payment Methods</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      v-for="method in paymentMethods"
                      :key="method.id"
                      class="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300"
                    >
                      <input
                        v-model="settings.pos.paymentMethods"
                        :value="method.id"
                        type="checkbox"
                        class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <component :is="method.icon" class="w-5 h-5 text-gray-300" />
                      <span class="font-medium text-gray-100">{{ method.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Users & Permissions -->
            <div v-if="activeCategory === 'users'" class="space-y-8">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-100">Staff Members</h3>
                  <button
                    @click="showAddUser = true"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                  >
                    <Plus class="w-4 h-4 mr-2" />
                    Add Staff Member
                  </button>
                </div>

                <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-700">
                    <thead class="bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                      <tr v-for="user in settings.users.staff" :key="user.id" class="hover:bg-gray-700 transition-all duration-300">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <User class="w-4 h-4 text-gray-300" />
                            </div>
                            <div class="ml-3">
                              <div class="text-sm font-medium text-gray-100">{{ user.name }}</div>
                              <div class="text-sm text-gray-400">{{ user.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                            {{ user.role }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="[
                            'px-2 py-1 text-xs font-semibold rounded-full',
                            user.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          ]">
                            {{ user.active ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button class="text-blue-400 hover:text-blue-300 mr-3 transition-colors duration-300">Edit</button>
                          <button class="text-red-400 hover:text-red-300 transition-colors duration-300">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Role Permissions</h3>
                <div class="space-y-4">
                  <div
                    v-for="role in userRoles"
                    :key="role.id"
                    class="bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <h4 class="font-medium text-gray-100 mb-3">{{ role.name }}</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        v-for="permission in availablePermissions"
                        :key="permission.id"
                        class="flex items-center space-x-2"
                      >
                        <input
                          v-model="role.permissions"
                          :value="permission.id"
                          type="checkbox"
                          class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                        />
                        <span class="text-sm text-gray-300">{{ permission.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeCategory === 'security'" class="space-y-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Authentication Settings</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Require PIN for Admin Actions</h4>
                      <p class="text-sm text-gray-400">Require admin PIN for sensitive operations</p>
                    </div>
                    <input
                      v-model="settings.security.requireAdminPin"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Auto Logout Time (minutes)
                    </label>
                    <select
                      v-model.number="settings.security.autoLogoutTime"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option :value="15">15 minutes</option>
                      <option :value="30">30 minutes</option>
                      <option :value="60">1 hour</option>
                      <option :value="240">4 hours</option>
                      <option :value="0">Never</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Data Backup</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Enable Automatic Backup</h4>
                      <p class="text-sm text-gray-400">Automatically backup data daily</p>
                    </div>
                    <input
                      v-model="settings.security.autoBackup"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>

                  <div v-if="settings.security.autoBackup">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Backup Time
                    </label>
                    <input
                      v-model="settings.security.backupTime"
                      type="time"
                      class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    />
                  </div>

                  <button
                    @click="createManualBackup"
                    :disabled="creatingBackup"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Loader2 v-if="creatingBackup" class="w-4 h-4 mr-2 animate-spin" />
                    <Download v-else class="w-4 h-4 mr-2" />
                    Create Manual Backup
                  </button>
                </div>
              </div>
            </div>

            <!-- System Settings -->
            <div v-if="activeCategory === 'system'" class="space-y-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Performance</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Enable Offline Mode</h4>
                      <p class="text-sm text-gray-400">Continue operations when internet is unavailable</p>
                    </div>
                    <input
                      v-model="settings.system.offlineMode"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Data Sync Interval (seconds)
                    </label>
                    <select
                      v-model.number="settings.system.syncInterval"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option :value="5">5 seconds</option>
                      <option :value="10">10 seconds</option>
                      <option :value="30">30 seconds</option>
                      <option :value="60">1 minute</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">Debug & Logging</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300">
                    <div>
                      <h4 class="font-medium text-gray-100">Enable Debug Mode</h4>
                      <p class="text-sm text-gray-400">Show detailed error information and logging</p>
                    </div>
                    <input
                      v-model="settings.system.debugMode"
                      type="checkbox"
                      class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Log Level
                    </label>
                    <select
                      v-model="settings.system.logLevel"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-100 mb-4">System Actions</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    @click="clearCache"
                    class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center space-x-3"
                  >
                    <Trash2 class="w-5 h-5 text-gray-300" />
                    <div class="text-left">
                      <div class="font-medium text-gray-100">Clear Cache</div>
                      <div class="text-sm text-gray-400">Clear application cache data</div>
                    </div>
                  </button>

                  <button
                    @click="exportSettings"
                    class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center space-x-3"
                  >
                    <Download class="w-5 h-5 text-gray-300" />
                    <div class="text-left">
                      <div class="font-medium text-gray-100">Export Settings</div>
                      <div class="text-sm text-gray-400">Download configuration file</div>
                    </div>
                  </button>

                  <button
                    @click="showImportSettings = true"
                    class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center space-x-3"
                  >
                    <Upload class="w-5 h-5 text-gray-300" />
                    <div class="text-left">
                      <div class="font-medium text-gray-100">Import Settings</div>
                      <div class="text-sm text-gray-400">Load configuration from file</div>
                    </div>
                  </button>

                  <button
                    @click="resetToDefaults"
                    class="p-4 bg-gray-800 border border-red-600 rounded-lg hover:bg-red-900/20 transition-all duration-300 flex items-center space-x-3 text-red-400"
                  >
                    <RotateCcw class="w-5 h-5" />
                    <div class="text-left">
                      <div class="font-medium">Reset to Defaults</div>
                      <div class="text-sm">Restore factory settings</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Settings,
  Save,
  Loader2,
  Store,
  CreditCard,
  Users,
  Shield,
  Monitor,
  User,
  Plus,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Globe,
  Clock,
  Smartphone,
  DollarSign,
  Banknote
} from 'lucide-vue-next'

// State
const saving = ref(false)
const creatingBackup = ref(false)
const showAddUser = ref(false)
const showImportSettings = ref(false)
const lastSaved = ref<string | null>(null)
const activeCategory = ref('general')

const originalSettings = ref<any>(null)

const settings = reactive({
  general: {
    businessName: 'Garbaking Cafe',
    businessType: 'restaurant',
    address: '123 Main Street\nDowntown District\nAbidjan, Côte d\'Ivoire',
    phone: '+225 01 23 45 67 89',
    email: 'info@garbaking.com',
    language: 'fr',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
    operatingHours: {
      monday: { enabled: true, open: '08:00', close: '22:00' },
      tuesday: { enabled: true, open: '08:00', close: '22:00' },
      wednesday: { enabled: true, open: '08:00', close: '22:00' },
      thursday: { enabled: true, open: '08:00', close: '22:00' },
      friday: { enabled: true, open: '08:00', close: '23:00' },
      saturday: { enabled: true, open: '09:00', close: '23:00' },
      sunday: { enabled: true, open: '10:00', close: '21:00' }
    }
  },
  pos: {
    autoAssignOrderNumbers: true,
    requireCustomerInfo: false,
    enableTableService: true,
    defaultTaxRate: 18.0,
    serviceCharge: 0,
    paymentMethods: ['cash', 'card', 'mobile']
  },
  users: {
    staff: [
      {
        id: '1',
        name: 'John Manager',
        email: 'manager@garbaking.com',
        role: 'Manager',
        active: true
      },
      {
        id: '2',
        name: 'Sarah Cashier',
        email: 'cashier@garbaking.com',
        role: 'Cashier',
        active: true
      },
      {
        id: '3',
        name: 'Mike Kitchen',
        email: 'kitchen@garbaking.com',
        role: 'Kitchen Staff',
        active: false
      }
    ]
  },
  security: {
    requireAdminPin: true,
    autoLogoutTime: 30,
    autoBackup: true,
    backupTime: '02:00'
  },
  system: {
    offlineMode: true,
    syncInterval: 10,
    debugMode: false,
    logLevel: 'info'
  }
})

const settingsCategories = [
  { id: 'general', name: 'General', icon: Store },
  { id: 'pos', name: 'Point of Sale', icon: CreditCard },
  { id: 'users', name: 'Users & Permissions', icon: Users },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'system', name: 'System', icon: Monitor }
]

const daysOfWeek = [
  { id: 'monday', name: 'Monday' },
  { id: 'tuesday', name: 'Tuesday' },
  { id: 'wednesday', name: 'Wednesday' },
  { id: 'thursday', name: 'Thursday' },
  { id: 'friday', name: 'Friday' },
  { id: 'saturday', name: 'Saturday' },
  { id: 'sunday', name: 'Sunday' }
]

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'mobile', name: 'Mobile Payment', icon: Smartphone },
  { id: 'check', name: 'Check', icon: DollarSign }
]

const userRoles = [
  { id: 'manager', name: 'Manager', permissions: ['orders', 'menu', 'analytics', 'settings', 'users'] },
  { id: 'cashier', name: 'Cashier', permissions: ['orders', 'payment'] },
  { id: 'kitchen', name: 'Kitchen Staff', permissions: ['orders'] },
  { id: 'waiter', name: 'Waiter/Server', permissions: ['orders', 'tables'] }
]

const availablePermissions = [
  { id: 'orders', name: 'Manage Orders' },
  { id: 'menu', name: 'Manage Menu' },
  { id: 'tables', name: 'Manage Tables' },
  { id: 'payment', name: 'Process Payments' },
  { id: 'analytics', name: 'View Analytics' },
  { id: 'settings', name: 'System Settings' },
  { id: 'users', name: 'User Management' }
]

// Computed
const hasUnsavedChanges = computed(() => {
  if (!originalSettings.value) return false
  return JSON.stringify(settings) !== JSON.stringify(originalSettings.value)
})

// Methods
const hasChanges = (categoryId: string): boolean => {
  if (!originalSettings.value) return false
  return JSON.stringify(settings[categoryId]) !== JSON.stringify(originalSettings.value[categoryId])
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

const saveAllSettings = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    originalSettings.value = JSON.parse(JSON.stringify(settings))
    lastSaved.value = new Date().toISOString()
    localStorage.setItem('pos-settings', JSON.stringify(settings))
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    saving.value = false
  }
}

const createManualBackup = async () => {
  creatingBackup.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    const backup = {
      timestamp: new Date().toISOString(),
      settings: settings,
      version: '1.0.0'
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `garbaking-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    console.log('Manual backup created')
  } catch (error) {
    console.error('Error creating backup:', error)
  } finally {
    creatingBackup.value = false
  }
}

const clearCache = () => {
  if (confirm('Are you sure you want to clear the application cache?')) {
    localStorage.removeItem('pos-cache')
    console.log('Cache cleared')
  }
}

const exportSettings = () => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'garbaking-settings.json'
  a.click()
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to their defaults? This cannot be undone.')) {
    console.log('Settings reset to defaults')
  }
}

// Load settings on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('pos-settings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
  originalSettings.value = JSON.parse(JSON.stringify(settings))
})

// Auto-save on changes
watch(settings, () => {
  const timeoutId = setTimeout(() => {
    localStorage.setItem('pos-settings-draft', JSON.stringify(settings))
  }, 1000)
  return () => clearTimeout(timeoutId)
}, { deep: true })
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-4 {
    @apply grid-cols-1;
  }
  .md\:grid-cols-4 {
    @apply grid-cols-1;
  }
  .col-span-3 {
    @apply col-span-1;
  }
}

/* Hover effects */
.settings-category {
  transition: all 0.3s ease;
}

/* Input and select styling */
input[type="checkbox"] {
  transition: all 0.3s ease;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A1A1AA'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
}
</style>