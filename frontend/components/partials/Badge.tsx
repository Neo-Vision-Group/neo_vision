"use client";

import { useState } from "react";
import { AnimatedBorder } from "../AnimatedBorder";

export default function Badge({ text }: { text: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-fit bg-brand-dark hover:bg-brand p-2 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <AnimatedBorder isHovered={isHovered} />
        <p className="text-dark dark:text-white font-funnel text-[18px]">{text}</p>
    </div>
  );
}