
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  children: React.ReactNode;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = "normal",
  className,
  ...props
}: MarqueeProps) {
  const speedMap = {
    slow: "35s",
    normal: "25s",
    fast: "15s",
  };

  // Use CSS variables to control animation properties
  const cssVars = {
    "--duration": speedMap[speed],
    "--gap": "1rem",
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden",
        pauseOnHover && "hover:[animation-play-state:paused]",
        className
      )}
      style={cssVars}
      {...props}
    >
      <div
        className={cn(
          "flex w-full gap-4 py-1 overflow-x-auto whitespace-nowrap no-scrollbar",
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        )}
        style={{ animationDuration: "var(--duration)" }}
      >
        {children}
      </div>
    </div>
  );
}
