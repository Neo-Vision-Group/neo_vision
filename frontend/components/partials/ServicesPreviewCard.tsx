import { cn } from "@/lib/utils";
import { Button } from "@/components/partials/Button";
import Image from "next/image";

type ServiceCard = {
  _key?: string;
  kind?: "engineering" | "ai";
  label?: string;
  labelImage?: string;
  title: string | { regular?: string; bold?: string };
  body?: string | readonly string[];
  services?: Array<{ name?: string; price?: string }>;
  cta?: { label: string; href: string; variant: "primary" | "secondary" };
  texture?: string;
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
        "group relative border border-decoration-dark dark:border-decoration-light isolate flex min-h-120 flex-1 dark:bg-[#0F0F0F] bg-[#f7f7f7] flex-col justify-between gap-8 p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 md:p-8 xl:min-h-145 xl:gap-12 xl:p-12",
        !isTextured && "bg-surface"
      )}
    >
      {isTextured ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black">
          {card.texture &&           
          <Image
            src={card.texture}
            alt=""
            className="absolute inset-0 h-full w-full object-cover invert dark:invert-0"
            fill
          />}
          <div
            className="absolute inset-0 mix-blend-screen dark:hidden"
            style={{ background: "#ff4404" }}
          />
          <div
            className="absolute inset-0 hidden mix-blend-multiply dark:block"
            style={{
              background: "#ff4404",
            }}
          />
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 14%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.45) 86%, rgba(255,255,255,0.9) 100%),
                linear-gradient(90deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.4) 12%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 76%, rgba(255,255,255,0.4) 88%, rgba(255,255,255,0.82) 100%),
                linear-gradient(180deg, rgba(255,68,4,0.08) 0%, rgba(255,68,4,0.18) 100%)
              `,
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: `
                linear-gradient(180deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 16%, rgba(11,11,11,0) 32%, rgba(11,11,11,0) 68%, rgba(11,11,11,0.42) 84%, rgba(11,11,11,0.88) 100%),
                linear-gradient(90deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.42) 12%, rgba(11,11,11,0) 24%, rgba(11,11,11,0) 76%, rgba(11,11,11,0.42) 88%, rgba(11,11,11,0.88) 100%),
                linear-gradient(180deg, rgba(15,15,15,0.18) 0%, rgba(15,15,15,0.84) 100%)
              `,
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          {card.labelImage ? (
            <div className="relative h-5 w-full max-w-52">
              <Image
                src={card.labelImage}
                alt={card.label || ""}
                fill
                className="object-contain object-left"
                sizes="208px"
              />
            </div>
          ) : card.label ? (
            <p
              className={cn(
                "font-betatron uppercase text-caption tracking-[-0.16px]",
                card.kind === "ai" ? "text-brand" : "text-foreground"
              )}
            >
              {card.label}
            </p>
          ) : null}
          <h3 className="text-100 leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-9 xl:text-4xl xl:leading-9">
            <span className="font-funnel text-[32px]">{titleText.regular}</span>
          </h3>
        </div>
        <div className="flex flex-col font-funnel text-xl dark:text-white-light text-muted-light">
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
            <span className="flex-1 dark:text-white-light text-dark-light font-funnel text-[18px]">{item.name}</span>
            <span
              className="shrink-0 font-funnel text-right text-[18px] dark:text-white-light text-muted-light"
            >
              {item.price}
            </span>
          </li>
          ))}
        </ul>
      )}

      {card.cta?.label && card.cta.href ? (
        <div className="flex justify-start">
          <Button href={card.cta.href} variant={card.cta.variant}>
            {card.cta.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
