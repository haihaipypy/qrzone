'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { QRGenerator } from '@/components/advanced/QRGenerator'
import { WebhookManager } from '@/components/integration/WebhookManager'
import { VCardForm } from '@/components/vcard/VCardForm'
import { TeamCard } from '@/components/teams/TeamCard'

export function FeaturesDashboard() {
  const [activeTab, setActiveTab] = useState('teams')
  const [qrId, setQrId] = useState<string | null>(null)

  const handleQrGenerated = (qrId: string) => {
    setQrId(qrId)
    alert(`QR Code generated successfully! ID: ${qrId}`)
  }

  const handleVCardSave = (vcardData: any) => {
    // Generate VCard QR code
    api.qr.create({
      title: 'Multi-Language VCard',
      content: 'vcard:' + encodeURIComponent(JSON.stringify(vcardData)),
      qrType: 'vcard'
    }).then(() => {
      alert('VCard QR Code generated!')
    })
  }

  const tabs = [
    { id: 'teams', name: '团队协作', icon: '👥' },
    { id: 'qr', name: '高级二维码', icon: '🎨' },
    { id: 'integration', name: '集成', icon: '🔗' },
    { id: 'vcard', name: '名片', icon: '📇' },
    { id: 'ar', name: 'AR 功能', icon: '🥽' }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">高级功能面板</h1>
        <p className="text-gray-600">探索二维码平台的所有强大功能</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border p-6">
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">团队协作</h2>
            <p className="text-gray-600 mb-6">
              创建团队，管理成员，控制协作二维码生成的权限。
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">👥 团队</h3>
                <p className="text-sm text-blue-700 mb-3">为您的组织创建团队</p>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  创建团队 →
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">👤 角色</h3>
                <p className="text-sm text-green-700 mb-3">管理员、员工、查看者角色</p>
                <button className="text-sm text-green-600 hover:text-green-800">
                  管理角色 →
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">🔐 权限</h3>
                <p className="text-sm text-purple-700 mb-3">细粒度访问控制</p>
                <button className="text-sm text-purple-600 hover:text-purple-800">
                  设置权限 →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">高级二维码生成</h2>
            <p className="text-gray-600 mb-6">
              创建动态 GIF 二维码、带 Logo 的二维码等高级功能。
            </p>

            <QRGenerator onSuccess={handleQrGenerated} />
          </div>
        )}

        {activeTab === 'integration' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">集成与 API</h2>
            <p className="text-gray-600 mb-6">
              通过 Webhook 和 API 连接外部服务。
            </p>

            <WebhookManager userId="current-user-id" />
          </div>
        )}

        {activeTab === 'vcard' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">多语言名片</h2>
            <p className="text-gray-600 mb-6">
              创建支持多语言的名片，适合国际联系人。
            </p>

            <VCardForm onSave={handleVCardSave} />
          </div>
        )}

        {activeTab === 'ar' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">AR 3D 模型集成</h2>
            <p className="text-gray-600 mb-6">
              将二维码链接到可在增强现实中查看的 3D 模型。
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🥽 AR 查看器</h3>
                <p className="text-gray-600 mb-4">
                  用户可扫描二维码在移动设备上以 AR 方式查看 3D 模型。
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 支持 GLB/GLTF 模型</p>
                  <p>• 位置和缩放控制</p>
                  <p>• 交互式 3D 体验</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 模型托管</h3>
                <p className="text-gray-600 mb-4">
                  在我们的平台上托管 3D 模型或集成您自己的 CDN。
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 自动模型优化</p>
                  <p>• 加载性能追踪</p>
                  <p>• 全球 CDN 分发</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Overview */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="font-semibold mb-2">Zapier 集成</h3>
          <p className="text-sm text-gray-600">
            通过 Zapier Webhook 连接数千个应用，实现自动化工作流。
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-semibold mb-2">微信小程序</h3>
          <p className="text-sm text-gray-600">
            生成专为微信小程序集成设计的二维码。
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="font-semibold mb-2">REST API</h3>
          <p className="text-sm text-gray-600">
            完整的 REST API，用于程序化二维码生成和管理。
          </p>
        </div>
      </div>
    </div>
  )
}