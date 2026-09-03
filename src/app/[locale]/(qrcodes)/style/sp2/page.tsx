import QrcodeGeneratorWithProvider from "@/components/QrcodeGeneratorWithProvider";
import { useTranslations } from "next-intl";
import {
  qrbtfModuleSp2,
  QrbtfRendererSp2Props,
} from "@/lib/qrbtf_lib/qrcodes/sp2";
import { useSp2Params } from "@/lib/qrbtf_lib/qrcodes/sp2_config";

export default function Page() {
  const t = useTranslations("qrcodes.sp2");
  const { params } = useSp2Params();

  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererSp2Props>
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleSp2}
      params={params}
      defaultPreset="sp2"
    />
  );
}