---
title: What a worm is
description: larvae's extensions, three forms, four capabilities, and one contract from all of them
category: Worms
order: 1
updated: 2026-08-16
---

A worm is a larvae extension. You name it in `larvae.toml`, larvae fetches it from a GitHub release or crates.io or reads it from a directory, and it loads before any work starts.

If you only read one sentence: **a worm is a `worm.toml` beside one artifact, the artifact is Luau source, a `wasm32` module, or a native executable, and every form answers the same four capabilities.**

## Three forms

The manifest states the form, and the form is a trade the project makes.

| form | the artifact | the trade |
|---|---|---|
| `luau` | Luau source, run in an embedded VM | No toolchain. Sandboxed, with an instruction budget and a memory ceiling. |
| `wasm` | A `wasm32` module, run in an interpreter | One artifact for every platform. Sandboxed: it cannot read a file larvae did not give it. **The default recommendation.** |
| `native` | An ordinary executable, spoken to over a pipe | Native speed and **no sandbox**. Opt in, for code a project trusts. |

The first two forms are sandboxed, and that is a property of the runtime rather than a promise in a document. A native worm is an ordinary program running as you, so it is never the default: a project chooses it for code it trusts, because that is the only honest way to offer native speed.

A worm author **never** depends on `larvae` itself. larvae is the host. The guest side for Rust authors is the `larvae-worm` crate: `frontend!` and `rules!` for the wasm ABI, and a `native` module with a `Handler` trait and `serve()` for the pipe protocol. The wire types are the same on every transport, so a worm returns the same values whichever form ships.

## Four capabilities

Every form answers every capability. The manifest declares what the worm does, and larvae refuses a promise the artifact cannot answer.

| capability | declared by | what crosses |
|---|---|---|
| **Transform** | `[frontend] claims` | Source in, Luau out, with the line count kept. |
| **Format** | `[frontend] fmt = true` | A layout document, or the byte ranges that hold Luau. larvae renders with the project style and splices `host` spans through its own emitter. |
| **Lint** | `[lints]` | Findings without a severity, plus comment spans for suppression, plus an optional Luau shadow for the inherited lints. |
| **Rules** | `[rules]` | Tree edits. Per node on wasm and Luau. One batched message per file on native, where a pipe crossing costs about 24 µs. |

The division of labor does not move with the form. **A worm never decides a severity, never renders, and never writes a file.** The host stamps lint levels, applies `allow` comments, and owns exit codes, so `[lint.rules.<worm>]` and a `-- larvae: allow(...)` comment work on a worm's findings exactly as they work on builtin ones. Format and lint cross once per file on every transport.

## Ranges do not need exact ends

A format reply that names byte ranges does not have to place the range ends exactly. A worm draws the ranges from its own parse, and a worm that ends a range at the last token of a statement leaves the `;` that terminates the statement outside it.

larvae takes a `;` that sits just after a range into that range, and leaves a `;` that opens a range outside it. Both edges matter for the same reason: larvae formats each range as a chunk of its own and cannot see the text around it, so a `;` at an edge reads as a stray statement. The first edge would give a file where `semicolons` worked on some statements and not others. The second would give the ambiguous call syntax that Luau rejects. Neither edge needs the worm to change, because a contract that needs exact ends from every worm gives output in two styles as soon as one end is wrong.

## What a worm inherits

The short forms give a worm most of larvae for the cost of naming where the Luau is.

- **Formatting.** A format reply that names the Luau ranges and nothing else gets each range formatted in the project style, and every other byte kept as the author wrote it. See [formatting](/docs/reference/formatting).
- **Linting.** `inherit_lints = true` runs the 49 builtin lints on claimed files, against the Luau shadow the worm returns, or against its transform output when there is no shadow. The project narrows this with `[worms.<name>.inherit]`. See [linting](/docs/reference/linting).
- **Settings.** At init a worm receives the resolved `[fmt]` table and the lint levels, so it lays its own constructs out in the project style and the user states each setting one time.

## What worms cost you

Per file, the cost is measured rather than estimated, and it is small enough that the boundary matters more than the parse. See [what a worm costs](/docs/worms/what-a-worm-costs).

## Related

- [using worms](/docs/worms/using-worms), the `[worms]` table, install channels, and inheritance
- [writing a worm in Luau](/docs/worms/writing-in-luau), no toolchain, a file in your own repo
- [writing a worm in Rust](/docs/worms/writing-in-rust), the wasm macros and the native pipe
- [worm.toml](/docs/worms/worm-toml), the manifest beside the artifact
