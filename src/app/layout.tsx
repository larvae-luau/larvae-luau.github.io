import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import {
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_TAGLINE,
  SITE_TITLE,
} from '@/lib/site'
import ogImage from '../../public/coldluau-og.png'
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
    description: SITE_TAGLINE,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
        alt: 'coldluau logo',
      },
    ],
  },
  twitter: {
    // 'summary' makes Discord render the image as a small square
    // thumbnail beside the text instead of a full-width banner.
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    images: [ogImage.src],
  },
}

export const viewport: Viewport = {
  themeColor: '#87fdff',
  colorScheme: 'dark',
}

/** Only claims that are true today, nothing about ratings or price. */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_ORIGIN,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux, macOS, Windows',
  softwareVersion: '0.1.0',
  programmingLanguage: 'Rust',
  codeRepository: REPO_URL,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
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
