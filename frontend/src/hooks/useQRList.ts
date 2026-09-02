'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { QRCode } from '@/lib/types'

export function useQRList() {
  const [qrs, setQRs] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.qr.list()
      .then(setQRs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function remove(id: string) {
    setQRs(prev => prev.filter(q => q.id !== id))
  }

  return { qrs, loading, error, remove }
}
