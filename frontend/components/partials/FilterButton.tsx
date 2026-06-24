import { useState } from "react";
import { AnimatedBorder } from "../AnimatedBorder";

export default function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-start text-left border border-transparent bg-surface lg:px-2 py-1.5 mx-1 font-funnel text-[18px] leading-[1.2] transition-colors md:text-[18px] lg:text-[18px] md:leading-normal ${
        isActive
          ? "bg-brand/30 text-black dark:text-[#efefef]"
          : "text-black/85 hover:text-black dark:text-[#efefef]/85 dark:hover:text-[#efefef]"
      }`}
    >
      <AnimatedBorder isHovered={isActive || isHovered} />
      <span className="relative z-10 uppercase">{label}</span>
    </button>
  );
}