---
title: How a build runs with worms
description: Where a front-end sits, how passes work, and why a warm build calls no worm at all
category: Worms
order: 7
updated: 2026-08-16
---

Worms do not sit beside the pipeline, they sit inside it at defined points. This page is where those points are.

## The order of events

Once, before any file:

```text
worms load and validate          names, claims, capabilities
schema written                   <cache_dir>/larvae.schema.json, declarations merged in
```

Then every file, in parallel:

```text
read, and rename if claimed      App.mk becomes App.luau from the extension alone
cache check                      a fresh file stops here, its worm is never called
front-end                        claimed files become Luau, in memory
  ↓  one pass per distinct run_order, in order
lex, scan requires, resolve      the native slot, [process] run_order
parse                            only if an enabled rule needs a tree
rules                            builtin and worm rules in this slot
splice                           every edit measured against this pass's input
  ↓  re-lex if another pass follows
dist/                            written once, atomically
```

This is the `larvae process` walk. Format and lint are not passes in it: `larvae fmt` and `larvae lint` route a claimed file to its worm once per file, and the editor goes through the same code, so the terminal and the editor cannot disagree. See [using worms](/docs/worms/using-worms).

## Everything runs in parallel

Front-ends included. For the embedded forms there is one worm instance per worker: `mlua::Lua` is `!Send`, so a Luau worm cannot be moved into a worker at all, let alone shared between them. larvae keeps the artifacts and settings, which are shareable, and each worker builds its own instance the first time it meets a file that needs one. A worker that never does pays nothing.

A native worm is a separate process that larvae speaks to over a pipe. A pipe crossing costs about 24 µs, so rules cross as one batched message per file instead of per node. See [the node API](/docs/worms/node-api).

**A worm keeping state between files is undefined.** Which files a worker sees is decided by work stealing, so state that survives a file makes output depend on scheduling. A rule is handed its nodes and a context and nothing else, and that is the whole of what it should need. The [handle epoch](/docs/worms/node-api) turns the tempting version of this into an error rather than a silent bug.

## A front-end runs before anything parses

That is enforced by structure rather than convention: markup cannot reach a rule because a rule needs a node, a node needs a flattened tree, and a tree needs a parse that markup cannot survive.

**Nothing is written between stages.** There is no intermediate on disk and `dist` is never read back. A front-end's output replaces the buffer in memory, and a pass hands the next one a string rather than a file.

## Ordering and passes

One pass per distinct `run_order`. Everything sharing a value shares a pass and a splice, and when nobody declares one there is exactly one pass and ordering costs nothing. An extra pass costs a re-lex, and only the build that asks for it pays.

Within a pass nothing sees anything else's output, exactly as larvae's own rules have always worked. Across a pass boundary it does, which is the whole point of asking for an order. See [using worms](/docs/worms/using-worms) for how a run order is declared.

A useful side effect: two transforms wanting the same bytes is a warning today, and first by start position wins. Putting them in different passes makes it defined, since the second is then editing the first one's output rather than racing it.

## Caching

A claimed file is renamed from its extension alone, without asking the worm, so the cache is consulted **before** a front-end runs. A warm build calls no worm at all.

Measured on 40 markup files with a deliberately slow front-end:

| build | time |
|---|---|
| cold | 37 ms |
| warm | 2 ms |

Only the file you edited recompiles. That is what makes watch mode usable with a front-end in the pipeline. Without it, every save would recompile every markup file in the project.

**A worm is a cache input like any other.** Its artifact, its `[worms.<name>.config]` and its enabled rules all fold into the resolution epoch, so editing a worm invalidates everything it produced. Without that, changing a worm would leave every file it touched cached against the old version, and stale output is worse than slow output. A `path` worm is read fresh on every run for the same reason: it is the one under development.

See [incremental builds](/docs/concepts/incremental-builds) for what else the cache key covers.

## Related

- [using worms](/docs/worms/using-worms), declaring run order
- [node API](/docs/worms/node-api), why edits are deferred to the end of a pass
- [what a worm costs](/docs/worms/what-a-worm-costs), what a pass and a crossing actually cost
