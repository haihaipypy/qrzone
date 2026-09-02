import type { Team } from '@/lib/types'

interface TeamCardProps {
  team: Team
  onManage: () => void
}

export function TeamCard({ team, onManage }: TeamCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onManage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Manage
        </button>
      </div>
    </div>
  )
}