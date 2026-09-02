'use client'

import { useTranslations } from 'next-intl'
import BulkGenerator from '@/components/qr/BulkGenerator'

export default function BulkPage() {
  const t = useTranslations('qr')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('bulk_title')}</h1>
      <BulkGenerator />
    </div>
  )
}
