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

支持任何可运行 Node.js 的平台（Vercel / EdgeOne Pages / 自托管服务器）。构建命令 `yarn build`，启动命令 `yarn start`。

可选环境变量：`NEXT_PUBLIC_SITE_URL`（站点地址，用于 SEO metadata）

## License

GPL-3.0（继承自 QRBTF）
