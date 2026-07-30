import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

// output: export needs metadata routes marked static explicitly
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // hashed build output, nothing a crawler should index
        disallow: '/_next/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
