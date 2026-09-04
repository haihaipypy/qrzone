"use client";

// QRzone AI 艺术二维码核心逻辑（Awesome-qr 经典画法，参考 LIU9293/art-qr）：
// 1. 前端本地把 URL 编码成标准二维码矩阵（用于最终绘制与扫码校验）
// 2. 让 Agnes 文生一张纯艺术背景图（完全自由，不约束二维码结构）
// 3. 本地按 Awesome-qr 画法把二维码叠到背景上：
//    背景图整张完整可见；数据模块画成小方点（暗点=背景主色调、亮点=半透明白点）；
//    定位角/时间/校正图形区域罩半透明白纱后用主色实心重绘；四周保留白色静区
// 4. 扫码校验，不通过则逐级加大点尺寸/透明度/背景压暗，仍失败则用标准黑白码兜底

import { encode } from "@/lib/qrbtf_lib/encoder";
import { urlAtom } from "@/lib/states";
import {
  AGNES_API_ENDPOINT,
  AGNES_IMAGE_MODEL,
  getAgnesApiKey,
} from "@/lib/agnes";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { BrowserQRCodeReader } from "@zxing/browser";

const MAX_ATTEMPTS = 3;
const QUIET = 4; // 静区模块数

export interface GenResult {
  status: "idle" | "generating" | "completed" | "failed";
  /** 生成结果的图片 URI（Data URI 或远程 URL） */
  imageUrl: string | null;
  /** 是否通过本地扫码校验 */
  scannable: boolean;
  /** 当前是第几次尝试 */
  attempts: number;
  message?: string;
}

/** 把 URL 编码为标准二维码矩阵（不含静区，border:0，typeNumber 计算正确） */
function buildQrMatrix(text: string): number[][] {
  const [matrix] = encode(text);
  return matrix.map((row) => row.map((v) => (v ? 1 : 0)));
}

/** 标准黑白二维码 PNG（用于兜底，必然可扫） */
function buildQrDataUri(text: string): string {
  const matrix = buildQrMatrix(text);
  const moduleCount = matrix.length;
  const scale = 8;
  const canvas = document.createElement("canvas");
  canvas.width = (moduleCount + QUIET * 2) * scale;
  canvas.height = (moduleCount + QUIET * 2) * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        ctx.fillRect((col + QUIET) * scale, (row + QUIET) * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL("image/png");
}

/** 组装“艺术背景图”提示词：只描述风格，不约束二维码（二维码由本地融合保证） */
function buildBgPrompt(stylePrompt: string): string {
  const style = stylePrompt.trim() || "精美插画风，丰富的细节与和谐配色";
  return (
    `生成一张高视觉密度的方形艺术背景图，主题风格：${style}。` +
    `要求：构图饱满、色彩丰富、细节丰富、明暗变化明显，整张画面统一为一种艺术风格，` +
    `不要出现任何文字、二维码、条形码或清晰可辨的人脸。` +
    `画面应当适合作为底图，在叠加内容后仍能保留其艺术美感。`
  );
}

/** 把图片缩放到指定边长（用于 ZXing 多尺度重试） */
async function resizeImage(imageUri: string, target: number): Promise<string | null> {
  try {
    const img = await loadImage(imageUri);
    const canvas = document.createElement("canvas");
    canvas.width = target;
    canvas.height = target;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, target, target);
    ctx.drawImage(img, 0, 0, target, target);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** 单次解码尝试 */
async function tryDecode(imageUri: string): Promise<boolean> {
  try {
    const reader = new BrowserQRCodeReader();
    let urlToDecode = imageUri;
    let createdUrl = false;
    if (!imageUri.startsWith("data:")) {
      const blob = await (await fetch(imageUri)).blob();
      urlToDecode = URL.createObjectURL(blob);
      createdUrl = true;
    }
    try {
      await reader.decodeFromImageUrl(urlToDecode);
      return true;
    } catch {
      return false;
    } finally {
      if (createdUrl) URL.revokeObjectURL(urlToDecode);
    }
  } catch {
    return false;
  }
}

/**
 * 扫码校验（多尺度重试）。
 * ZXing 的 HybridBinarizer 对部分画布尺寸会误判（块边界与模块边界错位），
 * 实测连标准黑白码在某些尺寸下都解码失败，故缩小后重试以排除尺寸因素。
 */
async function isScannable(imageUri: string): Promise<boolean> {
  if (await tryDecode(imageUri)) return true;
  for (const target of [528, 264]) {
    const resized = await resizeImage(imageUri, target);
    if (resized && (await tryDecode(resized))) return true;
  }
  return false;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("艺术背景图加载失败"));
    im.src = src;
  });
}

