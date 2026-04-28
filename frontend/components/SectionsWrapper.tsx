import { ReactNode } from "react";

interface SectionsWrapperProps {
  eyebrow: string | ReactNode;
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
    <section id={id} className="relative flex flex-col md:flex-row w-full items-start">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-3 w-px bg-black/20 dark:bg-white/20 md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-3 w-px bg-black/20 dark:bg-white/20 md:hidden"
      />

      <aside className="lg:sticky lg:top-0 lg:z-10 lg:flex lg:h-fit lg:w-1/4 lg:shrink-0 lg:flex-col lg:items-start lg:pt-24">
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        <div className="relative w-full px-12 py-6">
            <p className="font-betatron text-3xl text-black dark:text-[#efefef]">
              {eyebrow}
            </p>
        </div>
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
      </aside>

      <div className="hidden lg:block lg:w-px lg:self-stretch bg-black/20 dark:bg-white/20" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-12 pt-24">
        {!hideTopBorder && (
          <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        )}
        <div className="w-full px-6 pb-24 lg:px-6">{children}</div>
      </div>
    </section>
  );
}
