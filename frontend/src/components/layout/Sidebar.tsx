'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Plus, LogOut, Layers, KeyRound, Settings, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function Sidebar() {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/qr/new', label: t('new_qr'), icon: Plus },
    { href: '/features', label: '高级功能', icon: Star },
    { href: '/qr/bulk', label: t('bulk'), icon: Layers },
    { href: '/teams', label: '团队', icon: Layers },
    { href: '/keys', label: t('api_keys'), icon: KeyRound },
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  async function handleLogout() {
    await api.auth.logout().catch(() => {})
    toast.success(tAuth('logged_out'))
    router.push('/login')
  }

  return (
    <aside className="w-56 border-r bg-card flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#E8735A"/>
          <rect x="14" y="14" width="14" height="14" rx="3" fill="#F5C842"/>
          <text x="15" y="25" fontSize="8" fontWeight="bold" fill="#1a1a1a" fontFamily="sans-serif">Z</text>
          <rect x="4" y="4" width="9" height="9" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="5.5" y="5.5" width="6" height="6" rx="1" fill="#E8735A"/>
          <rect x="4" y="15" width="9" height="9" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="5.5" y="16.5" width="6" height="6" rx="1" fill="#E8735A"/>
          <rect x="15" y="4" width="9" height="9" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="16.5" y="5.5" width="6" height="6" rx="1" fill="#E8735A"/>
        </svg>
        <span className="font-bold text-sm">ErWeiMa<span style={{color:'#E8735A'}}>Zens</span></span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
    </aside>
  )
}
