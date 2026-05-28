import React from "react";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BorderWrapperProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function BorderWrapper({
  as: Component = "span",
  children,
  className = "",
  style,
}: BorderWrapperProps) {
  return (
    <Component
      className={cn(
        "relative inline-flex",
        className
      )}
      style={style}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-12.5%] h-[125%] w-px bg-brand"
      />
      <span
        aria-hidden="true"
        className="absolute right-0 top-[-12.5%] h-[125%] w-px bg-brand"
      />
      <span
        aria-hidden="true"
        className="absolute left-[-12.5%] top-0 h-px w-[125%] bg-brand"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[-12.5%] h-px w-[125%] bg-brand"
      />
      {children}
    </Component>
  );
}

export function Divider({ orientation = "horizontal", className = "" }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        aria-hidden="true"
        className={`hidden self-stretch bg-border md:block md:w-px ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`h-px w-full bg-border md:hidden ${className}`}
    />
  );
}
