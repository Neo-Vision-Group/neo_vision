import { ReactNode } from "react";

interface SectionsWrapperProps {
  eyebrow: string;
  children: ReactNode;
  id?: string;
  hideTopBorder?: boolean;
}

export function SectionsWrapper({
  eyebrow,
  children,
  id,
  hideTopBorder = false,
}: SectionsWrapperProps) {
  return (
    <section id={id} className="relative flex w-full items-start">
      <aside className="hidden md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start md:pt-24">
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        <div className="relative w-full px-12 py-6">
          <p className="font-betatron text-[32px] leading-[1.2] text-black dark:text-[#efefef]">
            {eyebrow}
          </p>
        </div>
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
      </aside>

      <div className="hidden md:block md:w-px md:self-stretch bg-black/20 dark:bg-white/20" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-12 pt-24">
        {!hideTopBorder && (
          <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        )}
        <div className="w-full px-6 pb-24 md:px-6">{children}</div>
      </div>
    </section>
  );
}
