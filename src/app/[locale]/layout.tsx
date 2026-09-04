import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "@/app/providers";
import { Footer } from "@/components/Footer";
import { LayoutHead } from "@/lib/layout_data";

const inter = Inter({ subsets: ["latin"] });

import { layoutViewport } from "@/lib/layout_data";
import { Header } from "@/components/Header";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { cn } from "@/lib/utils";

export { generateMetadata } from "@/lib/layout_data";

export const viewport: Viewport = layoutViewport;

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }, { locale: "jp" }];
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="antialiased" suppressHydrationWarning>
      <LayoutHead />
      <body className={cn(inter.className, "")}>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Header />
            <div className="min-h-screen flex flex-col">{children}</div>
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
