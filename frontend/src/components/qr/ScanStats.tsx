'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api'
import type { ScanLog } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  id: string
}

export default function ScanStats({ id }: Props) {
  const t = useTranslations('qr')
  const [scanCount, setScanCount] = useState(0)
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.qr.stats(id)
      .then(data => {
        setScanCount(data.scanCount)
        setScanLogs(data.scanLogs)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-32 bg-muted animate-pulse rounded-lg" />

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t('scan_stats')}</h2>
          <Badge variant="secondary">{t('scan_count')}: {scanCount}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {scanLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('recent_scans')}: 0</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4 font-medium">{t('scan_time')}</th>
                  <th className="text-left py-2 font-medium">{t('scan_ip')}</th>
                </tr>
              </thead>
              <tbody>
                {[...scanLogs].reverse().map((log, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="py-2 font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
