import { ReactNode } from "react";

interface BorderWrapperProps {
  children: ReactNode;
  className?: string;
  bordered?: "top" | "bottom" | "both" | "all";
}

export function BorderWrapper({
  children,
  className = "",
  bordered = "all",
}: BorderWrapperProps) {
  const borderClasses = {
    top: "border-t border-brand",
    bottom: "border-b border-brand",
    both: "border-t border-b border-brand",
    all: "border border-brand",
  };

  const hasTop = bordered === "all" || bordered === "top" || bordered === "both";
  const hasBottom = bordered === "all" || bordered === "bottom" || bordered === "both";

  return (
    <div className={`relative inline-block shrink-0 p-1.5 ${className}`}>
      <div className={`relative ${borderClasses[bordered]} shadow-[0_0_15px_rgba(255,85,0,0.1)]`}>
        {hasTop && (
          <>
            <Corner position="top-left" />
            <Corner position="top-right" />
          </>
        )}
        {hasBottom && (
          <>
            <Corner position="bottom-left" />
            <Corner position="bottom-right" />
          </>
        )}
        <div className="relative z-0 px-4 py-1">{children}</div>
      </div>
    </div>
  );
}

function Corner({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const positions = {
    "top-left": "-top-1.5 -left-1.5",
    "top-right": "-top-1.5 -right-1.5",
    "bottom-left": "-bottom-1.5 -left-1.5",
    "bottom-right": "-bottom-1.5 -right-1.5",
  };

  return (
    <div
      className={`pointer-events-none absolute z-10 size-3 ${positions[position]}`}
      aria-hidden="true"
    >
      <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-brand shadow-[0_0_8px_rgba(255,85,0,0.6)]" />
      <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-brand shadow-[0_0_8px_rgba(255,85,0,0.6)]" />
    </div>
  );
}

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
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
