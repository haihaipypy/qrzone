import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'

const ar = new Hono<AppEnv>()

// Generate AR QR code that links to 3D model
ar.post('/model', async (c) => {
  const {
    text,
    modelUrl,
    modelType = 'glb',
    position = { x: 0, y: 0, z: 0 },
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 }
  } = await c.req.json()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Generate AR experience URL
  const arData = {
    id: crypto.randomUUID(),
    userId,
    title: `AR Model - ${new Date().toLocaleString()}`,
    content: text,
    ar: {
      modelUrl,
      modelType,
      position,
      scale,
      rotation,
      experience: 'https://ar-cdn.example.com/viewer'
    },
    qrType: 'ar',
    scanCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: false
  }

  await c.env.QR_KV.put(`qr:${arData.id}`, JSON.stringify(arData))

  return c.json({
    success: true,
    qrId: arData.id,
    arUrl: `https://ar-cdn.example.com/viewer?model=${encodeURIComponent(modelUrl)}&id=${arData.id}`
  })
})

// Generate QR code for AR scene
ar.post('/scene', async (c) => {
  const {
    sceneData,
    text
  } = await c.req.json()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const arData = {
    id: crypto.randomUUID(),
    userId,
    title: `AR Scene - ${new Date().toLocaleString()}`,
    content: text,
    ar: {
      type: 'scene',
      sceneData,
      experience: 'https://ar-scene.example.com/viewer'
    },
    qrType: 'ar',
    scanCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: false
  }

  await c.env.QR_KV.put(`qr:${arData.id}`, JSON.stringify(arData))

  return c.json({
    success: true,
    qrId: arData.id,
    arUrl: `https://ar-scene.example.com/viewer?scene=${encodeURIComponent(JSON.stringify(sceneData))}&id=${arData.id}`
  })
})

// Get AR experience data
ar.get('/:qrId', async (c) => {
  const qrId = c.req.param('qrId')

  const qrData = await c.env.QR_KV.get(`qr:${qrId}`)
  if (!qrData) {
    return c.json({ error: 'AR experience not found' }, 404)
  }

  const data = JSON.parse(qrData)

  if (data.qrType !== 'ar') {
    return c.json({ error: 'Not an AR QR code' }, 400)
  }

  return c.json({
    experienceUrl: data.ar.experience,
    modelUrl: data.ar.modelUrl,
    sceneData: data.ar.sceneData,
    position: data.ar.position,
    scale: data.ar.scale,
    rotation: data.ar.rotation
  })
})

export default ar