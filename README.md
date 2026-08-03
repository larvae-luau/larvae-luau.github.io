# larvae site

The landing page and documentation for [larvae](https://github.com/larvae-luau/larvae), a Luau toolchain written in Rust. Built with Next.js, tailwind and framer motion.

## What larvae does

You write `require("@pkg/signal")` and larvae writes `require("@game/ReplicatedStorage/Packages/signal")`, a native Roblox string require the engine already understands. No Instance chains, no sourcemap, and the output still reads like the code you wrote.

It also refuses to emit a require that would break in a running game, which is the part nothing else in the ecosystem does. Requires that resolve fine on disk can still fail at runtime because Starter containers clone their children, because ServerStorage never replicates to a client, or because instance lookup is case sensitive while your filesystem is not. larvae maps both ends of every require into the DataModel and errors instead of shipping the break.

It is a drop in alternative to darklua. 27 of darklua's 32 rule names run under the same names, larvae adds 7 more, and running the same rules over the same tree it is roughly 14x faster.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The landing page is at the root and the documentation lives under `/docs`.

## Writing a documentation page

Pages are markdown files under `content/docs/<category>/<page>.md`. The path becomes the URL, so `content/docs/reference/cli.md` is served at `/docs/reference/cli`. Adding a file is all it takes, nothing needs registering.

Every page opens with five frontmatter keys and the build fails loudly if one is missing.

```markdown
---
title: CLI reference
description: Every larvae command, flag, exit code, and environment variable
category: Reference
order: 1
updated: 2026-07-29
---
```

`category` groups the page in the sidebar and on the index. `order` sorts pages inside their category. `updated` is what the sidebar and the index show as the last change date, and a category displays the newest date across its pages.

Categories appear in a fixed order set by `CATEGORY_ORDER` in `src/lib/doc-meta.ts`. Right now that is Getting started, then Reference, then Concepts, then Project.

### Code blocks

Fenced code is highlighted at build time by our own tokenizer rather than a syntax highlighting library, so the colors come from the site palette and stay consistent with the landing page. Tag every fence with a language.

`luau`, `toml`, `shell`, `json`, `yaml`, and `text` are the real ones. Common aliases map onto them, so `lua` becomes luau, `bash` and `sh` and `console` become shell, `yml` becomes yaml, and anything unrecognised falls back to plain text instead of failing.

### House style

The tool's own voice, worth matching so pages read as one document.

- No em dashes anywhere, use a comma or restructure the sentence
- Say "ex:" rather than "e.g."
- No trailing period in short labels or table cells
- Show the before and after Luau for every transform, that is what readers scan for
- Never write a planned feature as though it works, tag it with the milestone it lands in
- larvae and darklua stay lowercase, even starting a sentence

## Checks

```bash
npm run lint       # biome, single quotes and semicolons only where needed
npm run typecheck  # tsc with no emit
npm test           # vitest
npm run build      # static export into out/
```

All four run on every push and pull request. The test suite covers the snowfall physics, the tokenizer, the markdown loader, and the rendered landing page, and it reads the real files in `content/docs` so a page with broken frontmatter or a stray em dash fails the build rather than reaching the site.

## Layout

```text
content/docs/        the documentation, one markdown file per page
src/app/             routes, including /docs and the catch all page route
src/components/      landing page sections
src/components/docs/ sidebar, header, and the search palette
src/lib/docs.ts      frontmatter parsing, markdown rendering, search index
src/lib/highlight.ts the tokenizer behind every code block
src/lib/snow.ts      snowfall physics, kept pure so it can be tested
```

## Deploying

Pushing to the default branch builds the export and publishes it to GitHub Pages through `.github/workflows/nextjs.yml`. Because the repository is named after the organisation, Pages serves it from the domain root, so the landing page is at `/` and the documentation sits under `/docs`.

That workflow calls `actions/configure-pages`, which reads the site URL and injects a base path when there is one. Renaming the repository is therefore all it takes to move the site under a subpath, no config change needed, which is worth knowing because a base path is easy to break.

Reference an image as a plain string and you will break it. `next/image` leaves a string `src` untouched while images are unoptimized, so `/logo.png` is fetched from the domain root and misses a subpath deploy completely. Import the file instead, which routes it through the asset pipeline and picks up whatever prefix is in play. See `src/lib/logo.ts`.

To check the site still holds up under a subpath, build it with one.

```bash
NEXT_PUBLIC_BASE_PATH=/example npm run build
```

## The version badge

The badge under the logo prints the CLI's latest published release and links to its notes. `next.config.ts` asks the GitHub API once per build and inlines the answer, so visitors never wait on that request and the number never pops in. When the CLI has no releases, or the API cannot be reached, `src/lib/release.ts` prints `v0.1.0-beta` and points at the releases index instead. A build is never allowed to fail over this.

The catch is that the value is fixed at build time, and publishing a release in the CLI repository pushes nothing here. Two things cover that. The deploy workflow runs nightly on a schedule, so the badge can only be a day stale on its own. It also accepts a `repository_dispatch` for an immediate rebuild, which the CLI can fire from its own release workflow.

```yaml
- name: Refresh the site
  run: |
    gh api repos/larvae-luau/larvae-luau.github.io/dispatches \
      -f event_type=release-published
  env:
    GH_TOKEN: ${{ secrets.SITE_DISPATCH_TOKEN }}
```

`SITE_DISPATCH_TOKEN` is a fine-grained token with contents write on this repository, since the built in `GITHUB_TOKEN` cannot reach across repositories.

To see a published release locally without waiting for one to exist, hand the build the values the config would have fetched.

```bash
RELEASE_TAG=v0.2.1 npm run build
```
