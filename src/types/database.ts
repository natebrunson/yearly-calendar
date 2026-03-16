export interface CalendarEvent {
  id: string
  label: string
  color: string
  start_date: string // ISO date string YYYY-MM-DD
  end_date: string // ISO date string YYYY-MM-DD
  order: number // 1, 2, or 3 - vertical stacking priority
  created_at: string
  updated_at: string
}

export interface NewCalendarEvent {
  label: string
  color: string
  start_date: string
  end_date: string
  order: number
}

export interface WeekendConfig {
  color: string
  days: number[] // 0 = Sunday, 6 = Saturday
}

export interface CalendarSettings {
  year: number
  weekendConfig: WeekendConfig
}
