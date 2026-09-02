import { Hono } from 'hono'
import type { AppEnv, User, Session } from '../lib/types'
import { hashPassword, verifyPassword, getToken } from '../lib/auth'

const auth = new Hono<AppEnv>()

auth.post('/register', async (c) => {
  const { email, password } = await c.req.json()

  if (!email || !password) return c.json({ error: 'Email and password required' }, 400)
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)

  const existing = await c.env.AUTH_KV.get(`user:${email}`)
  if (existing) return c.json({ error: 'Email already registered' }, 409)

  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash: await hashPassword(password),
    // 第一个注册的账号即为管理员
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  }

  await c.env.AUTH_KV.put(`user:${email}`, JSON.stringify(user))
  return c.json({ success: true })
})

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  if (!email || !password) return c.json({ error: 'Email and password required' }, 400)

  const userData = await c.env.AUTH_KV.get(`user:${email}`)
  if (!userData) return c.json({ error: 'Invalid credentials' }, 401)

  const user: User = JSON.parse(userData)
  if (!(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = crypto.randomUUID()
  const session: Session = {
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }

  await c.env.AUTH_KV.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 7 * 24 * 60 * 60,
  })

  c.header('Set-Cookie', `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`)
  return c.json({ success: true, email: user.email, token })
})

auth.post('/logout', async (c) => {
  const token = getToken(c.req.header('Cookie') ?? null, c.req.header('Authorization') ?? null)
  if (token) await c.env.AUTH_KV.delete(`session:${token}`)
  c.header('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0')
  return c.json({ success: true })
})

auth.get('/me', async (c) => {
  const token = getToken(c.req.header('Cookie') ?? null, c.req.header('Authorization') ?? null)
  if (!token) return c.json({ authenticated: false })

  const sessionData = await c.env.AUTH_KV.get(`session:${token}`)
  if (!sessionData) return c.json({ authenticated: false })

  const session: Session = JSON.parse(sessionData)
  if (new Date(session.expiresAt) < new Date()) return c.json({ authenticated: false })

  return c.json({ authenticated: true, email: session.email })
})

export default auth
