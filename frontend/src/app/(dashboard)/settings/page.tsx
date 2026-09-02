'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const [customDomain, setCustomDomain] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.profile.get().then(p => setCustomDomain(p.customDomain ?? '')).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await api.profile.update({ customDomain: customDomain.trim() || undefined })
      toast.success(t('saved'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Card>
        <CardHeader className="pb-3"><h2 className="font-semibold">{t('custom_domain')}</h2></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{t('custom_domain_hint')}</p>
          <Input
            placeholder="qr.yourdomain.com"
            value={customDomain}
            onChange={e => setCustomDomain(e.target.value)}
          />
          <Button onClick={handleSave} disabled={saving}>{saving ? '…' : t('save')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
