import type { MetadataRoute } from 'next'
import { getAllDocs } from '@/lib/docs'
import { absoluteUrl } from '@/lib/site'

// output: export needs metadata routes marked static explicitly
export const dynamic = 'force-static'

/** Newest `updated` across all pages, used for the routes that list them. */
function newestUpdate(dates: string[]): string {
  return dates.reduce((latest, date) => (date > latest ? date : latest), '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = getAllDocs()
  const newest = newestUpdate(docs.map((doc) => doc.updated))

  return [
    {
      url: absoluteUrl('/'),
      lastModified: newest,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/docs'),
      lastModified: newest,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...docs.map((doc) => ({
      url: absoluteUrl(`/docs/${doc.slug}`),
      // the date the page itself declares, not the build time
      lastModified: doc.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
