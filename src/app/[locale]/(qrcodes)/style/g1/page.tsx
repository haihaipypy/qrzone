import { unstable_setRequestLocale } from "next-intl/server";
import QrcodeGeneratorWithProvider from "@/components/QrcodeGeneratorWithProvider";
import { useTranslations } from "next-intl";
import {
  qrbtfModuleG1,
  QrbtfRendererG1Props,
} from "@/lib/qrbtf_lib/qrcodes/g1";
import { useG1Params } from "@/lib/qrbtf_lib/qrcodes/g1_config";

export default function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("qrcodes.g1");
  const { params } = useG1Params();

  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererG1Props>
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleG1}
      params={params}
      defaultPreset="g1"
    />
  );
}
