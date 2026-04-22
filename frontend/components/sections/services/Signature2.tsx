import {SectionsWrapper} from "@/components/SectionsWrapper";
import { Button } from "@/components/partials/Button";

export function Signature({ data }: { data: any }) {
    return (
        <SectionsWrapper eyebrow={data.eyebrow ?? "CASE CALLOUT"} >
          <div className="px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <article className="flex flex-col gap-6 border border-brand/40 bg-surface p-8 md:p-12">
              <h3 className="text-[28px] font-medium leading-[34px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[44px]">
                {data.heading}
              </h3>
              {data.body ? (
                <p className="max-w-[70ch] text-body text-foreground/70 md:text-[20px] md:leading-[28px]">
                  {data.body}
                </p>
              ) : null}
              {data.cta?.label && data.cta?.href ? (
                <div>
                  <Button href={data.cta.href} variant="primary">
                    {data.cta.label}
                  </Button>
                </div>
              ) : null}
            </article>
          </div>
        </SectionsWrapper>
    )
}