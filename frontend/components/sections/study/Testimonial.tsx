import { SectionsWrapper } from "@/components/SectionsWrapper";
import { TestimonialQuote } from "@/components/partials/TestimonialQuote";
import { cleanStega, urlForImage } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url";

export type StudyTestimonialData = {
  eyebrow?: string;
  quote?: {
    profilePicture?: SanityImageSource;
    quote?: string;
    attribution?: string;
    source?: string | null;
    accent?: boolean;
  };
};

export function StudyTestimonial({ data }: { data?: StudyTestimonialData }) {
  const cleanData = data ? cleanStega(data) : data;

  const eyebrow = cleanData?.eyebrow ?? "TESTIMONIAL";
  const quote = cleanData?.quote;

  if (!quote?.quote) {
    return null;
  }

  const profilePictureUrl = quote.profilePicture
    ? urlForImage(quote.profilePicture).width(200).height(200).fit("crop").url()
    : null;

  return (
    <SectionsWrapper
      id="testimonial"
      eyebrow={eyebrow}
    >
      <div className="pb-16">
        <TestimonialQuote
          quote={quote.quote}
          attribution={quote.attribution ?? ""}
          source={quote.source ?? undefined}
          accent={quote.accent ?? false}
          variant="study"
          profilePictureUrl={profilePictureUrl}
        />
      </div>
    </SectionsWrapper>
  );
}
