'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useTeams } from '@/hooks/useTeams'
import { TeamCard } from './TeamCard'

export function TeamsPage() {
  const { teams, loading, createTeam } = useTeams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    setIsCreating(true)
    try {
      await createTeam(newTeamName.trim())
      setNewTeamName('')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create team:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleManageTeam = (teamId: string) => {
    // Navigate to team management page
    window.location.href = `/teams/${teamId}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">团队</h1>
          <p className="text-gray-600">管理您的团队成员和权限</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          创建团队
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无团队</h3>
          <p className="text-gray-600 mb-4">创建您的第一个团队，与成员协作</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            创建团队
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onManage={() => handleManageTeam(team.id)}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">创建新团队</h2>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="团队名称"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateTeam}
                disabled={isCreating || !newTeamName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? '创建中...' : '创建'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTeamName('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}