
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

  // Check if there are any children to display
  const hasChildren = React.Children.count(children) > 0;

  // If no children, return a minimal height container that won't cause layout shifts
  if (!hasChildren) {
    return null;
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
        className={cn(
          "flex min-w-full gap-4 py-1 animate-scroll whitespace-nowrap no-scrollbar",
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        )}
        style={{ animationDuration: "var(--duration)" }}
      >
        {children}
        {/* Duplicate children for a seamless loop */}
        {children}
      </div>
    </div>
  );
}
