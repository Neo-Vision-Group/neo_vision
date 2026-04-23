"use client";

import { useState } from "react";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import Image from "@/components/SanityImage";
import { cleanStega } from "@/sanity/lib/utils";

export type BookingData = {
  eyebrow?: string;
  heading?: { regular?: string; bold?: string };
  callTitle?: string;
  teamMember?: {
    name?: string;
    role?: string;
    portrait?: {
      asset?: {
        _ref?: string;
        _type?: string;
      };
    };
  };
  whatToExpectHeading?: string;
  expectations?: string[];
  schedulerUrl?: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIME_SLOTS = ["9:00 AM", "10:30 AM", "2:00 PM"];

interface TimeSlot {
  day: string;
  time: string;
  available: boolean;
}

export function Booking({ data }: { data?: BookingData }) {
  const cleanData = data ? cleanStega(data) : data;
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Generate time slots for each day
  const timeSlots: TimeSlot[] = [];
  DAYS.forEach((day) => {
    TIME_SLOTS.forEach((time) => {
      // Mark some slots as unavailable for demo
      const isUnavailable = (day === "Tue" && time === "9:00 AM") || 
                           (day === "Thu" && time === "2:00 PM");
      timeSlots.push({ day, time, available: !isUnavailable });
    });
  });

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const eyebrow = (
    <div className="flex flex-col gap-5">
      <p className="font-betatron text-[32px] leading-[1.2] text-[var(--text,#efefef)] dark:text-[var(--text,#efefef)]">
        {cleanData?.eyebrow || "PREFER TO BOOK DIRECTLY?"}
      </p>
    </div>
  );

  return (
    <SectionsWrapper eyebrow={eyebrow} id="booking">
      <div className="flex flex-col gap-12 px-6 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Heading */}
        <div className="px-6">
          <h2 className="font-funnel text-[48px] leading-[1.2] tracking-[-1px] text-[var(--text,#efefef)] dark:text-[var(--text,#efefef)]">
            {cleanData?.heading?.regular || "Skip the form. Pick a time."}
          </h2>
        </div>

        {/* Calendar Grid + Details */}
        <div className="flex flex-col gap-12 md:flex-row md:gap-16">
          {/* Calendar Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-px bg-[rgba(255,255,255,0.2)]">
              {DAYS.map((day) => (
                <div key={day} className="flex flex-col">
                  {/* Day Header */}
                  <div className="bg-[var(--bg-card,#0f0f0f)] flex h-14 items-center justify-center px-3">
                    <span className="font-funnel text-[18px] leading-[1.5] text-[var(--text,#efefef)]">
                      {day}
                    </span>
                  </div>
                  
                  {/* Time Slots */}
                  {TIME_SLOTS.map((time) => {
                    const slot = timeSlots.find(s => s.day === day && s.time === time);
                    const isSelected = selectedSlot?.day === day && selectedSlot?.time === time;
                    
                    return (
                      <div key={time}>
                        <div className="h-px w-full bg-[rgba(255,255,255,0.2)]" />
                        <button
                          onClick={() => slot && handleSlotClick(slot)}
                          disabled={!slot?.available}
                          className={`flex h-14 items-center justify-center px-3 transition-colors ${
                            !slot?.available
                              ? "bg-[rgba(255,65,0,0.2)] cursor-not-allowed"
                              : isSelected
                              ? "bg-[var(--brand,#ff4100)] cursor-pointer"
                              : "bg-[var(--bg-card,#0f0f0f)] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
                          }`}
                        >
                          <span 
                            className={`font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] whitespace-nowrap ${
                              !slot?.available
                                ? "text-[var(--brand,#ff4100)]"
                                : "text-[var(--text,#efefef)]"
                            }`}
                          >
                            {time}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Call Details */}
          <div className="flex w-full flex-col gap-6 md:w-[400px]">
            <div>
              <h3 className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-[var(--text,#efefef)] dark:text-[var(--text,#efefef)] whitespace-pre-line">
                {cleanData?.callTitle || "30-Minute Discovery\nCall With"}
              </h3>
            </div>

            {/* Person Info */}
            <div className="flex items-center gap-4">
              <div className="relative h-[50px] w-[50px]">
                {cleanData?.teamMember?.portrait?.asset?._ref ? (
                  <Image
                    id={cleanData.teamMember.portrait.asset._ref}
                    alt={cleanData.teamMember.name || 'Team member'}
                    className="h-full w-full object-cover"
                    height={50}
                    width={50}
                    mode="cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0f0f0f]" />
                )}
                <div className="absolute -left-2 top-0 h-px w-[60px] bg-[var(--brand,#ff4100)]" />
                <div className="absolute -left-2 bottom-0 h-px w-[60px] bg-[var(--brand,#ff4100)]" />
                <div className="absolute -left-2 top-1/2 h-[60px] w-px -translate-y-1/2 bg-[var(--brand,#ff4100)]" />
                <div className="absolute right-0 top-1/2 h-[60px] w-px -translate-y-1/2 bg-[var(--brand,#ff4100)]" />
              </div>
              <div className="flex flex-col">
                <p className="font-funnel text-[18px] leading-[1.5] text-[var(--text,#efefef)]">
                  {cleanData?.teamMember?.name || "Team Member"}
                </p>
                <p className="font-funnel text-[14px] leading-[1.2] tracking-[-0.5px] text-[rgba(239,239,239,0.7)]">
                  {cleanData?.teamMember?.role || "Team Role"}
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <p className="font-funnel text-[24px] leading-[1.2] font-bold text-[var(--text,#efefef)] dark:text-[var(--text,#efefef)]">
              {cleanData?.whatToExpectHeading || "What to expect:"}
            </p>

            <ul className="flex flex-col gap-3">
              {(cleanData?.expectations || [
                "Your goals and challenges",
                "Whether AI/engineering fits",
                "Honest assessment of fit",
                "Suggested next steps"
              ]).map((exp, idx) => (
                <li key={idx} className="flex gap-6">
                  <div className="flex pt-2">
                    <div className="h-3 w-3 shrink-0 bg-[var(--brand,#ff4100)]" />
                  </div>
                  <span className="flex-1 font-funnel text-[18px] leading-[1.5] text-[var(--text,#efefef)]">
                    {exp}
                  </span>
                </li>
              ))}
            </ul>

            {/* Book Button */}
            {selectedSlot && (
              <button
                onClick={() => {
                  const url = cleanData?.schedulerUrl || process.env.NEXT_PUBLIC_BOOKING_URL;
                  if (url) {
                    window.open(url, '_blank');
                  }
                }}
                className="mt-4 flex w-full items-center justify-between gap-4 border border-[var(--brand,#ff4100)]/40 bg-[var(--bg-card,#0f0f0f)] px-6 py-4 transition-colors hover:bg-[var(--brand,#ff4100)]"
              >
                <span className="font-funnel text-[18px] leading-[1.5] text-[var(--text,#efefef)]">
                  Book {selectedSlot.day} at {selectedSlot.time}
                </span>
                <svg className="h-5 w-5 text-[var(--text,#efefef)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            )}

            {!cleanData?.schedulerUrl && !process.env.NEXT_PUBLIC_BOOKING_URL && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-[rgba(239,239,239,0.7)]">
                Calendar integration pending. Set NEXT_PUBLIC_BOOKING_URL in .env.local.
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionsWrapper>
  );
}
