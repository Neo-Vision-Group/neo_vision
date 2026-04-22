import { SectionsWrapper } from "@/components/SectionsWrapper";
import { TestimonialQuote } from "@/components/partials/TestimonialQuote";
import { cleanStega } from "@/sanity/lib/utils";

export type StudyTestimonialData = {
  eyebrow?: string;
  quote?: {
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

  return (
    <SectionsWrapper
      id="testimonial"
      eyebrow={eyebrow}
    >
      <TestimonialQuote
        quote={quote.quote}
        attribution={quote.attribution ?? ""}
        source={quote.source ?? undefined}
        accent={quote.accent ?? false}
      />
    </SectionsWrapper>
  );
}
