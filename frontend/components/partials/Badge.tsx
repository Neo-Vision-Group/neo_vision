"use client";

import { useState } from "react";
import { AnimatedBorder } from "../AnimatedBorder";

export default function Badge({ text }: { text: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative bg-brand-dark hover:bg-brand p-2.5 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <AnimatedBorder isHovered={isHovered} />
        <p className="text-white font-funnel text-xl">{text}</p>
    </div>
  );
}