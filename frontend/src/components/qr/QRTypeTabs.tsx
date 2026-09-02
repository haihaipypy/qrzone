'use client'

import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QRType } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'

interface Props {
  qrType: QRType
  onTypeChange: (type: QRType) => void
  content: string
  onContentChange: (content: string) => void
}

interface WifiFields { ssid: string; password: string; encryption: string }
interface VCardFields {
  name: string; phone: string; email: string; org: string
  title: string; street: string; city: string; state: string; zip: string; country: string
  website: string; birthday: string; note: string
  altName: string; altLang: string
}

function buildWifi(f: WifiFields) {
  return `WIFI:T:${f.encryption};S:${f.ssid};P:${f.password};;`
}

function parseWifi(s: string): WifiFields {
  return {
    ssid: s.match(/S:([^;]+)/)?.[1] ?? '',
    password: s.match(/P:([^;]+)/)?.[1] ?? '',
    encryption: s.match(/T:([^;]+)/)?.[1] ?? 'WPA',
  }
}

function parseVCard(s: string): VCardFields {
  const get = (key: string) => s.match(new RegExp(`^${key}[^:\\r\\n]*:(.*)`, 'm'))?.[1]?.trim() ?? ''
  const adr = get('ADR').split(';')
  const altMatch = s.match(/^FN;LANGUAGE=([^:]+):(.+)/m)
  return {
    name: get('FN'), phone: get('TEL'), email: get('EMAIL'), org: get('ORG'),
    title: get('TITLE'), street: adr[2] ?? '', city: adr[3] ?? '',
    state: adr[4] ?? '', zip: adr[5] ?? '', country: adr[6] ?? '',
    website: get('URL'), birthday: get('BDAY'), note: get('NOTE'),
    altName: altMatch?.[2] ?? '', altLang: altMatch?.[1] ?? '',
  }
}

function buildVCard(f: VCardFields) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${f.name}`, `N:${f.name};;;;`]
  if (f.phone) lines.push(`TEL;TYPE=CELL:${f.phone}`)
  if (f.email) lines.push(`EMAIL:${f.email}`)
  if (f.org) lines.push(`ORG:${f.org}`)
  if (f.title) lines.push(`TITLE:${f.title}`)
  if (f.street || f.city || f.state || f.zip || f.country)
    lines.push(`ADR;TYPE=WORK:;;${f.street};${f.city};${f.state};${f.zip};${f.country}`)
  if (f.website) lines.push(`URL:${f.website}`)
  if (f.birthday) lines.push(`BDAY:${f.birthday}`)
  if (f.note) lines.push(`NOTE:${f.note}`)
  if (f.altName && f.altLang) lines.push(`FN;LANGUAGE=${f.altLang}:${f.altName}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

