import { SectionHero } from "@/app/[locale]/SectionHero";
import { SectionQA } from "@/app/[locale]/SectionQA";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 风格选择卡片 + 内联生成器现在由首页 HomeGenerator 统一渲染（状态切换、不跳路由）。
  // layout 只负责 Hero（URL 输入）、{children}（生成器）、底部常见问题。
  return (
    <div>
      <SectionHero />
      {children}
      <div className="mt-12">
        <SectionQA />
      </div>
    </div>
  );
}
