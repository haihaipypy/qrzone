import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'
import { createAnimatedQRCode, createQRWithLogo } from '../lib/qrGenerators'

const qrEnhanced = new Hono<AppEnv>()

// Generate animated SVG QR code
qrEnhanced.post('/animated', async (c) => {
  const { text, options } = await c.req.json()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const qrId = crypto.randomUUID()

    // Store the QR data
    await c.env.QR_KV.put(`qr:${qrId}`, JSON.stringify({
      id: qrId,
      userId,
      title: `Animated QR - ${new Date().toLocaleString()}`,
      content: text,
      qrType: 'animated',
      scanCount: 0,
      createdAt: new Date().toISOString(),
      isPublic: false,
      options
    }))

    return c.json({
      success: true,
      qrId,
      qrUrl: `/api/qr-enhanced/qr/${qrId}`,
      animationFrames: 20,
      frameDuration: 100
    })
  } catch (error) {
    return c.json({ error: 'Failed to create animated QR code' }, 500)
  }
})

// Generate QR with logo
qrEnhanced.post('/with-logo', async (c) => {
  const { text, logoUrl, options } = await c.req.json()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const qrId = crypto.randomUUID()

    // Store the QR data
    await c.env.QR_KV.put(`qr:${qrId}`, JSON.stringify({
      id: qrId,
      userId,
      title: `QR with Logo - ${new Date().toLocaleString()}`,
      content: text,
      qrType: 'logo',
      scanCount: 0,
      createdAt: new Date().toISOString(),
      isPublic: false,
      options: { logoUrl, ...options }
    }))

    return c.json({
      success: true,
      qrId,
      qrUrl: `/api/qr-enhanced/qr/${qrId}`
    })
  } catch (error) {
    return c.json({ error: 'Failed to create QR code with logo' }, 500)
  }
})

// Serve QR code as SVG
qrEnhanced.get('/qr/:qrId', async (c) => {
  const qrId = c.req.param('qrId')

  const qrData = await c.env.QR_KV.get(`qr:${qrId}`)
  if (!qrData) {
    return c.json({ error: 'QR code not found' }, 404)
  }

  const data = JSON.parse(qrData)

  // Import the QR generator
  const { generateQRCode } = await import('../lib/qrGenerators')

  // Generate SVG for the QR code
  const svg = await generateQRCode(data.content, {
    width: 200,
    margin: 10,
    color: data.options?.color || { dark: '#000000', light: '#ffffff' }
  })

  // Update scan count
  data.scanCount++
  await c.env.QR_KV.put(`qr:${qrId}`, JSON.stringify(data))

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    }
  })
})

export default qrEnhanced