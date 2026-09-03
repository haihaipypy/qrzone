import { SectionHero } from "@/app/[locale]/SectionHero";
import { SectionStyles } from "@/app/[locale]/SectionStyles";
import { SectionParams } from "@/app/[locale]/SectionParams";
import { SectionQA } from "@/app/[locale]/SectionQA";
import {
  Container,
  SplitLeft,
  SplitRight,
  SplitView,
} from "@/components/Containers";

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <div>
      <SectionHero />
      <SectionStyles />
      {children}
      <Container>
        <SplitView className="gap-x-9 gap-y-12 mt-12">
          <SplitLeft className="flex flex-col gap-12">
            <SectionQA />
          </SplitLeft>
          <SplitRight>
            <SectionParams />
          </SplitRight>
        </SplitView>
      </Container>
    </div>
  );
}
