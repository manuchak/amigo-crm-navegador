
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
    slow: "25s",
    normal: "18s",
    fast: "12s",
  };

  const directionMap = {
    left: "marquee",
    right: "marquee-reverse",
  };

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden [--duration:18s] [--gap:1rem]",
        pauseOnHover && "hover:[animation-play-state:paused]",
        className
      )}
      style={{ 
        "--duration": speedMap[speed] 
      } as React.CSSProperties}
      {...props}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-[--gap] py-1",
          `animate-${directionMap[direction]} [animation-duration:var(--duration)] [animation-iteration-count:infinite] [animation-timing-function:linear]`
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-[--gap] py-1",
          `animate-${directionMap[direction]} [animation-duration:var(--duration)] [animation-iteration-count:infinite] [animation-timing-function:linear]`
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
