"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { QrStyleItemProps, qrStyleList } from "@/lib/qr_style_list";
import { motion } from "framer-motion";
import { transitionDampingMd } from "@/lib/animations";
import { cn, useCurrentQrcodeType } from "@/lib/utils";
import { Link } from "@/navigation";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Container } from "@/components/Containers";
import React, { useEffect, useRef, useState } from "react";
import { useDraggable } from "react-use-draggable-scroll";
import { TrackLink } from "@/components/TrackComponents";

export function SectionStylesClient() {
  const t = useTranslations("index.style");
  const currentQrcodeType = useCurrentQrcodeType();

  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref, {
    applyRubberBandEffect: true, // activate rubber band effect
  });

  // 滚动进度条 0~1
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollMetrics, setScrollMetrics] = useState({
    itemWidth: 0,
    containerWidth: 0,
    visibleCount: 0,
  });

  const updateProgress = () => {
    const el = ref.current as unknown as HTMLDivElement;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
    setScrollProgress(ratio);
    const first = el.querySelector("[data-style-card]") as HTMLElement | null;
    const itemW = first ? first.getBoundingClientRect().width : 0;
    const visible = itemW > 0 ? Math.max(1, Math.round(el.clientWidth / itemW)) : 0;
    setScrollMetrics({
      itemWidth: itemW,
      containerWidth: el.clientWidth,
      visibleCount: visible,
    });
  };

  useEffect(() => {
    const el = ref.current as unknown as HTMLDivElement;
    if (!el) return;
    updateProgress();
    el.addEventListener("scroll", updateProgress, { passive: true });
    const ro = new ResizeObserver(updateProgress);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateProgress);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const render = (item: QrStyleItemProps, index: number) => {
    const itemPath = item.id === "g1" ? "/" : `/style/${item.id}`;
    const isActive = currentQrcodeType === item.id;
    return (
      <div
        key={"qrcode_style_" + index}
        data-style-card
        className={cn(
          "snap-start pl-6 -ml-3 sm:pl-0 sm:ml-0 transition-opacity",
          isActive ? "" : "dark:opacity-70",
        )}
      >
        <TrackLink
          trackValue={["qrcode_style", item.id]}
          href={itemPath}
          scroll={false}
          prefetch={false}
        >
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
        </TrackLink>
      </div>
    );
  };

  const total = qrStyleList.length;
  // 进度条 thumb 宽度 = 可见项数 / 总数；只在需要滚动时显示
  const needScroll = total > scrollMetrics.visibleCount && scrollMetrics.visibleCount > 0;
  const thumbRatio = needScroll ? scrollMetrics.visibleCount / total : 1;
  const thumbWidthPct = Math.max(0.08, Math.min(1, thumbRatio)) * 100;
  const trackWidthPct = 100;
  const thumbLeftPct = (1 - thumbRatio) * 100 * scrollProgress;

  return (
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
        className="overflow-x-auto no-scrollbar snap-x sm:snap-none snap-mandatory"
        {...events}
        ref={ref} // add reference and events to the wrapping div
      >
        <div className="flex flex-col">
          <div className="w-full flex flex-col items-center sm:px-6 lg:px-12">
            <div className="w-full max-w-5xl">
              <div className="flex sm:gap-3">
                <div className="w-3 shrink-0 sm:hidden" />

                {qrStyleList.map((item, index) => render(item, index))}

                <div className="w-6 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义进度条：可视化已滚动进度，方便用户知道还有更多 */}
      <Container>
        <div className="mt-3 max-w-5xl mx-auto px-6 sm:px-0 lg:px-12">
          <div
            className="relative h-1 rounded-full bg-foreground/10 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scrollProgress * 100)}
          >
            <div
              className="absolute top-0 h-full rounded-full bg-foreground/60 transition-[left,width] duration-150 ease-out"
              style={{
                left: `${thumbLeftPct}%`,
                width: `${thumbWidthPct}%`,
              }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
