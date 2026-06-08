"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import posthog from '@/lib/posthog-client';
import { cn } from "@/lib/utils";
import { cleanStega } from "@/sanity/lib/utils";
import ChevronIcon from "@/components/icons/ChevronIcon";
import { contactSchema, type ContactFormData } from "@/lib/contact-schema";

import { ContactHeroData } from "./ContactHero";
import { Button } from "@/components/partials/Button";

type ContactFormSectionProps = {
  formConfig?: ContactHeroData["formConfig"];
};

// Calculate lead quality score based on form data
function calculateLeadScore(formData: ContactFormData): number {
  let score = 5; // Base score
  
  // Budget range scoring
  if (formData.budget) {
    if (formData.budget.includes('100k+') || formData.budget.includes('$100')) score += 3;
    else if (formData.budget.includes('50k') || formData.budget.includes('$50')) score += 2;
    else if (formData.budget.includes('25k') || formData.budget.includes('$25')) score += 1;
  }
  
  // Company presence
  if (formData.company) score += 1;
  
  // Phone number presence (shows higher intent)
  if (formData.phone) score += 1;
  
  // Message length (detailed messages show higher intent)
  if (formData.message && formData.message.length > 100) score += 1;
  
  return Math.min(score, 10); // Cap at 10
}

export function ContactFormSection({ formConfig }: ContactFormSectionProps) {
  const [submitState, setSubmitState] = useState<"idle" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfHeaderName, setCsrfHeaderName] = useState<string>("x-csrf-token");
  const [formStarted, setFormStarted] = useState(false);
  const [formStartTime, setFormStartTime] = useState<number | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

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

  // Track form start and field completion
  const handleFieldFocus = (fieldName: string) => {
    if (!formStarted) {
      setFormStarted(true);
      setFormStartTime(Date.now());
      posthog.capture('contact_form_started', {
        source: typeof window !== 'undefined' ? window.location.pathname : '/contact',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        ...utmParams,
      });
    }
  };

  const handleFieldComplete = (fieldName: string, value: unknown) => {
    if (value && !completedFields.has(fieldName)) {
      const newCompleted = new Set(completedFields);
      newCompleted.add(fieldName);
      setCompletedFields(newCompleted);
      
      posthog.capture('contact_form_field_completed', {
        field_name: fieldName,
        source: typeof window !== 'undefined' ? window.location.pathname : '/contact',
      });
    }
  };

  // Fetch CSRF token on mount
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const res = await fetch("/api/csrf");
        if (res.ok) {
          const data = await res.json();
          setCsrfToken(data.token);
          setCsrfHeaderName(data.headerName);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err);
      }
    }
    fetchCsrfToken();
  }, []);

  // Capture UTM parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key);
      if (value) utms[key] = value;
    });
    
    setUtmParams(utms);
  }, []);

  // Track form abandonment on unmount
  useEffect(() => {
    return () => {
      if (formStarted && submitState === 'idle' && completedFields.size > 0) {
        const timeSpent = formStartTime ? (Date.now() - formStartTime) / 1000 : 0;
        posthog.capture('contact_form_abandoned', {
          fields_completed: Array.from(completedFields),
          fields_count: completedFields.size,
          time_spent: timeSpent,
          source: window.location.pathname,
          ...utmParams,
        });
      }
    };
  }, [formStarted, submitState, completedFields, formStartTime, utmParams]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      
      // Include CSRF token if available
      if (csrfToken) {
        headers[csrfHeaderName] = csrfToken;
      }

      // Add timeout to prevent indefinite loading (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const errMsg = json.error ?? "Something went wrong";
        setErrorMessage(errMsg);
        setSubmitState("error");
        posthog.capture("contact_form_error", {
          error_message: errMsg,
          project_type: formData.projectType,
          budget: formData.budget,
          source: formData.source,
        });
        return;
      }
      // Identify user with their email and enrich profile
      posthog.identify(formData.email, {
        email: formData.email,
        name: formData.name,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        project_type: formData.projectType,
        budget_range: formData.budget,
        acquisition_source: formData.hearAboutUs,
        first_contact_page: formData.source,
        first_contact_date: new Date().toISOString(),
      });

      // Set user properties for segmentation
      const leadQualityScore = calculateLeadScore(formData);
      posthog.setPersonProperties({
        is_lead: true,
        lead_quality: leadQualityScore,
        has_company: !!formData.company,
        has_phone: !!formData.phone,
      });

      const timeSpent = formStartTime ? (Date.now() - formStartTime) / 1000 : 0;
      
      posthog.capture("contact_form_submitted", {
        project_type: formData.projectType,
        budget: formData.budget,
        hear_about_us: formData.hearAboutUs,
        source: formData.source,
        has_company: !!formData.company,
        has_phone: !!formData.phone,
        time_spent: timeSpent,
        fields_completed: completedFields.size,
        lead_quality_score: leadQualityScore,
        ...utmParams,
      });

      reset();
      setSubmitState("ok");
    } catch (err) {
      const isAbortError = err instanceof Error && err.name === "AbortError";
      const errMsg = isAbortError 
        ? "Request timed out. Please try again." 
        : "Something went wrong";
      
      setErrorMessage(errMsg);
      setSubmitState("error");
      
      if (!isAbortError) {
        posthog.captureException(err);
      }
      
      posthog.capture("contact_form_error", {
        error_message: isAbortError ? "timeout" : "network_error",
        source: formData.source,
      });
    }
  });

  const cleanFormConfig = formConfig ? cleanStega(formConfig) : undefined;
  const services = cleanFormConfig?.services ?? [];
  const budgetRanges = cleanFormConfig?.budgetRanges ?? [];
  const hearAboutUsOptions = cleanFormConfig?.hearAboutUs ?? [];

  return (
    <div className="flex flex-1 flex-col gap-12">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {submitState === "ok" && "Message sent successfully! We'll get back to you within 24 hours."}
        {submitState === "error" && errorMessage && `Error: ${errorMessage}`}
      </div>
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
        <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
          <div aria-hidden="true" className="hidden">
            <input type="text" tabIndex={-1} {...register("website")} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <FormField label="Your name *" error={errors.name?.message} id="contact-name">
                {(props) => (
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    {...register("name", {
                      onBlur: (e) => handleFieldComplete('name', e.target.value)
                    })}
                    {...props}
                    onFocus={() => handleFieldFocus('name')}
                    className={inputClasses(!!errors.name)}
                  />
                )}
              </FormField>
              <FormField label="Your email *" error={errors.email?.message} id="contact-email">
                {(props) => (
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="jane@company.com"
                    {...register("email")}
                    {...props}
                    className={inputClasses(!!errors.email, true)}
                  />
                )}
              </FormField>
            </div>

            <FormField label="Company" error={errors.company?.message} id="contact-company">
              {(props) => (
                <input
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Corp (optional)"
                  {...register("company", {
                    onBlur: (e) => handleFieldComplete('company', e.target.value)
                  })}
                  {...props}
                  onFocus={() => handleFieldFocus('company')}
                  className={inputClasses(!!errors.company)}
                />
              )}
            </FormField>

            <FormField label="Service" error={errors.projectType?.message} id="contact-service">
              {() => (
                <DropdownField
                  placeholder="Select a service..."
                  options={services}
                  value={projectTypeField.field.value}
                  onChange={(value) => {
                    projectTypeField.field.onChange(value);
                    handleFieldComplete('projectType', value);
                  }}
                  onBlur={projectTypeField.field.onBlur}
                  onFocus={() => handleFieldFocus('projectType')}
                  name={projectTypeField.field.name}
                  hasError={!!errors.projectType}
                />
              )}
            </FormField>

            <div className="flex flex-col gap-3 md:flex-row">
              <FormField label="Estimated budget range" error={errors.budget?.message} id="contact-budget">
                {() => (
                  <DropdownField
                    placeholder="Select range..."
                    options={budgetRanges}
                    value={budgetField.field.value}
                    onChange={(value) => {
                      budgetField.field.onChange(value);
                      handleFieldComplete('budget', value);
                    }}
                    onBlur={budgetField.field.onBlur}
                    onFocus={() => handleFieldFocus('budget')}
                    name={budgetField.field.name}
                    hasError={!!errors.budget}
                  />
                )}
              </FormField>
              <FormField label="Phone number" error={errors.phone?.message} id="contact-phone">
                {(props) => (
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (555) 123-4567 (optional)"
                    {...register("phone", {
                      onBlur: (e) => handleFieldComplete('phone', e.target.value)
                    })}
                    {...props}
                    onFocus={() => handleFieldFocus('phone')}
                    className={inputClasses(!!errors.phone)}
                  />
                )}
              </FormField>
            </div>

            <FormField label="How did you hear about us?" error={errors.hearAboutUs?.message} id="contact-hear-about">
              {() => (
                <DropdownField
                  placeholder="Select an option..."
                  options={hearAboutUsOptions}
                  value={hearAboutUsField.field.value}
                  onChange={(value) => {
                    hearAboutUsField.field.onChange(value);
                    handleFieldComplete('hearAboutUs', value);
                  }}
                  onBlur={hearAboutUsField.field.onBlur}
                  onFocus={() => handleFieldFocus('hearAboutUs')}
                  name={hearAboutUsField.field.name}
                  hasError={!!errors.hearAboutUs}
                />
              )}
            </FormField>

            <FormField label="Tell us about your project" error={errors.message?.message} id="contact-message">
              {(props) => (
                <textarea
                  rows={4}
                  placeholder="What are you trying to achieve? Even rough ideas help..."
                  {...register("message", {
                    onBlur: (e) => handleFieldComplete('message', e.target.value)
                  })}
                  {...props}
                  onFocus={() => handleFieldFocus('message')}
                  className={cn(inputClasses(!!errors.message), "h-25 resize-none")}
                />
              )}
            </FormField>
          </div>

          {submitState === "error" && errorMessage && (
            <p className="text-brand">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 bg-brand py-3 pl-6 pr-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
  id,
}: {
  label: string;
  error?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
  id: string;
}) {
  const errorId = `${id}-error`;
  
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor={id} className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-black dark:text-[#efefef]">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && <span id={errorId} className="text-[14px] text-brand" role="alert">{error}</span>}
    </div>
  );
}

function inputClasses(hasError: boolean, isSpecial?: boolean) {
  return cn(
    "w-full border focus:bg-brand-dark focus:border-brand focus-within:bg-brand-dark focus-within:border-brand border-black/10 bg-white px-6 py-3 font-funnel text-[18px] leading-normal text-black placeholder:text-black/40 focus:outline-none dark:border-white/10 dark:bg-[#0f0f0f] dark:text-[#efefef] dark:placeholder:text-[#efefef]/40",
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
  onFocus,
  name,
  hasError,
}: {
  placeholder: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onFocus?: () => void;
  name: string;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedLabel = value && value.length > 0 ? value : placeholder;
  const hasSelection = !!value;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setFocusedIndex(0);
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
      if (!open) {
        setFocusedIndex(0);
      }
    }
  };

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (options.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex]);
          onBlur();
          setOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && focusedIndex >= 0 && focusedIndex < options.length
            ? `${listboxId}-option-${focusedIndex}`
            : undefined
        }
        onClick={() => {
          setOpen((current) => !current);
          if (!open) {
            setFocusedIndex(0);
          }
        }}
        onKeyDown={handleButtonKeyDown}
        onFocus={() => onFocus?.()}
        onBlur={() => {
          window.setTimeout(() => {
            if (!wrapperRef.current?.contains(document.activeElement)) {
              onBlur();
            }
          }, 0);
        }}
        className={cn(
          "flex min-h-13 w-full items-center justify-between border border-black/10 bg-white px-6 py-3 text-left dark:border-white/10 dark:bg-[#0f0f0f]",
          hasError && "border-brand",
          open && "ring-1 ring-brand/40"
        )}
      >
        <span
          className={cn(
            "font-funnel text-[18px] leading-normal",
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
          tabIndex={-1}
          onKeyDown={handleListboxKeyDown}
          className="absolute left-0 right-0 top-full z-20 overflow-hidden border border-black/15 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:border-white/15 dark:bg-[#0f0f0f] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        >
          <div className="h-px w-full bg-brand" />
          {options.map((option, index) => {
            const selected = option === value;
            const focused = index === focusedIndex;

            return (
              <button
                key={option}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  onBlur();
                  setOpen(false);
                  setFocusedIndex(-1);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  "block w-full border-b border-black/20 px-6 py-3 text-left font-funnel text-[18px] leading-normal text-black transition-colors last:border-b-0 dark:border-white/20 dark:text-[#efefef]",
                  selected
                    ? "bg-brand/30"
                    : focused
                      ? "bg-black/6 dark:bg-white/10"
                      : "bg-white hover:bg-black/3 dark:bg-[#0f0f0f] dark:hover:bg-white/6"
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
          <div className="px-6 py-3 font-funnel text-[18px] leading-normal text-black/50 dark:text-[#efefef]/60">
            No options available yet.
          </div>
        </div>
      )}
    </div>
  );
}
