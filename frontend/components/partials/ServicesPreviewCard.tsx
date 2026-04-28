import { cn } from "@/lib/utils";
import { Button } from "@/components/partials/Button";
import { services } from "@/lib/content/home";
import Image from "next/image";

type ServiceCard = {
  _key?: string;
  kind?: "engineering" | "ai";
  label: string;
  title: string | { regular?: string; bold?: string };
  body: string | readonly string[];
  services?: Array<{ name?: string; price?: string }>;
  cta: { label: string; href: string; variant: "primary" | "secondary" };
  texture?: string;
};

export default function ServicesPreviewCard({ card }: { card: ServiceCard }) {
  const isTextured = !!card.texture;
  
  const titleText = typeof card.title === "string" 
    ? { regular: card.title, bold: "" }
    : card.title;
  
  const bodyLines = Array.isArray(card.body) ? card.body : [card.body];
  
  const displayItems = card.services || [];

  return (
    <article
      className={cn(
        "group relative isolate flex min-h-120 flex-1 dark:bg-[#0F0F0F] bg-[#f7f7f7] flex-col justify-between gap-8 border border-white/5 p-6 transition-all duration-300 ease-out hover:border-white/20 hover:-translate-y-0.5 md:p-8 xl:min-h-145 xl:gap-12 xl:p-12",
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
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <p
            className={cn(
              "text-caption tracking-[-0.16px]",
              card.kind === "ai" ? "text-brand" : "text-foreground"
            )}
          >
            {card.label}
          </p>
          <h3 className="text-100 leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-9 xl:text-deco-h4 xl:leading-9">
            <span className="font-normal">{titleText.regular}</span>{" "}
            {titleText.bold && <span className="font-bold">{titleText.bold}</span>}
          </h3>
        </div>
        <div className="flex flex-col text-body text-foreground">
          {bodyLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>

      {displayItems.length > 0 && (
        <ul className="flex flex-col">
          {displayItems.map((item, idx) => (
          <li
            key={`item-${idx}-${item.name || 'service'}`}
            className={cn(
              "flex items-baseline justify-between gap-4 py-2.5 text-body-2 md:text-body",
              idx !== 0 && "border-t border-white/10"
            )}
          >
            <span className="flex-1 dark:text-white text-black font-funnel">{item.name}</span>
            <span
              className={cn(
                "shrink-0 text-right dark:text-[#EFEFEFB3] text-black",
                card.kind === "ai" ? "text-white/50" : "text-muted"
              )}
            >
              {item.price}
            </span>
          </li>
          ))}
        </ul>
      )}

      <div className="flex justify-start">
        <Button href={card.cta.href} variant={card.cta.variant}>
          {card.cta.label}
        </Button>
      </div>
    </article>
  );
}
