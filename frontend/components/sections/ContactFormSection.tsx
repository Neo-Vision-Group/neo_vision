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

export type ContactFormSectionData = {
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

export function ContactFormSection({ data }: { data?: ContactFormSectionData }) {
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
  const heading = cleanData?.heading || "Every project starts\nwith a conversation.";
  const description = cleanData?.description || "No pitch. No slides. Just a 30-minute call about whether TwelveTen is the right partner for what you're building. We respond within 24 hours.";
  const steps = cleanData?.steps || [];
  const services = cleanData?.formConfig?.services || [];
  const budgetRanges = cleanData?.formConfig?.budgetRanges || [];
  const timelines = cleanData?.formConfig?.timelines || [];
  const hearAboutUs = cleanData?.formConfig?.hearAboutUs || [];

  return (
    <section className="flex w-full gap-12 border-b border-border bg-background px-12 py-16">
      {/* Left column - Intro and steps */}
      <div className="flex flex-1 flex-col gap-6">
        <p className="font-betatron text-[32px] leading-[1.2] text-brand">
          {eyebrow}
        </p>

        <div className="flex flex-col gap-6 font-funnel text-foreground">
          <p className="whitespace-pre-wrap text-[48px] leading-[1.2] tracking-[-1px]">
            {heading}
          </p>
          <p className="text-[18px] leading-[1.5]">
            {description}
          </p>
        </div>

        {/* Timeline steps */}
        <div className="flex flex-col">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 shrink-0 bg-brand" />
                {idx < steps.length - 1 && (
                  <div className="w-px flex-1 bg-white/20" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 p-3 pb-6">
                <div className="flex gap-6">
                  <p className="font-betatron text-[32px] leading-[1.2] text-brand">
                    0{idx + 1}.
                  </p>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="font-funnel text-[24px] font-bold leading-[1.2] text-foreground">
                      {step.title}
                    </p>
                    <p className="font-funnel text-[18px] leading-[1.5] text-foreground/70">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex flex-1 flex-col gap-12 bg-[#040404] p-6">
        {/* Tab buttons */}
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={cn(
              "relative flex-1 p-3 font-funnel text-[18px] leading-[1.5] text-foreground",
              activeTab === "message" ? "bg-brand/30" : "bg-[#0f0f0f]"
            )}
          >
            Send a message
            {activeTab === "message" && (
              <>
                <div className="absolute -left-1 -right-1 -top-px h-px bg-brand" />
                <div className="absolute -bottom-px -left-1 -right-1 h-px bg-brand" />
                <div className="absolute -left-px -top-1 -bottom-1 w-px bg-brand" />
                <div className="absolute -right-px -top-1 -bottom-1 w-px bg-brand" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("call")}
            className={cn(
              "relative flex-1 p-3 font-funnel text-[18px] leading-[1.5] text-foreground",
              activeTab === "call" ? "bg-brand/30" : "bg-[#0f0f0f]"
            )}
          >
            Book a call
            {activeTab === "call" && (
              <>
                <div className="absolute -left-1 -right-1 -top-px h-px bg-brand" />
                <div className="absolute -bottom-px -left-1 -right-1 h-px bg-brand" />
                <div className="absolute -left-px -top-1 -bottom-1 w-px bg-brand" />
                <div className="absolute -right-px -top-1 -bottom-1 w-px bg-brand" />
              </>
            )}
          </button>
        </div>

        {activeTab === "message" ? (
          submitState === "ok" ? (
            <div className="flex flex-col gap-4 border border-brand/40 bg-surface p-8">
              <h3 className="font-funnel text-[28px] font-medium text-foreground">
                Message sent!
              </h3>
              <p className="font-funnel text-[18px] text-foreground/70">
                We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-12" noValidate>
              {/* Honeypot */}
              <div aria-hidden="true" className="hidden">
                <input type="text" tabIndex={-1} {...register("website")} />
              </div>

              <div className="flex flex-col gap-6">
                {/* Name & Email */}
                <div className="flex gap-3">
                  <FormField label="Your name *" error={errors.name?.message}>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Smith"
                      {...register("name")}
                      className={inputClasses(!!errors.name)}
                    />
                  </FormField>
                  <FormField label="Your name *" error={errors.email?.message}>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      {...register("email")}
                      className={inputClasses(!!errors.email)}
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
                <FormField label="Company" error={errors.service?.message}>
                  <select {...register("service")} className={inputClasses(!!errors.service)}>
                    <option value="">Select a service…</option>
                    {services.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>

                {/* Budget & Timeline */}
                <div className="flex gap-3">
                  <FormField label="Estimated budget range" error={errors.budget?.message}>
                    <select {...register("budget")} className={inputClasses(!!errors.budget)}>
                      <option value="">Select range…</option>
                      {budgetRanges.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="When do you want to start?" error={errors.timeline?.message}>
                    <select {...register("timeline")} className={inputClasses(!!errors.timeline)}>
                      <option value="">Select timeline…</option>
                      {timelines.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Message */}
                <FormField label="Tell us about your project" error={errors.message?.message}>
                  <textarea
                    rows={4}
                    placeholder="What are you trying to achieve? Even rough ideas help…"
                    {...register("message")}
                    className={cn(inputClasses(!!errors.message), "resize-none")}
                  />
                </FormField>

                {/* Hear about */}
                <FormField label="How did you hear about us?" error={errors.hearAbout?.message}>
                  <select {...register("hearAbout")} className={inputClasses(!!errors.hearAbout)}>
                    <option value="">Select…</option>
                    {hearAboutUs.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {submitState === "error" && errorMessage && (
                <p className="text-brand">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-3 bg-brand px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <span className="font-funnel text-[18px] leading-[1.5]">
                  {isSubmitting ? "Sending…" : "Send message"}
                </span>
                <ArrowRight color="white" width={38} height={24} />
              </button>
            </form>
          )
        ) : (
          <div className="flex flex-col gap-4 p-8">
            <p className="font-funnel text-[18px] text-foreground/70">
              Calendar booking integration coming soon.
            </p>
          </div>
        )}
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
      <label className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[14px] text-brand">{error}</span>
      )}
    </div>
  );
}

function inputClasses(hasError: boolean) {
  return cn(
    "w-full bg-[#0f0f0f] px-6 py-3 font-funnel text-[18px] leading-[1.5] text-foreground placeholder:text-foreground/40 focus:outline-none",
    hasError && "border border-brand"
  );
}
