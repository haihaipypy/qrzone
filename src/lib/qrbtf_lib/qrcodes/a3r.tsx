"use client";

import React, { useMemo } from "react";
import { QRPointType, encode } from "../encoder";
import { sq25 } from "@/lib/qrbtf_lib/constants";
import { QrbtfRendererPositioningProps } from "./param/position";
import { QrbtfModule, QrbtfRendererCommonProps, RendererProps } from "./param";
import { A3rPresetKeys, A3rPresets } from "./a3r_config";
import { rand } from "@/lib/utils";

export interface RenderA3rOwnProps {
  content_point_type: "square" | "circle";
  content_point_scale: number;
  content_point_opacity: number;
  content_point_color: string;
}

export type QrbtfRendererA3rProps = RenderA3rOwnProps &
  QrbtfRendererPositioningProps &
  QrbtfRendererCommonProps;

function QrbtfRendererA3r(props: RendererProps<QrbtfRendererA3rProps>) {
  const [table, typeTable] = useMemo(
    () => encode(props.url, { ecc: props.correct_level }),
    [props.url, props.correct_level],
  );
  const points = useMemo(() => {
    const points: React.ReactNode[] = [];

    const contentPointSize = props.content_point_scale * 1.01;
    const contentPointSizeHalf = contentPointSize / 2;
    const contentPointOffset = (1 - contentPointSize) / 2;

    let id = 0;

    for (let y = 0; y < table.length; y++) {
      for (let x = 0; x < table.length; x++) {
        if (!table[x][y]) continue;
        switch (typeTable[x][y]) {
          case QRPointType.POS_CENTER:
            if (props.positioning_point_type === "square") {
              points.push(
                <rect
                  key={id++}
                  fill={props.positioning_point_color}
                  x={x + 0.5 - 1.5}
                  y={y + 0.5 - 1.5}
                  width={3}
                  height={3}
                />,
              );
              points.push(
                <rect
                  key={id++}
                  fill="none"
                  strokeWidth="1"
                  stroke={props.positioning_point_color}
                  x={x + 0.5 - 3}
                  y={y + 0.5 - 3}
                  width={6}
                  height={6}
                />,
              );
            } else if (props.positioning_point_type === "circle") {
              points.push(
                <circle
                  key={id++}
                  fill={props.positioning_point_color}
                  cx={x + 0.5}
                  cy={y + 0.5}
                  r={1.5}
                />,
              );
              points.push(
                <circle
                  key={id++}
                  fill="none"
                  strokeWidth="1"
                  stroke={props.positioning_point_color}
                  cx={x + 0.5}
                  cy={y + 0.5}
                  r={3}
                />,
              );
            } else if (props.positioning_point_type === "rounded") {
              points.push(
                <circle
                  key={id++}
                  fill={props.positioning_point_color}
                  cx={x + 0.5}
                  cy={y + 0.5}
                  r={1.5}
                />,
              );
              points.push(
                <path
                  key={id++}
                  d={sq25}
                  stroke={props.positioning_point_color}
                  strokeWidth={(100 / 6) * (1 - (1 - contentPointSize) * 0.75)}
                  fill="none"
                  transform={
                    "translate(" +
                    String(x - 2.5) +
                    "," +
                    String(y - 2.5) +
                    ") " +
                    "scale(" +
                    String(6 / 100) +
                    "," +
                    String(6 / 100) +
                    ")"
                  }
                />,
              );
            }
            break;
          case QRPointType.POS_OTHER:
            break;
          case QRPointType.ALIGN_CENTER:
          case QRPointType.ALIGN_OTHER:
          case QRPointType.TIMING:
          default:
            // a3r: 单色随机大小（每个点尺寸随机，更具艺术感）
            const isConstant = false;
            const size = isConstant ? contentPointSize : rand(0.3, 1);
            const offset = isConstant ? contentPointOffset : (1 - size) / 2;
            if (props.content_point_type === "square") {
              points.push(
                <rect
                  opacity={props.content_point_opacity}
                  width={size}
                  height={size}
                  key={id++}
                  fill={props.content_point_color}
                  x={x + offset}
                  y={y + offset}
                />,
              );
            } else {
              points.push(
                <circle
                  opacity={props.content_point_opacity}
                  r={size / 2}
                  key={id++}
                  fill={props.content_point_color}
                  cx={x + 0.5}
                  cy={y + 0.5}
                />,
              );
            }
        }
      }
    }
    return points;
  }, [
    props.content_point_scale,
    props.positioning_point_type,
    props.content_point_type,
    props.positioning_point_color,
    props.content_point_opacity,
    props.content_point_color,
    table,
    typeTable,
  ]);

  const viewBox = `${-table.length / 5} ${-table.length / 5} ${
    (7 * table.length) / 5
  } ${(7 * table.length) / 5}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={viewBox}
      {...props}
    >
      {points}
    </svg>
  );
}

export const qrbtfModuleA3r: QrbtfModule<QrbtfRendererA3rProps> = {
  type: "svg_renderer",
  presets: A3rPresets,
  renderer: QrbtfRendererA3r,
};