function getSocialPlatform(href: string) {
  if (/instagram\.com/i.test(href)) return 'instagram'
  if (/facebook\.com/i.test(href)) return 'facebook'
  if (/linkedin\.com/i.test(href)) return 'linkedin'
  if (/github\.com/i.test(href)) return 'github'
  if (/x\.com|twitter\.com/i.test(href)) return 'x'
  if (/tiktok\.com/i.test(href)) return 'tiktok'
  return null
}

export default function SocialIcon({platform}: {platform: NonNullable<ReturnType<typeof getSocialPlatform>>}) {
  const shared = 'h-[1.5em] w-[1.5em] shrink-0'

  switch (platform) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="none">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.25" cy="6.75" r="1.25" fill="currentColor" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="currentColor">
          <path d="M13.5 21v-7h2.37l.63-3h-3V9.56c0-.92.3-1.56 1.64-1.56H16.7V5.33c-.27-.04-1.2-.11-2.28-.11-2.25 0-3.8 1.37-3.8 3.88V11H8v3h2.62v7h2.88Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="currentColor">
          <path d="M6.9 8.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM5.5 9.7H8.3V19H5.5V9.7Zm4.6 0h2.7V11h.04c.37-.7 1.3-1.46 2.67-1.46 2.86 0 3.39 1.88 3.39 4.33V19h-2.8v-4.53c0-1.08-.02-2.48-1.51-2.48-1.51 0-1.75 1.18-1.75 2.4V19h-2.74V9.7Z" />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="currentColor">
          <path d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.2.63-.45 0-.22-.01-.96-.01-1.74-2.3.42-2.9-.56-3.08-1.07-.1-.27-.52-1.08-.89-1.3-.3-.16-.72-.57-.01-.58.67-.01 1.15.62 1.31.88.77 1.3 2.01.93 2.5.71.08-.56.3-.94.54-1.16-2.04-.23-4.18-1.02-4.18-4.52 0-1 .36-1.82.95-2.46-.1-.23-.42-1.18.09-2.46 0 0 .78-.25 2.55.94a8.74 8.74 0 0 1 4.64 0c1.77-1.2 2.55-.94 2.55-.94.51 1.28.19 2.23.09 2.46.59.64.95 1.45.95 2.46 0 3.51-2.15 4.29-4.2 4.52.31.27.58.79.58 1.6 0 1.16-.01 2.09-.01 2.38 0 .25.17.54.63.45A9.25 9.25 0 0 0 12 2.75Z" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="currentColor">
          <path d="M13.71 10.62 20.41 3h-1.59l-5.82 6.62L8.35 3H3l7.02 10.01L3 21h1.59l6.14-6.98L15.65 21H21l-7.29-10.38ZM11.54 13.08l-.71-.99L5.2 4.2h2.43l4.54 6.34.71.99 5.9 8.26h-2.43l-4.81-6.71Z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={shared} fill="currentColor">
          <path d="M14.58 3c.2 1.69 1.16 3.18 2.61 4.05.93.56 2.02.87 3.13.87v2.88a8.46 8.46 0 0 1-3.68-.84v5.07c0 3.36-2.72 6.08-6.08 6.08a6.08 6.08 0 0 1 0-12.16c.27 0 .53.02.79.06v2.97a3.24 3.24 0 0 0-.79-.1 3.2 3.2 0 1 0 0 6.39c1.77 0 3.22-1.44 3.22-3.22V3h2.8Z" />
        </svg>
      )
  }
}

