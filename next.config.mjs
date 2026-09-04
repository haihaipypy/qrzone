import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
import withMDX from "@next/mdx";
import NextBundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isStaticExport = process.env.STATIC_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 走纯静态导出；EdgeOne Pages 保持默认 Next.js 构建
  output: isStaticExport ? "export" : undefined,
  distDir: isStaticExport ? "dist" : ".next",
  // 静态导出时强制末尾斜杠：Next 会生成 zh/index.html 而非 zh.html，
  // 这样 /zh/（带斜杠）可直接访问，与站内链接、根重定向保持一致。
  trailingSlash: isStaticExport ? true : undefined,
  images: isStaticExport ? { unoptimized: true } : undefined,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  webpack: (config) => {
    // https://github.com/vercel/next.js/discussions/36981
    config.module.generator["asset/resource"] =
      config.module.generator["asset"];
    config.module.generator["asset/source"] = config.module.generator["asset"];
    delete config.module.generator["asset"];

    const imageLoaderRule = config.module.rules.find(
      (rule) => rule.loader === "next-image-loader",
    );
    imageLoaderRule.exclude = /\.inline\.(png|jpg|svg)$/i;

    config.module.rules.push({
      test: /\.inline\.(png|jpg|gif)$/i,
      type: "asset/inline",
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX()(nextConfig)));
