<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO, isSameDay, isToday as isTodayFn } from 'date-fns'
import type { CalendarEvent } from '@/types/database'

const props = defineProps<{
  day: number
  month: number
  year: number
  isValid: boolean
  isWeekend: boolean
  isSelected: boolean
  weekendColor: string
  events: CalendarEvent[]
  dateString: string
}>()

const emit = defineEmits<{
  eventClick: [event: CalendarEvent]
}>()

// Day of week abbreviation (Sun, Mon, etc.)
const dayOfWeekAbbrev = computed(() => {
  if (!props.isValid) return ''
  const date = new Date(props.year, props.month, props.day)
  return format(date, 'EEE')
})

const isToday = computed(() => {
  if (!props.isValid) return false
  return isTodayFn(new Date(props.year, props.month, props.day))
})

// Sort events by order for consistent rendering
const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => a.order - b.order)
})

// Calculate event height based on how many events share this cell
const eventHeight = computed(() => {
  const count = props.events.length
  if (count === 0) return 0
  return 100 / count
})

// Determine if this is the first, middle, or last day of an event
function getEventPosition(event: CalendarEvent): 'first' | 'middle' | 'last' | 'single' {
  const currentDate = parseISO(props.dateString)
  const startDate = parseISO(event.start_date)
  const endDate = parseISO(event.end_date)

  const isStart = isSameDay(currentDate, startDate)
  const isEnd = isSameDay(currentDate, endDate)

  if (isStart && isEnd) return 'single'
  if (isStart) return 'first'
  if (isEnd) return 'last'
  return 'middle'
}

// Get border radius based on position
function getEventBorderRadius(position: 'first' | 'middle' | 'last' | 'single'): string {
  switch (position) {
    case 'single':
      return '4px'
    case 'first':
      return '4px 0 0 4px'
    case 'last':
      return '0 4px 4px 0'
    case 'middle':
      return '0'
  }
}

// Get margin based on position (to connect bars visually)
function getEventMargin(position: 'first' | 'middle' | 'last' | 'single'): string {
  switch (position) {
    case 'single':
      return '0 2px'
    case 'first':
      return '0 0 0 2px'
    case 'last':
      return '0 2px 0 0'
    case 'middle':
      return '0'
  }
}

// Should show label (only on first day)
function shouldShowLabel(event: CalendarEvent): boolean {
  const position = getEventPosition(event)
  return position === 'first' || position === 'single'
}

// Background style for the cell
const cellStyle = computed(() => {
  if (!props.isValid) {
    return { backgroundColor: '#f3f4f6' } // gray-100
  }
  if (props.isSelected) {
    return { backgroundColor: '#bfdbfe' } // blue-200
  }
  if (isToday.value) {
    return { backgroundColor: '#dcfce7' } // green-100
  }
  if (props.isWeekend) {
    return { backgroundColor: props.weekendColor }
  }
  return {}
})
</script>

<template>
  <div
    class="day-cell"
    :class="{
      'day-cell--invalid': !isValid,
      'day-cell--selected': isSelected,
      'day-cell--valid': isValid,
    }"
    :style="cellStyle"
  >
    <!-- Events container (behind header) -->
    <div v-if="isValid && events.length > 0" class="events-container">
      <div
        v-for="event in sortedEvents"
        :key="event.id"
        class="event-bar"
        :style="{
          backgroundColor: event.color,
          height: `${eventHeight}%`,
          borderRadius: getEventBorderRadius(getEventPosition(event)),
          margin: getEventMargin(getEventPosition(event)),
          overflow: shouldShowLabel(event) ? 'visible' : undefined,
        }"
        @click.stop="emit('eventClick', event)"
        @mousedown.stop
      >
        <span v-if="shouldShowLabel(event)" class="event-label">
          {{ event.label }}
        </span>
      </div>
    </div>

    <!-- Day header with number and day of week (floats on top) -->
    <div v-if="isValid" class="day-header">
      <span class="day-number">{{ day }}</span>
      <span class="day-of-week">{{ dayOfWeekAbbrev }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.day-cell {
  @apply border-b border-r border-gray-300 relative;
  min-height: 50px;
}

.day-cell--invalid {
  @apply cursor-not-allowed;
  background-image: linear-gradient(
    45deg,
    #e5e7eb 25%,
    transparent 25%,
    transparent 50%,
    #e5e7eb 50%,
    #e5e7eb 75%,
    transparent 75%,
    transparent
  );
  background-size: 8px 8px;
}

.day-cell--valid {
  @apply cursor-pointer;
}

.day-cell--valid:hover {
  @apply bg-gray-50;
}

.day-header {
  @apply absolute top-0 left-0 right-0 flex justify-between items-start px-1 pt-0.5 w-full z-10 pointer-events-none;
  font-size: 10px;
  line-height: 1.2;
}

.day-number {
  @apply font-semibold text-gray-700;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.day-of-week {
  @apply text-gray-700 font-semibold uppercase;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.events-container {
  @apply absolute left-0 right-0 bottom-0 flex flex-col;
  top: 16px;
  padding: 1px 0;
}

.event-bar {
  @apply flex items-center cursor-pointer transition-opacity;
  min-height: 0;
  flex: 1;
}

.event-bar:hover {
  @apply opacity-80;
}

.event-label {
  @apply text-xs text-white font-medium px-1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
  white-space: nowrap;
  overflow: visible;
  position: relative;
  z-index: 5;
  max-width: 600%; /* cap at ~6 cells wide */
}
</style>
