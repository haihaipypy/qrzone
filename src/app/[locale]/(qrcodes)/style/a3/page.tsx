import { unstable_setRequestLocale } from "next-intl/server";
import QrcodeGeneratorWithProvider from "@/components/QrcodeGeneratorWithProvider";
import { useTranslations } from "next-intl";
import {
  qrbtfModuleA3,
  QrbtfRendererA3Props,
} from "@/lib/qrbtf_lib/qrcodes/a3";
import { useA3Params } from "@/lib/qrbtf_lib/qrcodes/a3_config";

export default function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("qrcodes.a3");
  const { params } = useA3Params();

  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA3Props>
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA3}
      params={params}
      defaultPreset="a3"
    />
  );
}