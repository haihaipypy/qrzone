import { unstable_setRequestLocale } from "next-intl/server";
import { HomeGenerator } from "@/app/[locale]/HomeGenerator";

export default function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  return <HomeGenerator />;
}
