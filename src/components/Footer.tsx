import { Container } from "@/components/Containers";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ModeToggle } from "@/components/ModeToggle";
import React from "react";
import { TrackLink } from "@/components/TrackComponents";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <div className="_border-t py-9 lg:py-12 flex flex-col mt-12">
      <Container>
        <div className="text-sm text-muted-foreground mb-2 flex gap-4">
          <LocaleSwitcher />
          <ModeToggle />
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()}{" "}
          <TrackLink
            trackValue={["author_site", "footer"]}
            href="https://blog.1day.vip"
            target="_blank"
            className="border-b"
          >
            无辣的学习笔记
          </TrackLink>
          . QRzone. {t("reserve_rights")}
        </p>
        <p className="safe-pb" />
      </Container>
    </div>
  );
}
