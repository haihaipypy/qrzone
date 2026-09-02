import { Hono } from 'hono'
import type { AppEnv, Session } from '../lib/types'
import { authMiddleware } from '../middleware/auth'

const teams = new Hono<AppEnv>()

teams.use('*', authMiddleware)

// KV key helpers
const teamKey = (id: string) => `team:${id}`
const memberKey = (teamId: string, userId: string) => `team_member:${teamId}:${userId}`
const userTeamsKey = (userId: string) => `user_teams:${userId}`

async function getUserTeamIds(kv: KVNamespace, userId: string): Promise<string[]> {
  const data = await kv.get(userTeamsKey(userId))
  return data ? JSON.parse(data) : []
}

async function addUserToTeam(kv: KVNamespace, userId: string, teamId: string) {
  const ids = await getUserTeamIds(kv, userId)
  if (!ids.includes(teamId)) {
    ids.push(teamId)
    await kv.put(userTeamsKey(userId), JSON.stringify(ids))
  }
}

// GET /api/teams
teams.get('/', async (c) => {
  const { userId } = c.get('session')
  const teamIds = await getUserTeamIds(c.env.QR_KV, userId)
  const result = await Promise.all(
    teamIds.map(async (id) => {
      const data = await c.env.QR_KV.get(teamKey(id))
      return data ? JSON.parse(data) : null
    })
  )
  return c.json(result.filter(Boolean))
})

// POST /api/teams
teams.post('/', async (c) => {
  const { userId } = c.get('session')
  const { name } = await c.req.json()
  if (!name?.trim()) return c.json({ error: '团队名称不能为空' }, 400)

  const teamId = crypto.randomUUID()
  const team = {
    id: teamId,
    name: name.trim(),
    owner: userId,
    createdAt: new Date().toISOString(),
    settings: { canCreateQR: true, canViewAllQR: false, maxQRPerMonth: 1000 },
  }
  await c.env.QR_KV.put(teamKey(teamId), JSON.stringify(team))

  const member = {
    id: crypto.randomUUID(),
    teamId,
    userId,
    role: 'owner' as const,
    permissions: { canCreate: true, canView: true, canEdit: true, canDelete: true },
    joinedAt: new Date().toISOString(),
  }
  await c.env.QR_KV.put(memberKey(teamId, userId), JSON.stringify(member))
  await addUserToTeam(c.env.QR_KV, userId, teamId)

  return c.json({ success: true, teamId })
})

// GET /api/teams/:id
teams.get('/:id', async (c) => {
  const teamId = c.req.param('id')
  const data = await c.env.QR_KV.get(teamKey(teamId))
  if (!data) return c.json({ error: '团队不存在' }, 404)

  const teamData = JSON.parse(data)
  const memberList = await c.env.QR_KV.list({ prefix: `team_member:${teamId}:` })
  const members = await Promise.all(
    memberList.keys.map(async (k) => {
      const m = await c.env.QR_KV.get(k.name)
      if (!m) return null
      const member = JSON.parse(m)
      const userData = await c.env.AUTH_KV.get(`user:${member.userId}`)
      const email = userData ? JSON.parse(userData).email : member.userId
      return { ...member, email }
    })
  )
  return c.json({ ...teamData, members: members.filter(Boolean) })
})

// POST /api/teams/:id/members
teams.post('/:id/members', async (c) => {
  const { userId: adminId } = c.get('session')
  const teamId = c.req.param('id')
  const { email, role = 'member' } = await c.req.json()

  const adminData = await c.env.QR_KV.get(memberKey(teamId, adminId))
  if (!adminData) return c.json({ error: '无权限' }, 403)
  const admin = JSON.parse(adminData)
  if (admin.role !== 'owner' && admin.role !== 'admin') return c.json({ error: '无权限' }, 403)

  const allUsers = await c.env.AUTH_KV.list({ prefix: 'user:' })
  let targetUser = null
  for (const k of allUsers.keys) {
    const u = await c.env.AUTH_KV.get(k.name)
    if (u && JSON.parse(u).email === email) { targetUser = JSON.parse(u); break }
  }
  if (!targetUser) return c.json({ error: '用户不存在' }, 404)

  const member = {
    id: crypto.randomUUID(),
    teamId,
    userId: targetUser.id,
    role,
    permissions: {
      canCreate: role !== 'viewer',
      canView: true,
      canEdit: role === 'admin' || role === 'owner',
      canDelete: role === 'owner',
    },
    joinedAt: new Date().toISOString(),
  }
  await c.env.QR_KV.put(memberKey(teamId, targetUser.id), JSON.stringify(member))
  await addUserToTeam(c.env.QR_KV, targetUser.id, teamId)

  return c.json({ success: true, memberId: member.id })
})

// DELETE /api/teams/:id/members/:userId
teams.delete('/:id/members/:userId', async (c) => {
  const { userId: adminId } = c.get('session')
  const teamId = c.req.param('id')
  const targetId = c.req.param('userId')

  const adminData = await c.env.QR_KV.get(memberKey(teamId, adminId))
  if (!adminData) return c.json({ error: '无权限' }, 403)
  if (JSON.parse(adminData).role !== 'owner' && JSON.parse(adminData).role !== 'admin') return c.json({ error: '无权限' }, 403)

  const targetData = await c.env.QR_KV.get(memberKey(teamId, targetId))
  if (targetData && JSON.parse(targetData).role === 'owner') return c.json({ error: '不能移除团队所有者' }, 403)

  await c.env.QR_KV.delete(memberKey(teamId, targetId))
  return c.json({ success: true })
})

// PUT /api/teams/:id
teams.put('/:id', async (c) => {
  const { userId } = c.get('session')
  const teamId = c.req.param('id')

  const ownerData = await c.env.QR_KV.get(memberKey(teamId, userId))
  if (!ownerData || JSON.parse(ownerData).role !== 'owner') return c.json({ error: '仅团队所有者可修改设置' }, 403)

  const data = await c.env.QR_KV.get(teamKey(teamId))
  if (!data) return c.json({ error: '团队不存在' }, 404)

  const { settings } = await c.req.json()
  const team = JSON.parse(data)
  team.settings = { ...team.settings, ...settings }
  team.updatedAt = new Date().toISOString()
  await c.env.QR_KV.put(teamKey(teamId), JSON.stringify(team))

  return c.json({ success: true })
})

export default teams
