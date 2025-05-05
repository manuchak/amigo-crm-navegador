
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
  const contentRef = React.useRef<HTMLDivElement>(null);
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

  // Check if there are any children to display
  const hasChildren = React.Children.count(children) > 0;

  // If no children, return a placeholder element with fixed height to prevent layout jumps
  if (!hasChildren) {
    return (
      <div 
        className={cn("h-7 flex items-center", className)}
        {...props}
      >
        <div className="text-xs text-slate-400 px-2">No hay alertas disponibles</div>
      </div>
    );
  }

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
        ref={contentRef}
        className={cn(
          "flex min-w-full gap-4 py-1 whitespace-nowrap no-scrollbar animate-marquee",
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        )}
        style={{ 
          animationDuration: "var(--duration)",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite"
        }}
      >
        {children}
        {/* Duplicate children for a seamless loop */}
        {children}
      </div>
    </div>
  );
}
