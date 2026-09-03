"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { QrStyleItemProps, qrStyleList } from "@/lib/qr_style_list";
import { motion } from "framer-motion";
import { transitionDampingMd } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Container } from "@/components/Containers";
import { useDraggable } from "react-use-draggable-scroll";
import { trackEvent } from "@/components/TrackComponents";
import QrcodeGeneratorWithProvider from "@/components/QrcodeGeneratorWithProvider";

// 11 个风格模块 + 各自的参数 hook（首页一次性导入，切换时零网络、瞬时渲染）
import { qrbtfModuleG1, QrbtfRendererG1Props } from "@/lib/qrbtf_lib/qrcodes/g1";
import { useG1Params } from "@/lib/qrbtf_lib/qrcodes/g1_config";
import { qrbtfModuleA1, QrbtfRendererA1Props } from "@/lib/qrbtf_lib/qrcodes/a1";
import { useA1Params } from "@/lib/qrbtf_lib/qrcodes/a1_config";
import { qrbtfModuleC2, QrbtfRendererC2Props } from "@/lib/qrbtf_lib/qrcodes/c2";
import { useC2Params } from "@/lib/qrbtf_lib/qrcodes/c2_config";
import { qrbtfModuleSp1, QrbtfRendererSp1Props } from "@/lib/qrbtf_lib/qrcodes/sp1";
import { useSp1Params } from "@/lib/qrbtf_lib/qrcodes/sp1_config";
import { qrbtfModuleA2, QrbtfRendererA2Props } from "@/lib/qrbtf_lib/qrcodes/a2";
import { useA2Params } from "@/lib/qrbtf_lib/qrcodes/a2_config";
import { qrbtfModuleSp2, QrbtfRendererSp2Props } from "@/lib/qrbtf_lib/qrcodes/sp2";
import { useSp2Params } from "@/lib/qrbtf_lib/qrcodes/sp2_config";
import { qrbtfModuleA3, QrbtfRendererA3Props } from "@/lib/qrbtf_lib/qrcodes/a3";
import { useA3Params } from "@/lib/qrbtf_lib/qrcodes/a3_config";
import { qrbtfModuleA3r, QrbtfRendererA3rProps } from "@/lib/qrbtf_lib/qrcodes/a3r";
import { useA3rParams } from "@/lib/qrbtf_lib/qrcodes/a3r_config";

// —— 每个风格的生成器包装组件（与 /style/{id} 页面等价，但由状态切换渲染） ——
function G1Gen() {
  const t = useTranslations("qrcodes.g1");
  const { params } = useG1Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererG1Props>
      styleId="g1"
      title={t("title")}
      subtitle={t("subtitle")}
      desc={t("desc")}
      qrcodeModule={qrbtfModuleG1}
      params={params}
      defaultPreset="g1"
    />
  );
}
function A1Gen() {
  const t = useTranslations("qrcodes.a1");
  const { params } = useA1Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA1Props>
      styleId="a1"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA1}
      params={params}
      defaultPreset="a1"
    />
  );
}
function C2Gen() {
  const t = useTranslations("qrcodes.c2");
  const { params } = useC2Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererC2Props>
      styleId="c2"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleC2}
      params={params}
      defaultPreset="c2"
    />
  );
}
function Sp1Gen() {
  const t = useTranslations("qrcodes.sp1");
  const { params } = useSp1Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererSp1Props>
      styleId="sp1"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleSp1}
      params={params}
      defaultPreset="sp1"
    />
  );
}
function A2Gen() {
  const t = useTranslations("qrcodes.a2");
  const { params } = useA2Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA2Props>
      styleId="a2"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA2}
      params={params}
      defaultPreset="a2"
    />
  );
}
function Sp2Gen() {
  const t = useTranslations("qrcodes.sp2");
  const { params } = useSp2Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererSp2Props>
      styleId="sp2"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleSp2}
      params={params}
      defaultPreset="sp2"
    />
  );
}
function A1cGen() {
  const t = useTranslations("qrcodes.a1");
  const { params } = useA1Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA1Props>
      styleId="a1c"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA1}
      params={params}
      defaultPreset="a1c"
    />
  );
}
function A1pGen() {
  const t = useTranslations("qrcodes.a1");
  const { params } = useA1Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA1Props>
      styleId="a1p"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA1}
      params={params}
      defaultPreset="a1p"
    />
  );
}
function A3Gen() {
  const t = useTranslations("qrcodes.a3");
  const { params } = useA3Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA3Props>
      styleId="a3"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA3}
      params={params}
      defaultPreset="a3"
    />
  );
}
function A2cGen() {
  const t = useTranslations("qrcodes.a2");
  const { params } = useA2Params();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA2Props>
      styleId="a2c"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA2}
      params={params}
      defaultPreset="a2c"
    />
  );
}
function A3rGen() {
  const t = useTranslations("qrcodes.a3r");
  const { params } = useA3rParams();
  return (
    <QrcodeGeneratorWithProvider<QrbtfRendererA3rProps>
      styleId="a3r"
      title={t("title")}
      subtitle={t("subtitle")}
      qrcodeModule={qrbtfModuleA3r}
      params={params}
      defaultPreset="a3r"
    />
  );
}

const styleRegistry: Record<string, React.ComponentType> = {
  g1: G1Gen,
  a1: A1Gen,
  c2: C2Gen,
  sp1: Sp1Gen,
  a2: A2Gen,
  sp2: Sp2Gen,
  a1c: A1cGen,
  a1p: A1pGen,
  a3: A3Gen,
  a2c: A2cGen,
  a3r: A3rGen,
};

