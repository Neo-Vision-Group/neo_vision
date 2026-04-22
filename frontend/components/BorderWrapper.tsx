
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
