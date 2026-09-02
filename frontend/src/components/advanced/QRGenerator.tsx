'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface QRGeneratorProps {
  onSuccess: (qrId: string) => void
}

export function QRGenerator({ onSuccess }: QRGeneratorProps) {
  const [type, setType] = useState<'animated' | 'logo' | 'ar'>('animated')
  const [text, setText] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    try {
      let qrId: string

      switch (type) {
        case 'animated':
          const animatedRes = await fetch('/api/qr-enhanced/animated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, options: { frames: 20 } })
          })
          const animatedData = await animatedRes.json()
          qrId = animatedData.qrId
          break

        case 'logo':
          const logoRes = await fetch('/api/qr-enhanced/with-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              logoUrl: logoUrl || undefined,
              options: { size: 200, margin: 2 }
            })
          })
          const logoData = await logoRes.json()
          qrId = logoData.qrId
          break

        case 'ar':
          const arRes = await fetch('/api/ar/model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              modelUrl: modelUrl || 'https://example.com/model.glb',
              modelType: 'glb',
              position: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              rotation: { x: 0, y: 0, z: 0 }
            })
          })
          const arData = await arRes.json()
          qrId = arData.qrId
          break
      }

      onSuccess(qrId)
    } catch (error) {
      console.error('Failed to generate QR:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Generate Advanced QR Code</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">QR Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="animated">Animated GIF</option>
          <option value="logo">With Logo</option>
          <option value="ar">AR 3D Model</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'ar' ? '3D Model URL' : 'Text/Content'}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === 'ar' ? 'https://example.com/model.glb' : 'Enter text or URL'}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {type === 'logo' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (optional)</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {type === 'ar' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter description for your 3D model"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !text.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : `Generate ${type} QR`}
      </button>
    </div>
  )
}