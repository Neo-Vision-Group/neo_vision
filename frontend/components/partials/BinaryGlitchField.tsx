'use client'
import { useEffect, useState } from "react";

export default function BinaryGlitchField({ isDark }: { isDark: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initId = setTimeout(() => {
      setMounted(true);
      setLines(createBinaryLines());
    }, 0);

    if (mediaQuery?.matches) {
      return () => clearTimeout(initId);
    }

    const interval = window.setInterval(() => {
      setLines(createBinaryLines());
    }, 70);

    const stopId = setTimeout(() => {
      window.clearInterval(interval);
    }, 3500);

    return () => {
      clearTimeout(initId);
      clearTimeout(stopId);
      window.clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const dotColor = isDark ? "220,220,220" : "30,30,30";

  return (
    <div className="absolute inset-[-8%] overflow-hidden">
      <div className="absolute inset-0" />
      <div
        className="absolute inset-0 font-mono text-[22px] leading-[1.05] md:text-[28px] select-none"
        style={{
          color: `rgb(${dotColor})`,
        }}
      >
        {lines.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 10)}`}
            className="whitespace-nowrap"
            style={{
              transform: `translate3d(${index % 2 === 0 ? "-3%" : "1%"}, ${
                index * 92
              }%, 0)`,
              maskImage: `radial-gradient(circle at center, rgba(0,0,0,1) 0.5px, transparent 1.2px)`,
              maskSize: '2.5px 2.5px',
              WebkitMaskImage: `radial-gradient(circle at center, rgba(0,0,0,1) 0.5px, transparent 1.2px)`,
              WebkitMaskSize: '2.5px 2.5px',
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <div className="absolute inset-0" />
    </div>
  );
}

function createBinaryLines(lineCount = 9, lineLength = 28) {
  return Array.from({ length: lineCount }, () =>
    Array.from({ length: lineLength }, (_, i) =>
      i % 11 === 10 ? "." : (Math.random() > 0.5 ? "1" : "0")
    ).join("")
  );
}
