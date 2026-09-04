"use client";

import { Badge } from "@/components/ui/badge";
import { LucideScan } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAtom } from "jotai/index";
import { urlAtom } from "@/lib/states";
import { toast } from "sonner";
import { trackEvent } from "@/components/TrackComponents";
import { BrowserQRCodeReader } from "@zxing/browser";

export function ScanButton(props: { name: string }) {
  const scanRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const [url, setUrl] = useAtom(urlAtom);

  const prepareScan = async () => {
    const onFileChange = () => {
      if (!scanRef.current?.files || scanRef.current.files.length === 0) return;
      const imageFile = scanRef.current.files[0];
      const objectUrl = URL.createObjectURL(imageFile);

      if (!readerRef.current) {
        readerRef.current = new BrowserQRCodeReader();
      }

      readerRef.current
        .decodeFromImageUrl(objectUrl)
        .then((result) => {
          const text = result.getText();
          setUrl(text);
          toast.success("识别成功，已填入网址");
        })
        .catch((err) => {
          // 区分两类失败，给出可读提示
          const msg = String(err?.message ?? err ?? "");
          console.error(`Scan error: ${msg}`);
          if (/not\s*found|no qr|cannot|fail to|not detected/i.test(msg)) {
            toast.error("没能识别到二维码，请换一张清晰的标准二维码图片");
          } else {
            toast.error("未能识别到二维码，请换一张清晰的标准二维码图片");
          }
        })
        .finally(() => {
          URL.revokeObjectURL(objectUrl);
        });
    };

    scanRef.current?.addEventListener("change", onFileChange);
    return () => {
      scanRef.current?.removeEventListener("change", onFileChange);
    };
  };

  useEffect(() => {
    let removeListener: () => void = () => {};
    prepareScan().then((f) => (removeListener = f));
    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      <input
        ref={scanRef}
        id="qr-input-file"
        type="file"
        accept="image/*"
        className="hidden"
      />
      <Badge
        onClick={(evt) => {
          evt.preventDefault();
          scanRef.current?.click();
          trackEvent("upload_qrcode_button");
        }}
        className="rounded-md hover:bg-accent cursor-pointer"
        variant="outline"
      >
        <LucideScan className="w-4 h-4 mr-1" />
        {props.name}
      </Badge>
    </>
  );
}
