import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { WeekendConfig } from '@/types/database'

const STORAGE_KEY = 'year-calendar-settings'

export const useSettingsStore = defineStore('settings', () => {
  const year = ref(new Date().getFullYear())
  
  const weekendConfig = ref<WeekendConfig>({
    color: '#dbeafe', // Light blue
    days: [0, 6] // Sunday and Saturday
  })

  // Load settings from localStorage
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.year) year.value = parsed.year
        if (parsed.weekendConfig) weekendConfig.value = parsed.weekendConfig
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        year: year.value,
        weekendConfig: weekendConfig.value
      }))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  // Watch for changes and auto-save
  watch([year, weekendConfig], saveSettings, { deep: true })

  // Setters
  function setYear(newYear: number) {
    year.value = newYear
  }

  function setWeekendColor(color: string) {
    weekendConfig.value.color = color
  }

  function setWeekendDays(days: number[]) {
    weekendConfig.value.days = days
  }

  function toggleWeekendDay(day: number) {
    const index = weekendConfig.value.days.indexOf(day)
    if (index === -1) {
      weekendConfig.value.days.push(day)
    } else {
      weekendConfig.value.days.splice(index, 1)
    }
  }

  return {
    year,
    weekendConfig,
    loadSettings,
    setYear,
    setWeekendColor,
    setWeekendDays,
    toggleWeekendDay
  }
})
