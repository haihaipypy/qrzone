'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Download, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { QRCode, QRStyle, QRType, LandingPage, GeoRule } from '@/lib/types'
import QRPreview from './QRPreview'
import QRTypeTabs from './QRTypeTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const DEFAULT_STYLE: QRStyle = {
  dotsType: 'rounded', cornersSquareType: 'extra-rounded', cornersDotType: 'dot',
  background: '#ffffff', dotsColor: '#000000',
}

interface Props { initial?: QRCode }

export default function QRCreator({ initial }: Props) {
  const t = useTranslations('qr')
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [qrType, setQrType] = useState<QRType>(initial?.qrType ?? 'url')
  const [content, setContent] = useState(initial?.content ?? '')
  const [style, setStyle] = useState<QRStyle>(initial?.style ?? DEFAULT_STYLE)
  const [useGradient, setUseGradient] = useState(!!initial?.style?.dotsGradient)
  const [saving, setSaving] = useState(false)

  // New fields
  const [expireAt, setExpireAt] = useState(initial?.expireAt ? initial.expireAt.slice(0, 16) : '')
  const [password, setPassword] = useState('')
  const [useLanding, setUseLanding] = useState(!!initial?.landingPage)
  const [landing, setLanding] = useState<LandingPage>(
    initial?.landingPage ?? { title: '', description: '', imageUrl: '', buttons: [], theme: 'light' }
  )
  const [geoRules, setGeoRules] = useState<GeoRule[]>(initial?.geoRules ?? [])
  const [folder, setFolder] = useState(initial?.folder ?? '')
  const [generatingGif, setGeneratingGif] = useState(false)

  function updateStyle(patch: Partial<QRStyle>) { setStyle(prev => ({ ...prev, ...patch })) }

  function addGeoRule() { setGeoRules(r => [...r, { countries: [], redirectUrl: '' }]) }
  function removeGeoRule(i: number) { setGeoRules(r => r.filter((_, idx) => idx !== i)) }
  function updateGeoRule(i: number, patch: Partial<GeoRule>) {
    setGeoRules(r => r.map((rule, idx) => idx === i ? { ...rule, ...patch } : rule))
  }

  function addButton() { setLanding(l => ({ ...l, buttons: [...l.buttons, { label: '', url: '', primary: false }] })) }
  function removeButton(i: number) { setLanding(l => ({ ...l, buttons: l.buttons.filter((_, idx) => idx !== i) })) }
  function updateButton(i: number, patch: Partial<LandingPage['buttons'][0]>) {
    setLanding(l => ({ ...l, buttons: l.buttons.map((b, idx) => idx === i ? { ...b, ...patch } : b) }))
  }

  async function handleSave() {
    if (!title || !content) { toast.error(t('error_required')); return }
    setSaving(true)
    try {
      const payload = {
        title, content, qrType,
        style: useGradient ? style : { ...style, dotsGradient: undefined },
        expireAt: expireAt ? new Date(expireAt).toISOString() : undefined,
        password: password || undefined,
        landingPage: useLanding ? landing : undefined,
        geoRules: geoRules.length ? geoRules : undefined,
        folder: folder.trim() || undefined,
      }
      if (initial) {
        await api.qr.update(initial.id, payload)
        toast.success(t('updated'))
      } else {
        const created = await api.qr.create(payload)
        toast.success(t('created'))
        await navigator.clipboard.writeText(`${window.location.origin}/q/${created.id}`).catch(() => {})
        toast.success(t('link_copied'))
        router.refresh()
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadGif() {
    if (!content) return
    setGeneratingGif(true)
    try {
      const [{ default: QRCodeStyling }, { default: GIF }] = await Promise.all([
        import('qr-code-styling'),
        import('gif.js'),
      ])
      const gif = new GIF({
        workers: 2, quality: 10, width: 512, height: 512,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
      })
      const colors = Array.from({ length: 8 }, (_, i) => `hsl(${i * 45}, 80%, 35%)`)
      for (const color of colors) {
        const qr = new QRCodeStyling({
          width: 512, height: 512, data: content,
          dotsOptions: { type: style.dotsType, color },
          cornersSquareOptions: { type: style.cornersSquareType },
          cornersDotOptions: { type: style.cornersDotType },
          backgroundOptions: { color: style.background },
        })
        const blob = await qr.getRawData('png')
        if (!blob) continue
        const img = new Image()
        img.src = URL.createObjectURL(blob as Blob)
        await new Promise(r => { img.onload = r })
        const canvas = document.createElement('canvas')
        canvas.width = 512; canvas.height = 512
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        gif.addFrame(canvas, { delay: 150, copy: true })
        URL.revokeObjectURL(img.src)
      }
      gif.on('finished', (blob: Blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${title || 'qrcode'}.gif`
        a.click()
        URL.revokeObjectURL(a.href)
        setGeneratingGif(false)
      })
      gif.render()
    } catch {
      toast.error('GIF generation failed')
      setGeneratingGif(false)
    }
  }

  async function handleDownload(format: 'png' | 'svg') {
    if (!content) return
    const { default: QRCodeStyling } = await import('qr-code-styling')
    const qr = new QRCodeStyling({
      width: 1024, height: 1024, data: content,
      dotsOptions: {
        type: style.dotsType,
        ...(useGradient && style.dotsGradient
          ? { gradient: { type: style.dotsGradient.type, rotation: 0, colorStops: [{ offset: 0, color: style.dotsGradient.colors[0] }, { offset: 1, color: style.dotsGradient.colors[1] }] } }
          : { color: style.dotsColor }),
      },
      cornersSquareOptions: { type: style.cornersSquareType },
      cornersDotOptions: { type: style.cornersDotType },
      backgroundOptions: { color: style.background },
      image: style.logoUrl ?? undefined,
      imageOptions: { crossOrigin: 'anonymous', margin: 4 },
    })
    qr.download({ name: title || 'qrcode', extension: format })
  }

  const previewStyle = useGradient ? style : { ...style, dotsGradient: undefined }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('title_label')}</Label>
            <Input id="title" placeholder={t('title_placeholder')} value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* Folder */}
          <div className="space-y-2">
            <Label htmlFor="folder">{t('folder')}</Label>
            <Input id="folder" placeholder={t('folder_placeholder')} value={folder} onChange={e => setFolder(e.target.value)} />
          </div>

          <QRTypeTabs qrType={qrType} onTypeChange={setQrType} content={content} onContentChange={setContent} />

          {/* Dot style */}
          <div className="space-y-2">
            <Label>{t('dot_style')}</Label>
            <Select value={style.dotsType} onValueChange={v => updateStyle({ dotsType: v as QRStyle['dotsType'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['rounded','dots','classy','classy-rounded','square','extra-rounded'] as const).map(type => (
                  <SelectItem key={type} value={type}>{t(`dot_style_${type.replace('-', '_')}` as Parameters<typeof t>[0])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Corner styles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('corner_square_style')}</Label>
              <Select value={style.cornersSquareType} onValueChange={v => updateStyle({ cornersSquareType: v as QRStyle['cornersSquareType'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['dot','square','extra-rounded'] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('corner_dot_style')}</Label>
              <Select value={style.cornersDotType} onValueChange={v => updateStyle({ cornersDotType: v as QRStyle['cornersDotType'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['dot','square'] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bg">{t('background_color')}</Label>
              <div className="flex gap-2">
                <input type="color" id="bg" value={style.background} onChange={e => updateStyle({ background: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                <Input value={style.background} onChange={e => updateStyle({ background: e.target.value })} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dotsColor">{t('dot_color')}</Label>
              <div className="flex gap-2">
                <input type="color" id="dotsColor" value={style.dotsColor} onChange={e => updateStyle({ dotsColor: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                <Input value={style.dotsColor} onChange={e => updateStyle({ dotsColor: e.target.value })} className="font-mono text-xs" />
              </div>
            </div>
          </div>

          {/* Gradient */}
          <div className="flex items-center gap-3">
            <Switch id="gradient" checked={useGradient} onCheckedChange={setUseGradient} />
            <Label htmlFor="gradient">{t('use_gradient')}</Label>
          </div>
          {useGradient && (
            <div className="space-y-3 pl-2 border-l-2 border-primary/30">
              <Select value={style.dotsGradient?.type ?? 'linear'} onValueChange={v => updateStyle({ dotsGradient: { type: v as 'linear'|'radial', colors: style.dotsGradient?.colors ?? ['#000000','#6366f1'] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">{t('gradient_linear')}</SelectItem>
                  <SelectItem value="radial">{t('gradient_radial')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <input type="color" value={style.dotsGradient?.colors[0] ?? '#000000'} onChange={e => updateStyle({ dotsGradient: { type: style.dotsGradient?.type ?? 'linear', colors: [e.target.value, style.dotsGradient?.colors[1] ?? '#6366f1'] } })} className="h-10 w-full rounded border cursor-pointer" />
                <input type="color" value={style.dotsGradient?.colors[1] ?? '#6366f1'} onChange={e => updateStyle({ dotsGradient: { type: style.dotsGradient?.type ?? 'linear', colors: [style.dotsGradient?.colors[0] ?? '#000000', e.target.value] } })} className="h-10 w-full rounded border cursor-pointer" />
              </div>
            </div>
          )}

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">{t('logo_url')}</Label>
            <Input id="logo" placeholder="https://…/logo.png" value={style.logoUrl ?? ''} onChange={e => updateStyle({ logoUrl: e.target.value || undefined })} />
          </div>

          {/* ── 过期时间 ── */}
          <div className="space-y-2">
            <Label htmlFor="expireAt">过期时间（可选）</Label>
            <Input id="expireAt" type="datetime-local" value={expireAt} onChange={e => setExpireAt(e.target.value)} />
          </div>

          {/* ── 密码保护 ── */}
          <div className="space-y-2">
            <Label htmlFor="password">访问密码（可选，留空不设置）</Label>
            <Input id="password" type="password" placeholder={initial?.passwordHash ? '已设置密码，输入新密码可修改' : '设置访问密码'} value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {/* ── 落地页 ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch id="useLanding" checked={useLanding} onCheckedChange={setUseLanding} />
              <Label htmlFor="useLanding">启用自定义落地页（扫码跳 H5 页面）</Label>
            </div>
            {useLanding && (
              <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                <Input placeholder="页面标题" value={landing.title} onChange={e => setLanding(l => ({ ...l, title: e.target.value }))} />
                <Input placeholder="简介描述（可选）" value={landing.description ?? ''} onChange={e => setLanding(l => ({ ...l, description: e.target.value }))} />
                <Input placeholder="头像/图片 URL（可选）" value={landing.imageUrl ?? ''} onChange={e => setLanding(l => ({ ...l, imageUrl: e.target.value }))} />
                <Select value={landing.theme ?? 'light'} onValueChange={v => setLanding(l => ({ ...l, theme: v as 'light'|'dark' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色主题</SelectItem>
                    <SelectItem value="dark">深色主题</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">按钮列表</Label>
                  {landing.buttons.map((btn, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input placeholder="按钮文字" value={btn.label} onChange={e => updateButton(i, { label: e.target.value })} className="flex-1" />
                      <Input placeholder="链接 URL" value={btn.url} onChange={e => updateButton(i, { url: e.target.value })} className="flex-1" />
                      <Switch checked={!!btn.primary} onCheckedChange={v => updateButton(i, { primary: v })} />
                      <Button variant="ghost" size="icon" onClick={() => removeButton(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addButton} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />添加按钮
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── 地理围栏 ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>地理围栏（按国家跳转不同链接）</Label>
              <Button variant="outline" size="sm" onClick={addGeoRule}><Plus className="h-4 w-4 mr-1" />添加规则</Button>
            </div>
            {geoRules.map((rule, i) => (
              <div key={i} className="flex gap-2 items-center pl-2 border-l-2 border-primary/30">
                <Input placeholder="国家代码，逗号分隔（如 CN,HK,TW）" value={rule.countries.join(',')} onChange={e => updateGeoRule(i, { countries: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) })} className="flex-1" />
                <Input placeholder="跳转 URL" value={rule.redirectUrl} onChange={e => updateGeoRule(i, { redirectUrl: e.target.value })} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeGeoRule(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? t('saving') : initial ? t('update') : t('create')}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <QRPreview content={content || 'https://example.com'} style={previewStyle} />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => handleDownload('png')} disabled={!content}>
            <Download className="h-4 w-4 mr-2" />PNG
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleDownload('svg')} disabled={!content}>
            <Download className="h-4 w-4 mr-2" />SVG
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadGif} disabled={!content || generatingGif}>
            <Download className="h-4 w-4 mr-2" />{generatingGif ? t('gif_generating') : t('download_gif')}
          </Button>
        </div>
      </div>
    </div>
  )
}
