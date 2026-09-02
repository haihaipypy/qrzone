import type { Context, Next } from 'hono'
import type { Env, Session } from '../lib/types'
import { getToken, sha256 } from '../lib/auth'

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { session: Session; token: string } }>, next: Next) {
  const authHeader = c.req.header('Authorization') ?? null
  const cookieHeader = c.req.header('Cookie') ?? null

  // API Key auth
  if (authHeader?.startsWith('Bearer ak_')) {
    const rawKey = authHeader.slice(7)
    const keyHash = await sha256(rawKey)
    const indexData = await c.env.AUTH_KV.get(`apikeyindex:${keyHash}`)
    if (!indexData) return c.json({ error: 'Invalid API key' }, 401)
    const { userId, keyId } = JSON.parse(indexData)
    const keyData = await c.env.AUTH_KV.get(`apikey:${userId}:${keyId}`)
    if (!keyData) return c.json({ error: 'Invalid API key' }, 401)
    const key = JSON.parse(keyData)
    // Update lastUsedAt async (fire and forget)
    c.env.AUTH_KV.put(`apikey:${userId}:${keyId}`, JSON.stringify({ ...key, lastUsedAt: new Date().toISOString() }))
    const userData = await c.env.AUTH_KV.get(`user:${userId}`)
    if (!userData) return c.json({ error: 'Unauthorized' }, 401)
    const user = JSON.parse(userData)
    c.set('session', { userId, email: user.email, expiresAt: '' } as Session)
    c.set('token', rawKey)
    return next()
  }

  const token = getToken(cookieHeader, authHeader)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const sessionData = await c.env.AUTH_KV.get(`session:${token}`)
  if (!sessionData) return c.json({ error: 'Unauthorized' }, 401)

  const session: Session = JSON.parse(sessionData)
  if (new Date(session.expiresAt) < new Date()) {
    await c.env.AUTH_KV.delete(`session:${token}`)
    return c.json({ error: 'Session expired' }, 401)
  }

  c.set('session', session)
  c.set('token', token)
  await next()
}
