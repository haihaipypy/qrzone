import { Hono } from 'hono'
import type { AppEnv, Session, ApiKey } from '../lib/types'
import { authMiddleware } from '../middleware/auth'
import { sha256 } from '../lib/auth'

const keys = new Hono<AppEnv>()

keys.use('*', authMiddleware)

keys.get('/', async (c) => {
  const { userId } = c.get('session')
  const list = await c.env.AUTH_KV.list({ prefix: `apikey:${userId}:` })
  const result = await Promise.all(
    list.keys.map(async (k) => {
      const data = await c.env.AUTH_KV.get(k.name)
      if (!data) return null
      const key: ApiKey = JSON.parse(data)
      return { id: key.id, name: key.name, createdAt: key.createdAt, lastUsedAt: key.lastUsedAt }
    })
  )
  return c.json(result.filter(Boolean))
})

keys.post('/', async (c) => {
  const { userId } = c.get('session')
  const { name } = await c.req.json<{ name: string }>()
  if (!name?.trim()) return c.json({ error: 'Name required' }, 400)

  const rawKey = `ak_${crypto.randomUUID().replace(/-/g, '')}`
  const keyHash = await sha256(rawKey)
  const id = crypto.randomUUID()
  const key: ApiKey = { id, userId, name: name.trim(), keyHash, createdAt: new Date().toISOString() }

  await c.env.AUTH_KV.put(`apikey:${userId}:${id}`, JSON.stringify(key))
  await c.env.AUTH_KV.put(`apikeyindex:${keyHash}`, JSON.stringify({ userId, keyId: id }))

  return c.json({ ...key, key: rawKey }, 201)
})

keys.delete('/:id', async (c) => {
  const { userId } = c.get('session')
  const id = c.req.param('id')
  const data = await c.env.AUTH_KV.get(`apikey:${userId}:${id}`)
  if (!data) return c.json({ error: 'Not found' }, 404)
  const key: ApiKey = JSON.parse(data)
  await c.env.AUTH_KV.delete(`apikey:${userId}:${id}`)
  await c.env.AUTH_KV.delete(`apikeyindex:${key.keyHash}`)
  return c.json({ success: true })
})

export default keys
