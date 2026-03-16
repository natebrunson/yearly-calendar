<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

// Generate year options (5 years before and after current year)
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y)
  }
  return years
})

function isWeekendDay(day: number): boolean {
  return settingsStore.weekendConfig.days.includes(day)
}

async function handleSignOut() {
  await authStore.signOut()
}
</script>

<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
    </div>

    <div class="settings-body">
      <!-- Year Selector -->
      <div class="setting-group">
        <label for="year-select" class="setting-label">Year</label>
        <select
          id="year-select"
          :value="settingsStore.year"
          @change="settingsStore.setYear(Number(($event.target as HTMLSelectElement).value))"
          class="select-input"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Weekend Days -->
      <div class="setting-group">
        <label class="setting-label">Weekend Days</label>
        <div class="weekday-toggles">
          <button
            v-for="day in WEEKDAYS"
            :key="day.value"
            class="weekday-toggle"
            :class="{ 'weekday-toggle--active': isWeekendDay(day.value) }"
            @click="settingsStore.toggleWeekendDay(day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <!-- Weekend Color -->
      <div class="setting-group">
        <label class="setting-label">Weekend Highlight Color</label>
        <div class="color-setting">
          <input
            type="color"
            :value="settingsStore.weekendConfig.color"
            @input="settingsStore.setWeekendColor(($event.target as HTMLInputElement).value)"
            class="color-input"
          />
          <span class="color-hex">{{ settingsStore.weekendConfig.color }}</span>
          <div
            class="color-preview"
            :style="{ backgroundColor: settingsStore.weekendConfig.color }"
          />
        </div>
      </div>

      <!-- User Info & Sign Out -->
      <div class="setting-group user-section">
        <div class="user-info" v-if="authStore.user">
          <div class="user-avatar">
            <img
              v-if="authStore.user.image"
              :src="authStore.user.image"
              :alt="authStore.user.name || authStore.user.email || 'User'"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ (authStore.user.email || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-details">
            <div class="user-name">
              {{ authStore.user.name || authStore.user.email }}
            </div>
            <div class="user-email" v-if="authStore.user.name">
              {{ authStore.user.email }}
            </div>
          </div>
        </div>
        <button class="sign-out-button" @click="handleSignOut">Sign Out</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.settings-panel {
  @apply bg-white border-l border-gray-200 w-72 flex flex-col;
}

.settings-header {
  @apply px-4 py-3 border-b border-gray-200;
}

.settings-title {
  @apply text-lg font-semibold text-gray-900;
}

.settings-body {
  @apply flex-1 overflow-y-auto p-4 space-y-6;
}

.setting-group {
  @apply space-y-2;
}

.setting-label {
  @apply block text-sm font-medium text-gray-700;
}

.select-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         text-gray-900 bg-white;
}

.weekday-toggles {
  @apply flex flex-wrap gap-1;
}

.weekday-toggle {
  @apply px-2 py-1 text-xs font-medium rounded border transition-colors;
  @apply border-gray-300 text-gray-600 hover:bg-gray-100;
}

.weekday-toggle--active {
  @apply bg-blue-600 border-blue-600 text-white hover:bg-blue-700;
}

.color-setting {
  @apply flex items-center gap-3;
}

.color-input {
  @apply w-10 h-10 rounded cursor-pointer border border-gray-300;
}

.color-hex {
  @apply text-sm text-gray-500 font-mono;
}

.color-preview {
  @apply w-16 h-6 rounded border border-gray-200;
}

.user-section {
  @apply pt-4 border-t border-gray-200;
}

.user-info {
  @apply flex items-center gap-3 mb-3;
}

.user-avatar {
  @apply flex-shrink-0;
}

.avatar-image {
  @apply w-10 h-10 rounded-full;
}

.avatar-placeholder {
  @apply w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center
         text-gray-600 font-semibold;
}

.user-details {
  @apply flex-1 min-w-0;
}

.user-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.user-email {
  @apply text-xs text-gray-500 truncate;
}

.sign-out-button {
  @apply w-full px-4 py-2 text-sm font-medium text-gray-700
         border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}
</style>
