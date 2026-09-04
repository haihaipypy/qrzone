import { useTranslations } from "next-intl";
import { QrbtfRendererSp2Props } from "./sp2";
import { CommonControlProps } from "./param";
import { useCommonParams } from "./param/common";

export type Sp2PresetKeys = "sp2";

export const Sp2Presets: Record<Sp2PresetKeys, QrbtfRendererSp2Props> = {
  sp2: {
    correct_level: "medium",
  },
};

export function useSp2Params() {
  const { commonParams } = useCommonParams();
  const params: CommonControlProps<QrbtfRendererSp2Props>[] = [...commonParams];
  return { params };
}
