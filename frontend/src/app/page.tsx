'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    api.auth.me().then(({ authenticated }) => {
      router.replace(authenticated ? '/dashboard' : '/login')
    }).catch(() => {
      router.replace('/login')
    })
  }, [router])

  return null
}
