# qrzone · 二维码管理平台

二维码批量生成与动态二维码管理工具。前端与后端合并运行在**同一个 Cloudflare Worker** 上，零配置部署，全程免费、无需服务器。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 部署

> 整个流程约 5 分钟，**成功率最高**的本地部署方式。一次部署后所有数据落在你自己的 Cloudflare 账户里。

### 前置要求

- Node.js 20+
- 一个 Cloudflare 账户（[免费注册](https://dash.cloudflare.com/sign-up)）
- 一个 GitHub 账户

### 步骤

#### 1. Fork 本仓库

在 GitHub 上打开 [`haihaipypy/qrzone`](https://github.com/haihaipypy/qrzone)，点右上角 **Fork** → 选你的账户。

完成后你的账户下会出现 `<你的名字>/qrzone`。

#### 2. Clone 到本地

```bash
git clone https://github.com/<你的名字>/qrzone.git
cd qrzone
```

#### 3. 安装依赖

```bash
npm install
```

#### 4. 登录 Cloudflare

```bash
npx wrangler login
```

浏览器会弹出 Cloudflare 授权页 → 点 **Allow** → 命令行提示 `Successfully logged in` 即完成。

> 这一步是 OAuth 授权，**不会创建任何资源**。后续的 `wrangler deploy` 才会创建。

#### 5. 创建两个 KV 命名空间

```bash
npx wrangler kv namespace create QR_KV
npx wrangler kv namespace create AUTH_KV
```

每条命令会返回一行 `id = "..."`，把两个 id **填进 `wrangler.toml`**（替换下面占位的 `__FILL_IN_QR_KV_ID__` 和 `__FILL_IN_AUTH_KV_ID__`）：

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "第一个返回的 id"

[[kv_namespaces]]
binding = "AUTH_KV"
id = "第二个返回的 id"
```

> **为什么手动创建**：`wrangler.toml` 不写 id 直接 `wrangler deploy` 也能跑（wrangler 会自动 provision 并把 id 写回本地 `wrangler.toml`），效果一样。手动创建的优势是：  
> 1. 你**显式拥有**这两个 KV 命名空间，Dashboard 里能看到命名一致
> 2. 部署时 wrangler 不会自动改 `wrangler.toml`，更干净  
> 两条路都行，下面给手动路径（更可控）。

#### 6. 构建并部署

```bash
npm run build
npx wrangler deploy
```

构建跑完后部署约 5–10 秒，命令成功后会打印：

```
Published qrzone (X.XX sec)
https://qrzone.<你的子域>.workers.dev
```

打开这个 `*.workers.dev` 地址即可使用。

#### 7. 把 KV id 提交到 fork

填好 id 的 `wrangler.toml` 提交到 fork 仓库，以后部署就不用再填：

```bash
git add wrangler.toml
git commit -m "chore: 填入 KV namespace id"
git push origin main
```

### 后续更新代码

```bash
git pull                 # 拉取本仓库更新（如果你想同步原仓库改动）
npm install              # 依赖有变才需要
npm run build
npx wrangler deploy
```

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