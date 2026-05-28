import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyTechStackData = {
  eyebrow?: string;
  tools?: string[];
};

export function StudyTechStack({ data }: { data?: StudyTechStackData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "TECH STACK";
  const tools = cleanData?.tools ?? [];

  if (tools.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper id="tech-stack" eyebrow={eyebrow} classNameOverride="px-0 py-0 -mt-12">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <article
              key={t}
              className="flex flex-col gap-3 p-6 border-r border-b border-white/20 dark:border-white/20"
            >
            <div 
              aria-hidden="true"
              className="aspect-[102.5/57.65] w-full bg-black"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(193,201,197,0.12) 0%, rgba(255,65,0,0.24) 100%)",
                backgroundSize: "8px 8px, auto",
              }}
            />
            <p className="text-center text-[18px] leading-normal text-black dark:text-white">
              {t}
            </p>
          </article>
        ))}
        </div>
      </div>
    </SectionsWrapper>
  );
}
