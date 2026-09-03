"use client";

import React, { ReactNode } from "react";
import { Link } from "@/navigation";
import { LinkProps } from "next/link";

interface TrackLinkProps extends Omit<LinkProps, "locale"> {
  children?: ReactNode;
  trackValue: string | string[];
  className?: string;
  target?: string;
}

// QRzone 已移除第三方统计，TrackLink 仅保留链接行为
export const TrackLink: React.FC<TrackLinkProps> = ({
  trackValue,
  onClick,
  ...props
}) => {
  return (
    <Link
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
      }}
      {...props}
    >
      {props.children}
    </Link>
  );
};

export function trackEvent(
  _name: string,
  _properties?: Record<string, any>,
) {
  // 统计已移除，保留空实现以兼容旧调用
}
