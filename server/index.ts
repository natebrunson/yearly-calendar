import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import './db' // Create tables before auth initializes
import { auth } from './auth'
import { events } from './events'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()

// Session middleware — populates c.get('user') and c.get('session')
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})

// Better Auth handles /api/auth/*
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

// Events API
app.route('/api/events', events)

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})
