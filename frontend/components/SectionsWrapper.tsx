import {ReactNode} from 'react'
import {DrawLine} from './partials/motion/DrawLine'

interface SectionsWrapperProps {
  eyebrow: string | ReactNode
  children: ReactNode
  id?: string
  hideTopBorder?: boolean
  hideBorders?: boolean
  classNameOverride?: string
}

export function SectionsWrapper({
  eyebrow,
  children,
  id,
  hideTopBorder = false,
  hideBorders = false,
  classNameOverride = '',
}: SectionsWrapperProps) {
  return (
    <section id={id} className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
      <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start md:pt-24">
        {!hideBorders && (<div className="h-px w-full bg-black/20 dark:bg-white/20" />)}
        <div className="relative w-full 2xl:pl-30 lg:pl-16 md:pl-12 pr-6 py-6">
          <p className="font-betatron text-center md:text-left text-3xl text-black dark:text-[#efefef]">{eyebrow}</p>
        </div>
        
        {/* Fixed: Horizontal line needs h-px and w-full. 
            Triggered when the top of the aside hits the middle of the screen */}
        {!hideBorders && (
          <DrawLine
            className="hidden md:block h-px w-full bg-black/20 dark:bg-white/20"
            start="top 80%" 
            end="top 40%"
            direction="horizontal"
          />
        )}
      </aside>

      {/* Mobile Borders */}
      <DrawLine
        className="md:hidden absolute inset-y-0 left-3 w-px bg-black/20 dark:bg-white/20"
        start="top 85%"
        end="bottom 85%"
        direction="vertical"
      />
      <DrawLine
        className="md:hidden absolute inset-y-0 right-3 w-px bg-black/20 dark:bg-white/20"
        start="top 85%"
        end="bottom 85%"
        direction="vertical"
      />

      {/* Vertical Separator: This one looks correct, but ensure parent has height */}
      <DrawLine
        className="hidden md:block w-px self-stretch bg-black/20 dark:bg-white/20"
        start="top 85%"
        end="bottom 85%"
        direction="vertical"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-12 pt-24">
        {/* Fixed: Top border horizontal line. 
            Changed start/end to vertical triggers so it animates as you scroll down */}
        {!(hideTopBorder || hideBorders) && (
          <DrawLine 
            className="w-full h-px bg-black/20 dark:bg-white/20" 
            start="top 90%" 
            end="top 30%" 
            direction="horizontal" 
          />
        )}
        <div className={classNameOverride || 'w-full px-6 pb-24 lg:px-8 xl:px-16'}>
          {children}
        </div>
      </div>
    </section>
  )
}