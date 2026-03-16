import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarEvent, NewCalendarEvent } from '@/types/database'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

export const useEventsStore = defineStore('events', () => {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Get events indexed by date for efficient lookup
  const eventsByDate = computed(() => {
    const map = new Map<string, CalendarEvent[]>()

    for (const event of events.value) {
      const start = parseISO(event.start_date)
      const end = parseISO(event.end_date)
      const days = eachDayOfInterval({ start, end })

      for (const day of days) {
        const dateKey = format(day, 'yyyy-MM-dd')
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(event)
      }
    }

    return map
  })

  // Get events for a specific date
  function getEventsForDate(date: string): CalendarEvent[] {
    return eventsByDate.value.get(date) || []
  }

  // Get the max event count for a date range (for consistent height rendering)
  function getMaxEventCountInRange(startDate: string, endDate: string): number {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const days = eachDayOfInterval({ start, end })

    let max = 0
    for (const day of days) {
      const dateKey = format(day, 'yyyy-MM-dd')
      const count = eventsByDate.value.get(dateKey)?.length || 0
      max = Math.max(max, count)
    }

    return max
  }

  // Find the next available order for a date range
  function findAvailableOrder(startDate: string, endDate: string): number | null {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const days = eachDayOfInterval({ start, end })

    // Check which orders are used on each day
    const usedOrders = new Set<number>()

    for (const day of days) {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayEvents = eventsByDate.value.get(dateKey) || []
      for (const event of dayEvents) {
        usedOrders.add(event.order)
      }
    }

    // Find first available order (1, 2, or 3)
    for (let order = 1; order <= 3; order++) {
      if (!usedOrders.has(order)) {
        return order
      }
    }

    return null // All slots full
  }

  // Fetch all events for the current user
  async function fetchEvents() {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`)
      events.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch events'
      console.error('Error fetching events:', e)
    } finally {
      loading.value = false
    }
  }

  // Create a new event
  async function createEvent(newEvent: NewCalendarEvent): Promise<CalendarEvent | null> {
    error.value = null

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newEvent.label,
          color: newEvent.color,
          start_date: newEvent.start_date,
          end_date: newEvent.end_date,
          order: newEvent.order,
        }),
      })

      if (!res.ok) throw new Error(`Failed to create event: ${res.statusText}`)

      const data: CalendarEvent = await res.json()
      events.value.push(data)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create event'
      console.error('Error creating event:', e)
      return null
    }
  }

  // Update an existing event
  async function updateEvent(id: string, updates: Partial<NewCalendarEvent>): Promise<boolean> {
    error.value = null

    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error(`Failed to update event: ${res.statusText}`)

      const updated: CalendarEvent = await res.json()
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = updated
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update event'
      console.error('Error updating event:', e)
      return false
    }
  }

  // Delete an event
  async function deleteEvent(id: string): Promise<boolean> {
    error.value = null

    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error(`Failed to delete event: ${res.statusText}`)

      events.value = events.value.filter((e) => e.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete event'
      console.error('Error deleting event:', e)
      return false
    }
  }

  // Clear events on logout
  function clearEvents() {
    events.value = []
  }

  return {
    events,
    loading,
    error,
    eventsByDate,
    getEventsForDate,
    getMaxEventCountInRange,
    findAvailableOrder,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    clearEvents,
  }
})
