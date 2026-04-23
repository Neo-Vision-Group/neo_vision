import { NewsletterForm } from "@/components/sections/insight/NewsletterForm";

interface InsightNewsletterProps {
  slug: string;
}

export function InsightNewsletter({ slug }: InsightNewsletterProps) {
  return (
    <section id="newsletter" className="px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16 border-t border-border">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <h2 className="text-[36px] font-normal leading-[1.2] tracking-[-1px] text-foreground md:text-[44px]">
          <span className="text-foreground/70">Liked this? </span>
          <span className="font-bold">Get the newsletter.</span>
        </h2>
        <p className="max-w-[60ch] text-[18px] text-foreground/70">
          One post per month, no fluff, no sales pitch.
        </p>
        <NewsletterForm source={`/insights/${slug}`} />
      </div>
    </section>
  );
}