export default function QRTypeTabs({ qrType, onTypeChange, content, onContentChange }: Props) {
  const t = useTranslations('qr')

  const [wifi, setWifi] = useState<WifiFields>(
    qrType === 'wifi' && content ? parseWifi(content) : { ssid: '', password: '', encryption: 'WPA' }
  )
  const [vcard, setVcard] = useState<VCardFields>(
    qrType === 'vcard' && content ? parseVCard(content) : {
      name: '', phone: '', email: '', org: '',
      title: '', street: '', city: '', state: '', zip: '', country: '',
      website: '', birthday: '', note: '', altName: '', altLang: '',
    }
  )
  const onContentChangeRef = useRef(onContentChange)
  onContentChangeRef.current = onContentChange

  useEffect(() => {
    if (qrType === 'wifi') onContentChangeRef.current(buildWifi(wifi))
  }, [wifi, qrType])

  useEffect(() => {
    if (qrType === 'vcard') onContentChangeRef.current(buildVCard(vcard))
  }, [vcard, qrType])

  function handleTabChange(val: string) {
    const type = val as QRType
    onTypeChange(type)
    if (type === 'wifi') onContentChangeRef.current(buildWifi(wifi))
    else if (type === 'vcard') onContentChangeRef.current(buildVCard(vcard))
    else onContentChangeRef.current('')
  }

  return (
    <Tabs value={qrType} onValueChange={handleTabChange}>
      <TabsList className="flex gap-1 rounded-lg bg-muted p-1 mb-3">
        {(['url', 'text', 'wifi', 'vcard'] as QRType[]).map(type => (
          <TabsTrigger
            key={type}
            value={type}
            className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {t(`type_${type}` as Parameters<typeof t>[0])}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="url">
        <div className="space-y-2">
          <Label htmlFor="content-url">{t('url_content')}</Label>
          <Input
            id="content-url"
            placeholder={t('url_placeholder')}
            value={content}
            onChange={e => onContentChange(e.target.value)}
          />
        </div>
      </TabsContent>

      <TabsContent value="text">
        <div className="space-y-2">
          <Label htmlFor="content-text">{t('url_content')}</Label>
          <Input
            id="content-text"
            placeholder={t('text_placeholder')}
            value={content}
            onChange={e => onContentChange(e.target.value)}
          />
        </div>
      </TabsContent>

      <TabsContent value="wifi" className="space-y-3">
        <div className="space-y-2">
          <Label>{t('wifi_ssid')}</Label>
          <Input placeholder="MyNetwork" value={wifi.ssid} onChange={e => setWifi(p => ({ ...p, ssid: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('wifi_password')}</Label>
          <Input type="password" placeholder="••••••••" value={wifi.password} onChange={e => setWifi(p => ({ ...p, password: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('wifi_encryption')}</Label>
          <Select value={wifi.encryption} onValueChange={v => setWifi(p => ({ ...p, encryption: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="vcard" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2">
            <Label>{t('vcard_name')}</Label>
            <Input placeholder="赵青松" value={vcard.name} onChange={e => setVcard(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('vcard_phone')}</Label>
            <Input value={vcard.phone} onChange={e => setVcard(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('vcard_email')}</Label>
            <Input type="email" value={vcard.email} onChange={e => setVcard(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('vcard_org')}</Label>
            <Input value={vcard.org} onChange={e => setVcard(p => ({ ...p, org: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>职位 (TITLE)</Label>
            <Input value={vcard.title} onChange={e => setVcard(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>街道地址</Label>
            <Input value={vcard.street} onChange={e => setVcard(p => ({ ...p, street: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>城市</Label>
            <Input value={vcard.city} onChange={e => setVcard(p => ({ ...p, city: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>省份</Label>
            <Input value={vcard.state} onChange={e => setVcard(p => ({ ...p, state: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>邮编</Label>
            <Input value={vcard.zip} onChange={e => setVcard(p => ({ ...p, zip: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>国家</Label>
            <Input value={vcard.country} onChange={e => setVcard(p => ({ ...p, country: e.target.value }))} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>网址 (URL)</Label>
            <Input placeholder="https://..." value={vcard.website} onChange={e => setVcard(p => ({ ...p, website: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>生日 (BDAY)</Label>
            <Input type="date" value={vcard.birthday} onChange={e => setVcard(p => ({ ...p, birthday: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>备注 (NOTE)</Label>
            <Input value={vcard.note} onChange={e => setVcard(p => ({ ...p, note: e.target.value }))} />
          </div>
          <div className="space-y-2 col-span-2 border-t pt-3">
            <Label className="text-xs text-muted-foreground">{t('vcard_alt_name')} (多语言)</Label>
            <div className="flex gap-2">
              <Input placeholder={t('vcard_alt_lang') + ' (e.g. en)'} value={vcard.altLang} onChange={e => setVcard(p => ({ ...p, altLang: e.target.value }))} className="w-24 shrink-0" />
              <Input placeholder="John Smith" value={vcard.altName} onChange={e => setVcard(p => ({ ...p, altName: e.target.value }))} />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
