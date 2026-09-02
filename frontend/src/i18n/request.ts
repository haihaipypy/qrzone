import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'zh'
  const messages = (await import(`../../messages/${locale}.json`)).default
  return { locale, messages }
})
