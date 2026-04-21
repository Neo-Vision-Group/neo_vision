import { cn } from '@/lib/utils'

export function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        className={cn(
          "origin-center transition-transform duration-200",
          open && "translate-y-[5px] rotate-45"
        )}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        className={cn(
          "transition-opacity duration-200",
          open && "opacity-0"
        )}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        className={cn(
          "origin-center transition-transform duration-200",
          open && "-translate-y-[5px] -rotate-45"
        )}
      />
    </svg>
  );
}