import { cn } from "@/lib/utils";
import { Button } from "@/components/partials/Button";
import Image from "next/image";
const workCardHoverGraphic = "/images/graphic.webp";

type ServiceCard = {
  _key?: string;
  kind?: "engineering" | "ai";
  label?: string;
  labelImage?: string;
  labelImageLight?: string;
  labelImageDark?: string;
  title: string | { regular?: string; bold?: string };
  body?: string | readonly string[];
  services?: Array<{ name?: string; price?: string }>;
  cta?: { label: string; href: string; variant: "primary" | "secondary" };
  texture?: boolean;
};

export default function ServicesPreviewCard({ card }: { card: ServiceCard }) {
  const isTextured = !!card.texture;
  
  const titleText = typeof card.title === "string" 
    ? { regular: card.title, bold: "" }
    : card.title;
  
  const displayItems = card.services || [];

  return (
    <article
      className={cn(
        "group relative border border-decoration-dark dark:border-decoration-light isolate flex flex-1 dark:bg-[#0F0F0F] bg-[#f7f7f7] flex-col justify-between gap-8 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 md:p-8 xl:gap-12 xl:p-12",
        !isTextured && "bg-surface"
      )}
    >
      {isTextured ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black">
          {card.texture &&           
          <Image
            src={workCardHoverGraphic}
            alt=""
            className="absolute inset-0 h-full w-full object-cover invert dark:invert-0"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />}
          <div
            className="absolute inset-0 mix-blend-screen dark:hidden"
            style={{ background: "#ff4404" }}
          />
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background: "linear-gradient(0deg, #f7f7f7 0%, rgba(247, 247, 247, 0.00) 68.19%)",
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background: `linear-gradient(0deg, #0F0F0F 0%, rgba(0, 0, 0, 0.00) 68.19%), linear-gradient(0deg, #FF4404 0%, #FF4404 100%), url(${workCardHoverGraphic}) lightgray 50% / cover no-repeat`,
              backgroundBlendMode: "normal, color, normal",
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          {(card.labelImage || card.labelImageLight || card.labelImageDark) ? (
            <div className="relative h-5 w-full max-w-52">
              {(card.labelImageLight || card.labelImage) && (
                <Image
                  src={(card.labelImageLight || card.labelImage)!}
                  alt={card.label || ""}
                  fill
                  className="object-contain object-left dark:hidden"
                  sizes="208px"
                />
              )}
              {(card.labelImageDark || card.labelImage) && (
                <Image
                  src={(card.labelImageDark || card.labelImage)!}
                  alt={card.label || ""}
                  fill
                  className="object-contain object-left hidden dark:block"
                  sizes="208px"
                />
              )}
            </div>
          ) : card.label ? (
            <p
              className={cn(
                "font-clash uppercase text-caption tracking-[-0.16px]",
                card.kind === "ai" ? "text-brand" : "text-foreground"
              )}
            >
              {card.label}
            </p>
          ) : null}
          <h3 className="text-100 leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-12 xl:text-4xl xl:leading-12">
            <span className="font-funnel text-[32px]">{titleText.regular}</span>
          </h3>
        </div>
        <div className="flex flex-col font-funnel text-[18px] dark:text-white-light text-muted-light">
          {card.body}
        </div>
      </div>

      {displayItems.length > 0 && (
        <ul className="flex flex-col">
          {displayItems.map((item, idx) => (
          <li
            key={`item-${idx}-${item.name || 'service'}`}
            className={cn(
              "flex items-baseline justify-between gap-4 py-2.5 text-body-2 md:text-body",
              idx !== 0 && "border-t border-decoration-dark dark:border-decoration-light"
            )}
          >
            <span className="flex-1 dark:text-white-light text-dark-light font-funnel text-[14px] md:text-[18px]">{item.name}</span>
            <span
              className="shrink-0 font-funnel text-right text-[18px] md:text-[18px] dark:text-white-light text-muted-light"
            >
              {item.price}
            </span>
          </li>
          ))}
        </ul>
      )}

      {card.cta?.label && card.cta.href ? (
        <div className="flex justify-center">
          <Button href={card.cta.href} variant={card.cta.variant}>
            {card.cta.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
