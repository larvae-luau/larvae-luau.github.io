/**
 * One place for the values that appear in metadata, the sitemap, robots,
 * and the web manifest, so they cannot drift apart.
 */

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://coldluau.github.io'

export const SITE_NAME = 'coldluau'

export const SITE_TITLE = 'coldluau · the cold, fast Luau preprocessor'

export const SITE_DESCRIPTION =
  'A parallel, incremental Luau preprocessor written in Rust. Native Roblox string requires, realm aware validation, and one Rojo project file instead of two.'

export const SITE_TAGLINE =
  'Parallel, incremental, and realm aware, with native Roblox string requires that no other tool emits.'

export const REPO_URL = 'https://github.com/coldluau/cli'

/** Absolute url for a route, ex: absoluteUrl('/docs') */
export function absoluteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path === '/' ? '' : path}`
}
