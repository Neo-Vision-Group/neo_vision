"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBorder } from "../AnimatedBorder";

export default function Badge({ text, isActive, groupHover = false, showBorder = true }: { text: string; isActive?: boolean; groupHover?: boolean; showBorder?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "relative w-fit bg-[#ff41004d] p-2 transition-colors duration-300",
        isActive ? "bg-brand" : groupHover ? "group-hover:bg-brand" : "hover:bg-brand"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {showBorder && !groupHover && <AnimatedBorder isHovered={!isActive && isHovered} />}
        <p className="text-dark dark:text-white font-funnel text-[18px]">{text}</p>
    </div>
  );
}