'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
type FormData = z.infer<typeof schema>

function zodResolver(schema: any) {
  return (data: any) => {
    try {
      const result = schema.parse(data)
      return { values: result, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = {
            message: issue.message,
            type: issue.code,
          }
        })
        return { values: {}, errors }
      }
      throw error
    }
  }
}

export default function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (data: FormData) => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          newErrors[path] = issue.message
        })
        setErrors(newErrors)
        return false
      }
      return false
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm(formData)) {
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await api.auth.register(formData.email, formData.password)
        toast.success(t('account_created'))
        setMode('login')
        setFormData({ email: '', password: '' })
      } else {
        await api.auth.login(formData.email, formData.password)
        window.location.href = '/dashboard'
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'login' ? t('sign_in') : t('create_account')}</CardTitle>
          <CardDescription>
            {mode === 'login' ? t('enter_credentials') : t('start_managing')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('please_wait') : mode === 'login' ? t('sign_in') : t('create_account')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === 'login' ? t('no_account') : t('already_have_account')}{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? t('sign_up') : t('sign_in')}
            </button>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
