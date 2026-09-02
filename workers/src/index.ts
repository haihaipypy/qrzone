import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './lib/types'
import auth from './routes/auth'
import qr from './routes/qr'
import shortlink from './routes/shortlink'
import keys from './routes/keys'
import profile from './routes/profile'
import teams from './routes/teams'
import webhooks from './routes/webhooks'
import qrEnhanced from './routes/qrEnhanced'
import ar from './routes/ar'
import proxyImage from './routes/proxyImage'

const app = new Hono<AppEnv>()

// 前端与 API 已合并进同一个 Worker，浏览器请求同源，这里回显调用方 origin
// 只是为了让 Open API 仍能被第三方页面跨域调用。
// 认证走 Bearer Token 而非 Cookie，因此不存在 CSRF 风险。
app.use('/api/*', cors({
  origin: (origin) => origin,
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Authentication middleware
app.use('*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    c.set('user', null)
    return next()
  }

  const session = await c.env.AUTH_KV.get(`session:${token}`)
  if (session) {
    const sessionData = JSON.parse(session)
    c.set('user', sessionData)
  }

  return next()
})

app.route('/api/auth', auth)
app.route('/api/qr', qr)
app.route('/api/keys', keys)
app.route('/api/profile', profile)
app.route('/api/teams', teams)
app.route('/api/webhooks', webhooks)
app.route('/api/qr-enhanced', qrEnhanced)
app.route('/api/ar', ar)
app.route('/api/proxy-image', proxyImage)
app.route('/q', shortlink)

export default app
