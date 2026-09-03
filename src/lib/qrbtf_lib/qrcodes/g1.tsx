"use client";

import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { opacityAnimations, transitionMd } from "@/lib/animations";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/Progress";
import { QrbtfModule } from "./param";
import { G1Presets } from "./g1_config";
import PixelCard from "@/components/vfx/pixel-grid";
import { GenResult } from "./hooks/use_gen_ai_image";

export interface QrbtfRendererG1Props {
  prompt: string;
  size: string;
}

function QrbtfVisualizerG1(props: { data: GenResult | null }) {
  const result = props.data;

  return (
    <div>
      <div
        id="output_image"
        className="aspect-square flex flex-col items-center justify-center"
      >
        {!result?.imageUrl && <PhotoIcon className="w-12 h-12 opacity-10" />}
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
        <AnimatePresence>
          {result?.status === "generating" && (
            <>
              <div className="absolute w-full h-full top-0 left-0">
                <PixelCard isActive className="w-full h-full">
                  {""}
                </PixelCard>
              </div>
              <motion.div
                key="progress-and-status"
                className="w-full h-full flex flex-col items-center justify-center gap-2 bg-background"
                variants={opacityAnimations}
                transition={transitionMd}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Progress
                  value={Math.min(
                    0.15 + (result.attempts - 1) * 0.3 + 0.25,
                    0.95,
                  )}
                  className="w-[30%] h-2"
                />
                <div className="opacity-30 text-sm">
                  AI 生成中（第 {result.attempts} 次）...
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <AnimatePresence>
          {result?.imageUrl && result.status !== "generating" && (
            <motion.div
              key="final-image"
              variants={opacityAnimations}
              transition={transitionMd}
              initial="hidden"
              animate="visible"
              className="relative bg-background w-full h-full"
            >
              <img
                src={result.imageUrl}
                alt="AI QR Code"
                className="w-full h-full block select-auto"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-xs backdrop-blur">
                {result.scannable ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span>已通过扫码校验（第 {result.attempts} 次）</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>未通过扫码校验，建议重试</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result?.status === "failed" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm opacity-60">
            <Loader2 className="mr-1 h-4 w-4" />
            {result.message || "生成失败，请重试"}
          </div>
        </div>
      )}
    </div>
  );
}

export const qrbtfModuleG1: QrbtfModule<QrbtfRendererG1Props> = {
  type: "api_fetcher",
  visualizer: QrbtfVisualizerG1,
  presets: G1Presets,
};
