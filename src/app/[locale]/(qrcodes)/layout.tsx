"use client";

import { SectionHero } from "@/app/[locale]/SectionHero";
import { SectionStyles } from "@/app/[locale]/SectionStyles";
import { SectionQA } from "@/app/[locale]/SectionQA";
import { useCurrentQrcodeType } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentQrcodeType = useCurrentQrcodeType();
  // 首页（无样式路由）只显示 Hero + Styles + QA，不渲染右侧参数面板
  // 样式页（如 /zh/style/a1）和 g1 首页（/zh）都展示 children（具体内容）
  const isHome = !currentQrcodeType;

  if (isHome) {
    return (
      <div>
        <SectionHero />
        <SectionStyles />
        <div className="mt-12">
          <SectionQA />
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}