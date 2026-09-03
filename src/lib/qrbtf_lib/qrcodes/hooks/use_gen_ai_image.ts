"use client";

// QRzone AI 生成核心逻辑：
// 1. 前端本地把 URL 编码成标准二维码 PNG（Data URI）
// 2. 连同风格提示词一起发给 Agnes Image 2.5 Flash 做图生图
// 3. 拿到结果后本地扫码校验，不通过则自动重试（最多 3 次）

import { encode } from "@/lib/qrbtf_lib/encoder";
import { urlAtom } from "@/lib/states";
import { AGNES_IMAGE_MODEL, getAgnesApiKey } from "@/lib/agnes";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 3;

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

/** 把二维码矩阵绘制到 canvas 并导出 PNG Data URI（含静区，黑白高对比） */
function buildQrDataUri(text: string): string {
  const [matrix] = encode(text, { border: 4, scale: 8 });
  const moduleCount = matrix.length;
  const canvas = document.createElement("canvas");
  canvas.width = moduleCount * 8;
  canvas.height = moduleCount * 8;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        ctx.fillRect(col * 8, row * 8, 8, 8);
      }
    }
  }
  return canvas.toDataURL("image/png");
}

function dataUriToFile(dataUri: string, name: string): File {
  const [head, b64] = dataUri.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] || "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

/** 用 html5-qrcode 对生成结果做扫码校验 */
async function isScannable(imageUri: string): Promise<boolean> {
  const holder = document.createElement("div");
  holder.id = "qrzone-scan-check";
  holder.style.display = "none";
  document.body.appendChild(holder);
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qrzone-scan-check");
    try {
      let file: File;
      if (imageUri.startsWith("data:")) {
        file = dataUriToFile(imageUri, "result.png");
      } else {
        const blob = await (await fetch(imageUri)).blob();
        file = new File([blob], "result.png", { type: blob.type });
      }
      await scanner.scanFile(file, false);
      return true;
    } catch {
      return false;
    } finally {
      try {
        scanner.clear();
      } catch {
        // ignore
      }
    }
  } finally {
    holder.remove();
  }
}

/** 组装图生图提示词：改动要求 + 保留约束，重试时加强二维码保持力度 */
function buildPrompt(stylePrompt: string, attempt: number): string {
  const style = stylePrompt.trim() || "精美插画风，丰富的细节与和谐配色";
  const keep =
    "这是一张二维码图片，请在艺术化重绘的同时完整保留二维码的三个回字形定位角和全部黑白模块结构，保持高对比度和清晰的模块边缘，确保手机摄像头可以正常扫码识别，不要改变二维码的构图和内容位置。";
  const stronger =
    attempt > 1
      ? "特别注意：提高二维码区域的黑白对比度，弱化覆盖在定位角和信息点上的装饰元素。"
      : "";
  return `${keep} 艺术风格要求：${style}。 ${stronger}`;
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

    const qrDataUri = buildQrDataUri(url);
    const size = values.size || "1K";
    let lastResult: GenResult | null = null;

    try {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        setResData({
          status: "generating",
          imageUrl: null,
          scannable: false,
          attempts: attempt,
        });

        const resp = await fetch("/api/agnes/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-agnes-key": apiKey,
          },
          body: JSON.stringify({
            model: AGNES_IMAGE_MODEL,
            prompt: buildPrompt(values.prompt || "", attempt),
            size,
            ratio: "1:1",
            extra_body: {
              image: [qrDataUri],
              response_format: "b64_json",
            },
          }),
        });

        if (!resp.ok) {
          let msg = `请求失败（HTTP ${resp.status}）`;
          try {
            const err = await resp.json();
            if (err?.error) msg = String(err.error);
          } catch {
            // keep default message
          }
          toast.error(msg);
          setResData({
            status: "failed",
            imageUrl: null,
            scannable: false,
            attempts: attempt,
            message: msg,
          });
          return;
        }

        const data = await resp.json();
        const item = data?.data?.[0];
        const imageUri: string | null = item?.b64_json
          ? `data:image/png;base64,${item.b64_json}`
          : item?.url || null;

        if (!imageUri) {
          continue;
        }

        const scannable = await isScannable(imageUri);
        lastResult = {
          status: "completed",
          imageUrl: imageUri,
          scannable,
          attempts: attempt,
        };
        setResData(lastResult);

        if (scannable) {
          if (attempt > 1) toast.success(`第 ${attempt} 次生成通过扫码校验`);
          return;
        }
      }

      // 全部尝试用完：保留最后一次结果，提示未通过校验
      if (lastResult) {
        toast.warning(
          `已生成 ${MAX_ATTEMPTS} 次，均未通过本地扫码校验，可更换提示词或尺寸后重试`,
        );
      } else {
        setResData({
          status: "failed",
          imageUrl: null,
          scannable: false,
          attempts: MAX_ATTEMPTS,
          message: "接口未返回图片",
        });
        toast.error("接口未返回图片，请检查 API Key 与账户额度");
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
