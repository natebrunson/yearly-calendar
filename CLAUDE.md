# Year Calendar - Project Guide

## Project Overview

A digital year-at-a-glance calendar inspired by "The Big Ass Calendar" - displaying all 12 months as rows with 31 day columns. Users can create multi-day events that display as colored "stickers" spanning across days.

## Tech Stack

- **Framework**: Vue 3 with Composition API + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS v4
- **Auth**: Better Auth (Google + Apple OAuth)
- **Database**: SQLite (better-sqlite3)
- **Backend**: Hono + @hono/node-server
- **Date Utilities**: date-fns

## Key Design Decisions

### Calendar Grid Layout
- 12 rows (months) × 31 columns (days)
- Sticky header row for day numbers (1-31)
- Sticky first column for month names
- Invalid days (e.g., Feb 30-31) are greyed out with diagonal stripes
- Weekend days have configurable highlight color

### Event System
- Maximum 3 events per day
- Events dynamically resize based on count: 1 event = full cell height, 2 = half each, 3 = thirds
- Multi-day events render as continuous colored bars
- First day shows label, middle days show color only, last day caps the bar
- Events have an `order` (1-3) for consistent vertical positioning

### Drag-to-Select
- Click and drag to create multi-day events, including across month rows
- Selection highlights cells during drag (handles reverse/upward dragging)
- Release opens EventModal with date range pre-filled

## Project Structure

```
server/
├── index.ts               # Hono server entry point, session middleware
├── auth.ts                # Better Auth instance (Google + Apple OAuth, SQLite)
├── db.ts                  # SQLite database setup, events table creation
└── events.ts              # Events REST API (GET/POST/PUT/DELETE)

src/
├── components/
│   ├── YearGrid.vue       # Main grid container, drag coordination
│   ├── MonthRow.vue       # Single month row (31 DayCells)
│   ├── DayCell.vue        # Individual day with event bars
│   ├── EventModal.vue     # Create/edit/delete events
│   └── SettingsPanel.vue  # Weekend config, year picker, sign-out
├── views/
│   ├── CalendarView.vue   # Main authenticated view
│   ├── AuthView.vue       # Google + Apple sign-in page
│   └── AuthCallbackView.vue # OAuth redirect handler
├── stores/
│   ├── events.ts          # Events CRUD via fetch to /api/events
│   ├── auth.ts            # Authentication state (Better Auth)
│   └── settings.ts        # Weekend config, year (localStorage)
├── lib/
│   └── auth-client.ts     # Better Auth Vue client
├── types/
│   └── database.ts        # TypeScript interfaces
└── router/
    └── index.ts           # Routes with auth guards
```

## Database Schema

SQLite database stored at `data/calendar.db`. Better Auth auto-creates its own tables (user, session, account).

```sql
-- events table
id: TEXT PRIMARY KEY (hex random)
user_id: TEXT NOT NULL (references user)
label: TEXT NOT NULL
color: TEXT NOT NULL (hex color)
start_date: TEXT NOT NULL (YYYY-MM-DD)
end_date: TEXT NOT NULL (YYYY-MM-DD)
"order": INTEGER NOT NULL CHECK(1-3)
created_at: TEXT (datetime)
updated_at: TEXT (datetime)
```

Access control is enforced in API route handlers via `WHERE user_id = ?`.

## Commands

```bash
npm run dev          # Start both Vite + backend server
npm run dev:client   # Start Vite only
npm run dev:server   # Start Hono backend only (tsx watch)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
```

## Environment Variables

```
BETTER_AUTH_SECRET=<32+ char secret>   # Required: auth encryption key
GOOGLE_CLIENT_ID=<google-oauth-id>     # Google OAuth
GOOGLE_CLIENT_SECRET=<google-secret>
APPLE_CLIENT_ID=<apple-oauth-id>       # Apple OAuth
APPLE_CLIENT_SECRET=<apple-secret>
```

## Component Communication

- **YearGrid** → **MonthRow**: passes year, weekendConfig, handles drag events
- **MonthRow** → **DayCell**: passes day data, events, selection state
- **DayCell** → **YearGrid**: emits event clicks via `inject('handleEventClick')`
- **Stores** are accessed directly via `useEventsStore()`, etc.

## Styling Conventions

- Use Tailwind utility classes with `@apply` in `<style scoped>` blocks
- Component-specific styles are scoped
- Global styles minimal (just Tailwind base + body reset)

## Known Patterns

### Event Height Calculation
```typescript
const eventHeight = computed(() => {
  const count = props.events.length
  if (count === 0) return 0
  return 100 / count  // Percentage height per event
})
```

### Finding Available Order Slot
```typescript
// In events store - finds first order (1-3) not used across all days in range
function findAvailableOrder(startDate: string, endDate: string): number | null
```

### Drag State (provided/injected)
```typescript
provide('dragState', {
  isDragging,
  dragStartMonth,
  dragStartDay,
  dragEndDay
})
```

## Future Considerations

- Event editing could allow changing date range (currently only label/color)
- Could add event categories/tags
- Print stylesheet if physical copies needed
- Mobile touch support for drag-to-select
