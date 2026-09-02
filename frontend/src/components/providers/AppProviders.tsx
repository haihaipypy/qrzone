'use client'

import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import type { AbstractIntlMessages } from 'next-intl'
import { Toaster } from 'sonner'

type Props = {
  children: React.ReactNode
  locale: string
  messages: AbstractIntlMessages
}

export default function AppProviders({ children, locale, messages }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
