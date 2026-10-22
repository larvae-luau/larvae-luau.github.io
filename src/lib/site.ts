/**
 * One place for the values that appear in metadata, the sitemap, robots,
 * and the web manifest, so they cannot drift apart.
 */

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://larvae-luau.github.io'

export const SITE_NAME = 'larvae'

export const SITE_TITLE = 'larvae · A Luau toolchain, in Rust'

/* Also the body of the Discord card, which cuts near 350 characters. */
export const SITE_DESCRIPTION =
  'larvae rewrites requires and refuses to ship one that fails at runtime. It formats with stylua parity and lints with thirty four selene rules. Worms extend all three to languages that compile to Luau. One parallel Rust binary, one VS Code extension.'

export const REPO_URL = 'https://github.com/larvae-luau/larvae'

/** Absolute url for a route, ex: absoluteUrl('/docs') */
export function absoluteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path === '/' ? '' : path}`
}
