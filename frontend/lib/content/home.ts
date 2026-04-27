export const brand = {
  name: "TwelveTen",
  logoText: "1210",
  tagline: "From 1 to 10.",
  email: "hello@1210.ai",
  location: "Bucharest, Romania",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  Services: [
    { label: "AI Transformation", href: "/services/ai-transformation" },
    { label: "Forward Deployed Engineers", href: "/services/fde" },
    { label: "AI Readiness Assessment", href: "/services/readiness" },
    { label: "Team Augmentation", href: "/services/team" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
  Connect: [
    { label: "LinkedIn", href: "https://linkedin.com/company/twelveten" },
    { label: "Instagram", href: "https://instagram.com/twelveten" },
    { label: "GitHub", href: "https://github.com/twelveten" },
    { label: "hello@1210.ai", href: "mailto:hello@1210.ai" },
  ],
} as const;

export const hero = {
  label: "TwelveTen",
  heading: "We take you from 1 to 10.",
  body: "AI-native engineering and transformation for companies that need working systems, not slide decks. We embed in your business, prove ROI, then scale it.",
  primaryCtaLabel: "Start with 2",
  primaryCtaHref: "mailto:hello@1210.ai",
  stats:
    "10+ years shipping · 200+ projects delivered · Awwwards & CSSDA recognised · Bucharest, Romania",
  dimensionLine: "A NEW DIMENSION.",
  mergerNote: [
    "Neo Vision Dev + Neo xAI are now TwelveTen.",
    "Same team. New mission.",
  ],
  secondaryCtaLabel: "Start with 2",
  secondaryCtaHref: "/about",
} as const;

type HeroLinkValue = {
  href?: string | null;
  page?: string | null;
  post?: string | null;
} | null;

type HeroCtaValue = {
  buttonText?: string | null;
  link?: HeroLinkValue;
} | null;

export type ResolvedHeroContent = {
  label: string;
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  stats: string;
  dimensionLine: string;
  mergerNote: string[];
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

function resolveHeroLinkHref(cta: HeroCtaValue | undefined, fallbackHref: string) {
  return cta?.link?.href ?? cta?.link?.page ?? cta?.link?.post ?? fallbackHref;
}

export function resolveHeroContent(data?: {
  label?: string;
  heading?: string;
  body?: string;
  primaryCta?: HeroCtaValue;
  stats?: string;
  dimensionLine?: string;
  ctaText?: string;
  secondaryCta?: HeroCtaValue;
}): ResolvedHeroContent {
  return {
    label: data?.label ?? hero.label,
    heading: data?.heading ?? hero.heading,
    body: data?.body ?? hero.body,
    primaryCtaLabel: data?.primaryCta?.buttonText ?? hero.primaryCtaLabel,
    primaryCtaHref: resolveHeroLinkHref(data?.primaryCta, hero.primaryCtaHref),
    stats: data?.stats ?? hero.stats,
    dimensionLine: data?.dimensionLine ?? hero.dimensionLine,
    mergerNote: data?.ctaText
      ? data.ctaText.split("\n").filter(Boolean)
      : [...hero.mergerNote],
    secondaryCtaLabel: data?.secondaryCta?.buttonText ?? hero.secondaryCtaLabel,
    secondaryCtaHref: resolveHeroLinkHref(data?.secondaryCta, hero.secondaryCtaHref),
  };
}

export const origin = {
  eyebrow: "THE ORIGIN",
  heading: {
    full: "In 2015, we started ",
    medium: "Neo Vision — an ",
    faded:
      "award-winning product studio that shipped 200+ digital products for companies across Europe and the US. In 2023, we launched Neo xAI — Romania's first applied AI studio. In 2026, we merged them into one.",
  },
  body: {
    prefix: "TwelveTen is what happens when a decade of ",
    bold: "engineering craft meets AI-native delivery.",
    suffix:
      "One team. Two capabilities. From your first AI solution to your tenth.",
  },
} as const;

export const services = {
  eyebrow: "WHAT WE DO",
  cards: [
    {
      kind: "engineering",
      label: "01 / ENGINEERING",
      title: { regular: "Software that ships.", bold: "Faster." },
      body: [
        "AI-augmented development using our NeoFlow methodology.",
        "Websites, platforms, mobile apps, and embedded teams — delivered 30–50% faster.",
      ],
      services: [
        { title: "AI Readiness Assessment" },
        { title: "AI Agents" },
        { title: "AI Automation" },
        { title: "AI Consulting" },
      ],
      cta: { label: "Start with 2", href: "/services/engineering", variant: "secondary" as const },
    },
    {
      kind: "ai",
      label: "02 / AI TRANSFORMATION",
      title: { regular: "AI that works.", bold: "In production." },
      body: [
        "Practical AI solutions that integrate with your existing systems and deliver measurable ROI.",
        "Not demos. Not slide decks. Working systems.",
      ],
      services: [
        { title: "AI Readiness Assessment" },
        { title: "AI Agents" },
        { title: "AI Automation" },
        { title: "Knowledge Hub (RAG)" },
        { title: "AI Consulting" },
      ],
      cta: { label: "Start with 2", href: "/services/ai", variant: "primary" as const },
      texture: "/figma/ai-transformation-bg.png",
    },
  ],
} as const;

export const signatureModel = {
  eyebrow: "OUR SIGNATURE MODEL",
  heading: {
    faded: "We don't advise from the outside.",
    bold: "We build from the inside.",
  },
  body: "Our Forward Deployed Engineers embed inside your organisation. They map your processes, find where AI creates real value, calculate the ROI, and build the solution — staying until the numbers prove it works.",
  secondaryLine: "Think of it as a technical co-founder for 3-6 months.",
  steps: [
    {
      number: "01.",
      title: "Embed & Map",
      duration: "2-4 weeks",
      body: "FDE goes on-site. Shadows operators. Maps real processes. Finds hidden opportunities.",
    },
    {
      number: "02.",
      title: "Quantify & Propose",
      duration: "1-2 weeks",
      body: "ROI model for each opportunity. Business case the CFO can't refuse.",
    },
    {
      number: "03.",
      title: "Build & Deploy",
      duration: "4-16 weeks",
      body: "FDE leads the build. Dev team in Bucharest executes. Sprint demos with real users.",
    },
    {
      number: "04.",
      title: "Validate & Expand",
      duration: "Ongoing",
      body: "Measure actual vs projected ROI. Use proven results to expand across departments.",
    },
  ],
  cta: { label: "Start with 2", href: "mailto:hello@1210.ai" },
  valueCard: {
    value: "€215K — €840K",
    body: [
      "potential value per client over 24 months, from a single FDE engagement.",
      "The highest-leverage model in AI services.",
    ],
  },
} as const;

export const signatureModel2 = {
  eyebrow: "OUR SIGNATURE MODEL",
  heading: {
    faded: "Forward Deployed Engineers:",
    bold: "We embed. We build. We prove.",
  },
  body: "A senior technical operator who goes inside your organisation for 3-6 months. Maps your processes, calculates your ROI, builds AI solutions, and stays until the numbers prove it works. Not a consultant. An operator.",
  steps: [
    {
      title: "Embed & Map",
      highlighted: false,
    },
    {
      title: "Quantify & Propose",
      highlighted: true,
    },
    {
      title: "Build & Deploy",
      highlighted: false,
    },
    {
      title: "Validate & Expand",
      highlighted: false,
    },
  ],
  cta: {label: "Deploy an FDE", href: "mailto:hello@1210.ai"},
} as const;

export const whyTwelveTen = {
  eyebrow: "WHY TWELVETEN",
  heading: "How we're different.",
  points: [
    {
      title: "AI-Native, Not AI-Added",
      body: [
        "We rebuilt our entire operation around AI. Every developer codes in Cursor.",
        "Every PM drafts with Claude. AI isn't our marketing — it's our operating system.",
      ],
    },
    {
      title: "10+ Years of Shipping",
      body: [
        "Founded 2015. 200+ products. Healthcare, fintech, construction tech, e-commerce.",
        "We've seen what fails in production.",
      ],
    },
    {
      title: "Engineering + AI, One Roof",
      body: [
        "Most agencies are dev shops that bolt on AI, or consultancies that outsource code.",
        "We're both. One contract. Complete accountability.",
      ],
    },
    {
      title: "European Quality",
      body: [
        "Bucharest team. 30-50% more efficient than London or NYC.",
        "We lead with outcomes, not pricing.",
      ],
    },
    {
      title: "We Stay Until It Works",
      body: [
        "Our FDEs don't hand off a report.",
        "They stay embedded until ROI is measured with your real data.",
      ],
    },
  ],
} as const;

export const ourWork = {
  eyebrow: "OUR WORK",
  heading: {
    faded: "200+ products shipped.",
    bold: "Here are a few we're proud of.",
  },
  items: [
    {
      client: "Data",
      year: "2025",
      category: "AI Transformation",
      name: "Confidas",
      tagline: "Enterprise LLM platform, 10K+ docs",
      thumbHref: "https://confidas.example",
      ctaLabel: "View",
      ctaHref: "/portfolio/confidas",
    },
    {
      client: "Platform",
      year: "2024",
      category: "Engineering",
      name: "Lumalane",
      tagline: "Healthcare scheduling SaaS, 40+ clinics",
      thumbHref: "https://lumalane.example",
      ctaLabel: "View",
      ctaHref: "/portfolio/lumalane",
    },
  ],
  cta: { label: "Start with 2", href: "/portfolio" },
} as const;

export const trustedBy = {
  eyebrow: "TRUSTED BY",
  logos: [
    "Confidas",
    "Confidas",
    "Confidas",
    "Confidas",
    "Confidas",
    "Confidas",
  ],
  testimonials: Array.from({ length: 4 }, () => ({
    attribution: "— Client Testimonial, Enterprise Client",
    quote:
      "They deliver 3x more features with world-class code quality and processes. More than skill, they care about our business as deeply as we do.",
  })),
} as const;

/**
 * Pricing — frame 141:10771. Two cards (Engineering / AI Transformation)
 * with a subhead and a free-discovery-call CTA row. Note: Figma has a
 * "Mobile Applications" row duplicated with different unit labels — the
 * second one is intended to be "Team Augmentation" per the footer copy.
 */
export const pricing = {
  eyebrow: "PRICING",
  heading: {
    faded: "Transparent pricing.",
    bold: "No proposals needed to know the range.",
  },
  cards: [
    {
      kind: "engineering",
      title: "Engineering",
      items: [
        { name: "Websites & E-Commerce", price: "from €5K" },
        { name: "Custom Software / SaaS", price: "from €15K" },
        { name: "Mobile Applications", price: "from €15K" },
        { name: "Team Augmentation", price: "from €5K/person/mo" },
      ],
    },
    {
      kind: "ai",
      title: "AI Transformation",
      items: [
        { name: "AI Readiness Assessment", price: "from €5K" },
        { name: "AI Agents", price: "from €15K" },
        { name: "AI Automation", price: "from €15K" },
        { name: "Knowledge Hub (RAG)", price: "from €10K" },
        { name: "AI Consulting", price: "from €5K/mo" },
      ],
      texture: "/figma/ai-transformation-bg.png",
    },
  ],
  callout: {
    heading: "Every engagement starts with a free 30-minute discovery call.",
    body: "No pitch. Just a conversation about whether we can help.",
    ctaLabel: "Book a call",
    ctaHref: "mailto:hello@1210.ai",
  },
} as const;

/**
 * Our Methodology — frame 141:10843. Six-step NeoFlow process in a 3×2 grid.
 * Each card has a giant Betatron number (96px, #ff4404) and a title+one-liner.
 */
export const methodology = {
  eyebrow: "OUR METHODOLOGY",
  heading: {
    faded: "NeoFlow: How we build.",
    bold: "30-50% faster. Zero shortcuts.",
  },
  steps: [
    { number: "01.", title: "Discovery", body: "AI analysis, interviews, scope" },
    { number: "02.", title: "Architecture", body: "System design, tech stack, AI planning" },
    { number: "03.", title: "Design", body: "AI-assisted concepting, crafted UI" },
    { number: "04.", title: "Build", body: "AI code gen + human review, sprints" },
    { number: "05.", title: "Launch", body: "QA, deployment, 30-day hypercare" },
    { number: "06.", title: "Evolve", body: "Data-driven improvements, AI monitoring" },
  ],
} as const;

export const story = {
  eyebrow: "OUR STORY",
  heading: "Two studios. One vision. A decade in the making.",
  milestones: [
    {
      year: "2015.",
      body: "Neo Vision founded in Bucharest. A digital product studio built on craft, straight talk, and shipping real products.",
    },
    {
      year: "2020.",
      body: "100+ products shipped. Awwwards and CSSDA awards. The studio matures into a reliable delivery partner for European and US startups.",
    },
    {
      year: "2023.",
      body: "Neo xAI launches — Romania's first applied AI studio. Focus: production-ready AI, not demos.",
    },
    {
      year: "2026.",
      body: "Neo Vision Dev + Neo xAI merge into TwelveTen. One team. Two capabilities. From your first AI solution to your tenth.",
    },
  ],
} as const;

/**
 * The Team — frame 141:10964. Member carousel (Adi is the first) with
 * prev/next arrows, supporting portrait image on the right (binary-text
 * watermark + Z logo overlay). Ends with a closing statement about
 * direct access to builders.
 */
export const team = {
  eyebrow: "THE TEAM",
  heading: {
    faded: "20 people. 0 account managers between",
    bold: "you and the builders.",
  },
  members: [
    {
      name: "Adi N.",
      role: "CEO & AI Strategy",
      bio: "Has opinions about your tech stack. Will find AI opportunities in your business before the first coffee gets cold. Responds to messages at hours that concern his team.",
      portrait: "/figma/adi-portrait.png",
    },
  ],
  closingStatement: [
    "When you work with TwelveTen, you talk directly to the people who ",
    { bold: "design and build" },
    " your product.",
    "\nNo layers. No account managers.",
    "\nThe person on the call is ",
    { bold: "the person writing the code." },
  ],
} as const;

/**
 * Closing CTA — frame 141:11010. Full-bleed block with textured bg,
 * large Funnel Display headline, body copy, availability microcopy,
 * and a primary CTA.
 */
export const closingCta = {
  heading: {
    regular: "Your first AI win",
    bold: "is 6 weeks away.",
  },
  body: [
    "Practical AI solutions that integrate with your existing systems and deliver measurable ROI.",
    "Not demos. Not slide decks. Working systems.",
  ],
  microcopy: "Currently accepting projects for Q2 2026 · Response within 24 hours",
  ctaLabel: "Book a call",
  ctaHref: "mailto:hello@1210.ai",
} as const;

/**
 * Footer — frame 141:11019. Left brand column (Z logo + TwelveTen +
 * tagline + location + copyright), three link columns (Services / Company
 * / Connect), big decorative "1210" logotype overflowing at the bottom.
 */
export const footer = {
  brand: {
    logoText: "TwelveTen",
    tagline: "From 1 to 10.",
    location: "Bucharest, Romania",
    copyright: "© 2026 TwelveTen (NEO X AI SRL) · Bucharest, Romania · All rights reserved.",
  },
  columns: [
    {
      title: "Services",
      links: [
        { label: "Engineering", href: "/services/engineering" },
        { label: "AI Transformation", href: "/services/ai-transformation" },
        { label: "Forward Deployed Engineers", href: "/services/fde" },
        { label: "AI Readiness Assessment", href: "/services/readiness" },
        { label: "Team Augmentation", href: "/services/team" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Insights", href: "/insights" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "LinkedIn", href: "https://linkedin.com/company/twelveten" },
        { label: "Instagram", href: "https://instagram.com/twelveten" },
        { label: "GitHub", href: "https://github.com/twelveten" },
        { label: "hello@1210.ai", href: "mailto:hello@1210.ai", accent: true },
      ],
    },
  ],
} as const;
