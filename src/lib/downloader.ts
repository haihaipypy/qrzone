function createDownloadTask(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.target = "download";
  a.download = filename;
  a.hidden = true;
  a.click();
}

function svgToSvg(name: string, el: SVGSVGElement) {
  const svgHead =
    '<?xml version="1.0" encoding="utf-8"?>\n ' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">\n';
  let htmlContent = [svgHead + el.outerHTML];
  let bl = new Blob(htmlContent, { type: "image/svg+xml" });
  createDownloadTask(URL.createObjectURL(bl), `qrcode_${name}.svg`);
}

const MIME = { jpg: "image/jpeg", png: "image/png" };
interface SvgToImageOptions {
  type: keyof typeof MIME;
  width: number;
  height: number;
}

function svgToImage(
  name: string,
  el: SVGSVGElement,
  options?: Partial<SvgToImageOptions>,
) {
  const { type = "jpg", width = 1500, height = 1500 } = options || {};

  const $clone = el.cloneNode(true) as HTMLElement;
  $clone.setAttribute("width", width.toString());
  $clone.setAttribute("height", height.toString());
  const svgData = new XMLSerializer().serializeToString($clone);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", width.toString());
  canvas.setAttribute("height", height.toString());

  const ctx = canvas.getContext("2d");
  const img = document.createElement("img");
  img.setAttribute(
    "src",
    "data:image/svg+xml;base64," + btoa(svgData),
  );

  img.onload = () => {
    if (!ctx) {
      return;
    }

    ctx.fillStyle = "white";
    if (type === "jpg") ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const data = canvas.toDataURL(MIME[type], 0.8);
    createDownloadTask(data, `QRcode_${name}.${type}`);
  };
}

// AI 生成结果可能是 Data URI（b64_json）或远程 URL，统一转成 Blob 下载
async function uriToImage(name: string, src: string) {
  const isDataUri = src.startsWith("data:");
  const suffix = isDataUri
    ? src.slice(5, src.indexOf(";"))?.split("/")[1] || "png"
    : new URL(src).pathname.split(".").pop() || "jpg";

  const blob = await (await fetch(src)).blob();
  createDownloadTask(URL.createObjectURL(blob), `QRcode_${name}.${suffix}`);
}

export type Downloader = (options: {
  name: string;
  wrapper: HTMLElement;
  params: any;
}) => void;

const SvgQrcodeDownloaders: Record<string, Downloader> = {
  svg: ({ name, wrapper }) =>
    svgToSvg(name, wrapper.firstChild as SVGSVGElement),
  jpg: ({ name, wrapper }) =>
    svgToImage(name, wrapper.firstChild as SVGSVGElement, { type: "jpg" }),
  png: ({ name, wrapper }) =>
    svgToImage(name, wrapper.firstChild as SVGSVGElement, { type: "png" }),
};

const ApiFetcherQrcodeDownloaders: Record<string, Downloader> = {
  jpg: ({ name, wrapper }) =>
    uriToImage(name, wrapper.getElementsByTagName("img")[0].src),
};

const downloaderMaps: Record<
  "svg_renderer" | "api_fetcher",
  Record<string, Downloader>
> = {
  svg_renderer: SvgQrcodeDownloaders,
  api_fetcher: ApiFetcherQrcodeDownloaders,
};

export { downloaderMaps };
