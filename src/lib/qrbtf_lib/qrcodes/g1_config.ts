import { useTranslations } from "next-intl";
import { CommonControlProps } from "./param";
import { QrbtfRendererG1Props } from "./g1";

export type G1PresetKeys = "g1";

export const G1Presets: Record<G1PresetKeys, QrbtfRendererG1Props> = {
  g1: {
    prompt: "",
    size: "1K",
  },
};

export function useG1Params() {
  const t = useTranslations("qrcodes.g1");

  const params: CommonControlProps<QrbtfRendererG1Props>[] = [
    {
      type: "prompt",
      name: "prompt",
      label: t("prompt.label"),
      desc: t("prompt.desc"),
      config: {
        placeholder: t("prompt.placeholder"),
      },
    },
    {
      type: "select",
      name: "size",
      label: t("size.label"),
      desc: t("size.desc"),
      config: {
        values: [
          { value: "1K", label: "1K (1024px)" },
          { value: "2K", label: "2K (2048px)" },
          { value: "3K", label: "3K (3072px)" },
          { value: "4K", label: "4K (4096px)" },
        ],
      },
    },
  ];

  return {
    params,
  };
}
