import {SectionsWrapper} from '@/components/SectionsWrapper'
import {SplitTextReveal} from '@/components/partials/motion/SplitTextReveal'
import {cleanStega, urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const RevealOnScroll = dynamic(
  () =>
    import('@/components/partials/motion/RevealOnScroll').then(
      (mod) => mod.RevealOnScroll,
    ),
  {ssr: false},
)

type TechStackItem = {
  _key?: string
  name?: string | null
  logo?: {
    asset?: {
      _ref?: string
      url?: string
    } | null
  } | null
}

type TechStackGroup = {
  _key?: string
  title?: string | null
  items?: Array<TechStackItem | null> | null
}

export type TechStacksData = {
  eyebrow?: string | null
  headingRegular?: string | null
  headingBold?: string | null
  groups?: Array<TechStackGroup | null> | null
  closingNote?: string | null
}

function PlaceholderTile() {
  return (
    <div className="relative aspect-[102.5/57.656246185302734] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#c1c9c5]/15 via-transparent to-brand/30 mix-blend-screen" />
    </div>
  )
}

export function TechStacks({data}: {data?: TechStacksData}) {
  const cleanData = data ? cleanStega(data) : data
  const eyebrow = cleanData?.eyebrow ?? 'TRUSTED BY'
  const headingRegular = cleanData?.headingRegular ?? 'The tools and partners'
  const headingBold = cleanData?.headingBold ?? 'behind our work.'
  const groups =
    cleanData?.groups?.filter(
      (group) => group?.title?.trim() || group?.items?.some((item) => item?.name?.trim()),
    ) ?? []
  const closingNote = cleanData?.closingNote

  if (!headingRegular && !headingBold && groups.length === 0) {
    return null
  }

  return (
    <SectionsWrapper eyebrow={eyebrow}>
      <div className="flex flex-col gap-16">
        <SplitTextReveal
          as="h2"
          type="lines"
          scrollTriggered
          className="text-[28px] leading-[36px] tracking-[-0.3px] text-foreground md:text-[36px] md:leading-[46px] lg:text-[44px] lg:leading-[54px] 2xl:text-[48px] 2xl:leading-[57.6px] 2xl:tracking-[-1px]"
        >
          {`${headingRegular} ${headingBold}`.trim()}
        </SplitTextReveal>

        <div className="flex flex-col gap-12">
          {groups.map((group, groupIndex) => {
            const items = group?.items?.filter((item) => item?.name?.trim()) ?? []

            if (!group?.title && items.length === 0) {
              return null
            }

            return (
              <section key={group?._key ?? `group-${groupIndex}`} className="flex flex-col">
                {group?.title ? (
                  <div className="py-6">
                    <h3 className="text-[24px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-[32px] md:tracking-[-1px]">
                      {group.title}
                    </h3>
                  </div>
                ) : null}

                <div className="border-y border-white/10">
                  <RevealOnScroll
                    as="div"
                    stagger={0.05}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  >
                    {items.map((item, itemIndex) => {
                      const imageUrl = item?.logo ? urlForImage(item.logo)?.url() : null

                      return (
                        <article
                          key={item?._key ?? `item-${itemIndex}`}
                          className="flex min-h-[160px] flex-col justify-between border-b border-r border-white/10 p-6 odd:border-l md:min-h-[188px] lg:min-h-[212px]"
                        >
                          <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-[253px]">
                              {imageUrl ? (
                                <div className="relative aspect-[102.5/57.656246185302734] w-full">
                                  <Image
                                    src={imageUrl}
                                    alt={item?.name ?? ''}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <PlaceholderTile />
                              )}
                            </div>
                          </div>
                          {item?.name ? (
                            <p className="pt-3 text-center text-[14px] leading-[1.5] text-foreground md:text-[18px]">
                              {item.name}
                            </p>
                          ) : null}
                        </article>
                      )
                    })}
                  </RevealOnScroll>
                </div>
              </section>
            )
          })}
        </div>

        {closingNote ? (
          <p className="text-[24px] leading-[1.2] tracking-[-0.4px] text-foreground md:text-[32px] md:tracking-[-1px]">
            {closingNote}
          </p>
        ) : null}
      </div>
    </SectionsWrapper>
  )
}
