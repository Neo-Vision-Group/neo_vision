import Link from "next/link";
import { cn } from "../../lib/utils";
import ArrowRight from "../icons/ArrowRight";
import ArrowRightPixel from "../icons/ArrowRightPixel";

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

interface AsLink extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = AsButton | AsLink;

const sizeStyles: Record<ButtonSize, string> = {
  md: "pl-6 pr-4 py-3 text-body gap-3", // 24/16/12 — matches Figma
  sm: "pl-4 pr-3 py-2 text-body-2 gap-2",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-brand",
  secondary:
    "bg-white text-background hover:bg-white hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-foreground",
  ghost:
    "border border-border text-foreground hover:bg-surface hover:border-foreground/30 hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-foreground",
};

const baseStyles =
  "group inline-flex items-center justify-center whitespace-nowrap font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon = variant !== "ghost",
    className,
    children,
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
      <span>{children}</span>
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

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  const { variant: _v, size: _s, icon: _i, className: _c, children: _ch, ...rest } = props as AsButton;
  void _v; void _s; void _i; void _c; void _ch;

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
