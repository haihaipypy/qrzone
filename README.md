# qrzone · 二维码管理平台

二维码批量生成与动态二维码管理工具。前端与后端合并运行在**同一个 Cloudflare Worker** 上，零配置部署，全程免费、无需服务器。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 部署（Connect-to-Git · 操作最少）

> 全部操作都在 **Cloudflare Dashboard 一个页面里点击完成**，不需要任何 GitHub secrets、API Token 或本地 wrangler。首次部署约 5 分钟，成功后 `git push` 自动触发重新部署。

### 步骤

1. **登录 Cloudflare Dashboard**（[dash.cloudflare.com](https://dash.cloudflare.com/)，没账号先免费注册）
2. **左侧栏 → Workers & Pages → 点 Create application**
3. **选 Workers 标签 → Import a Git repository**
4. **Connect to Git → 选 GitHub → 完成 OAuth 授权**（弹窗点 Authorize 即可）
5. **选你的 fork 仓库**：`<你的 GitHub 用户名>/qrzone`
6. **Build settings 已默认填好**：
    - Build command：`npm run build`
    - Deploy command：`npx wrangler deploy`
    - 其余不动
7. **点页面底部 Deploy and save**，等进度条跑完

完成后 Cloudflare 会给你一个 `https://qrzone.<你的子域>.workers.dev` 的地址，打开就能用。

### 第一次之后

以后改代码只需要：

```bash
git push origin main
```

Cloudflare 自动检测 fork 仓库的 `main` 分支变化 → 自动 build + deploy，**你什么都不用做**。两个 KV 命名空间会在首次部署时自动创建，Cloudflare 自己记住 id，以后永远复用。

### 为什么是这个方案

| 维度 | Connect-to-Git（这个方案）| GitHub Actions（替代）|
|---|---|---|
| 平台切换 | **0 次**（全程在 CF Dashboard）| 2 次（CF 拿 token → GitHub 配 secret）|
| 鼠标点击 | 7 步 | 6 步 |
| 复制粘贴凭据 | **0 个** | 1 个 API Token + 2 个 GitHub Secrets |
| 出错断点 | 1 个（OAuth 授权）| 4 个（KV id / token / secret 名 / workflow 字段）|
| 后续 push 行为 | 完全一样 | 完全一样 |

**操作最少 = 平台切换最少 = 凭据最少 = 出错最少**。

---

## 本地开发

需要 Node.js 20+。

```bash
npm install
```

**方式一：带热更新（推荐开发时用）**

开两个终端：

```bash
npm run dev:worker     # Worker 跑在 http://localhost:8787
npm run dev:frontend   # 前端跑在 http://localhost:3000
```

前端通过 `.env.development` 里的 `NEXT_PUBLIC_API_BASE` 指向 8787。

**方式二：与生产形态一致**

```bash
npm run dev            # 先构建前端，再由 Worker 托管，统一访问 8787
```

本地开发用的是 Wrangler 的本地 KV 模拟，数据保存在 `.wrangler/` 目录，不会碰线上的数据。

---

## 功能

| 功能 | 说明 |
| --- | --- |
| 多类型二维码 | URL、纯文本、WiFi、vCard 名片（含多语言备用姓名） |
| 样式自定义 | 点样式、角落样式、颜色、渐变、Logo |
| 动态二维码 | 扫码跳短链，后台可随时修改目标地址 |
| 过期时间 | 每个二维码可单独设置失效时间 |
| 密码保护 | 扫码后需输入密码才能访问 |
| 自定义落地页 | 扫码跳 H5 页面（标题 / 简介 / 按钮 / 主题） |
| 地理围栏 | 按国家或地区跳转不同链接 |
| 扫描统计 | 记录扫描次数、时间、来源 IP |
| 批量生成 | 一次输入多条 URL，批量出码 |
| ZIP 下载 | 批量生成后打包下载 PNG |
| 动画 GIF | 由前端生成彩色循环动画的二维码 GIF |
| 文件夹分类 | 给二维码打标签，仪表盘一键过滤 |
| 自定义短链域名 | 设置页面配置自己的域名作为短链前缀 |
| 团队与权限 | 创建团队、邀请成员、按角色控制增删改查 |
| Open API | 生成 API Key，通过 REST 接口程序化管理二维码 |
| Webhook | 供 Zapier 等外部服务自动建码（实验性） |
| AR 二维码 | 扫码查看 3D 模型（实验性，viewer 地址需在代码里替换为自己的） |
| 多语言 / 深色模式 | 中文与英文，深色模式跟随系统 |

---

## 技术栈

```
前端    Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS，静态导出
后端    Hono.js，运行在 Cloudflare Workers
存储    Cloudflare KV（无数据库，零成本）
托管    Workers Static Assets，前端与 API 同源
认证    Session Token，存 KV，7 天有效
```

前端是纯静态导出（`output: 'export'`），因此不需要 Next.js 服务端运行时，也就不需要 `@opennextjs/cloudflare` 那一套。静态文件和 API 由同一个 Worker 提供，浏览器请求天然同源，跨域配置无从谈起。

---

## 项目结构

```
qrzone/
├── frontend/                 # Next.js 前端，构建产物在 frontend/out
│   ├── src/app/              # 页面路由
│   ├── src/components/qr/    # 二维码相关组件
│   └── src/lib/api.ts        # API 客户端
├── src/                      # Cloudflare Workers 后端（仓库根目录，部署契约所在）
│   ├── index.ts              # 入口，路由注册与 CORS
│   ├── lib/                  # 类型定义与共享工具
│   ├── middleware/           # 鉴权中间件
│   └── routes/               # auth / qr / shortlink / keys / profile / teams / webhooks / ar / proxyImage
├── wrangler.toml             # 唯一的部署配置（位于仓库根）
└── package.json              # 根构建脚本：build 委托 frontend，deploy 跑 wrangler
```

> 仓库刻意保持「扁平」：Worker 入口与 `wrangler.toml` 都在根目录，因此 `wrangler deploy` 在仓库根目录就能识别完整的部署契约。

---

## 部署配置说明

`wrangler.toml` 里这一块别乱改：

```toml
[assets]
directory = "./frontend/out"
not_found_handling = "single-page-application"
binding = "ASSETS"
run_worker_first = ["/api/*", "/q/*"]
```

`run_worker_first` 这行必须保留。扫码访问短链属于导航请求，Cloudflare 默认会优先返回静态 `index.html`；只有显式声明 `/q/*` 交给 Worker，短链跳转才能正常工作。同理 `/api/*` 也必须交给 Worker。其余路径（页面、JS、CSS）不经过 Worker，不消耗请求额度。

想改访问入口就改 `name` 字段。

---

## Open API

登录后进入侧边栏 **API 密钥**，创建一个密钥（只显示一次）。所有请求在 Header 携带：

```
Authorization: Bearer ak_YOUR_KEY
```

| 操作 | 请求 |
| --- | --- |
| 创建二维码 | `POST /api/qr` |
| 获取列表 | `GET /api/qr` |
| 删除二维码 | `DELETE /api/qr/{id}` |

示例：

```bash
curl https://<你的项目名>.workers.dev/api/qr \
  -H "Authorization: Bearer ak_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "My QR", "content": "https://example.com", "qrType": "url"}'
```

---

## 可选配置

### 绑定自定义域名

1. Cloudflare 后台 → **Workers & Pages** → 选择你的 Worker
2. **Settings → Domains & Routes → Add**，选 Custom domain
3. 输入已托管在 Cloudflare 的域名

### 设置 Webhook 密钥

`/api/webhooks/zapier` 默认不校验来源。要启用校验：

```bash
npx wrangler secret put WEBHOOK_SECRET
```

设置后，请求需带上 `X-Webhook-Secret` 头。

---

## 常见问题

**扫码后提示 "QR code not found"**
检查 `wrangler.toml` 里 `run_worker_first` 是否包含 `/q/*`。少了这一项，短链请求会被静态资源拦截。

**登录后访问 API 返回 401**
前端把 token 存 localStorage。执行 `localStorage.removeItem('session_token')` 后重新登录。

**部署后页面能开，但 API 全 404**
同上，检查 `run_worker_first` 是否包含 `/api/*`。

**名片二维码手机扫不出来**
确认扫码 App 支持 vCard 3.0。iOS 和 Android 原生相机都支持，部分第三方 App 不支持。

**如何查看线上日志**
`npx wrangler tail`

---

## 已知限制

**AR 二维码是占位实现。** `src/routes/ar.ts` 里的体验地址写的是 `ar-cdn.example.com`，需要替换成你自己的 3D 模型查看器才能用。

---

## 免费额度

Cloudflare 免费计划包含：

- Workers 每天 10 万次请求（静态资源不占用）
- KV 每天 10 万次读取、1000 次写入、1 GB 存储

个人和小团队使用完全够用。

---

## License

MIT — 见 [LICENSE](./LICENSE) 文件。