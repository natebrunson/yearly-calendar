<script setup lang="ts">
import { ref, onMounted } from 'vue'
import YearGrid from '@/components/YearGrid.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { useEventsStore } from '@/stores/events'
import { useSettingsStore } from '@/stores/settings'

const eventsStore = useEventsStore()
const settingsStore = useSettingsStore()

const showSettings = ref(false)

onMounted(async () => {
  // Load saved settings
  settingsStore.loadSettings()

  // Fetch events
  await eventsStore.fetchEvents()
})

function toggleSettings() {
  showSettings.value = !showSettings.value
}
</script>

<template>
  <div class="calendar-view">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1 class="app-title">Year Calendar</h1>
        <span class="year-badge">{{ settingsStore.year }}</span>
      </div>
      <div class="header-right">
        <button
          class="settings-toggle"
          :class="{ 'settings-toggle--active': showSettings }"
          @click="toggleSettings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <div class="main-content">
      <!-- Calendar Grid -->
      <div class="calendar-container">
        <div v-if="eventsStore.loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
        <YearGrid v-else />
      </div>

      <!-- Settings Panel -->
      <transition name="slide">
        <SettingsPanel v-if="showSettings" />
      </transition>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.calendar-view {
  @apply h-screen flex flex-col bg-gray-50;
}

.header {
  @apply flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm;
}

.header-left {
  @apply flex items-center gap-3;
}

.app-title {
  @apply text-xl font-bold text-gray-900;
}

.year-badge {
  @apply px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded;
}

.header-right {
  @apply flex items-center gap-2;
}

.settings-toggle {
  @apply p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.settings-toggle--active {
  @apply bg-gray-100 text-gray-900;
}

.main-content {
  @apply flex-1 flex overflow-hidden;
}

.calendar-container {
  @apply flex-1 overflow-auto pr-4;
}

.loading-state {
  @apply flex flex-col items-center justify-center h-full text-gray-500;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
}

/* Slide transition for settings panel */
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
