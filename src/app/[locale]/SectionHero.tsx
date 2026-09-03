import { useTranslations } from "next-intl";
import {
  Container,
  SplitLeft,
  SplitRight,
  SplitView,
} from "@/components/Containers";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideScan } from "lucide-react";
import { ScanButton } from "@/components/ScanButton";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { urlAtom } from "@/lib/states";
import { useAtom } from "jotai";
import { UrlInput } from "@/components/hero/UrlInput";
import { HeroLogo } from "@/components/Header";

export function SectionHero() {
  const t = useTranslations("index.hero");

  return (
    <div className="_mt-28 _lg: mt-36">
      <Container>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold hidden">
            {t("title")}
          </h1>

          <HeroLogo />

          <p className="text-base lg:text-lg mt-6 text-foreground/70">
            {t("subtitle")}
          </p>

          <SplitView className="gap-y-0">
            <SplitLeft>
              <div className="mt-6 w-full">
                <Label className="flex justify-between text-sm font-medium mb-1.5">
                  {t("url")}
                  <div className="flex items-center gap-3">
                    <ScanButton name={t("scan")} />
                  </div>
                </Label>
                <UrlInput />
              </div>
            </SplitLeft>
            <SplitRight />
          </SplitView>
        </div>
      </Container>
    </div>
  );
}
