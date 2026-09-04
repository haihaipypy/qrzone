"use client";

import React, { useMemo } from "react";
import { QRPointType, encode } from "../encoder";
import { QrbtfModule, QrbtfRendererCommonProps, RendererProps } from "./param";
import { Sp2PresetKeys, Sp2Presets } from "./sp2_config";

export type QrbtfRendererSp2Props = QrbtfRendererCommonProps;

// 基于 URL 的确定性伪随机：同一二维码输出稳定（可复现），不同 URL 呈现不同随机配色
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

function QrbtfRendererSp2(props: RendererProps<QrbtfRendererSp2Props>) {
  const [table, typeTable] = useMemo(
    () => encode(props.url, { ecc: props.correct_level }),
    [props.url, props.correct_level],
  );
  const points = useMemo(() => {
    const points: React.ReactNode[] = [];
    const rng = mulberry32(hashStr(props.url || "qrzone"));
    let id = 0;

    for (let x = 0; x < table.length; x++) {
      for (let y = 0; y < table.length; y++) {
        if (!table[x][y]) continue;
        // 经典 SP-2：每个暗点画两层随机大小的彩色矩形（骚气粉紫/橙红配色）
        const tempRand = 0.8 + rng() * (1.3 - 0.8);
        const randNum = 50 + rng() * (230 - 50);
        const rgb1 = `rgb(${Math.floor(20 + randNum)}, ${Math.floor(
          170 - randNum / 2,
        )}, ${Math.floor(60 + randNum * 2)})`;
        const rgb2 = `rgb(${Math.floor(-20 + randNum)}, ${Math.floor(
          130 - randNum / 2,
        )}, ${Math.floor(20 + randNum * 2)})`;
        const width = 0.15;
        const ox = x - (tempRand - 1) / 2;
        const oy = y - (tempRand - 1) / 2;
        points.push(
          <rect
            key={id++}
            fill={rgb2}
            opacity={0.9}
            width={tempRand + width}
            height={tempRand + width}
            x={ox}
            y={oy}
          />,
        );
        points.push(
          <rect
            key={id++}
            fill={rgb1}
            width={tempRand}
            height={tempRand}
            x={ox}
            y={oy}
          />,
        );
      }
    }
    return points;
  }, [props.url, props.correct_level, table, typeTable]);

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

export const qrbtfModuleSp2: QrbtfModule<QrbtfRendererSp2Props> = {
  type: "svg_renderer",
  presets: Sp2Presets,
  renderer: QrbtfRendererSp2,
};
