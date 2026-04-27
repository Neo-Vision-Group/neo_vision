"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import ChevronIcon from "@/components/icons/ChevronIcon";
import { contactSchema, type ContactFormData } from "@/lib/contact-schema";

import { ContactHeroData } from "./ContactHero";
import { Button } from "@/components/partials/Button";

type ContactFormSectionProps = {
  formConfig?: ContactHeroData["formConfig"];
};

export function ContactFormSection({ formConfig }: ContactFormSectionProps) {
  const [submitState, setSubmitState] = useState<"idle" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
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
      hearAboutUs: "",
      message: "",
      website: "",
      source: "/contact",
    },
  });

  const projectTypeField = useController({ control, name: "projectType" });
  const budgetField = useController({ control, name: "budget" });
  const hearAboutUsField = useController({ control, name: "hearAboutUs" });

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

  const cleanFormConfig = formConfig ? cleanStega(formConfig) : undefined;
  const services = cleanFormConfig?.services ?? [];
  const budgetRanges = cleanFormConfig?.budgetRanges ?? [];
  const hearAboutUsOptions = cleanFormConfig?.hearAboutUs ?? [];

  return (
    <div className="flex flex-1 flex-col gap-12">
      {submitState === "ok" ? (
        <div className="flex flex-col gap-4 border border-brand/40 bg-surface p-8">
          <h3 className="font-funnel text-[28px] font-medium text-foreground">
            Message sent!
          </h3>
          <p className="font-funnel text-[18px] text-foreground/70">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-[24px]" noValidate>
          <div aria-hidden="true" className="hidden">
            <input type="text" tabIndex={-1} {...register("website")} />
          </div>

          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px] md:flex-row">
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

            <FormField label="Company" error={errors.company?.message}>
              <input
                type="text"
                autoComplete="organization"
                placeholder="Acme Corp (optional)"
                {...register("company")}
                className={inputClasses(!!errors.company)}
              />
            </FormField>

            <FormField label="Service" error={errors.projectType?.message}>
              <DropdownField
                placeholder="Select a service..."
                options={services}
                value={projectTypeField.field.value}
                onChange={projectTypeField.field.onChange}
                onBlur={projectTypeField.field.onBlur}
                name={projectTypeField.field.name}
                hasError={!!errors.projectType}
              />
            </FormField>

            <div className="flex flex-col gap-[12px] md:flex-row">
              <FormField label="Estimated budget range" error={errors.budget?.message}>
                <DropdownField
                  placeholder="Select range..."
                  options={budgetRanges}
                  value={budgetField.field.value}
                  onChange={budgetField.field.onChange}
                  onBlur={budgetField.field.onBlur}
                  name={budgetField.field.name}
                  hasError={!!errors.budget}
                />
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

            <FormField label="How did you hear about us?" error={errors.hearAboutUs?.message}>
              <DropdownField
                placeholder="Select an option..."
                options={hearAboutUsOptions}
                value={hearAboutUsField.field.value}
                onChange={hearAboutUsField.field.onChange}
                onBlur={hearAboutUsField.field.onBlur}
                name={hearAboutUsField.field.name}
                hasError={!!errors.hearAboutUs}
              />
            </FormField>

            <FormField label="Tell us about your project" error={errors.message?.message}>
              <textarea
                rows={4}
                placeholder="What are you trying to achieve? Even rough ideas help..."
                {...register("message")}
                className={cn(inputClasses(!!errors.message), "h-[100px] resize-none")}
              />
            </FormField>
          </div>

          {submitState === "error" && errorMessage && (
            <p className="text-brand">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-[12px] bg-brand py-[12px] pl-[24px] pr-[16px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <span className="font-funnel text-[18px] leading-normal">
              {isSubmitting ? "Sending..." : "Send message"}
            </span>
          </Button>
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
      <label className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black dark:text-[#efefef]">
        {label}
      </label>
      {children}
      {error && <span className="text-[14px] text-brand">{error}</span>}
    </div>
  );
}

function inputClasses(hasError: boolean, isSpecial?: boolean) {
  return cn(
    "w-full border border-black/10 bg-white px-[24px] py-[12px] font-funnel text-[18px] leading-[1.5] text-black placeholder:text-black/40 focus:outline-none dark:border-white/10 dark:bg-[#0f0f0f] dark:text-[#efefef] dark:placeholder:text-[#efefef]/40",
    hasError && "border-brand",
    isSpecial && "bg-brand/30"
  );
}

function DropdownField({
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  name,
  hasError,
}: {
  placeholder: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedLabel = value && value.length > 0 ? value : placeholder;
  const hasSelection = !!value;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => {
          window.setTimeout(() => {
            if (!wrapperRef.current?.contains(document.activeElement)) {
              onBlur();
            }
          }, 0);
        }}
        className={cn(
          "flex min-h-[51px] w-full items-center justify-between border border-black/10 bg-white px-[24px] py-[12px] text-left dark:border-white/10 dark:bg-[#0f0f0f]",
          hasError && "border-brand",
          open && "ring-1 ring-brand/40"
        )}
      >
        <span
          className={cn(
            "font-funnel text-[18px] leading-[1.5]",
            hasSelection
              ? "text-black dark:text-[#efefef]"
              : "text-black/40 dark:text-[#efefef]/70"
          )}
        >
          {selectedLabel}
        </span>
        <span
          className={cn(
            "pointer-events-none text-black transition-transform dark:text-[#efefef]",
            open && "rotate-180"
          )}
        >
          <ChevronIcon />
        </span>
      </button>

      {open && options.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 overflow-hidden border border-black/15 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:border-white/15 dark:bg-[#0f0f0f] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        >
          <div className="h-px w-full bg-brand" />
          {options.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  onBlur();
                  setOpen(false);
                }}
                className={cn(
                  "block w-full border-b border-black/20 px-[24px] py-[12px] text-left font-funnel text-[18px] leading-[1.5] text-black transition-colors last:border-b-0 dark:border-white/20 dark:text-[#efefef]",
                  selected
                    ? "bg-brand/30"
                    : "bg-white hover:bg-black/[0.03] dark:bg-[#0f0f0f] dark:hover:bg-white/[0.06]"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {open && options.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-20 border border-black/15 bg-white dark:border-white/15 dark:bg-[#0f0f0f]">
          <div className="h-px w-full bg-brand" />
          <div className="px-[24px] py-[12px] font-funnel text-[18px] leading-[1.5] text-black/50 dark:text-[#efefef]/60">
            No options available yet.
          </div>
        </div>
      )}
    </div>
  );
}
