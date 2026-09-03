# QRzone

AI & 参数化二维码生成器。基于开源项目 [QRBTF](https://github.com/latentcat/qrbtf)（GPL-3.0）二次开发，作者：[无辣的学习笔记](https://blog.1day.vip)。

## 特性

- **参数化样式**：十余种参数化二维码风格，纯前端渲染，支持 SVG / JPG / PNG 下载
- **AI 生成**：接入 [Agnes Image 2.5 Flash](https://www.agnes-ai.com/zh-Hans/docs/agnes-image-25-flash) 图生图模型，本地生成标准二维码后交给 AI 艺术化重绘
- **自动扫码校验**：AI 生成结果自动做本地扫码验证，不通过自动重试（最多 3 次）
- **无账号、无存储**：不需要登录，不保存任何数据；API Key 仅保存在用户浏览器 localStorage

## 使用

1. 打开首页，输入 URL 或文本
2. 选择风格、调整参数
3. AI 风格需在页面中填写你自己的 Agnes API Key（[获取地址](https://www.agnes-ai.com)）
4. 下载 SVG / JPG / PNG

## 开发

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # 生产构建
```

技术栈：Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + next-intl

## 部署

QRzone 是一个标准 Next.js 应用，使用 API Route（`/api/agnes/image`）做服务端代理，因此部署平台需支持 Node.js 运行时（不能用纯静态导出）。

### 方式一：Fork 后部署到 EdgeOne Pages（推荐，操作最少）

1. 点击右上角 **Fork** 把本仓库复制到你的 GitHub 账号；
2. 打开 [EdgeOne Pages 控制台](https://console.edgeone.ai/)，新建项目 → 选 **Connect to Git** → 授权 GitHub 并选中你 fork 的 `qrzone` 仓库；
3. 构建配置：构建命令 `yarn build`（或 `npm run build`），框架选择 Next.js（EdgeOne 会自动识别 `.next` 输出），Node 版本 18+；
4. 点击部署，等待完成即可获得你的专属域名。

> 全程无需配置任何密钥：Agnes API Key 由每位访客在自己浏览器中填写，不经服务端存储。

### 方式二：Vercel / 其他 Node 平台

构建命令 `yarn build`，启动命令 `yarn start`，构建产物 `.next`，其余同方式一。

## 可选环境变量

- `NEXT_PUBLIC_SITE_URL`：站点地址，用于 SEO metadata（可选）。
- **Agnes API Key 无需服务端配置**：每位用户在前端页面填写自己的 Key，仅存于浏览器 `localStorage`，经本站代理直连 Agnes，服务端不留存、也不读取任何相关环境变量。

## License

GPL-3.0（继承自 QRBTF）
