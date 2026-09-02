'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import QRCreator from '@/components/qr/QRCreator'
import { api } from '@/lib/api'
import type { QRCode } from '@/lib/types'

function QRNewContent() {
  const t = useTranslations('qr')
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const [initial, setInitial] = useState<QRCode | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!editId) {
      setInitial(undefined)
      return
    }

    let cancelled = false
    setLoading(true)
    api.qr.get(editId)
      .then((qr) => {
        if (!cancelled) setInitial(qr)
      })
      .catch(() => {
        if (!cancelled) setInitial(undefined)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [editId])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{editId ? t('update') : t('create_title')}</h1>
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : <QRCreator initial={initial} />}
    </div>
  )
}

export default function NewQRPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <QRNewContent />
    </Suspense>
  )
}
