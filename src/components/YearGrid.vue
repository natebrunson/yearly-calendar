<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { getDaysInMonth, getDay, format, isValid, parse } from 'date-fns'
import MonthRow from './MonthRow.vue'
import EventModal from './EventModal.vue'
import { useSettingsStore } from '@/stores/settings'
import { useEventsStore } from '@/stores/events'
import type { CalendarEvent } from '@/types/database'

const settingsStore = useSettingsStore()
const eventsStore = useEventsStore()

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// Drag selection state
const isDragging = ref(false)
const dragStartMonth = ref<number | null>(null)
const dragStartDay = ref<number | null>(null)
const dragEndMonth = ref<number | null>(null)
const dragEndDay = ref<number | null>(null)

// Modal state
const showModal = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)
const selectedStartDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)

// Provide drag state to child components
provide('dragState', {
  isDragging,
  dragStartMonth,
  dragStartDay,
  dragEndMonth,
  dragEndDay,
})

// Handle drag start
function handleDragStart(month: number, day: number) {
  isDragging.value = true
  dragStartMonth.value = month
  dragStartDay.value = day
  dragEndMonth.value = month
  dragEndDay.value = day
}

// Handle drag move
function handleDragMove(month: number, day: number) {
  if (!isDragging.value) return
  dragEndMonth.value = month
  dragEndDay.value = day
}

// Normalize drag range so start is always before end
function getNormalizedDrag() {
  const sm = dragStartMonth.value!
  const sd = dragStartDay.value!
  const em = dragEndMonth.value!
  const ed = dragEndDay.value!

  if (sm < em || (sm === em && sd <= ed)) {
    return { startMonth: sm, startDay: sd, endMonth: em, endDay: ed }
  }
  return { startMonth: em, startDay: ed, endMonth: sm, endDay: sd }
}

// Handle drag end
function handleDragEnd() {
  if (
    !isDragging.value ||
    dragStartMonth.value === null ||
    dragStartDay.value === null ||
    dragEndMonth.value === null ||
    dragEndDay.value === null
  ) {
    resetDrag()
    return
  }

  const { startMonth, startDay, endMonth, endDay } = getNormalizedDrag()

  // Validate start day is within its month
  const startDaysInMonth = getDaysInMonth(new Date(settingsStore.year, startMonth))
  if (startDay > startDaysInMonth) {
    resetDrag()
    return
  }

  // Clamp end day to its month's valid range
  const endDaysInMonth = getDaysInMonth(new Date(settingsStore.year, endMonth))
  const validEndDay = Math.min(endDay, endDaysInMonth)

  // Create date strings
  const startDate = format(new Date(settingsStore.year, startMonth, startDay), 'yyyy-MM-dd')
  const endDate = format(new Date(settingsStore.year, endMonth, validEndDay), 'yyyy-MM-dd')

  // Check if there's an available order slot
  const availableOrder = eventsStore.findAvailableOrder(startDate, endDate)
  if (availableOrder === null) {
    resetDrag()
    return
  }

  // Open modal for new event
  selectedStartDate.value = startDate
  selectedEndDate.value = endDate
  editingEvent.value = null
  showModal.value = true

  resetDrag()
}

function resetDrag() {
  isDragging.value = false
  dragStartMonth.value = null
  dragStartDay.value = null
  dragEndMonth.value = null
  dragEndDay.value = null
}

// Handle event click for editing
function handleEventClick(event: CalendarEvent) {
  selectedStartDate.value = event.start_date
  selectedEndDate.value = event.end_date
  editingEvent.value = event
  showModal.value = true
}

// Provide event click handler to children
provide('handleEventClick', handleEventClick)

function handleModalClose() {
  showModal.value = false
  editingEvent.value = null
  selectedStartDate.value = null
  selectedEndDate.value = null
}

// Prevent text selection during drag
function handleMouseDown(e: MouseEvent) {
  if (isDragging.value) {
    e.preventDefault()
  }
}
</script>

<template>
  <div
    class="year-grid-container"
    @mouseup="handleDragEnd"
    @mouseleave="handleDragEnd"
    @mousedown="handleMouseDown"
  >
    <div class="year-grid">
      <!-- Month rows -->
      <template v-for="(monthName, monthIndex) in MONTHS" :key="monthIndex">
        <MonthRow
          :month-index="monthIndex"
          :month-name="monthName"
          :year="settingsStore.year"
          :weekend-config="settingsStore.weekendConfig"
          @drag-start="handleDragStart"
          @drag-move="handleDragMove"
        />
      </template>
    </div>

    <!-- Event Modal -->
    <EventModal
      v-if="showModal"
      :event="editingEvent"
      :start-date="selectedStartDate!"
      :end-date="selectedEndDate!"
      @close="handleModalClose"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.year-grid-container {
  @apply w-full h-full overflow-auto;
  user-select: none;
}

.year-grid {
  display: grid;
  grid-template-columns: 50px repeat(31, minmax(50px, 1fr));
  grid-template-rows: repeat(12, 1fr);
  min-width: fit-content;
  height: 100%;
  min-height: 720px; /* Minimum height so cells don't get too small */
}
</style>
