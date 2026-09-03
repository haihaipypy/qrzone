import { useTranslations } from "next-intl";
import { QrbtfRendererA3Props } from "./a3";
import { CommonControlProps } from "./param";
import { useCommonParams } from "./param/common";
import { usePositioningParams } from "./param/position";

export type A3PresetKeys = "a3";

export const A3Presets: Record<A3PresetKeys, QrbtfRendererA3Props> = {
  a3: {
    correct_level: "medium",
    positioning_point_type: "square",
    positioning_point_color: "#000000",
    content_point_type: "square",
    content_point_scale: 0.8,
    content_point_opacity: 1,
    content_point_color: "#000000",
  },
};

export function useA3Params() {
  const t = useTranslations("qrcodes.a3");
  const { commonParams } = useCommonParams();
  const { positioningParams } = usePositioningParams();

  const params: CommonControlProps<QrbtfRendererA3Props>[] = [
    ...commonParams,
    ...positioningParams,
    {
      type: "select",
      name: "content_point_type",
      label: t("content_point_type.label"),
      desc: t("content_point_type.desc"),
      config: {
        values: [
          { value: "square", label: t("square") },
          { value: "circle", label: t("circle") },
        ],
      },
    },
    {
      type: "number",
      name: "content_point_scale",
      label: t("content_point_scale.label"),
      desc: t("content_point_scale.desc"),
      config: { min: 0, max: 1, step: 0.01 },
    },
    {
      type: "number",
      name: "content_point_opacity",
      label: t("content_point_opacity.label"),
      desc: t("content_point_opacity.desc"),
      config: { min: 0, max: 1, step: 0.01 },
    },
    {
      type: "color",
      name: "content_point_color",
      label: t("content_point_color.label"),
      desc: t("content_point_color.desc"),
      config: {},
    },
  ];

  return { params };
}