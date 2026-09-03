// Agnes AI 图像生成代理：
// 浏览器 -> /api/agnes/image -> apihub.agnes-ai.com
// 用于规避浏览器跨域限制；API Key 由前端随请求头透传，不在服务端存储

import { AGNES_API_ENDPOINT } from "@/lib/agnes";

export const runtime = "nodejs";
// 图像生成可能较慢，放宽超时（文档建议 60s - 360s）
export const maxDuration = 300;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-agnes-key") || "";
  if (!apiKey) {
    return Response.json(
      { error: "Missing API key" },
      { status: 401 },
    );
  }

  let body: string;
  try {
    body = await req.text();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(AGNES_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
      signal: AbortSignal.timeout(290_000),
    });
  } catch (err) {
    return Response.json(
      { error: `Upstream request failed: ${err}` },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
