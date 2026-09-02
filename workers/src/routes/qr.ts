import { Hono } from 'hono'
import type { AppEnv, QRCode, QRStyle, QRType, Session, LandingPage, GeoRule, TextStyle } from '../lib/types'
import { authMiddleware } from '../middleware/auth'
import { sha256 } from '../lib/auth'


const qr = new Hono<AppEnv>()

qr.use('*', authMiddleware)

qr.get('/', async (c) => {
  const { userId } = c.get('session')
  const idsData = await c.env.QR_KV.get(`user_qrs:${userId}`)
  const ids: string[] = idsData ? JSON.parse(idsData) : []

  const qrs = await Promise.all(
    ids.map(async (id) => {
      const data = await c.env.QR_KV.get(`qr:${id}`)
      return data ? (JSON.parse(data) as QRCode) : null
    })
  )

  return c.json(qrs.filter(Boolean))
})

qr.post('/', async (c) => {
  const { userId } = c.get('session')
  const { title, content, style, expireAt, qrType, password, landingPage, geoRules, textStyle } = await c.req.json()

  if (!title || !content) return c.json({ error: 'Title and content required' }, 400)

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8)

  const defaultStyle: QRStyle = {
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
    background: '#ffffff',
    dotsColor: '#000000',
  }

  const qrCode: QRCode = {
    id,
    userId,
    title,
    content,
    style: style ?? defaultStyle,
    expireAt,
    scanCount: 0,
    createdAt: new Date().toISOString(),
    qrType: (qrType as QRType) ?? 'url',
    textStyle: (textStyle as TextStyle) ?? undefined,
    scanLogs: [],
    passwordHash: password ? await sha256(password) : undefined,
    landingPage: landingPage ?? undefined,
    geoRules: geoRules ?? undefined,
    isPublic: false,
  }

  await c.env.QR_KV.put(`qr:${id}`, JSON.stringify(qrCode))

  const idsData = await c.env.QR_KV.get(`user_qrs:${userId}`)
  const ids: string[] = idsData ? JSON.parse(idsData) : []
  ids.push(id)
  await c.env.QR_KV.put(`user_qrs:${userId}`, JSON.stringify(ids))

  return c.json(qrCode, 201)
})

qr.post('/bulk', async (c) => {
  const { userId } = c.get('session')
  const { urls } = await c.req.json<{ urls: string[] }>()

  if (!Array.isArray(urls) || urls.length === 0) {
    return c.json({ error: 'urls array required' }, 400)
  }

  const defaultStyle: QRStyle = {
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
    background: '#ffffff',
    dotsColor: '#000000',
  }

  const created: QRCode[] = []

  for (const url of urls.slice(0, 50)) {
    if (!url.trim()) continue
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
    const qrCode: QRCode = {
      id,
      userId,
      title: url.trim().slice(0, 60),
      content: url.trim(),
      style: defaultStyle,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      qrType: 'url',
      scanLogs: [],
      isPublic: false,
    }
    await c.env.QR_KV.put(`qr:${id}`, JSON.stringify(qrCode))
    created.push(qrCode)
  }

  const idsData = await c.env.QR_KV.get(`user_qrs:${userId}`)
  const ids: string[] = idsData ? JSON.parse(idsData) : []
  created.forEach(q => ids.push(q.id))
  await c.env.QR_KV.put(`user_qrs:${userId}`, JSON.stringify(ids))

  return c.json(created, 201)
})

qr.get('/:id', async (c) => {
  const { userId } = c.get('session')
  const id = c.req.param('id')
  const data = await c.env.QR_KV.get(`qr:${id}`)
  if (!data) return c.json({ error: 'Not found' }, 404)
  const qrCode: QRCode = JSON.parse(data)
  if (qrCode.userId !== userId) return c.json({ error: 'Forbidden' }, 403)
  return c.json(qrCode)
})

qr.get('/:id/stats', async (c) => {
  const { userId } = c.get('session')
  const id = c.req.param('id')
  const data = await c.env.QR_KV.get(`qr:${id}`)
  if (!data) return c.json({ error: 'Not found' }, 404)
  const qrCode: QRCode = JSON.parse(data)
  if (qrCode.userId !== userId) return c.json({ error: 'Forbidden' }, 403)
  return c.json({ scanCount: qrCode.scanCount, scanLogs: qrCode.scanLogs ?? [] })
})

qr.put('/:id', async (c) => {
  const { userId } = c.get('session')
  const id = c.req.param('id')
  const data = await c.env.QR_KV.get(`qr:${id}`)
  if (!data) return c.json({ error: 'Not found' }, 404)
  const qrCode: QRCode = JSON.parse(data)
  if (qrCode.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json()
  const updated: QRCode = {
    ...qrCode,
    title: body.title ?? qrCode.title,
    content: body.content ?? qrCode.content,
    style: body.style ?? qrCode.style,
    expireAt: body.expireAt ?? qrCode.expireAt,
    qrType: body.qrType ?? qrCode.qrType,
    textStyle: 'textStyle' in body ? (body.textStyle ?? undefined) : qrCode.textStyle,
    passwordHash: body.password ? await sha256(body.password) : (body.password === '' ? undefined : qrCode.passwordHash),
    landingPage: 'landingPage' in body ? (body.landingPage ?? undefined) : qrCode.landingPage,
    geoRules: 'geoRules' in body ? (body.geoRules ?? undefined) : qrCode.geoRules,
    folder: 'folder' in body ? (body.folder || undefined) : qrCode.folder,
  }

  await c.env.QR_KV.put(`qr:${id}`, JSON.stringify(updated))
  return c.json(updated)
})

qr.delete('/:id', async (c) => {
  const { userId } = c.get('session')
  const id = c.req.param('id')
  const data = await c.env.QR_KV.get(`qr:${id}`)
  if (!data) return c.json({ error: 'Not found' }, 404)
  const qrCode: QRCode = JSON.parse(data)
  if (qrCode.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  await c.env.QR_KV.delete(`qr:${id}`)

  const idsData = await c.env.QR_KV.get(`user_qrs:${userId}`)
  const ids: string[] = idsData ? JSON.parse(idsData) : []
  await c.env.QR_KV.put(`user_qrs:${userId}`, JSON.stringify(ids.filter(i => i !== id)))

  return c.json({ success: true })
})

export default qr
