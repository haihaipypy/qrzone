'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import type { QRCode } from '@/lib/types'
import QRCard from '@/components/qr/QRCard'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tQr = useTranslations('qr')
  const [qrs, setQRs] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  useEffect(() => {
    api.qr.list().then(setQRs).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const folders = useMemo(() =>
    Array.from(new Set(qrs.map(q => q.folder).filter(Boolean) as string[])).sort()
  , [qrs])

  const filtered = activeFolder ? qrs.filter(q => q.folder === activeFolder) : qrs

  function handleDelete(id: string) { setQRs(prev => prev.filter(q => q.id !== id)) }

  function handleFolderChange(id: string, folder: string | undefined) {
    setQRs(prev => prev.map(q => q.id === id ? { ...q, folder } : q))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {qrs.length === 1 ? t('count_one') : t('count_other', { count: qrs.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/qr/new"><Plus className="h-4 w-4 mr-2" />{t('new_qr_button')}</Link>
        </Button>
      </div>

      {folders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {[null, ...folders].map(f => (
            <button key={f ?? '__all'} onClick={() => setActiveFolder(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeFolder === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {f ?? tQr('all_folders')}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg">{t('no_qr')}</p>
          <Button asChild className="mt-4"><Link href="/qr/new">{t('create_first')}</Link></Button>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
          <AnimatePresence>
            {filtered.map(qr => (
              <QRCard key={qr.id} qr={qr} folders={folders} onDelete={handleDelete} onFolderChange={handleFolderChange} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
