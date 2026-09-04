# QRzone

AI & 参数化二维码生成器。作者：[无辣的学习笔记](https://blog.1day.vip)。

![QRzone](public/assets/qrcodes/g1.png)

## 特性

- **参数化样式**：十余种参数化二维码风格，纯前端渲染，支持 SVG / JPG / PNG 下载
- **AI 生成**：接入 [Agnes Image 2.5 Flash](https://www.agnes-ai.com/zh-Hans/docs/agnes-image-25-flash) 文生图模型：先让 AI 生成一张艺术背景图，再在本地按二维码矩阵把背景融合成可扫描的艺术二维码（二维码成为画面的一部分，而非叠加在图上）
- **自动扫码校验**：生成结果自动做本地扫码验证，对比不足时自动增强，仍不通过则用标准二维码兜底
- **扫码识别**：上传二维码图片自动识别内容并填入
- **无账号、无存储**：不需要登录，不保存任何数据；API Key 仅保存在用户浏览器 localStorage

## 使用

1. 打开首页，输入 URL 或文本（也可上传二维码图片识别）
2. 选择风格、调整参数
3. AI 风格需在页面中填写你自己的 Agnes API Key（[获取地址](https://platform.agnes-ai.com/settings/apiKeys)）
4. 下载 SVG / JPG / PNG

## 开发

> 需要 Node.js 18+（推荐 20+）

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # 生产构建
```

技术栈：Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + next-intl

## 部署

QRzone 是标准 Next.js 应用，含一个 API Route（`/api/agnes/image`）做服务端代理，因此**不能用纯静态导出**，需部署到支持 Node.js 运行时的平台。

### 方式一：部署到腾讯云 EdgeOne Pages（推荐，国内访问快）

1. **Fork 本仓库**：点击本仓库右上角 **Fork**，把它复制到你的 GitHub 账号下；
2. **进入控制台**：打开 [EdgeOne Pages 控制台](https://console.edgeone.ai/)，登录后点击 **创建项目**；
3. **导入仓库**：选择 **Connect to Git** → 授权 GitHub → 选中你 fork 的 `qrzone` 仓库；
4. **构建配置**（大部分保持默认即可）：
   - 框架预设：`Next.js`（一般会自动识别）
   - 构建命令：`yarn build`（或 `npm run build`）
   - Node.js 版本：`20`（环境变量 `NODE_VERSION` 设为 20）
5. **点击部署**，等待构建完成（约 2~4 分钟），即可获得 `xxx.edgeone.app` 专属域名；
6. **绑定自定义域名**（可选）：项目设置 → 自定义域名 → 添加你的域名并按提示加 CNAME 记录。

> 全程无需配置任何密钥：Agnes API Key 由每位访客在自己浏览器中填写，不经服务端存储。

### 方式二：部署到 Cloudflare

推荐用 Cloudflare 官方的 OpenNext 适配器（`@opennextjs/cloudflare`）部署到 Workers。

**准备工作**：本地装好 Node.js 20+，把 fork 的仓库 clone 到本地。

1. **安装依赖与适配器**：

   ```bash
   yarn install
   yarn add -D @opennextjs/cloudflare wrangler
   ```

2. **在项目根目录新建 `wrangler.jsonc`**：

   ```jsonc
   {
     "name": "qrzone",
     "main": ".open-next/worker.js",
     "compatibility_date": "2024-12-01",
     "compatibility_flags": ["nodejs_compat"],
     "assets": {
       "directory": ".open-next/assets",
       "binding": "ASSETS"
     }
   }
   ```

3. **登录 Cloudflare**：

   ```bash
   npx wrangler login
   ```

4. **构建并部署**：

   ```bash
   npx opennextjs-cloudflare build
   npx opennextjs-cloudflare deploy
   ```

5. 部署完成后会输出 `qrzone.<你的子域>.workers.dev` 地址；绑定自定义域名在 Cloudflare 控制台该 Worker 的 **Settings → Domains & Routes** 中操作。

> 提示：也可以在 Cloudflare 控制台用 **Workers & Pages → Connect to Git** 走 Git 集成构建，框架预设选 Next.js（OpenNext），效果相同。国内访问 Cloudflare 可能不稳定，介意的话选方式一。

### 方式三：Vercel / 其他 Node 平台

构建命令 `yarn build`，启动命令 `yarn start`，其余同方式一。

## 可选环境变量

- `NEXT_PUBLIC_SITE_URL`：站点地址，用于 SEO metadata（可选）。
- **Agnes API Key 无需服务端配置**：每位用户在前端页面填写自己的 Key，仅存于浏览器 `localStorage`，经本站代理直连 Agnes，服务端不留存、也不读取任何相关环境变量。

## License

[GPL-3.0](LICENSE)
