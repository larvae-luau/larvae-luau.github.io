# coldluau site

The landing page and documentation for [coldluau](https://github.com/coldluau), a Luau preprocessor written in Rust. Built with Next.js and exported as static files, so GitHub Pages can serve the whole thing.

## What coldluau does

You write `require("@pkg/signal")` and coldluau writes `require("@game/ReplicatedStorage/Packages/signal")`, a native Roblox string require the engine already understands. No Instance chains, no sourcemap, and the output still reads like the code you wrote.

It also refuses to emit a require that would break in a running game, which is the part nothing else in the ecosystem does. Requires that resolve fine on disk can still fail at runtime because Starter containers clone their children, because ServerStorage never replicates to a client, or because instance lookup is case sensitive while your filesystem is not. coldluau maps both ends of every require into the DataModel and errors instead of shipping the break.

It is a drop in alternative to darklua, accepts every darklua rule name, and runs roughly 16x faster on a normal project.

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
description: Every coldluau command, flag, exit code, and environment variable
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
- coldluau and darklua stay lowercase, even starting a sentence

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

Pushing to the default branch builds the export and publishes it to GitHub Pages. The workflow reads the repository name to work out the base path, so a project site is served from a subpath and a `*.github.io` repository is served from the root, with no config to change either way.

To build against a subpath locally, set the base path yourself.

```bash
NEXT_PUBLIC_BASE_PATH=/docs npm run build
```
