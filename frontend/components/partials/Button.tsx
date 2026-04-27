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
    "bg-brand text-white hover:bg-brand-hover hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-brand",
  secondary:
    "bg-white text-background hover:bg-white hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-foreground",
  ghost:
    "border border-border text-foreground hover:bg-surface hover:border-foreground/30 hover:shadow-[0_0_60px_0px_rgba(255,65,0,0.5)] focus-visible:ring-foreground",
};

const baseStyles =
  "group inline-flex max-w-full items-center justify-center font-medium leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

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
      <span className="min-w-0 break-words whitespace-normal text-center leading-[1.2]">
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

    return (
      <Link
        href={linkProps.href}
        target={linkProps.target}
        rel={linkProps.rel}
        download={linkProps.download}
        className={classes}
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
