'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

interface TeamMember {
  id: string
  userId: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

const ROLE_LABELS: Record<string, string> = { owner: '所有者', admin: '管理员', member: '成员' }

export function TeamManagementPage() {
  const params = useParams()
  const teamId = params.id as string
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => { fetchTeamDetails() }, [teamId])

  const fetchTeamDetails = async () => {
    try {
      const teamData = await api.teams.get(teamId)
      setTeam(teamData)
      setMembers(teamData.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return
    setIsAdding(true)
    try {
      await api.teams.addMember(teamId, { email: newMemberEmail.trim(), role: newMemberRole })
      setNewMemberEmail('')
      setShowAddMember(false)
      await fetchTeamDetails()
    } catch (err) {
      console.error('添加成员失败:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('确认移除该成员？')) return
    try {
      await api.teams.removeMember(teamId, userId)
      await fetchTeamDetails()
    } catch (err) {
      console.error('移除成员失败:', err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800">错误</h3>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h1>
        <p className="text-gray-600">团队 ID：{team.id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">团队设置</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">可创建二维码</p>
              <p className="text-sm text-gray-500">{team.settings.canCreateQR ? '是' : '否'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">可查看所有二维码</p>
              <p className="text-sm text-gray-500">{team.settings.canViewAllQR ? '是' : '否'}</p>
            </div>
            {team.settings.maxQRPerMonth && (
              <div>
                <p className="text-sm font-medium text-gray-700">每月最大二维码数</p>
                <p className="text-sm text-gray-500">{team.settings.maxQRPerMonth}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">成员（{members.length}）</h2>
            <button onClick={() => setShowAddMember(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              添加成员
            </button>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{member.email}</p>
                  <p className="text-sm text-gray-500">
                    {ROLE_LABELS[member.role] ?? member.role} · 加入于 {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {member.role !== 'owner' && (
                  <button onClick={() => handleRemoveMember(member.userId)}
                    className="text-red-600 hover:text-red-800 text-sm">
                    移除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">添加团队成员</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                <input type="email" value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="member">成员（可创建和查看）</option>
                  <option value="admin">管理员（可编辑和删除）</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleAddMember} disabled={isAdding || !newMemberEmail.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isAdding ? '添加中...' : '添加'}
              </button>
              <button onClick={() => { setShowAddMember(false); setNewMemberEmail('') }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
