"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBorder } from "../AnimatedBorder";

export default function Badge({ text, isActive, groupHover = false }: { text: string; isActive?: boolean; groupHover?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "relative w-fit bg-[#ff41004d] p-2 transition-colors duration-300",
        groupHover ? "group-hover:bg-brand" : "hover:bg-brand"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <AnimatedBorder isHovered={!groupHover && (isHovered || !!isActive)} groupHover={groupHover} />
        <p className="text-dark dark:text-white font-funnel text-[18px]">{text}</p>
    </div>
  );
}