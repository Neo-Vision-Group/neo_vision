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
      <div className="flex flex-wrap gap-3">
        {tools.map((t) => (
          <span
            key={t}
            className="border border-white/10 bg-surface px-3 py-2 font-betatron text-caption uppercase tracking-wider text-foreground/80"
          >
            {t}
          </span>
        ))}
      </div>
    </SectionsWrapper>
  );
}
