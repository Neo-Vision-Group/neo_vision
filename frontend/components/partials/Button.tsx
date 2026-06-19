import Link from "next/link";
import { cn } from "../../lib/utils";
import ArrowRight from "../icons/ArrowRight";
import ArrowRightPixel from "../icons/ArrowRightPixel";
import {trackCtaClick} from "@/lib/marketing-analytics";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: boolean; // show trailing arrow. Default true for primary/secondary.
  className?: string;
  children: React.ReactNode;
}

interface AsButton
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface AsLink
  extends BaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  href: string;
}

type ButtonProps = AsButton | AsLink;

const sizeStyles: Record<ButtonSize, string> = {
  md: "pl-6 pr-4 py-3 text-body gap-3", // 24/16/12 — matches Figma
  sm: "pl-4 pr-3 py-2 text-body-2 gap-2",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-brand font-funnel",
  secondary:
    "bg-white-dark text-dark font-funnel hover:bg-white",
  ghost:
    "border border-border text-foreground hover:bg-surface hover:border-foreground/30 hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-foreground",
};

const baseStyles =
  "group inline-flex max-w-full text-xl items-center justify-center font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

export function Button(props: ButtonProps) {
  const isLink = "href" in props && typeof props.href === "string";
  const {
    variant = "primary",
    size = "md",
    icon = variant !== "ghost",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const iconSize = size === "sm" ? 26 : 38;
  const iconHeight = size === "sm" ? 16 : 24;
  const iconColor = variant === "secondary" ? "currentColor" : "white";

  const content = (
    <>
      <span className="min-w-0 wrap-break-words whitespace-normal text-center leading-[1.2]">
        {children}
      </span>
      {icon ? (
        <span className="relative shrink-0 block" style={{ width: iconSize, height: iconHeight }}>
          <ArrowRight
            className="absolute inset-0 transition-all duration-200 ease-out group-hover:opacity-0 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            width={iconSize}
            height={iconHeight}
            color={iconColor}
          />
          <ArrowRightPixel
            className="absolute inset-0 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-1 group-focus-visible:opacity-100 group-focus-visible:translate-x-1"
            width={iconSize}
            height={iconHeight}
            color={iconColor}
          />
        </span>
      ) : null}
    </>
  );

  if (isLink) {
    const linkProps = rest as Omit<AsLink, keyof BaseProps>;
    const {
      href,
      target,
      rel,
      download,
      onClick,
      ...linkRest
    } = linkProps;
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (variant === "primary") {
        const rawLocation = event.currentTarget.dataset.ctaLocation;
        const ctaLocation = typeof rawLocation === "string" ? rawLocation : "button";
        const ctaText = typeof children === "string" ? children : event.currentTarget.textContent?.trim() || "CTA";
        trackCtaClick({
          cta_text: ctaText,
          cta_location: ctaLocation,
          link_url: href,
        });
      }

      onClick?.(event);
    };

    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        download={download}
        onClick={handleClick}
        className={classes}
        {...linkRest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<AsButton, keyof BaseProps>)}>
      {content}
    </button>
  );
}
