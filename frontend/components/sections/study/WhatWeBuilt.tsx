import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";

const RevealOnScroll = dynamic(
  () =>
    import("@/components/partials/motion/RevealOnScroll").then(
      (mod) => mod.RevealOnScroll
    ),
  { ssr: false }
);

export type StudyWhatWeBuiltData = {
  eyebrow?: string;
  heading?: string;
  features?: Array<{
    number?: string;
    title?: string;
    body?: string;
    image?: string | { asset?: { url?: string } };
  }>;
};

export function StudyWhatWeBuilt({ data }: { data?: StudyWhatWeBuiltData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "WHAT WE BUILT";
  const heading = cleanData?.heading;
  const features = cleanData?.features ?? [];

  if (features.length === 0) {
    return null;
  }

  return (
    <SectionsWrapper
      id="what-we-built"
      eyebrow={eyebrow}
    >
      <div className="flex flex-col gap-12">
        {heading ? (
          <h2 className="text-[28px] leading-9 tracking-[-0.3px] text-foreground md:text-[36px] md:leading-12 lg:text-[44px] lg:leading-14">
            {heading}
          </h2>
        ) : null}
        <RevealOnScroll
          as="div"
          stagger={0.1}
          className="flex flex-col gap-0 border-t border-white/20"
        >
          {features.map((f, idx) => {
            const imageUrl =
              typeof f.image === "string" ? f.image : f.image?.asset?.url;

            return (
              <article
                key={(f.title ?? "ft") + idx}
                className="grid grid-cols-1 gap-6 border-b border-white/20 px-6 py-8 md:grid-cols-[auto_1fr_1fr] md:items-start md:gap-12 md:px-6 md:py-12 lg:px-8 xl:px-12"
              >
                <span className="font-betatron text-5xl leading-none tracking-tight text-brand-hover md:text-[72px]">
                  {f.number}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-h4 font-medium text-foreground md:text-100">{f.title}</h3>
                  <p className="text-body text-foreground/70">{f.body}</p>
                </div>
                {imageUrl ? (
                  <div className="aspect-4/3 w-full overflow-hidden border border-white/10 bg-black">
                    <Image
                      src={imageUrl}
                      alt={f.title ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="hidden aspect-4/3 w-full border border-white/10 bg-surface md:block" />
                )}
              </article>
            );
          })}
        </RevealOnScroll>
      </div>
    </SectionsWrapper>
  );
}
