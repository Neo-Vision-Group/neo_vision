'use client'

import ArrowRight from "@/components/icons/ArrowRightPixel"
import Image from "next/image"
import SocialIcon from "@/components/icons/SocialIcon"
import { AnimatedBorder } from "@/components/AnimatedBorder"
import BinaryGlitchField from "@/components/partials/BinaryGlitchField"
import Badge from "@/components/partials/Badge"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type AuthorHeroParams = {
    name: string
    role: string
    bio: string
    portrait: string
    linkedin?: string
    instagram?: string
    facebook?: string
    github?: string
    x?: string
    tiktok?: string
    badges: string[]
}

function getSocialPlatform(href: string) {
    if (/instagram\.com/i.test(href)) return 'instagram' as const
    if (/facebook\.com/i.test(href)) return 'facebook' as const
    if (/linkedin\.com/i.test(href)) return 'linkedin' as const
    if (/github\.com/i.test(href)) return 'github' as const
    if (/x\.com|twitter\.com/i.test(href)) return 'x' as const
    if (/tiktok\.com/i.test(href)) return 'tiktok' as const
    return null
}

export default function AuthorHero(member: AuthorHeroParams) {
    const router = useRouter()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const isDarkTheme = !mounted || theme === 'dark'

    const socials = [member.linkedin, member.instagram, member.facebook, member.github, member.x, member.tiktok]
        .filter((s): s is string => Boolean(s?.length))

    return (
        <section className="relative bg-transparent min-h-screen w-full pt-24 pb-16 flex flex-col gap-6 px-6 lg:px-16 2xl:px-30">
            {/* Back button */}
            <div className="flex items-center">
                <button
                    onClick={() => router.back()}
                    className="group relative flex items-center gap-3 p-2.5 text-foreground transition-colors hover:text-brand"
                >
                    <span className="flex-none rotate-180">
                        <ArrowRight color="currentColor" width={38} height={24} />
                    </span>
                    <span className="font-funnel text-[18px] font-bold leading-[1.5] text-foreground whitespace-nowrap">
                        Back to article
                    </span>
                    <AnimatedBorder groupHover />
                </button>
            </div>

            {/* Main content row: stacked on mobile, side-by-side on lg+ */}
            <div className="flex flex-1 flex-col-reverse items-start gap-10 w-full md:flex-row lg:gap-16">
                {/* Left: text content */}
                <div className="flex flex-1 min-w-0 flex-col gap-8 lg:gap-12">
                    {/* Name + role + socials */}
                    <div className="flex flex-col gap-6 w-full">
                        <div className="flex flex-wrap items-start gap-6 w-full">
                            <div className="flex flex-1 min-w-0 flex-col">
                                <p className="font-funnel text-[32px] leading-[1.2] tracking-[-1px] text-foreground w-full lg:text-[40px] xl:text-[48px] xl:tracking-[-2px]">
                                    {member.name}
                                </p>
                                <p className="font-funnel text-[18px] leading-[1.5] text-muted w-full">
                                    {member.role}
                                </p>
                            </div>
                            {socials.length > 0 && (
                                <div className="flex flex-wrap items-start gap-4 shrink-0">
                                    {socials.map((social) => {
                                        const platform = getSocialPlatform(social)
                                        if (!platform) return null
                                        return (
                                            <a
                                                key={social}
                                                href={social}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${member.name} on ${platform}`}
                                                className="group relative flex size-[50px] lg:size-[60px] shrink-0 items-center justify-center bg-[var(--bg-card)] transition-colors hover:bg-[rgba(255,65,0,0.3)] active:bg-brand"
                                            >
                                                <SocialIcon platform={platform} />
                                                <AnimatedBorder groupHover />
                                            </a>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
                    </div>

                    {/* Bio */}
                    <p className="font-funnel text-[18px] leading-[1.5] text-foreground w-full">
                        {member.bio}
                    </p>

                    {/* Badges */}
                    {member.badges?.length > 0 && (
                        <div className="flex flex-wrap gap-4 lg:gap-6">
                            {member.badges.map((badge) => (
                                <Badge key={badge} text={badge} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: portrait card — full width on mobile, fixed on lg+ */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden md:w-[280px] lg:w-[360px] xl:w-[440px]">
                    <BinaryGlitchField isDark={isDarkTheme} />
                    {member.portrait && (
                        <div className="absolute inset-0 z-10 overflow-hidden">
                            <Image
                                src={member.portrait}
                                alt={member.name}
                                className="object-contain object-bottom"
                                fill
                                sizes="(min-width: 1280px) 440px, (min-width: 1024px) 360px, (min-width: 768px) 280px, 100vw"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}