/**
 * 在矩阵中探测 5x5 校正图形（alignment pattern）中心坐标。
 * 校正图形有固定环形签名（外圈全暗 + 内十字亮 + 中心暗），
 * 直接在矩阵中精确匹配 25 个格子即可，无需内置版本位置表。
 */
function detectAlignmentCenters(matrix: number[][]): Array<{ r: number; c: number }> {
  const n = matrix.length;
  const sig = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];
  const centers: Array<{ r: number; c: number }> = [];
  for (let r = 0; r + 4 < n; r++) {
    for (let c = 0; c + 4 < n; c++) {
      let ok = true;
      for (let i = 0; i < 5 && ok; i++) {
        for (let j = 0; j < 5 && ok; j++) {
          if (matrix[r + i][c + j] !== sig[i][j]) ok = false;
        }
      }
      if (!ok) continue;
      // 排除三个定位角区域内的误报（定位角内部不含该签名，这里只是双保险）
      const inFinder =
        (r + 2 < 8 && c + 2 < 8) ||
        (r + 2 < 8 && c + 2 >= n - 8) ||
        (r + 2 >= n - 8 && c + 2 < 8);
      if (!inFinder) centers.push({ r: r + 2, c: c + 2 });
    }
  }
  return centers;
}

/** 融合风格档位：从"最艺术"到"最稳"逐级加大点尺寸/白点透明度/背景压暗 */
const FUSE_STYLES = [
  { dotScale: 0.45, lightAlpha: 0.65, darkMix: 0.15, dim: 0 },
  { dotScale: 0.62, lightAlpha: 0.8, darkMix: 0.35, dim: 0.18 },
  { dotScale: 0.8, lightAlpha: 0.92, darkMix: 0.55, dim: 0.35 },
] as const;

/**
 * Awesome-qr 经典画法（参考 LIU9293/art-qr，即 Awesome-qr.js 的 fork）：
 * 背景图整张完整可见；数据模块画成小方点——
 *   暗模块 = 背景主色调（autoColor，向黑混合保证够暗）；
 *   亮模块 = 半透明白点（在暗背景上可见）。
 * 定位角/时间/校正图形区域先罩半透明白纱，再用主色实心重绘。
 * 静区为白色边框（二维码规范要求）。
 */
