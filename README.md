# qrzone · 二维码管理平台

二维码批量生成与动态二维码管理工具。前端与后端合并运行在**同一个 Cloudflare Worker** 上，零配置部署，全程免费、无需服务器。

---

## 一键部署（Deploy to Cloudflare 按钮）

> **整个项目生命周期，按钮只点这一次**——剩下的 Cloudflare 全帮你做完。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/haihaipypy/qrzone)

点上面的按钮，登录 Cloudflare → 按提示授权 GitHub → 几秒后进度条跑完，你的二维码平台就上线了，访问 `*.workers.dev` 子域名就能用。

**为什么按钮只点一次就够了？**
Cloudflare 会把仓库 fork 到你的 GitHub 账户下（比如 `<你的名字>/qrzone`），并在 fork 上启动 Workers Builds。**后续你在 fork 仓库上 push 代码，Cloudflare 自动重新构建并部署，永远复用同一对 KV 命名空间**——不会重复创建。

如果想自己改代码、做二次开发：
1. 打开 GitHub 账户下 fork 的那个仓库（`你的名字/qrzone`）
2. `git clone` 到本地 → 改代码 → `git push` 到 `main`
3. Cloudflare Dashboard → Workers & Pages → 你的项目 → Deployments，能看到每次 push 触发的构建

---

## 其他部署方式

### 方式 A：Cloudflare Dashboard Connect-to-Git

适合「已经在 Dashboard 里手动部署过，现在想把代码接上 GitHub 让 push 自动触发」的衔接场景：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧栏 → **Workers & Pages** → 点 **Create application**
3. 标签切到 **Workers**，选 **Import a Git repository**
4. **Connect to Git** → 选 **GitHub** → 授权并选仓库 `haihaipypy/qrzone`（如果 fork 过，选你自己的 fork）
5. **Build settings** 页面里 Build / Deploy 命令已自动填好（`npm run build` + `npx wrangler deploy`），其余不动
6. 点 **Deploy and save**

### 方式 B：GitHub Actions

习惯 push 即部署 / 想用 CI 流程的话：

1. Fork 本项目
2. 把 `docs/deploy-workflow.example.yml` 复制成 `.github/workflows/deploy.yml`

   > 工作流故意以示例形式提供。如果它一开箱就在 `.github/workflows/` 里，
   > fork 后的第一次 push 会立刻触发部署，而你还没配 secret，必定失败。
   > 等你配好再放进去，第一次跑就是成功的。

3. 在 Cloudflare 后台创建一个 API Token，模板选 **Edit Cloudflare Workers**
4. 到仓库 **Settings → Secrets and variables → Actions**，添加两个 secret：

   | Secret | 从哪里拿 |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | 上一步创建的 Token |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 后台右侧边栏的 Account ID |

5. 推送代码到 `main` 分支，或在 Actions 页面手动触发 **Deploy to Cloudflare Workers**

之后每次 push 都会自动重新部署。

---

### 为什么不用手动建 KV

`wrangler.toml` 里只声明 binding，不写 id：

```toml
[[kv_namespaces]]
binding = "QR_KV"

[[kv_namespaces]]
binding = "AUTH_KV"
```

部署时 Wrangler 会自动创建这两个命名空间。这意味着同一份配置可以安全地分享给任何人，每个人的数据都落在自己的账号里。

> 如果你本地跑过 `wrangler deploy`，`wrangler.toml` 会多出两行 `id`。这是 Wrangler 把自动创建出的 KV id 写回来的结果，不想提交的话执行 `git checkout wrangler.toml` 还原即可，**已创建的 KV 不受影响**。

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
├── .github/workflows/        # GitHub Actions 部署（可选）
├── wrangler.toml             # 唯一的部署配置（位于仓库根）
└── package.json              # 根构建脚本：build 委托 frontend，deploy 跑 wrangler
```

> 仓库刻意保持「扁平」：Worker 入口与 `wrangler.toml` 都在根目录，因此 Cloudflare 的一键部署按钮和 Dashboard Connect-to-Git 都能直接在根目录找到完整的部署契约，无需处理 monorepo 子目录隔离问题。

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

**本地 `npm run deploy` 后 wrangler.toml 被改动**
这是 Wrangler 把自动创建的 KV id 写回去了，正常现象。`git checkout wrangler.toml` 可还原，已创建的 KV 不受影响。

**名片二维码手机扫不出来**
确认扫码 App 支持 vCard 3.0。iOS 和 Android 原生相机都支持，部分第三方 App 不支持。

**如何查看线上日志**
`npx wrangler tail`

**账户里看到了多个 `qrzone-QR_KV` / `qrzone-AUTH_KV` KV 命名空间**
这是因为你**多次点击了 Deploy to Cloudflare 按钮**——按钮每次都走一遍 fork + 全新部署流程，wrangler 检测到 fork 仓库的 `wrangler.toml` 没 KV id（Cloudflare 不回写 id 到 GitHub），就又自动建一对。**正确做法是按钮只点一次**，后续改代码通过 `git push` 到 fork 仓库触发自动部署，会复用已存在的 KV。
清理重复项：去 Cloudflare Dashboard → Storage → KV，删掉多余的、只留一对即可。

---

## 已知限制

**AR 二维码是占位实现。** `src/routes/ar.ts` 里的体验地址写的是 `ar-cdn.example.com`，需要替换成你自己的 3D 模型查看器才能用。

---

## 免费额度

Cloudflare 免费计划包含：

- Workers 每天 10 万次请求（静态资源不占用）
- KV 每天 10 万次读取、1000 次写入、1 GB 存储

个人和小团队使用完全够用。