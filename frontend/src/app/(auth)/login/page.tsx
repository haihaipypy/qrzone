'use client'

import { useTranslations } from 'next-intl'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const t = useTranslations('auth')
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">qrzone</h1>
          <p className="text-muted-foreground mt-2">{t('enter_credentials')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
