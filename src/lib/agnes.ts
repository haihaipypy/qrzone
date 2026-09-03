// Agnes AI 图像接口配置
// 端点与模型按官方文档写死：https://www.agnes-ai.com/zh-Hans/docs/agnes-image-25-flash
// 仅 API Key 由用户在页面中填写，保存在浏览器 localStorage

export const AGNES_API_ENDPOINT =
  "https://apihub.agnes-ai.com/v1/images/generations";

export const AGNES_IMAGE_MODEL = "agnes-image-2.5-flash";

export const AGNES_API_KEY_STORAGE = "qrzone_agnes_api_key";

export function getAgnesApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AGNES_API_KEY_STORAGE) || "";
}

export function setAgnesApiKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGNES_API_KEY_STORAGE, key.trim());
}
