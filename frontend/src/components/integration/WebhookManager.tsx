'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface WebhookManagerProps {
  userId: string
}

export function WebhookManager({ userId }: WebhookManagerProps) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [webhooks, setWebhooks] = useState<any[]>([])

  const createWebhook = async () => {
    if (!webhookUrl.trim()) return

    setIsCreating(true)
    try {
      // In a real implementation, you would save this to your database
      const newWebhook = {
        id: crypto.randomUUID(),
        url: webhookUrl.trim(),
        secret: secret.trim() || null,
        events: ['qr.created', 'qr.scanned'],
        isActive: true,
        createdAt: new Date().toISOString()
      }

      setWebhooks(prev => [...prev, newWebhook])
      setWebhookUrl('')
      setSecret('')
    } catch (error) {
      console.error('Failed to create webhook:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  const generateWebhookExample = () => {
    const example = {
      action: 'create_qr',
      data: {
        title: 'Test QR',
        content: 'https://example.com',
        qrType: 'url',
        style: {
          dotsType: 'rounded',
          cornersSquareType: 'dot',
          cornersDotType: 'dot',
          background: '#ffffff',
          dotsColor: '#000000'
        }
      },
      userId
    }

    navigator.clipboard.writeText(JSON.stringify(example, null, 2))
    alert('Webhook example copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Webhook Integration</h2>

      {/* Create Webhook */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Create Webhook</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-endpoint.com/qr"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret (optional)</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="webhook-secret-123"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={createWebhook}
            disabled={isCreating || !webhookUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Webhook'}
          </button>
        </div>
      </div>

      {/* Webhook Example */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium mb-3">Webhook Payload Example</h3>
        <div className="space-y-2">
          <button
            onClick={generateWebhookExample}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Copy to Clipboard
          </button>
          <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded overflow-x-auto">
{`{
  "action": "create_qr",
  "data": {
    "title": "My QR Code",
    "content": "https://example.com",
    "qrType": "url",
    "style": {
      "dotsType": "rounded",
      "cornersSquareType": "dot",
      "cornersDotType": "dot",
      "background": "#ffffff",
      "dotsColor": "#000000"
    }
  },
  "userId": "user-id-here"
}`}
          </pre>
        </div>
      </div>

      {/* Webhooks List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Active Webhooks</h3>
        {webhooks.length === 0 ? (
          <p className="text-gray-500">No webhooks configured</p>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{webhook.url}</p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(webhook.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zapier/Make.com Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-medium mb-2">Zapier/Make.com Integration</h3>
        <p className="text-sm text-gray-700 mb-3">
          Use this URL in Zapier/Make.com webhook trigger:
        </p>
        <div className="bg-gray-800 text-gray-200 p-2 rounded text-sm font-mono">
          {window.location.origin}/api/webhooks/zapier
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Set the method to POST and include the JSON payload from the example above.
        </p>
      </div>
    </div>
  )
}