async function fuseArtwork(
  artworkUri: string,
  matrix: number[][],
  finalSize = 1024,
  style: (typeof FUSE_STYLES)[number] = FUSE_STYLES[0],
): Promise<string> {
  const img = await loadImage(artworkUri);
  const n = matrix.length;
  const total = n + QUIET * 2;
  const px = Math.max(4, Math.floor(finalSize / total));
  const size = px * total;
  const Q = QUIET * px;

  const bkg = document.createElement("canvas");
  bkg.width = size;
  bkg.height = size;
  const bctx = bkg.getContext("2d");
  if (!bctx) throw new Error("Canvas not supported");

  // 1) 背景层：艺术图整张铺满（完整可见）
  bctx.drawImage(img, 0, 0, size, size);

  // autoColor：跳过过亮像素求平均主色（Awesome-qr 同款做法）
  const bdata = bctx.getImageData(0, 0, size, size).data;
  let ar = 0,
    ag = 0,
    ab = 0,
    ac = 0;
  for (let i = 0; i < bdata.length; i += 4 * 13) {
    const r = bdata[i],
      g = bdata[i + 1],
      b = bdata[i + 2];
    if (r > 200 || g > 200 || b > 200) continue;
    ar += r;
    ag += g;
    ab += b;
    ac++;
  }
  let dr = ac ? ar / ac : 40,
    dg = ac ? ag / ac : 60,
    db = ac ? ab / ac : 90;
  dr *= 1 - style.darkMix;
  dg *= 1 - style.darkMix;
  db *= 1 - style.darkMix;
  const colorDark = `rgb(${dr | 0}, ${dg | 0}, ${db | 0})`;

  if (style.dim > 0) {
    bctx.fillStyle = `rgba(0, 0, 0, ${style.dim})`;
    bctx.fillRect(0, 0, size, size);
  }

  // 2) 前景层（透明画布）：数据点 + 保护区薄纱 + 实心定位图形
  const fg = document.createElement("canvas");
  fg.width = size;
  fg.height = size;
  const fctx = fg.getContext("2d");
  if (!fctx) throw new Error("Canvas not supported");

  const aligns = detectAlignmentCenters(matrix);
  const isProtected = (r: number, c: number) => {
    if (r === 6 || c === 6) return true; // 时间图形
    if ((r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8))
      return true; // 三个定位角 8x8 区
    for (const a of aligns) {
      if (Math.abs(r - a.r) <= 2 && Math.abs(c - a.c) <= 2) return true;
    }
    return false;
  };

  // 2a) 数据模块小方点（暗=主色点、亮=半透明白点）
  const dot = style.dotScale * px;
  const off = ((1 - style.dotScale) * 0.5 * px) | 0;
  fctx.fillStyle = colorDark;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isProtected(r, c) || !matrix[r][c]) continue;
      fctx.fillRect((c + QUIET) * px + off, (r + QUIET) * px + off, dot, dot);
    }
  }
  fctx.fillStyle = `rgba(255, 255, 255, ${style.lightAlpha})`;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isProtected(r, c) || matrix[r][c]) continue;
      fctx.fillRect((c + QUIET) * px + off, (r + QUIET) * px + off, dot, dot);
    }
  }

  // 2b) 保护区白色薄纱（定位角/时间/校正图形区域，让背景透出来但变淡）
  fctx.fillStyle = `rgba(255, 255, 255, ${style.lightAlpha})`;
  fctx.fillRect(Q, Q, 8 * px, 8 * px);
  fctx.fillRect(Q + (n - 8) * px, Q, 8 * px, 8 * px);
  fctx.fillRect(Q, Q + (n - 8) * px, 8 * px, 8 * px);
  fctx.fillRect(Q + 8 * px, Q + 6 * px, (n - 16) * px, px);
  fctx.fillRect(Q + 6 * px, Q + 8 * px, px, (n - 16) * px);
  for (const a of aligns) {
    fctx.fillRect(Q + (a.c - 2) * px, Q + (a.r - 2) * px, 5 * px, 5 * px);
  }

  // 2c) 保护区内的暗模块实心绘制（定位图形/时间图形/校正图形，直接取矩阵）
  fctx.fillStyle = colorDark;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] && isProtected(r, c)) {
        fctx.fillRect((c + QUIET) * px, (r + QUIET) * px, px, px);
      }
    }
  }

  // 3) 白色静区边框（二维码规范）
  fctx.fillStyle = "#ffffff";
  fctx.fillRect(0, 0, size, Q);
  fctx.fillRect(0, size - Q, size, Q);
  fctx.fillRect(0, 0, Q, size);
  fctx.fillRect(size - Q, 0, Q, size);

  // 4) 合成：背景 + 前景
  bctx.drawImage(fg, 0, 0);
  return bkg.toDataURL("image/png");
}

/**
 * 解析 Agnes 错误响应。其格式为嵌套对象 { error: { code, message, type } }，
 * 直接 String(err.error) 会得到 "[object Object]"，必须取 error.message。
 */
async function parseError(resp: Response): Promise<string> {
  let msg = `请求失败（HTTP ${resp.status}）`;
  try {
    const err = await resp.json();
    const e = err?.error;
    if (typeof e === "string") msg = e;
    else if (e?.message) msg = String(e.message);
  } catch {
    // keep default message
  }
  return msg;
}

/**
 * 直接调用 Agnes 图像生成接口（带重试）。Agnes 偶发 503 / 429 等临时性故障，
 * 间隔后重试通常可自愈。401 / 400 等属请求本身的问题，不重试，直接返回给上层提示。
 * 注意：EdgeOne Pages 按静态项目部署，不托管 /api/*，因此不走后端代理。
 */
