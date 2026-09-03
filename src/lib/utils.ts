import { usePathname } from "@/navigation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useCurrentQrcodeType() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  // usePathname 返回的是去掉 locale 前缀的路径
  // /zh          -> "/"            -> ["", ""]            -> 首页
  // /zh/style/g1 -> "/style/g1"    -> ["", "style", "g1"]  -> "g1"
  if (segments.length < 3 || segments[1] !== "style") return null;
  return segments[2];
}

interface NestedDict {
  [key: string]: NestedDict | any;
}

export function flattenObject(
  obj: NestedDict,
  parentKey: string = "",
  result: Record<string, number> = {},
): Record<string, number> {
  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObject(obj[key] as NestedDict, newKey, result);
    } else {
      result[newKey] = obj[key] as number;
    }
  }
  return result;
}

let seed = 0;

export function rand(min: number, max: number) {
  seed = (seed * 9301 + 49297) % 233280;
  return min + (seed / 233280.0) * (max - min);
}
