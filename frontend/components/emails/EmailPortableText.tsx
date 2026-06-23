import React from "react";

export type EmailPTSpan = {
  _type: "span";
  _key?: string;
  text: string;
  marks?: string[];
};

export type EmailPTMarkDef = {
  _key: string;
  _type: string;
  href?: string;
};

export type EmailPTBlock = {
  _type: "block";
  _key?: string;
  style?: string;
  children?: EmailPTSpan[];
  markDefs?: EmailPTMarkDef[];
};

export type EmailPortableTextBlocks = EmailPTBlock[];

function renderSpan(
  span: EmailPTSpan,
  markDefs: EmailPTMarkDef[],
  index: number
): React.ReactNode {
  let node: React.ReactNode = span.text;

  if (span.marks && span.marks.length > 0) {
    for (const mark of span.marks) {
      if (mark === "strong") {
        node = <strong key={`${index}-strong`} style={{ fontWeight: 700 }}>{node}</strong>;
      } else if (mark === "em") {
        node = <em key={`${index}-em`}>{node}</em>;
      } else {
        const def = markDefs.find((d) => d._key === mark);
        if (def?._type === "link" && def.href) {
          node = (
            <a
              key={`${index}-link`}
              href={def.href}
              style={{ color: "#ff8a4c", textDecoration: "underline" }}
            >
              {node}
            </a>
          );
        }
      }
    }
  }

  return <React.Fragment key={index}>{node}</React.Fragment>;
}

export function EmailPortableText({
  blocks,
  style,
}: {
  blocks: EmailPortableTextBlocks;
  style?: React.CSSProperties;
}) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, bi) => {
        if (block._type !== "block") return null;
        const markDefs = block.markDefs ?? [];
        const children = (block.children ?? []).map((span, si) =>
          renderSpan(span, markDefs, si)
        );

        return (
          <p
            key={block._key ?? bi}
            style={{
              margin: "0 0 10px",
              ...style,
            }}
          >
            {children}
          </p>
        );
      })}
    </>
  );
}
