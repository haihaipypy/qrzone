import { toast } from "sonner";

export const http: typeof fetch = async (input, init) => {
  const res = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    let msg = "Network Error";
    try {
      const body = await res.json();
      msg = body["error"] ?? msg;
    } catch {
      // ignore body parse error
    }
    toast.error(msg);
    throw Error(msg);
  }
  return res;
};
