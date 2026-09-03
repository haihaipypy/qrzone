import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
import withMDX from "@next/mdx";
import NextBundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
