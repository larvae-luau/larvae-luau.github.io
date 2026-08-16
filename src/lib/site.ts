/**
 * One place for the values that appear in metadata, the sitemap, robots,
 * and the web manifest, so they cannot drift apart.
 */

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://larvae-luau.github.io'

export const SITE_NAME = 'larvae'

export const SITE_TITLE = 'larvae · the Luau toolchain'

export const SITE_DESCRIPTION =
  'Format, lint, and ship Luau. One parallel Rust binary: requires that cannot break, style that cannot drift, and worms that teach it languages beyond Luau.'

export const SITE_TAGLINE = 'Format, lint, and ship Luau.'

export const REPO_URL = 'https://github.com/larvae-luau/larvae'

/** Absolute url for a route, ex: absoluteUrl('/docs') */
export function absoluteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path === '/' ? '' : path}`
}
