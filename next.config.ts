import type { NextConfig } from 'next'
import { RELEASE_API } from './src/lib/release'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Asked once per build and inlined, rather than fetched by every visitor.
 *
 * Every failure path returns null and lib/release prints its placeholder. A
 * website should not stop shipping because an API was slow, and the token is
 * only there because CI runners share an IP and the anonymous quota is 60 an
 * hour across all of them.
 */
async function latestRelease(): Promise<{ tag: string; url: string } | null> {
  const token = process.env.GITHUB_TOKEN
  try {
    const res = await fetch(RELEASE_API, {
      headers: {
        accept: 'application/vnd.github+json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    })
    // 404 is the ordinary answer for a repo that has never tagged anything.
    if (!res.ok) {
      console.warn(
        `release lookup answered ${res.status}, badge shows the placeholder`,
      )
      return null
    }
    const data = (await res.json()) as Record<string, unknown>
    if (typeof data.tag_name !== 'string') return null
    if (typeof data.html_url !== 'string') return null
    return { tag: data.tag_name, url: data.html_url }
  } catch (error) {
    console.warn('release lookup failed, badge shows the placeholder:', error)
    return null
  }
}

export default async function config(): Promise<NextConfig> {
  // An explicit tag wins, which is the only way to see a published release
  // locally while the CLI still has none, and a way to pin one if ever needed.
  const release = process.env.RELEASE_TAG
    ? { tag: process.env.RELEASE_TAG, url: process.env.RELEASE_URL ?? '' }
    : await latestRelease()

  return {
    output: 'export',
    basePath,
    images: {
      unoptimized: true,
    },
    experimental: {
      // Turbopack's persistent dev cache lives in .next/dev, which on this
      // repo sits on an ntfs-3g mount Next itself flags as slow. A cache that
      // gets written badly there survives restarts and every rebuild after it
      // panics with "Next.js package not found", which the dev overlay answers
      // by reloading the page, forever. Cold and warm starts both measure
      // ~400ms here, so the cache buys nothing worth that failure mode.
      turbopackFileSystemCacheForDev: false,
    },
    env: {
      RELEASE_TAG: release?.tag ?? '',
      RELEASE_URL: release?.url ?? '',
    },
  }
}
