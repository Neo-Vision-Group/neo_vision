import PageBuilderPage from '@/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

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

  if (!homePage.pageBuilder || homePage.pageBuilder.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{homePage.name}</h1>
        <p className="text-gray-600 mt-4">
          This page has no content blocks. Add blocks in Sanity Studio under &quot;Page
          builder&quot;.
        </p>
      </div>
    )
  }

  return <PageBuilderPage page={homePage} />
}
