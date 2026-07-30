import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://coldluau.github.io'
const ogImage = `${basePath}/coldluau-og.png`

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'coldluau · the cold, fast Luau preprocessor',
  description:
    'A parallel, incremental Luau preprocessor written in Rust. Native Roblox string requires, realm aware validation, and one Rojo project file instead of two.',
  keywords: ['luau', 'preprocessor', 'roblox', 'darklua', 'rust', 'bundler'],
  openGraph: {
    title: 'coldluau · the cold, fast Luau preprocessor',
    description:
      'Parallel, parse-once, and incremental, with native Roblox string requires that no other tool can emit.',
    url: `${siteOrigin}${basePath}`,
    siteName: 'coldluau',
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 384,
        height: 384,
        alt: 'coldluau logo',
      },
    ],
  },
  twitter: {
    // 'summary' makes Discord render the image as a small square
    // thumbnail beside the text instead of a full-width banner.
    card: 'summary',
    title: 'coldluau · the cold, fast Luau preprocessor',
    description:
      'Parallel, parse-once, and incremental, with native Roblox string requires that no other tool can emit.',
    images: [ogImage],
  },
}

export const viewport: Viewport = {
  themeColor: '#87fdff',
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
