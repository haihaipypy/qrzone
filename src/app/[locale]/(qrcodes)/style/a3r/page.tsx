import QrcodeGeneratorWithProvider from "@/components/QrcodeGeneratorWithProvider";
import { useTranslations } from "next-intl";
import {
  qrbtfModuleA3r,
  QrbtfRendererA3rProps,
} from "@/lib/qrbtf_lib/qrcodes/a3r";
import { useA3rParams } from "@/lib/qrbtf_lib/qrcodes/a3r_config";

export default function Page() {
  const t = useTranslations("qrcodes.a3r");
  const { params } = useA3rParams();

  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA3rProps>
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA3r}
      params={params}
      defaultPreset="a3r"
    />
  );
}