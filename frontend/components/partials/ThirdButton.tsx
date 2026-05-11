import { useState } from "react"
import Link from "next/link"
import { AnimatedBorder } from "@/components/AnimatedBorder"
import ArrowRightPixel from "@/components/icons/ArrowRightPixel"

export default function ThirdButton({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <>
      <AnimatedBorder isHovered={isHovered} />
      <ArrowRightPixel
        color="currentColor"
        width={38}
        height={24}
        className="relative z-10 h-6 w-10 shrink-0"
      />
      <span className="relative z-10 font-funnel text-100 font-bold leading-[1.2]">
        {label}
      </span>
    </>
  );

  const className =
    `relative inline-flex items-center gap-3 self-start px-2 py-1 transition-colors duration-200 ${
      isHovered ? "text-brand" : "text-black dark:text-[#efefef]"
    }`;

  if (!href) {
    return (
      <div
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </div>
    );
  }

  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link
        href={href}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  );
}