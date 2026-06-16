import Image from "next/image";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";

type TechTool = {
  _key?: string;
  name?: string;
  logo?: {
    asset?: {
      _id?: string;
      url?: string;
      metadata?: {
        dimensions?: {
          width?: number;
          height?: number;
        };
      };
    };
    hotspot?: { x?: number; y?: number };
    crop?: { top?: number; bottom?: number; left?: number; right?: number };
  };
};

export type StudyTechStackData = {
  eyebrow?: string;
  tools?: TechTool[];
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
          {tools.map((tool) => {
            const logoUrl = tool.logo?.asset?.url;
            const toolName = tool.name ?? "";

            return (
              <article
                key={tool._key ?? toolName}
                className="flex flex-col gap-3 p-6 border-r border-b border-black/20 dark:border-white/20"
              >
                {logoUrl ? (
                  <div className="aspect-[102.5/57.65] w-full flex items-center justify-center bg-black/5 dark:bg-white/5 rounded">
                    <Image
                      src={logoUrl}
                      alt={`${toolName} logo`}
                      width={120}
                      height={68}
                      className="object-contain max-h-[68px] w-auto"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="aspect-[102.5/57.65] w-full bg-black"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(193,201,197,0.12) 0%, rgba(255,65,0,0.24) 100%)",
                      backgroundSize: "8px 8px, auto",
                    }}
                  />
                )}
                <p className="text-center text-[18px] leading-normal text-black dark:text-white">
                  {toolName}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </SectionsWrapper>
  );
}
