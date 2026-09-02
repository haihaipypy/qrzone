export type UserRole = 'admin' | 'employee' | 'viewer'

export interface User {
  id: string
  email: string
  role: UserRole
  teamId?: string
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  owner: string
  createdAt: string
  settings: {
    canCreateQR: boolean
    canViewAllQR: boolean
    maxQRPerMonth?: number
  }
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  permissions: {
    canCreate: boolean
    canView: boolean
    canEdit: boolean
    canDelete: boolean
  }
  joinedAt: string
}

export interface UserProfile {
  customDomain?: string
  updatedAt?: string
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  keyHash: string
  key?: string
  createdAt: string
  lastUsedAt?: string
}

export interface QRStyle {
  dotsType: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
  cornersSquareType: 'dot' | 'square' | 'extra-rounded'
  cornersDotType: 'dot' | 'square'
  background: string
  dotsColor: string
  dotsGradient?: { type: 'linear' | 'radial'; colors: [string, string] }
  logoUrl?: string
}

export type QRType = 'url' | 'text' | 'wifi' | 'vcard'

export interface LandingButton { label: string; url: string; primary?: boolean }
export interface LandingPage {
  title: string
  description?: string
  imageUrl?: string
  buttons: LandingButton[]
  theme?: 'light' | 'dark'
}

export interface GeoRule { countries: string[]; redirectUrl: string }

export interface ScanLog { time: string; ip: string }

export interface QRCode {
  id: string
  userId: string
  title: string
  content: string
  style: QRStyle
  expireAt?: string
  scanCount: number
  createdAt: string
  qrType: QRType
  scanLogs: ScanLog[]
  passwordHash?: string
  landingPage?: LandingPage
  geoRules?: GeoRule[]
  folder?: string
  isPublic?: boolean
  allowedUsers?: string[]
}
