import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { releaseVersion } from '@/lib/release'
import {
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_TITLE,
} from '@/lib/site'
import banner from '../../public/larvae-embed-banner.png'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['luau', 'preprocessor', 'roblox', 'darklua', 'rust', 'rojo'],
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: banner.src,
        width: banner.width,
        height: banner.height,
        alt: 'larvae: format, lint, and ship Luau. The Luau toolchain, in Rust',
      },
    ],
  },
  twitter: {
    // Discord reads this card too: the banner full width under the link,
    // as on the Alloy site. scripts/embed-banner.html is its source.
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [banner.src],
  },
}

export const viewport: Viewport = {
  themeColor: '#10e694',
  colorScheme: 'dark',
}

/** Only claims that are true today, nothing about ratings or price. */
const structuredData = {
  /* Shares its source with the hero badge, which is the only other place the
     version appears. Two hardcoded copies would drift the first time one of
     them was updated. */
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_ORIGIN,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux, macOS, Windows',
  /* Omitted when the build could not resolve a release, because structured
     data claiming a version nobody published is worse than none. */
  ...(releaseVersion() ? { softwareVersion: releaseVersion() } : {}),
  programmingLanguage: 'Rust',
  codeRepository: REPO_URL,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    /* The stylesheet sets `scroll-behavior: smooth` so the in-page nav anchors
       glide. Next has to suppress that for the scroll-to-top it runs on a route
       change, or the reset animates from wherever you were and the incoming
       page's own layout cancels it partway, which is why /docs used to open
       partly scrolled. It only reaches in to do that when this attribute marks
       the element as smooth by intent. */
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data is a fixed literal
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  )
}
