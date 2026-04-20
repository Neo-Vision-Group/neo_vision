import BlockRenderer from '@/components/BlockRenderer'
import {homePageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {
  const {data: homePage} = await sanityFetch({
    query: homePageQuery,
  })

  if (!homePage) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No home page found</h1>
        <p className="text-gray-600 mt-4">
          Please create a page in Sanity with pageType set to &quot;home&quot;
        </p>
      </div>
    )
  }

  return (
    <>
      {homePage.pageBuilder?.map((block: any, index: number) => (
        <BlockRenderer
          key={block._key}
          block={block}
          index={index}
          pageId={homePage._id}
          pageType={homePage.pageType}
        />
      ))}
    </>
  )
}
