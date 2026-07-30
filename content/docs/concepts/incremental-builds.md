---
title: Incremental builds and watch mode
description: A cache key that includes everything require resolution reads
category: Concepts
order: 5
updated: 2026-07-29
---

coldluau caches its work between runs, which darklua has no equivalent for. The interesting part is not the caching, it is the cache key, because a per file content hash alone would be unsound.

## Why a content hash is not enough

Require resolution reads more than the file being processed. It reads the Rojo project file, `coldluau.toml`, every `.luaurc` on the way up the tree, and the set of paths that exist on disk.

So the correct output for a file can change without that file changing at all.

Two concrete cases.

**Editing a `.luaurc`.** The file is untouched:

```luau
local Signal = require("@pkg/signal")
```

Yesterday `@pkg` pointed at `Packages`, today it points at `vendor`. Same bytes in, different bytes out:

```luau
-- before the .luaurc edit
local Signal = require("@game/ReplicatedStorage/Packages/signal")

-- after
local Signal = require("@game/ReplicatedStorage/vendor/signal")
```

**Adding a sibling.** Again the requiring file is untouched:

```luau
local util = require("./util")
```

Yesterday only `util.luau` existed and this resolved cleanly. Today someone added `util.lua` next to it. That is now a `.luau` / `.lua` ambiguity, which is an error. Nothing about the requiring file changed, but the right answer went from a rewrite to a hard failure. See [failure classes](/docs/concepts/failure-classes).

A per file content hash would happily serve the stale answer in both cases.

## The resolution epoch

So the cache key includes a **resolution epoch**, a hash of everything resolution reads:

- the Rojo project file
- `coldluau.toml`
- every `.luaurc`
- the set of source paths

When the epoch changes, every file is reprocessed. When it does not, only files whose own contents changed are reprocessed.

This is deliberately coarse. Touching a `.luaurc` rebuilds the whole tree even if only one file cared, and adding a single new source file changes the path set and does the same. The tradeoff is bought on purpose: coarse, never stale. A cold full rebuild of a few thousand files runs in tens of milliseconds, so being clever here would buy milliseconds and risk correctness.

The cache lives in `cache_dir`, `.coldluau` by default, next to the derived Rojo project.

```toml
[process]
cache = true
cache_dir = ".coldluau"
```

Set `cache = false` to disable it entirely. Deleting `.coldluau` is also safe, the next run rebuilds it.

Cache hits show up in the summary, and the count only appears when it is non zero:

```text
processed 128 file(s): 3 require(s) rewritten, 125 unchanged
```

## Two details that surprise people

**`check` never uses the cache.** It must report every diagnostic on every run. A cached clean file would produce no output, and a CI gate that goes quiet on the second run is not a gate. So `check` is always a full pass, which is why its timing column looks slower than a warm `process`.

**Only clean files are cached.** A file that produced an error is not written into the cache, so it is reprocessed next time and its diagnostic is reported again. You never get a build that silently forgets a failure because the second run skipped the broken file.

Those two together mean the cache is only ever an optimization over work whose answer was known good.

## Watch mode

```shell
coldluau process --watch
```

Ctrl-C to stop. Three behaviors worth knowing.

**Rebuilds on change.** A save triggers a rebuild of what the epoch says needs rebuilding, which is usually just the file you saved.

**Mirrors deletions.** Deleting a source file prunes its output, so `dist/` never accumulates orphans that the derived Rojo project would still mount. Pruned outputs are counted:

```text
processed 127 file(s): 1 stale removed
```

**Keeps the last good output on a lex failure.** This is the one that makes watch mode usable next to a live rojo session. Mid keystroke, a file is routinely not valid Luau:

```luau
local Signal = require("@pkg/sig
```

If coldluau wrote that through, or wrote nothing, every downstream require of that module would start failing inside the running game, and you would watch a half typed save cascade errors through a session that was fine a second ago. Instead the previous good output for that file stays on disk until the file lexes again. rojo sees no change, the game keeps running, and you finish typing.

## Related

- [failure classes](/docs/concepts/failure-classes), why an errored file is never cached
- [Rojo integration](/docs/concepts/rojo-integration), the derived project watch mode keeps fresh
- [CLI reference](/docs/reference/cli), `process` and `check` flags
- [configuration](/docs/reference/configuration), the `[process]` table
