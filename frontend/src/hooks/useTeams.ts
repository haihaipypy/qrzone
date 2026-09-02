'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { User, Team, TeamMember } from '@/lib/types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const response = await api.teams.list()
      setTeams(response)
    } catch (err) {
      // Don't propagate 401 — backend fix handles auth; avoid redirect loop
      const msg = err instanceof Error ? err.message : 'Failed to fetch teams'
      if (msg !== 'Unauthorized') setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (name: string) => {
    try {
      await api.teams.create(name)
      await fetchTeams()
    } catch (err) {
      throw err
    }
  }

  const addMember = async (teamId: string, email: string, role: 'admin' | 'member' = 'member') => {
    try {
      await api.teams.addMember(teamId, { email, role })
      await fetchTeams()
    } catch (err) {
      throw err
    }
  }

  const removeMember = async (teamId: string, userId: string) => {
    try {
      await api.teams.removeMember(teamId, userId)
      await fetchTeams()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return { teams, loading, error, createTeam, addMember, removeMember }
}