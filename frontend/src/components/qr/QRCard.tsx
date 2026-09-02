'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Copy, Edit, Trash2, BarChart2, FolderOpen } from 'lucide-react'
import type { QRCode } from '@/lib/types'
import { api } from '@/lib/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import QRPreview from './QRPreview'

interface Props {
  qr: QRCode
  folders: string[]
  onDelete: (id: string) => void
  onFolderChange: (id: string, folder: string | undefined) => void
}

export default function QRCard({ qr, folders, onDelete, onFolderChange }: Props) {
  const t = useTranslations('qr')
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${qr.id}`
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [newFolder, setNewFolder] = useState('')

  async function handleCopy() {
    const text = qr.qrType === 'url' ? shortUrl : qr.content
    await navigator.clipboard.writeText(text)
    toast.success(t('link_copied'))
  }

  async function handleDelete() {
    if (!confirm(t('confirm_delete', { title: qr.title }))) return
    try {
      await api.qr.delete(qr.id)
      onDelete(qr.id)
      toast.success(t('deleted'))
    } catch {
      toast.error(t('delete_failed'))
    }
  }

  async function handleMoveFolder(folder: string | undefined) {
    try {
      await api.qr.update(qr.id, { folder: folder || '' })
      onFolderChange(qr.id, folder || undefined)
      setShowFolderPicker(false)
      setNewFolder('')
    } catch {
      toast.error('移动失败')
    }
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="h-full flex flex-col">
        <CardContent className="pt-5 flex-1 space-y-3">
          <QRPreview content={qr.content} style={qr.style} size={200} />
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{qr.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {qr.qrType && qr.qrType !== 'url' && (
                <Badge variant="outline" className="text-xs capitalize">{t(`type_${qr.qrType}`)}</Badge>
              )}
              <Badge variant="secondary" className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" />
                {qr.scanCount}
              </Badge>
            </div>
          </div>
          {qr.folder && (
            <Badge variant="outline" className="text-xs gap-1">
              <FolderOpen className="h-3 w-3" />{qr.folder}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground truncate">{qr.content}</p>
          <p className="text-xs text-muted-foreground">{new Date(qr.createdAt).toLocaleDateString()}</p>

          {showFolderPicker && (
            <div className="space-y-2 p-2 border rounded-md bg-muted/40">
              <p className="text-xs font-medium">移动到分组</p>
              <div className="flex flex-wrap gap-1">
                {folders.map(f => (
                  <button key={f} onClick={() => handleMoveFolder(f)}
                    className="px-2 py-0.5 text-xs rounded border bg-background hover:bg-accent">
                    {f}
                  </button>
                ))}
                {qr.folder && (
                  <button onClick={() => handleMoveFolder(undefined)}
                    className="px-2 py-0.5 text-xs rounded border bg-background hover:bg-destructive/10 text-destructive">
                    移出分组
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <input value={newFolder} onChange={e => setNewFolder(e.target.value)}
                  placeholder="新建分组名…" className="flex-1 text-xs px-2 py-1 border rounded bg-background" />
                <button onClick={() => newFolder.trim() && handleMoveFolder(newFolder.trim())}
                  className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground">确定</button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2 pt-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
            <Copy className="h-3.5 w-3.5 mr-1" />{t('copy')}
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/qr/new?id=${encodeURIComponent(qr.id)}`}>
              <Edit className="h-3.5 w-3.5 mr-1" />{t('edit')}
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowFolderPicker(v => !v)}>
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
