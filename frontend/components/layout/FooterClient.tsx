import Image from 'next/image'
import Link from 'next/link'
import {cn} from '@/lib/utils'
import {Logo} from '../icons/Logo'
import {FooterGraphic} from '../icons/FooterGraphicLightTheme'
import {openCookiePreferences} from '../partials/CookieBanner'

type FooterLink = {
  label: string
  href: string
  accent?: boolean
  _key: string
}

type FooterColumn = {
  title: string
  links?: FooterLink[]
  _key: string
}

type FooterProps = {
  columns: FooterColumn[]
  cookiePreferencesLabel?: string | null
  title: string
  email?: string | null
  logo?: string
  location?: string | null
  phoneNumber?: string | null
  copyright?: string | null
}

type ContactItem = {
  label: string
  href?: string
}

export function Footer({
  columns,
  cookiePreferencesLabel,
  title,
  email,
  logo,
  location,
  phoneNumber,
  copyright,
}: FooterProps) {
  const contactItems: ContactItem[] = [
    email ? {label: email, href: `mailto:${email}`} : null,
    phoneNumber ? {label: phoneNumber, href: `tel:${phoneNumber.replace(/\s+/g, '')}`} : null,
    location ? {label: location} : null,
  ].filter((item): item is ContactItem => item !== null)

  const contactColumn: FooterColumn | null = contactItems.length
    ? {
        _key: 'contact-details',
        title: 'Contact',
        links: contactItems.map((item, index) => ({
          _key: `contact-${index}`,
          label: item.label,
          href: item.href ?? '',
          accent: false,
        })),
      }
    : null

  const displayColumns = contactColumn ? [...columns, contactColumn] : columns

  return (
    <footer className="relative w-full overflow-x-clip overflow-y-hidden border-t border-black/20 bg-brand dark:border-white/15 dark:bg-black">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
        <div className="flex w-full justify-end overflow-hidden translate-y-[15%]">
          <FooterGraphic className="block h-auto w-[clamp(520px,72vw,1197px)] max-w-full shrink-0" />
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col md:flex-row md:items-stretch lg:h-146">
        <div className="relative z-10 flex min-w-0 flex-col justify-between gap-10 p-8 md:w-[420px] md:flex-none md:p-10 lg:w-[480px] lg:p-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              {logo ? (
                <Image
                  src={logo}
                  alt={title}
                  aria-hidden="true"
                  width={80}
                  height={102}
                  className="h-[50px] w-[39px] shrink-0 md:h-[64px] md:w-[50px] lg:h-[80px] lg:w-[62px] 2xl:h-[102px] 2xl:w-[80px]"
                />
              ) : (
                <Logo className="h-[50px] w-[39px] shrink-0 md:h-[64px] md:w-[50px] lg:h-[80px] lg:w-[62px] 2xl:h-[102px] 2xl:w-[80px]" />
              )}
              <p className="min-w-0 break-words font-betatron text-[22px] leading-[30px] tracking-[-0.2px] text-foreground md:text-[24px] md:leading-8 lg:text-[28px] lg:leading-[36px] 2xl:text-[32px] 2xl:leading-[38px]">
                {title}
              </p>
            </div>
            <p className="text-body text-foreground">From 1 to 10</p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <p className="text-body-2 text-foreground">{copyright}</p>
            {cookiePreferencesLabel ? (
              <button
                className="text-body-2 text-left text-foreground underline decoration-brand underline-offset-4 transition-colors hover:text-brand"
                onClick={openCookiePreferences}
                type="button"
              >
                {cookiePreferencesLabel}
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-10 border-t border-black/20 p-8 md:flex-1 md:border-l md:border-t-0 md:px-8 md:py-12 lg:grid-cols-4 dark:border-white/15 lg:px-16">
          {displayColumns.map((col) => (
            <div key={col._key || col.title} className="flex min-w-0 flex-col gap-6">
              <h3 className="font-medium text-[24px] leading-8 tracking-[-0.2px] text-foreground md:text-[28px] md:leading-[36px] 2xl:text-[32px] 2xl:leading-[38px]">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links?.map((link) => (
                  <li key={link._key || link.href}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className={cn(
                          'text-body block max-w-full break-all font-light transition-colors',
                          link.accent
                            ? 'text-brand hover:text-brand-hover'
                            : 'text-black hover:text-brand dark:text-white',
                        )}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-body block max-w-full break-all font-light text-black dark:text-white">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