async function requestAgnes(body: string, apiKey: string): Promise<Response> {
  const delays = [0, 3000, 8000];
  let last: Response | null = null;
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      toast.info(`Agnes 服务暂时不可用，${delays[i] / 1000} 秒后自动重试…`);
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    const resp = await fetch(AGNES_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
    last = resp;
    if (resp.ok) return resp;
    if (![429, 500, 502, 503, 504].includes(resp.status)) return resp;
  }
  return last as Response;
}

export default function useGenAiImage() {
  const [generating, setGenerating] = useState(false);
  const [resData, setResData] = useState<GenResult>({
    status: "idle",
    imageUrl: null,
    scannable: false,
    attempts: 0,
  });

  const url = useAtomValue(urlAtom) || "https://blog.1day.vip";

  async function onSubmit(values: { prompt?: string; size?: string }) {
    const apiKey = getAgnesApiKey();
    if (!apiKey) {
      toast.error("请先在上方填写 Agnes API Key");
      return;
    }

    setGenerating(true);
    setResData({
      status: "generating",
      imageUrl: null,
      scannable: false,
      attempts: 0,
    });

    const qrMatrix = buildQrMatrix(url);
    const size = values.size || "1K";

    try {
      // 1) Agnes 文生艺术背景图（不传二维码，完全自由）
      const resp = await requestAgnes(
        JSON.stringify({
          model: AGNES_IMAGE_MODEL,
          prompt: buildBgPrompt(values.prompt || ""),
          size,
          ratio: "1:1",
          return_base64: true,
        }),
        apiKey,
      );

      if (!resp.ok) {
        const msg = await parseError(resp);
        toast.error(msg);
        setResData({
          status: "failed",
          imageUrl: null,
          scannable: false,
          attempts: 0,
          message: msg,
        });
        return;
      }

      const data = await resp.json();
      const item = data?.data?.[0];
      const bgUri: string | null = item?.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : item?.url || null;

      if (!bgUri) {
        toast.error("接口未返回背景图，请检查账户额度");
        setResData({
          status: "failed",
          imageUrl: null,
          scannable: false,
          attempts: 0,
          message: "接口未返回图片",
        });
        return;
      }

      // 2) 本地绘制：Awesome-qr 画法叠加背景，扫码不通过则逐级加稳直到可扫
      let fused: string | null = null;
      let scannable = false;
      try {
        for (let c = 1; c <= MAX_ATTEMPTS; c++) {
          setResData({
            status: "generating",
            imageUrl: null,
            scannable: false,
            attempts: c,
          });
          fused = await fuseArtwork(
            bgUri,
            qrMatrix,
            1024,
            FUSE_STYLES[Math.min(c - 1, FUSE_STYLES.length - 1)],
          );
          scannable = await isScannable(fused);
          if (scannable) break;
        }
      } catch {
        // 融合过程出错（例如背景图为跨域远程图导致画布被污染），交给标准码兜底
        fused = null;
        scannable = false;
      }

      // 3) 兜底：艺术融合失败或未通过校验 → 标准黑白码（必然可扫）
      let isFallback = false;
      if (!scannable) {
        toast.info("艺术融合未通过扫码校验，正在生成标准二维码兜底…");
        fused = buildQrDataUri(url);
        scannable = await isScannable(fused);
        isFallback = true;
      }

      setResData({
        status: "completed",
        imageUrl: fused,
        scannable,
        attempts: 1,
        message: isFallback
          ? "已生成标准二维码（艺术融合未通过校验）"
          : "艺术二维码已生成",
      });
      if (scannable) {
        toast.success(isFallback ? "已生成标准二维码" : "已生成艺术二维码");
      } else {
        toast.warning("建议用手机实测扫码");
      }
    } catch (err) {
      setResData({
        status: "failed",
        imageUrl: null,
        scannable: false,
        attempts: 0,
        message: String(err),
      });
      toast.error(`生成出错：${err}`);
    } finally {
      setGenerating(false);
    }
  }

  return {
    onSubmit,
    generating,
    resData,
  };
}
