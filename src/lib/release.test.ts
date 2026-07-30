import { afterEach, describe, expect, it } from 'vitest'
import {
  currentRelease,
  RELEASE_API,
  RELEASES_PAGE,
  releaseVersion,
  UNRELEASED_LABEL,
} from '@/lib/release'

/** next.config injects these, so a test run sees whatever the shell had. */
afterEach(() => {
  process.env.RELEASE_TAG = ''
  process.env.RELEASE_URL = ''
})

describe('currentRelease', () => {
  it('falls back to the placeholder when nothing is published', () => {
    process.env.RELEASE_TAG = ''
    const release = currentRelease()
    expect(release.label).toBe(UNRELEASED_LABEL)
    expect(release.url).toBe(RELEASES_PAGE)
    expect(release.published).toBe(false)
  })

  it('uses the published tag and its notes page', () => {
    process.env.RELEASE_TAG = 'v0.2.1'
    process.env.RELEASE_URL =
      'https://github.com/coldluau/cli/releases/tag/v0.2.1'
    const release = currentRelease()
    expect(release.label).toBe('v0.2.1')
    expect(release.url).toBe(
      'https://github.com/coldluau/cli/releases/tag/v0.2.1',
    )
    expect(release.published).toBe(true)
  })

  it('adds the prefix to a tag published without one', () => {
    process.env.RELEASE_TAG = '0.2.1'
    expect(currentRelease().label).toBe('v0.2.1')
  })

  it('still points somewhere when a tag arrives without a url', () => {
    process.env.RELEASE_TAG = 'v0.2.1'
    process.env.RELEASE_URL = ''
    expect(currentRelease().url).toBe(RELEASES_PAGE)
  })
})

describe('releaseVersion', () => {
  it('strips the prefix that structured data does not want', () => {
    process.env.RELEASE_TAG = 'v1.4.0'
    expect(releaseVersion()).toBe('1.4.0')
  })

  it('covers the placeholder too', () => {
    process.env.RELEASE_TAG = ''
    expect(releaseVersion()).toBe('0.1.0-beta')
  })
})

describe('RELEASE_API', () => {
  it('is derived from the repo url rather than written out twice', () => {
    expect(RELEASE_API).toBe(
      'https://api.github.com/repos/coldluau/cli/releases/latest',
    )
  })
})
