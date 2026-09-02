import AppProviders from '@/components/providers/AppProviders'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'zh'
  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <title>qrzone · 二维码管理平台</title>
        <meta name="description" content="批量生成、美化并追踪你的二维码" />
      </head>
      <body>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
