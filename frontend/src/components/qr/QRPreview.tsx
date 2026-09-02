'use client'

import { useEffect, useRef } from 'react'
import type { QRStyle } from '@/lib/types'

interface Props {
  content: string
  style: QRStyle
  size?: number
}

export default function QRPreview({ content, style, size = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!content || !style || !containerRef.current) return

    let cancelled = false

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return

      containerRef.current.innerHTML = ''

      const gradientOptions = style.dotsGradient
        ? {
            gradient: {
              type: style.dotsGradient.type as 'linear' | 'radial',
              rotation: 0,
              colorStops: [
                { offset: 0, color: style.dotsGradient.colors[0] },
                { offset: 1, color: style.dotsGradient.colors[1] },
              ],
            },
          }
        : { color: style.dotsColor }

      const qr = new QRCodeStyling({
        width: size,
        height: size,
        data: content,
        dotsOptions: {
          type: style.dotsType,
          ...gradientOptions,
        },
        cornersSquareOptions: { type: style.cornersSquareType },
        cornersDotOptions: { type: style.cornersDotType },
        backgroundOptions: { color: style.background },
        imageOptions: { crossOrigin: 'anonymous', margin: 4 },
        image: style.logoUrl
          ? `/api/proxy-image?${new URLSearchParams({ url: style.logoUrl }).toString()}`
          : undefined,
      })

      qr.append(containerRef.current!)
    })

    return () => { cancelled = true }
  }, [content, style])

  return (
    <div className="flex items-center justify-center p-4 rounded-lg border bg-card">
      <div className="rounded-md bg-white p-2">
        <div ref={containerRef} />
      </div>
    </div>
  )
}
