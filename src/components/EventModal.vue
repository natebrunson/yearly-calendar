<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import type { CalendarEvent } from '@/types/database'
import { useEventsStore } from '@/stores/events'

const props = defineProps<{
  event: CalendarEvent | null
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  close: []
}>()

const eventsStore = useEventsStore()

// Form state
const label = ref('Work')
const color = ref('#3b82f6')
const saving = ref(false)
const deleting = ref(false)

// Color presets with emoji labels
const colorPresets = [
  { color: '#ef4444', emoji: '❤️', label: 'Love' },
  { color: '#f97316', emoji: '🏖️', label: 'Vacation' },
  { color: '#eab308', emoji: '⭐', label: 'Important' },
  { color: '#22c55e', emoji: '🏃', label: 'Fitness' },
  { color: '#14b8a6', emoji: '🧘', label: 'Wellness' },
  { color: '#3b82f6', emoji: '💼', label: 'Work' },
  { color: '#8b5cf6', emoji: '🎉', label: 'Party' },
  { color: '#ec4899', emoji: '🎂', label: 'Birthday' },
  { color: '#6b7280', emoji: '📅', label: 'General' },
  { color: '#000000', emoji: '🚫', label: 'Blocked' },
]

function selectPreset(preset: typeof colorPresets[number]) {
  color.value = preset.color
  if (!label.value || colorPresets.some(p => p.label === label.value)) {
    label.value = preset.label
  }
}

const isEditing = computed(() => props.event !== null)

const dateRangeDisplay = computed(() => {
  const start = parseISO(props.startDate)
  const end = parseISO(props.endDate)

  if (props.startDate === props.endDate) {
    return format(start, 'MMMM d, yyyy')
  }

  // Same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`
  }

  // Different months
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
})

// Initialize form with event data if editing
onMounted(() => {
  if (props.event) {
    label.value = props.event.label
    color.value = props.event.color
  }
})

async function handleSave() {
  if (!label.value.trim()) return

  saving.value = true

  try {
    if (isEditing.value && props.event) {
      // Update existing event
      await eventsStore.updateEvent(props.event.id, {
        label: label.value.trim(),
        color: color.value,
      })
    } else {
      // Create new event
      const order = eventsStore.findAvailableOrder(props.startDate, props.endDate)
      if (order === null) {
        alert('All slots are full for this date range')
        return
      }

      await eventsStore.createEvent({
        label: label.value.trim(),
        color: color.value,
        start_date: props.startDate,
        end_date: props.endDate,
        order,
      })
    }

    emit('close')
  } catch (error) {
    console.error('Error saving event:', error)
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!props.event) return

  if (!confirm('Are you sure you want to delete this event?')) return

  deleting.value = true

  try {
    await eventsStore.deleteEvent(props.event.id)
    emit('close')
  } catch (error) {
    console.error('Error deleting event:', error)
  } finally {
    deleting.value = false
  }
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Edit Event' : 'New Event' }}
        </h2>
        <button class="close-button" @click="emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
          <!-- Date Range -->
          <div class="field">
            <label class="field-label">Date Range</label>
            <div class="date-display">
              {{ dateRangeDisplay }}
            </div>
          </div>

          <!-- Label -->
          <div class="field">
            <label for="event-label" class="field-label">Label</label>
            <input
              id="event-label"
              v-model="label"
              type="text"
              class="text-input"
              placeholder="Enter event label"
              maxlength="50"
              @keyup.enter="handleSave"
            />
          </div>

          <!-- Color -->
          <div class="field">
            <label class="field-label">Category</label>
            <div class="color-picker">
              <div class="preset-colors">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.color"
                  class="color-swatch"
                  :class="{ 'color-swatch--selected': color === preset.color }"
                  :style="{ backgroundColor: preset.color }"
                  :title="preset.label"
                  @click="selectPreset(preset)"
                >
                  <span class="swatch-emoji">{{ preset.emoji }}</span>
                </button>
              </div>
              <div class="custom-color">
                <input type="color" v-model="color" class="color-input" />
                <span class="color-hex">{{ color }}</span>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="field">
            <label class="field-label">Preview</label>
            <div class="event-preview" :style="{ backgroundColor: color }">
              {{ label || 'Event Label' }}
            </div>
          </div>
      </div>

      <div class="modal-footer">
        <button v-if="isEditing" class="delete-button" :disabled="deleting" @click="handleDelete">
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>
        <div class="flex-1" />
        <button class="cancel-button" @click="emit('close')">Cancel</button>
        <button class="save-button" :disabled="!label.trim() || saving" @click="handleSave">
          {{ saving ? 'Saving...' : isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.modal-backdrop {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl w-full max-w-md mx-4;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.close-button {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply px-6 py-4 space-y-4;
}

.btn-signin {
  @apply px-6 py-2 text-sm font-medium text-white bg-blue-600
         hover:bg-blue-700 rounded-md transition-colors;
}

.field {
  @apply space-y-1;
}

.field-label {
  @apply block text-sm font-medium text-gray-700;
}

.date-display {
  @apply text-gray-900 font-medium;
}

.text-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         text-gray-900 placeholder-gray-400;
}

.color-picker {
  @apply space-y-2;
}

.preset-colors {
  @apply flex flex-wrap gap-2;
}

.color-swatch {
  @apply w-9 h-9 rounded-full border-2 border-transparent cursor-pointer
         transition-transform hover:scale-110 flex items-center justify-center;
}

.swatch-emoji {
  font-size: 14px;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

.color-swatch--selected {
  @apply border-gray-800 ring-2 ring-offset-2 ring-gray-400;
}

.custom-color {
  @apply flex items-center gap-2;
}

.color-input {
  @apply w-10 h-10 rounded cursor-pointer border-0;
}

.color-hex {
  @apply text-sm text-gray-500 font-mono;
}

.event-preview {
  @apply px-3 py-2 rounded text-white font-medium text-sm;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.modal-footer {
  @apply flex items-center gap-3 px-6 py-4 border-t border-gray-200;
}

.delete-button {
  @apply px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700
         hover:bg-red-50 rounded-md transition-colors;
}

.delete-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.cancel-button {
  @apply px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900
         hover:bg-gray-100 rounded-md transition-colors;
}

.save-button {
  @apply px-4 py-2 text-sm font-medium text-white bg-blue-600
         hover:bg-blue-700 rounded-md transition-colors;
}

.save-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
