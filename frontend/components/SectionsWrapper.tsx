import {ReactNode} from 'react'
import {DrawLine} from './partials/motion/DrawLine'

interface SectionsWrapperProps {
  eyebrow: string | ReactNode
  children: ReactNode
  id?: string
  hideTopBorder?: boolean
  hideBorders?: boolean
  classNameOverride?: string
  overrideEyebrowSize?: string
}

export function SectionsWrapper({
  eyebrow,
  children,
  id,
  hideTopBorder = false,
  hideBorders = false,
  classNameOverride = '',
  overrideEyebrowSize = '',
}: SectionsWrapperProps) {
  return (
    <section id={id} className="relative flex flex-col md:flex-row w-full md:items-start bg-white dark:bg-dark">
      <aside className="w-full md:sticky md:top-0 md:z-10 md:flex md:h-fit md:w-1/4 md:shrink-0 md:flex-col md:items-start pt-24">
        {!hideBorders && (<div className="h-px w-full bg-black/20 dark:bg-white/20" />)}
        <div className="relative w-full pl-6 2xl:pl-30 lg:pl-16 md:pl-6 pr-6 py-6">
          <div className={`font-clash text-center md:text-left ${overrideEyebrowSize || 'text-3xl text-[24px] lg:text-3xl'} text-black dark:text-[#efefef] font-bold`}>{eyebrow}</div>
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

      {/* Vertical Separator: This one looks correct, but ensure parent has height */}
      <DrawLine
        className="hidden md:block w-px self-stretch bg-black/20 dark:bg-white/20"
        start="top 85%"
        end="bottom 85%"
        direction="vertical"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-12 md:pt-24">
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
        <div className={classNameOverride || 'w-full px-6 lg:px-8 xl:px-16'}>
          {children}
        </div>
      </div>
    </section>
  )
}