import { Hono } from 'hono'
import type { AppEnv } from '../lib/types'

// 二维码 Logo 常托管在第三方站点，浏览器直接加载会被 Canvas 的同源策略阻断，
// 因此由 Worker 代为抓取并回传字节流。
// 该能力原先由 Cloudflare Pages Functions 提供，合并为单 Worker 后搬到这里。
const app = new Hono<AppEnv>()

const IMAGE_UA = 'Mozilla/5.0 (compatible; QRZoneImageProxy/1.0)'

app.get('/', async (c) => {
  const raw = c.req.query('url')
  if (!raw) {
    return c.json({ error: 'Missing url parameter' }, 400)
  }

  // Logo 地址可能被二次编码，两种形态都尝试解析
  const candidates = [raw]
  try {
    candidates.push(decodeURIComponent(raw))
  } catch {
    // 非法编码序列直接忽略，回退到原始值
  }

  let target: URL | null = null
  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        target = parsed
        break
      }
    } catch {
      // 非绝对地址，继续尝试下一个候选
    }
  }

  if (!target) {
    return c.json({ error: 'Invalid url parameter' }, 400)
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: 'image/*,*/*;q=0.8',
      'User-Agent': IMAGE_UA,
    },
  })

  if (!upstream.ok || !upstream.body) {
    return c.json(
      {
        error: 'Upstream image request failed',
        upstreamStatus: upstream.status,
        upstreamUrl: target.toString(),
      },
      502,
    )
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

export default app
