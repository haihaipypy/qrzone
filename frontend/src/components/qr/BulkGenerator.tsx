'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { QRCode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function BulkGenerator() {
  const t = useTranslations('qr')
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [zipping, setZipping] = useState(false)
  const [created, setCreated] = useState<QRCode[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  async function handleGenerate() {
    const urls = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (urls.length === 0) return
    setLoading(true)
    setProgress({ done: 0, total: urls.length })
    try {
      const result = await api.qr.bulk(urls)
      setCreated(result)
      setProgress({ done: result.length, total: urls.length })
      toast.success(t('bulk_success', { count: result.length }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadZip() {
    if (created.length === 0) return
    setZipping(true)
    try {
      const [{ default: QRCodeStyling }, { default: JSZip }] = await Promise.all([
        import('qr-code-styling'),
        import('jszip'),
      ])
      const zip = new JSZip()
      await Promise.all(created.map(async (qr) => {
        const instance = new QRCodeStyling({
          width: 512, height: 512, data: qr.content,
          dotsOptions: { type: qr.style.dotsType, color: qr.style.dotsColor },
          cornersSquareOptions: { type: qr.style.cornersSquareType },
          cornersDotOptions: { type: qr.style.cornersDotType },
          backgroundOptions: { color: qr.style.background },
        })
        const blob = await instance.getRawData('png')
        if (blob) zip.file(`${qr.title.slice(0, 40).replace(/[/\\?%*:|"<>]/g, '_')}.png`, blob)
      }))
      const content = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(content)
      a.download = 'qrcodes.zip'
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success(t('zip_success', { count: created.length }))
    } catch {
      toast.error(t('zip_failed'))
    } finally {
      setZipping(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="font-semibold">{t('bulk_title')}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          className="w-full min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t('bulk_placeholder')}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
        />
        {progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.done} / {progress.total}</span>
              <span>{Math.round((progress.done / progress.total) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleGenerate} disabled={loading || !text.trim()} className="flex-1">
            {loading ? `${progress?.done ?? 0} / ${progress?.total ?? 0}` : t('bulk_generate')}
          </Button>
          {created.length > 0 && (
            <Button variant="outline" onClick={handleDownloadZip} disabled={zipping} className="flex-1">
              {zipping ? t('zip_packing') : t('zip_download', { count: created.length })}
            </Button>
          )}
        </div>
        {created.length > 0 && (
          <Button variant="ghost" className="w-full text-sm" onClick={() => { router.refresh(); router.push('/dashboard') }}>
            {t('go_dashboard')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
