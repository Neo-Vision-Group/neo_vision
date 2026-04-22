"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import ArrowRight from "@/components/icons/ArrowRight";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().min(10, "Please tell us more about your project"),
  hearAbout: z.string().optional(),
  website: z.string().optional(),
  source: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export type ContactHeroData = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  steps?: Array<{
    title: string;
    description: string;
  }>;
  formConfig?: {
    services?: string[];
    budgetRanges?: string[];
    timelines?: string[];
    hearAboutUs?: string[];
  };
};

export function ContactHero({ data }: { data?: ContactHeroData }) {
  const cleanData = data ? cleanStega(data) : data;

  const [activeTab, setActiveTab] = useState<"message" | "call">("message");
  const [submitState, setSubmitState] = useState<"idle" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      service: "",
      budget: "",
      timeline: "",
      message: "",
      hearAbout: "",
      website: "",
      source: "/contact",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMessage(json.error ?? "Something went wrong");
        setSubmitState("error");
        return;
      }
      reset();
      setSubmitState("ok");
    } catch {
      setErrorMessage("Something went wrong");
      setSubmitState("error");
    }
  });

  const eyebrow = cleanData?.eyebrow || "LET'S TALK";
  
  // Handle both new string format and legacy object format
  let heading = "Every project starts\nwith a conversation.";
  if (cleanData?.heading) {
    if (typeof cleanData.heading === 'string') {
      heading = cleanData.heading;
    } else if (typeof cleanData.heading === 'object' && 'faded' in cleanData.heading) {
      // Legacy format: { faded, bold }
      const parts = [];
      if (cleanData.heading.faded) parts.push(cleanData.heading.faded);
      if ((cleanData.heading as any).bold) parts.push((cleanData.heading as any).bold);
      heading = parts.join(' ');
    }
  }
  
  const description = cleanData?.description || "No pitch. No slides. Just a 30-minute call about whether TwelveTen is the right partner for what you're building. We respond within 24 hours.";
  const steps = cleanData?.steps || [];
  const services = cleanData?.formConfig?.services || [];
  const budgetRanges = cleanData?.formConfig?.budgetRanges || [];
  const timelines = cleanData?.formConfig?.timelines || [];
  const hearAboutUs = cleanData?.formConfig?.hearAboutUs || [];

  return (
    <section className="relative isolate flex w-full flex-col overflow-hidden border-b border-border bg-background">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(0deg, #9D2B03 0%, #9D2B03 100%)",
        }}
      />
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="relative flex flex-col gap-[48px] px-6 pb-12 pt-32 lg:flex-row lg:items-start lg:px-[48px]">
        {/* Left column - Intro and steps */}
        <div className="flex flex-1 flex-col gap-6">
          <p className="font-betatron text-[32px] leading-[1.2] text-brand">
            {eyebrow}
          </p>

          <div className="flex flex-col gap-6 font-funnel text-[#efefef]">
            <h2 className="text-[48px] leading-[1.2] tracking-[-1px]">
              {heading.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < heading.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="max-w-[540px] text-[18px] leading-normal">
              {description}
            </p>
          </div>

          {/* Timeline steps */}
          <div className="mt-6 flex flex-col">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-[15px]">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="h-[12px] w-[12px] shrink-0 bg-brand" />
                  {idx < steps.length - 1 && (
                    <div className="w-px flex-1 bg-white/20" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start gap-[24px] p-3">
                    <p className="font-betatron text-[32px] leading-[1.2] text-brand">
                      0{idx + 1}.
                    </p>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-funnel text-[24px] font-bold leading-[1.2] text-[#efefef]">
                        {step.title}
                      </p>
                      <p className="font-funnel text-[18px] leading-normal text-[#efefef]/70">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Form container */}
        <div className="flex flex-1 flex-col gap-[48px] bg-[#040404] p-6 lg:p-[24px]">
          {/* Tab buttons */}
          <div className="flex gap-[24px]">
            <button
              type="button"
              onClick={() => setActiveTab("message")}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center p-[10px] font-funnel text-[18px] leading-normal text-[#efefef]",
                activeTab === "message" ? "bg-brand/30" : "bg-[#0f0f0f]"
              )}
            >
              Send a message
              {activeTab === "message" && (
                <>
                  <div className="absolute -left-[5px] -right-[5px] -top-px h-px bg-brand" />
                  <div className="absolute -bottom-px -left-[5px] -right-[5px] h-px bg-brand" />
                  <div className="absolute -left-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                  <div className="absolute -right-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("call")}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center p-[10px] font-funnel text-[18px] leading-normal text-[#efefef]",
                activeTab === "call" ? "bg-brand/30" : "bg-[#0f0f0f]"
              )}
            >
              Book a call
              {activeTab === "call" && (
                <>
                  <div className="absolute -left-[5px] -right-[5px] -top-px h-px bg-brand" />
                  <div className="absolute -bottom-px -left-[5px] -right-[5px] h-px bg-brand" />
                  <div className="absolute -left-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                  <div className="absolute -right-px -top-[5px] -bottom-[5px] w-px bg-brand" />
                </>
              )}
            </button>
          </div>

          {activeTab === "message" ? (
            submitState === "ok" ? (
              <div className="flex flex-col gap-4 border border-brand/40 bg-[#0f0f0f] p-8">
                <h3 className="font-funnel text-[28px] font-medium text-[#efefef]">
                  Message sent!
                </h3>
                <p className="font-funnel text-[18px] text-[#efefef]/70">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-[24px]" noValidate>
                {/* Honeypot */}
                <div aria-hidden="true" className="hidden">
                  <input type="text" tabIndex={-1} {...register("website")} />
                </div>

                <div className="flex flex-col gap-[24px]">
                  {/* Name & Email */}
                  <div className="flex gap-[12px]">
                    <FormField label="Your name *" error={errors.name?.message}>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="Jane Smith"
                        {...register("name")}
                        className={inputClasses(!!errors.name)}
                      />
                    </FormField>
                    <FormField label="Your email *" error={errors.email?.message}>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="jane@company.com"
                        {...register("email")}
                        className={inputClasses(!!errors.email, true)}
                      />
                    </FormField>
                  </div>

                  {/* Company */}
                  <FormField label="Company" error={errors.company?.message}>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme Corp (optional)"
                      {...register("company")}
                      className={inputClasses(!!errors.company)}
                    />
                  </FormField>

                  {/* Service */}
                  <FormField label="Service" error={errors.service?.message}>
                    <div className="relative">
                      <select {...register("service")} className={cn(inputClasses(!!errors.service), "appearance-none pr-12")}>
                        <option value="">Select a service…</option>
                        {services.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                        <ChevronIcon />
                      </div>
                    </div>
                  </FormField>

                  {/* Budget & Timeline */}
                  <div className="flex gap-[12px]">
                    <FormField label="Estimated budget range" error={errors.budget?.message}>
                      <div className="relative">
                        <select {...register("budget")} className={cn(inputClasses(!!errors.budget), "appearance-none pr-12")}>
                          <option value="">Select range…</option>
                          {budgetRanges.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                          <ChevronIcon />
                        </div>
                      </div>
                    </FormField>
                    <FormField label="When do you want to start?" error={errors.timeline?.message}>
                      <div className="relative">
                        <select {...register("timeline")} className={cn(inputClasses(!!errors.timeline), "appearance-none pr-12")}>
                          <option value="">Select timeline…</option>
                          {timelines.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                          <ChevronIcon />
                        </div>
                      </div>
                    </FormField>
                  </div>

                  {/* Message */}
                  <FormField label="Tell us about your project" error={errors.message?.message}>
                    <textarea
                      rows={4}
                      placeholder="What are you trying to achieve? Even rough ideas help…"
                      {...register("message")}
                      className={cn(inputClasses(!!errors.message), "h-[100px] resize-none")}
                    />
                  </FormField>

                  {/* Hear about */}
                  <FormField label="How did you hear about us?" error={errors.hearAbout?.message}>
                    <div className="relative">
                      <select {...register("hearAbout")} className={cn(inputClasses(!!errors.hearAbout), "appearance-none pr-12")}>
                        <option value="">Select…</option>
                        {hearAboutUs.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                        <ChevronIcon />
                      </div>
                    </div>
                  </FormField>
                </div>

                {submitState === "error" && errorMessage && (
                  <p className="text-brand">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-[12px] bg-brand py-[12px] pl-[24px] pr-[16px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <span className="font-funnel text-[18px] leading-normal">
                    {isSubmitting ? "Sending…" : "Send message"}
                  </span>
                  <div className="h-6 w-[38px]">
                    <ArrowIcon />
                  </div>
                </button>
              </form>
            )
          ) : (
            <div className="flex flex-col gap-4 p-8">
              <p className="font-funnel text-[18px] text-[#efefef]/70">
                Calendar booking integration coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-[#efefef]">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[14px] text-brand">{error}</span>
      )}
    </div>
  );
}

function inputClasses(hasError: boolean, isSpecial?: boolean) {
  return cn(
    "w-full bg-[#0f0f0f] px-[24px] py-[12px] font-funnel text-[18px] leading-[1.5] text-[#efefef] placeholder:text-[#efefef]/40 focus:outline-none",
    hasError && "border border-brand",
    isSpecial && "bg-brand/30"
  );
}

function ChevronIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L10 11L19 1" stroke="#efefef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12H36M36 12L26 2M36 12L26 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
