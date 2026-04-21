import { ReactNode } from "react";

interface BorderWrapperProps {
  children: ReactNode;
  className?: string;
  bordered?: "top" | "bottom" | "both" | "all";
}

export function BorderWrapper({
  children,
  className = "",
  bordered = "top",
}: BorderWrapperProps) {
  const borderClasses = {
    top: "border-t border-border",
    bottom: "border-b border-border",
    both: "border-t border-b border-border",
    all: "border border-border",
  };

  return (
    <div className={`relative w-full shrink-0 ${borderClasses[bordered]} ${className}`}>
      {children}
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
