import { Card } from "@/components/ui/card";
import { Container } from "@/components/Containers";
import { useTranslations } from "next-intl";
import React from "react";

export function QrcodePlaceholder() {
  const t = useTranslations("qrcode_placeholder");
  return (
    <div className="mt-12">
      <Container>
        <Card className="rounded-xl">
          <div className="min-h-36 flex flex-col justify-center items-center">
            <p className="p-6 text-sm text-foreground/70 text-center">
              {t("todo")}
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
