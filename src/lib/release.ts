import { REPO_URL } from './site'

/**
 * Shown when a build cannot resolve the release. The CLI has published
 * releases, so a made-up version here would claim the wrong one; a neutral
 * label sends the reader to the releases page instead.
 */
export const UNRELEASED_LABEL = 'latest release'

export interface Release {
  /** What the badge prints. */
  label: string
  /** Where the badge points. */
  url: string
  /** False when the label is the placeholder rather than a published tag. */
  published: boolean
}

const SLUG = new URL(REPO_URL).pathname.replace(/^\/+/, '')

/** Imported by next.config, which is why nothing here uses a path alias. */
export const RELEASE_API = `https://api.github.com/repos/${SLUG}/releases/latest`

export const RELEASES_PAGE = `${REPO_URL}/releases`

/** Tags are published both ways. The badge has always shown the prefix. */
function withPrefix(tag: string): string {
  return /^v/i.test(tag) ? tag : `v${tag}`
}

/**
 * Resolved once per build by next.config, so the page ships a fixed string and
 * no visitor waits on the GitHub API or watches the badge pop in.
 *
 * A build that cannot reach the API falls back to the placeholder rather than
 * failing, which does mean a published release can render as the beta until the
 * next deploy. Losing a version number is a better outcome than losing a site.
 */
export function currentRelease(): Release {
  const tag = process.env.RELEASE_TAG
  if (!tag) {
    return { label: UNRELEASED_LABEL, url: RELEASES_PAGE, published: false }
  }
  return {
    label: withPrefix(tag),
    url: process.env.RELEASE_URL || RELEASES_PAGE,
    published: true,
  }
}

/**
 * Structured data wants a bare 0.1.0 rather than the badge's v0.1.0, and it
 * wants no version at all when the build could not resolve one.
 */
export function releaseVersion(): string | null {
  const release = currentRelease()
  if (!release.published) return null
  return release.label.replace(/^v/i, '')
}
