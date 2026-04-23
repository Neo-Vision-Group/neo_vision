"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import ArrowIcon from "@/components/icons/ArrowIcon";
import ChevronIcon from "@/components/icons/ChevronIcon";
import { contactSchema, type ContactFormData } from "@/lib/contact-schema";

import { ContactHeroData } from "./ContactHero";

export function ContactFormSection() {
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
      phone: "",
      projectType: "",
      budget: "",
      message: "",
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

  const services: string[] = [];
  const budgetRanges: string[] = [];

  return (
    <div className="flex flex-1 flex-col gap-12">
      {submitState === "ok" ? (
        <div className="flex flex-col gap-4 border border-brand/40 bg-surface p-8">
          <h3 className="font-funnel text-[28px] font-medium text-foreground">
            Message sent!
          </h3>
          <p className="font-funnel text-[18px] text-foreground/70">
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
              <FormField label="Service" error={errors.projectType?.message}>
                <div className="relative">
                  <select {...register("projectType")} className={cn(inputClasses(!!errors.projectType), "appearance-none pr-12")}>
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

              {/* Budget & Phone */}
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
                <FormField label="Phone number" error={errors.phone?.message}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (555) 123-4567 (optional)"
                    {...register("phone")}
                    className={inputClasses(!!errors.phone)}
                  />
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
        )}
    </div>
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
      <label className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black dark:text-foreground">
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
    "w-full bg-white dark:bg-[#0f0f0f] px-[24px] py-[12px] font-funnel text-[18px] leading-[1.5] text-black dark:text-[#efefef] placeholder:text-black/40 dark:placeholder:text-[#efefef]/40 focus:outline-none",
    hasError && "border border-brand",
    isSpecial && "bg-brand/30"
  );
}
