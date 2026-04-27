import { SectionsWrapper } from "@/components/SectionsWrapper";
import { cleanStega } from "@/sanity/lib/utils";
import Image from "next/image";

export type StudyHeroImageData = {
  image?: string;
  alt?: string;
};

export function StudyHeroImage({ data }: { data?: StudyHeroImageData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData?.image) {
    return null;
  }

  return (
    <SectionsWrapper
      id="hero-image"
      eyebrow=""
      hideTopBorder
    >
      <div className="aspect-video w-full overflow-hidden border border-white/10 bg-black">
        <Image
          src={cleanData.image}
          alt={cleanData.alt ?? "Hero image"}
          className="h-full w-full object-cover"
        />
      </div>
    </SectionsWrapper>
  );
}
