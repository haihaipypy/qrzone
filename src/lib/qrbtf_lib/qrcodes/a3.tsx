"use client";

import React, { useMemo } from "react";
import { QRPointType, encode } from "../encoder";
import { QrbtfRendererPositioningProps } from "./param/position";
import { QrbtfModule, QrbtfRendererCommonProps, RendererProps } from "./param";
import { A3PresetKeys, A3Presets } from "./a3_config";

export interface RenderA3OwnProps {
  content_point_opacity: number;
  content_point_color: string;
}

export type QrbtfRendererA3Props = RenderA3OwnProps &
  QrbtfRendererPositioningProps &
  QrbtfRendererCommonProps;

// 基于 URL 的确定性伪随机：同一二维码输出稳定（可复现、可扫、刷新不抖），不同 URL 呈现不同随机分布
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function QrbtfRendererA3(props: RendererProps<QrbtfRendererA3Props>) {
  const [table, typeTable] = useMemo(
    () => encode(props.url, { ecc: props.correct_level }),
    [props.url, props.correct_level],
  );
  const points = useMemo(() => {
    const points: React.ReactNode[] = [];
    const rng = mulberry32(hashStr(props.url || "qrzone"));
    const posType = props.positioning_point_type;
    const contentColor = props.content_point_color;
    const contentOpacity = props.content_point_opacity;
    const posColor = props.positioning_point_color;

    let id = 0;

    for (let x = 0; x < table.length; x++) {
      for (let y = 0; y < table.length; y++) {
        if (!table[x][y]) continue;
        const tt = typeTable[x][y];
        if (
          tt === QRPointType.ALIGN_CENTER ||
          tt === QRPointType.ALIGN_OTHER ||
          tt === QRPointType.TIMING
        ) {
          points.push(
            <circle
              key={id++}
              opacity={contentOpacity}
              r={0.5}
              fill={contentColor}
              cx={x + 0.5}
              cy={y + 0.5}
            />,
          );
        } else if (tt === QRPointType.POS_CENTER) {
          if (posType === "circle") {
            points.push(
              <circle key={id++} fill={posColor} cx={x + 0.5} cy={y + 0.5} r={1.5} />,
            );
            points.push(
              <circle
                key={id++}
                fill="none"
                strokeWidth="1"
                stroke={posColor}
                cx={x + 0.5}
                cy={y + 0.5}
                r={3}
              />,
            );
          } else if (posType === "planet") {
            points.push(
              <circle key={id++} fill={posColor} cx={x + 0.5} cy={y + 0.5} r={1.5} />,
            );
            points.push(
              <circle
                key={id++}
                fill="none"
                strokeWidth="0.15"
                strokeDasharray="0.5,0.5"
                stroke={posColor}
                cx={x + 0.5}
                cy={y + 0.5}
                r={3}
              />,
            );
            for (const w of [3, -3]) {
              points.push(
                <circle
                  key={id++}
                  fill={posColor}
                  cx={x + w + 0.5}
                  cy={y + 0.5}
                  r={0.5}
                />,
              );
            }
            for (const h of [3, -3]) {
              points.push(
                <circle
                  key={id++}
                  fill={posColor}
                  cx={x + 0.5}
                  cy={y + h + 0.5}
                  r={0.5}
                />,
              );
            }
          } else {
            // square / rounded 都按方块处理
            points.push(
              <rect key={id++} fill={posColor} x={x} y={y} width={1} height={1} />,
            );
          }
        } else if (tt === QRPointType.POS_OTHER) {
          points.push(
            <rect
              key={id++}
              fill={posColor}
              x={x}
              y={y}
              width={1}
              height={1}
              rx={posType === "rounded" ? 0.3 : 0}
            />,
          );
        } else {
          // 普通信息点：A3 经典 = 随机半径圆点（混乱与秩序）
          const r = 0.5 * (0.33 + rng() * (1.0 - 0.33));
          points.push(
            <circle
              key={id++}
              opacity={contentOpacity}
              fill={contentColor}
              cx={x + 0.5}
              cy={y + 0.5}
              r={r}
            />,
          );
        }
      }
    }
    return points;
  }, [
    props.url,
    props.correct_level,
    props.content_point_opacity,
    props.content_point_color,
    props.positioning_point_type,
    props.positioning_point_color,
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

export const qrbtfModuleA3: QrbtfModule<QrbtfRendererA3Props> = {
  type: "svg_renderer",
  presets: A3Presets,
  renderer: QrbtfRendererA3,
};
