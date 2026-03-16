<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { getDaysInMonth, getDay, format } from 'date-fns'
import DayCell from './DayCell.vue'
import type { WeekendConfig, CalendarEvent } from '@/types/database'
import { useEventsStore } from '@/stores/events'

const props = defineProps<{
  monthIndex: number
  monthName: string
  year: number
  weekendConfig: WeekendConfig
}>()

const emit = defineEmits<{
  dragStart: [month: number, day: number]
  dragMove: [month: number, day: number]
}>()

const eventsStore = useEventsStore()

// Inject drag state from parent
const dragState = inject<{
  isDragging: Ref<boolean>
  dragStartMonth: Ref<number | null>
  dragStartDay: Ref<number | null>
  dragEndMonth: Ref<number | null>
  dragEndDay: Ref<number | null>
}>('dragState')!

// Inject event click handler
const handleEventClick = inject<(event: CalendarEvent) => void>('handleEventClick')!

const daysInMonth = computed(() => getDaysInMonth(new Date(props.year, props.monthIndex)))

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

// Check if a day is a weekend
function isWeekend(day: number): boolean {
  const date = new Date(props.year, props.monthIndex, day)
  const dayOfWeek = getDay(date)
  return props.weekendConfig.days.includes(dayOfWeek)
}

// Check if a day is in the current drag selection (supports cross-month ranges)
function isInDragSelection(day: number): boolean {
  if (!dragState.isDragging.value) return false
  if (
    dragState.dragStartMonth.value === null ||
    dragState.dragStartDay.value === null ||
    dragState.dragEndMonth.value === null ||
    dragState.dragEndDay.value === null
  ) return false
  if (day > daysInMonth.value) return false

  // Normalize so startMonth/startDay is always before endMonth/endDay
  const sm = dragState.dragStartMonth.value
  const sd = dragState.dragStartDay.value
  const em = dragState.dragEndMonth.value
  const ed = dragState.dragEndDay.value

  let startMonth: number, startDay: number, endMonth: number, endDay: number
  if (sm < em || (sm === em && sd <= ed)) {
    startMonth = sm; startDay = sd; endMonth = em; endDay = ed
  } else {
    startMonth = em; startDay = ed; endMonth = sm; endDay = sd
  }

  const mi = props.monthIndex
  if (mi < startMonth || mi > endMonth) return false

  if (startMonth === endMonth) {
    // Single-month selection
    return day >= startDay && day <= endDay
  }

  if (mi === startMonth) return day >= startDay
  if (mi === endMonth) return day <= endDay
  // Middle month — all valid days selected
  return true
}

// Get date string for a day
function getDateString(day: number): string {
  return format(new Date(props.year, props.monthIndex, day), 'yyyy-MM-dd')
}

// Get events for a specific day
function getEventsForDay(day: number): CalendarEvent[] {
  if (day > daysInMonth.value) return []
  return eventsStore.getEventsForDate(getDateString(day))
}
</script>

<template>
  <!-- Month label -->
  <div class="month-label">
    {{ monthName }}
  </div>

  <!-- Day cells -->
  <DayCell
    v-for="day in DAYS"
    :key="day"
    :day="day"
    :month="monthIndex"
    :year="year"
    :is-valid="day <= daysInMonth"
    :is-weekend="day <= daysInMonth && isWeekend(day)"
    :is-selected="isInDragSelection(day)"
    :weekend-color="weekendConfig.color"
    :events="getEventsForDay(day)"
    :date-string="getDateString(day)"
    @mousedown="emit('dragStart', monthIndex, day)"
    @mouseenter="emit('dragMove', monthIndex, day)"
    @event-click="handleEventClick"
  />
</template>

<style scoped>
@reference "tailwindcss";

.month-label {
  @apply sticky left-0 z-10 bg-gray-100 border-b border-r border-gray-300
         text-xs font-bold py-3 px-2 text-gray-700 flex items-center justify-center tracking-wide;
}
</style>
