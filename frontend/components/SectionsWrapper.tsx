import {ReactNode} from 'react'
import {DrawLine} from './partials/motion/DrawLine'

interface SectionsWrapperProps {
  eyebrow: string | ReactNode
  children: ReactNode
  id?: string
  hideTopBorder?: boolean
  classNameOverride?: string
}

export function SectionsWrapper({
  eyebrow,
  children,
  id,
  hideTopBorder = false,
  classNameOverride = '',
}: SectionsWrapperProps) {
  return (
    <section id={id} className="relative flex flex-col md:flex-row w-full lg:items-start">
      <aside className="w-full lg:sticky lg:top-0 lg:z-10 lg:flex lg:h-fit lg:w-1/4 lg:shrink-0 lg:flex-col lg:items-start lg:pt-24">
        <div className="h-px w-full bg-black/20 dark:bg-white/20" />
        <div className="relative w-full px-12 py-6">
          <p className="font-betatron text-3xl text-black dark:text-[#efefef]">{eyebrow}</p>
        </div>
        
        {/* Fixed: Horizontal line needs h-px and w-full. 
            Triggered when the top of the aside hits the middle of the screen */}
        <DrawLine
          className="hidden lg:block h-px w-full bg-black/20 dark:bg-white/20"
          start="top 80%" 
          end="top 40%"
          direction="horizontal"
        />
      </aside>

      {/* Mobile Borders */}
      <div aria-hidden="true" className="absolute inset-y-0 left-3 w-px bg-black/20 dark:bg-white/20 md:hidden" />
      <div aria-hidden="true" className="absolute inset-y-0 right-3 w-px bg-black/20 dark:bg-white/20 md:hidden" />

      {/* Vertical Separator: This one looks correct, but ensure parent has height */}
      <DrawLine
        className="hidden lg:block w-px self-stretch bg-black/20 dark:bg-white/20"
        start="top 85%"
        end="bottom 85%"
        direction="vertical"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-12 pt-24">
        {/* Fixed: Top border horizontal line. 
            Changed start/end to vertical triggers so it animates as you scroll down */}
        {!hideTopBorder && (
          <DrawLine 
            className="w-full h-px bg-black/20 dark:bg-white/20" 
            start="top 90%" 
            end="top 30%" 
            direction="horizontal" 
          />
        )}
        <div className={classNameOverride || 'w-full px-6 pb-24 lg:px-16'}>
          {children}
        </div>
      </div>
    </section>
  )
}