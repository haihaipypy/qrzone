'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Trash2, Plus, Copy, Key } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiKey } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function KeysPage() {
  const t = useTranslations('keys')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  useEffect(() => {
    api.keys.list().then(setKeys).catch(() => {})
  }, [])

  async function handleCreate() {
    if (!name.trim()) { toast.error(t('name_required')); return }
    setCreating(true)
    try {
      const created = await api.keys.create(name.trim())
      setKeys(prev => [...prev, created])
      setNewKey(created.key ?? null)
      setName('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(key: ApiKey) {
    if (!confirm(t('confirm_revoke', { name: key.name }))) return
    await api.keys.revoke(key.id)
    setKeys(prev => prev.filter(k => k.id !== key.id))
    toast.success(t('revoke'))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><h2 className="font-semibold">{t('new_key')}</h2></CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder={t('key_name_placeholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating}>
            <Plus className="h-4 w-4 mr-1" />{t('create')}
          </Button>
        </CardContent>
      </Card>

      {newKey && (
        <Card className="border-green-500">
          <CardContent className="pt-4 space-y-2">
            <p className="text-sm text-green-600 font-medium">{t('created_notice')}</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-xs bg-muted rounded px-3 py-2 break-all">{newKey}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copied') }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4 divide-y">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t('no_keys')}</p>
          ) : keys.map(k => (
            <div key={k.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('last_used')}: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : t('never')}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRevoke(k)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><h2 className="font-semibold text-sm">{t('example_title')}</h2></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted rounded p-3 overflow-x-auto">{`curl https://<你的域名>/api/qr \\
  -H "Authorization: Bearer ak_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My QR","content":"https://example.com","qrType":"url"}'`}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
