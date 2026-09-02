import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'

const webhooks = new Hono<AppEnv>()

// Webhook endpoint for external services
webhooks.post('/zapier', async (c) => {
  const payload = await c.req.json()

  // Validate webhook secret if provided
  const secret = c.env.WEBHOOK_SECRET
  const providedSecret = c.req.header('X-Webhook-Secret')

  if (secret && providedSecret !== secret) {
    return c.json({ error: 'Invalid webhook secret' }, 401)
  }

  // Handle QR code creation webhook
  if (payload.action === 'create_qr' && payload.data) {
    const { title, content, qrType, style } = payload.data

    const qrData = {
      id: crypto.randomUUID(),
      userId: payload.userId || 'system',
      title,
      content,
      qrType: qrType || 'url',
      style: style || {
        dotsType: 'rounded',
        cornersSquareType: 'dot',
        cornersDotType: 'dot',
        background: '#ffffff',
        dotsColor: '#000000'
      },
      scanCount: 0,
      createdAt: new Date().toISOString(),
      isPublic: false
    }

    await c.env.QR_KV.put(`qr:${qrData.id}`, JSON.stringify(qrData))

    return c.json({ success: true, qrId: qrData.id })
  }

  // Handle bulk QR code creation
  if (payload.action === 'bulk_create_qr' && payload.data) {
    const results = []

    for (const item of payload.data) {
      const qrData = {
        id: crypto.randomUUID(),
        userId: payload.userId || 'system',
        title: item.title || 'Untitled',
        content: item.url,
        qrType: 'url',
        style: item.style || {
          dotsType: 'rounded',
          cornersSquareType: 'dot',
          cornersDotType: 'dot',
          background: '#ffffff',
          dotsColor: '#000000'
        },
        scanCount: 0,
        createdAt: new Date().toISOString(),
        isPublic: false
      }

      await c.env.QR_KV.put(`qr:${qrData.id}`, JSON.stringify(qrData))
      results.push(qrData.id)
    }

    return c.json({ success: true, qrIds: results })
  }

  return c.json({ error: 'Invalid webhook action' }, 400)
})

// Webhook endpoint for WeChat Mini Program
webhooks.post('/wechat', async (c) => {
  const payload = await c.req.json()

  // Create QR code for WeChat Mini Program
  const qrData = {
    id: crypto.randomUUID(),
    userId: payload.userId || 'wechat_user',
    title: payload.title || 'WeChat QR',
    content: payload.content,
    qrType: payload.qrType || 'url',
    style: payload.style || {
      dotsType: 'rounded',
      cornersSquareType: 'dot',
      cornersDotType: 'dot',
      background: '#ffffff',
      dotsColor: '#07c160' // WeChat green
    },
    scanCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: false,
    wechatMiniProgram: {
      appId: payload.appId,
      path: payload.path,
      type: 'scheme'
    }
  }

  await c.env.QR_KV.put(`qr:${qrData.id}`, JSON.stringify(qrData))

  return c.json({
    success: true,
    qrId: qrData.id,
    wechatUrl: `weixin://dl/business/?t=${qrData.id}`
  })
})

// Generate API for external systems
webhooks.get('/generate-api', async (c) => {
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const keyId = crypto.randomUUID()
  const apiKey = `ak_${crypto.randomUUID().replace(/-/g, '')}`
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
  const keyHashHex = Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join('')

  const keyData = {
    id: keyId,
    userId,
    name: `API Key ${new Date().toLocaleDateString()}`,
    keyHash: keyHashHex,
    createdAt: new Date().toISOString(),
    lastUsedAt: null
  }

  await c.env.AUTH_KV.put(`apikey:${userId}:${keyId}`, JSON.stringify(keyData))
  await c.env.AUTH_KV.put(`apikeyindex:${keyHashHex}`, JSON.stringify({ userId, keyId }))

  return c.json({
    apiKey,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  })
})

export default webhooks