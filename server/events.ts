import { Hono } from 'hono'
import { db } from './db'

// Event row shape from SQLite
interface EventRow {
  id: string
  user_id: string
  label: string
  color: string
  start_date: string
  end_date: string
  order: number
  created_at: string
  updated_at: string
}

type AuthVariables = {
  user: { id: string } | null
  session: unknown | null
}

const events = new Hono<{ Variables: AuthVariables }>()

// All event routes require authentication
events.use('*', async (c, next) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})

// GET /api/events - List all events for the current user
events.get('/', (c) => {
  const user = c.get('user')!
  const rows = db
    .prepare('SELECT * FROM events WHERE user_id = ? ORDER BY start_date ASC')
    .all(user.id) as EventRow[]
  return c.json(rows)
})

// POST /api/events - Create a new event
events.post('/', async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<{
    label: string
    color: string
    start_date: string
    end_date: string
    order: number
  }>()

  const { label, color, start_date, end_date, order } = body

  if (!label || !color || !start_date || !end_date || !order) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  if (order < 1 || order > 3) {
    return c.json({ error: 'Order must be between 1 and 3' }, 400)
  }

  const stmt = db.prepare(`
    INSERT INTO events (user_id, label, color, start_date, end_date, "order")
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `)

  const row = stmt.get(user.id, label, color, start_date, end_date, order) as EventRow
  return c.json(row, 201)
})

// PUT /api/events/:id - Update an event
events.put('/:id', async (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')
  const body = await c.req.json<Partial<{
    label: string
    color: string
    start_date: string
    end_date: string
    order: number
  }>>()

  // Verify the event belongs to this user
  const existing = db
    .prepare('SELECT id FROM events WHERE id = ? AND user_id = ?')
    .get(id, user.id) as EventRow | undefined

  if (!existing) {
    return c.json({ error: 'Event not found' }, 404)
  }

  const fields: string[] = []
  const values: unknown[] = []

  if (body.label !== undefined) { fields.push('label = ?'); values.push(body.label) }
  if (body.color !== undefined) { fields.push('color = ?'); values.push(body.color) }
  if (body.start_date !== undefined) { fields.push('start_date = ?'); values.push(body.start_date) }
  if (body.end_date !== undefined) { fields.push('end_date = ?'); values.push(body.end_date) }
  if (body.order !== undefined) {
    if (body.order < 1 || body.order > 3) {
      return c.json({ error: 'Order must be between 1 and 3' }, 400)
    }
    fields.push('"order" = ?')
    values.push(body.order)
  }

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  fields.push("updated_at = datetime('now')")
  values.push(id, user.id)

  const row = db
    .prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`)
    .get(...values) as EventRow

  return c.json(row)
})

// DELETE /api/events/:id - Delete an event
events.delete('/:id', (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')

  const result = db
    .prepare('DELETE FROM events WHERE id = ? AND user_id = ?')
    .run(id, user.id)

  if (result.changes === 0) {
    return c.json({ error: 'Event not found' }, 404)
  }

  return c.json({ ok: true })
})

export { events }
