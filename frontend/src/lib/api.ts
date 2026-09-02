import type { QRCode, ScanLog, ApiKey, UserProfile } from './types'

let redirecting = false

// 生产环境前端与 API 由同一个 Worker 同源托管，留空即为相对路径。
// 本地开发时前端跑在 3000、Worker 跑在 8787，由 NEXT_PUBLIC_API_BASE 指过去。
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? ''

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('session_token') : null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Construct full URL with API base
  const url = `${API_BASE_URL}${path}`

  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/api/auth/') && !redirecting) {
      redirecting = true
      window.location.replace('/login')
      throw new Error('Unauthorized')
    }
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }

  return res.json()
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ success: boolean }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: async (email: string, password: string) => {
      const res = await request<{ success: boolean; email: string; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res.token && typeof window !== 'undefined') {
        localStorage.setItem('session_token', res.token)
      }
      return res
    },
    logout: async () => {
      const res = await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' })
      if (typeof window !== 'undefined') localStorage.removeItem('session_token')
      redirecting = false
      return res
    },
    me: () => request<{ authenticated: boolean; email?: string }>('/api/auth/me'),
  },
  teams: {
    list: () => request<any[]>('/api/teams'),
    create: (name: string) =>
      request<{ success: boolean; teamId: string }>('/api/teams', { method: 'POST', body: JSON.stringify({ name }) }),
    get: (id: string) => request<any>(`/api/teams/${id}`),
    addMember: (teamId: string, data: { email: string; role: string }) =>
      request<{ success: boolean; memberId: string }>(`/api/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify(data) }),
    removeMember: (teamId: string, userId: string) =>
      request<{ success: boolean }>(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),
    updateSettings: (teamId: string, settings: any) =>
      request<{ success: boolean }>(`/api/teams/${teamId}`, { method: 'PUT', body: JSON.stringify({ settings }) }),
  },
  qr: {
    list: () => request<QRCode[]>('/api/qr'),
    get: (id: string) => request<QRCode>(`/api/qr/${id}`),
    create: (data: Partial<QRCode> & { password?: string }) =>
      request<QRCode>('/api/qr', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<QRCode> & { password?: string }) =>
      request<QRCode>(`/api/qr/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/qr/${id}`, { method: 'DELETE' }),
    stats: (id: string) =>
      request<{ scanCount: number; scanLogs: ScanLog[] }>(`/api/qr/${id}/stats`),
    bulk: (urls: string[]) =>
      request<QRCode[]>('/api/qr/bulk', { method: 'POST', body: JSON.stringify({ urls }) }),
  },
  keys: {
    list: () => request<ApiKey[]>('/api/keys'),
    create: (name: string) => request<ApiKey>('/api/keys', { method: 'POST', body: JSON.stringify({ name }) }),
    revoke: (id: string) => request<{ success: boolean }>(`/api/keys/${id}`, { method: 'DELETE' }),
  },
  profile: {
    get: () => request<UserProfile>('/api/profile'),
    update: (data: Partial<UserProfile>) => request<UserProfile>('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
}