export function HomeGenerator() {
  const t = useTranslations("index.style");
  const [activeStyle, setActiveStyle] = useState<string>("g1");

  const scrollRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;
  const trackRef = useRef<HTMLDivElement>(null);
  const grabOffsetRef = useRef(0);

  const { events } = useDraggable(scrollRef as unknown as React.MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    itemWidth: 0,
    containerWidth: 0,
    visibleCount: 0,
  });

  const updateProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
    setScrollProgress(ratio);
    const first = el.querySelector("[data-style-card]") as HTMLElement | null;
    const itemW = first ? first.getBoundingClientRect().width : 0;
    const visible = itemW > 0 ? Math.max(1, Math.round(el.clientWidth / itemW)) : 0;
    setMetrics({
      itemWidth: itemW,
      containerWidth: el.clientWidth,
      visibleCount: visible,
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateProgress();
    el.addEventListener("scroll", updateProgress, { passive: true });
    const ro = new ResizeObserver(updateProgress);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateProgress);
      ro.disconnect();
    };
  }, [updateProgress]);

  const total = qrStyleList.length;
  const thumbRatio = metrics.visibleCount > 0 && total > metrics.visibleCount
    ? metrics.visibleCount / total
    : 1;
  const needScroll = thumbRatio < 1;
  const thumbWidthPct = Math.max(0.08, Math.min(1, thumbRatio)) * 100;
  const thumbLeftPct = (1 - thumbRatio) * 100 * scrollProgress;

  const scrollToRatio = (ratio: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = Math.max(0, Math.min(1, ratio)) * max;
  };

  const onTrackPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    const el = scrollRef.current;
    if (!track || !el || !needScroll) return;
    const trackRect = track.getBoundingClientRect();
    const thumbW = trackRect.width * thumbRatio;
    const pointerX = e.clientX - trackRect.left;
    const currentThumbLeft = scrollProgress * (trackRect.width - thumbW);
    grabOffsetRef.current = pointerX - currentThumbLeft;

    const move = (clientX: number) => {
      let thumbLeft = clientX - trackRect.left - grabOffsetRef.current;
      thumbLeft = Math.max(0, Math.min(trackRect.width - thumbW, thumbLeft));
      const r = (trackRect.width - thumbW) > 0 ? thumbLeft / (trackRect.width - thumbW) : 0;
      scrollToRatio(r);
    };
    move(e.clientX);
    const onMove = (ev: PointerEvent) => move(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleSelect = (id: string) => {
    setActiveStyle(id);
    trackEvent("qrcode_style", { id });
  };

  const renderCard = (item: QrStyleItemProps, index: number) => {
    const isActive = activeStyle === item.id;
    return (
      <div
        key={"qrcode_style_" + index}
        data-style-card
        className={cn(
          "snap-start pl-6 -ml-3 sm:pl-0 sm:ml-0 transition-opacity",
          isActive ? "" : "dark:opacity-70",
        )}
      >
        <button type="button" onClick={() => handleSelect(item.id)} className="block w-full text-left">
          <motion.div
            className={cn(
              "relative w-[calc((100vw-(12px)*5)/2)] sm:w-[195px] rounded-2xl bg-accent/30 overflow-hidden",
            )}
            whileTap={{
              scale: 0.95,
              opacity: 0.8,
            }}
            transition={transitionDampingMd}
          >
            <AspectRatio ratio={1} />
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white">
              <QrCodeIcon className="w-8 h-8 opacity-20 text-black" />
            </div>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <img
                src={`/assets/qrcodes/${item.image}`}
                alt=""
                className="block w-full h-full bg-white"
              />
            </div>
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-full rounded-2xl",
                isActive ? "ring-[5px] ring-background ring-inset" : "",
              )}
            ></div>
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-full rounded-2xl ring ring-inset",
                isActive
                  ? "ring-2 ring-foreground"
                  : "ring-1 ring-border dark:hidden",
              )}
            ></div>
          </motion.div>
        </button>
      </div>
    );
  };

  const ActiveGen = styleRegistry[activeStyle];

  return (
    <>
      <div className="mt-9">
        <Container>
          <Label className="flex justify-between text-sm font-medium mb-2">
            {t("title")}
            <span className="ml-3 font-normal text-foreground/50">
              {t("subtitle")}
            </span>
          </Label>
        </Container>

        <div
          id="style-card-scroll"
          className="overflow-x-auto no-scrollbar snap-x sm:snap-none snap-mandatory"
          {...events}
          ref={scrollRef}
        >
          <div className="flex flex-col">
            <div className="w-full flex flex-col items-center sm:px-6 lg:px-12">
              <div className="w-full max-w-5xl">
                <div className="flex sm:gap-3">
                  <div className="w-3 shrink-0 sm:hidden" />

                  {qrStyleList.map((item, index) => renderCard(item, index))}

                  <div className="w-6 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {needScroll && (
          <Container>
            <div className="mt-3 max-w-5xl mx-auto px-6 sm:px-0 lg:px-12">
              <div
                ref={trackRef}
                onPointerDown={onTrackPointerDown}
                className="relative h-1.5 rounded-full bg-foreground/10 overflow-hidden cursor-pointer select-none touch-none"
                role="scrollbar"
                aria-controls="style-card-scroll"
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(scrollProgress * 100)}
              >
                <div
                  className="absolute top-0 h-full rounded-full bg-foreground/60"
                  style={{
                    left: `${thumbLeftPct}%`,
                    width: `${thumbWidthPct}%`,
                  }}
                />
              </div>
            </div>
          </Container>
        )}
      </div>

      {/* 当前风格的二维码生成器（原地切换，零路由跳转） */}
      <div className="mt-9">
        {ActiveGen && <ActiveGen key={activeStyle} />}
      </div>
    </>
  );
}
