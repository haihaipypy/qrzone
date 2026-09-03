import { type Metadata, Viewport } from "next";

import { getTranslations } from "next-intl/server";
import React from "react";

export async function generateMetadata({
  params: { locale },
}: Readonly<{
  params: { locale: string };
}>) {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://blog.1day.vip",
    ),
    title: {
      template: t("title.template"),
      default: t("title.default"),
    },
    description: t("description"),
    keywords: [
      t("keywords.0"),
      t("keywords.1"),
      t("keywords.2"),
      t("keywords.3"),
      t("keywords.4"),
      t("keywords.5"),
    ],
  };
}

export const layoutViewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  height: "device-height",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export function LayoutHead() {
  return (
    <head>
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon?<generated>"
        type="image/<generated>"
        sizes="<generated>"
      />
      <meta content="yes" name="apple-mobile-web-app-capable" />
      <meta name="theme-color" content="#000000" />
    </head>
  );
}
