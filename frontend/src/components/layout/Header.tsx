'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('common')
  const router = useRouter()

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
    router.refresh()
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-end px-6 gap-2">
      <Button variant="ghost" size="sm" onClick={() => switchLocale('zh')} className="text-xs px-2">
        {t('lang_zh')}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => switchLocale('en')} className="text-xs px-2">
        {t('lang_en')}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  )
}
