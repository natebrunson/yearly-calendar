import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
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

// In production, serve the built Vue SPA
if (process.env.NODE_ENV === 'production') {
  app.use('*', serveStatic({ root: './dist' }))
  // SPA fallback — serve index.html for any non-API, non-static routes
  app.get('*', serveStatic({ root: './dist', path: 'index.html' }))
}

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})
