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
    <SectionsWrapper
      id="tech-stack"
      eyebrow={eyebrow}
    >
      <div className="grid grid-cols-2 gap-0 border-y border-white/15 md:grid-cols-4">
        {tools.map((t) => (
          <article
            key={t}
            className="flex flex-col gap-3 border border-white/15 bg-[#0f0f0f] p-6"
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
            <p className="text-center text-[18px] leading-[1.5] text-[#efefef]">
              {t}
            </p>
          </article>
        ))}
      </div>
    </SectionsWrapper>
  );
}
