/**
 * One place for the values that appear in metadata, the sitemap, robots,
 * and the web manifest, so they cannot drift apart.
 */

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://larvae-luau.github.io'

export const SITE_NAME = 'larvae'

export const SITE_TITLE = 'larvae · the Luau toolchain'

export const SITE_DESCRIPTION =
  'A Luau toolchain written in Rust. Transformers today, with native Roblox string requires and realm aware validation, and formatting and linting on the way.'

export const SITE_TAGLINE =
  'Transformers, formatting, and linting for Luau in one Rust binary, starting with the require rewriting nothing else does.'

export const REPO_URL = 'https://github.com/larvae-luau/larvae'

/** Absolute url for a route, ex: absoluteUrl('/docs') */
export function absoluteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path === '/' ? '' : path}`
}
