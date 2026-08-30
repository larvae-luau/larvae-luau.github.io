---
title: Roadmap
description: What is still ahead, published benchmarks, a 1.0 freeze, and four worm gaps
category: Project
order: 3
updated: 2026-08-30
---

Where larvae is going, so you can tell whether to adopt now or wait.

The old milestones on this page have shipped. larvae now formats (`larvae fmt`), lints (`larvae lint`), bundles (`larvae bundle` and `[bundle]`), minifies (`generator = "dense"` and `[minify]`), serves an editor with Luau's own analyzer inside (`larvae-lsp`, at parity with luau-lsp), gates CI through `[check]`, reads and emits instance requires, overlays config per environment with `[profile.<name>]`, and loads [worms](/docs/worms/what-a-worm-is), whose hooks reach the editor too. For what works today, see [configuration](/docs/reference/configuration), [rules](/docs/reference/rules), and the [CLI reference](/docs/reference/cli).

What remains is short, and this page lists all of it.

## Published benchmarks and the 1.0 freeze

The numbers on the [performance](/docs/project/performance) page are reproducible with `scripts/bench.sh`, but they were measured on a development machine. Published benchmarks on fixed hardware are planned, so the quoted figures stop depending on whose laptop ran them.

Alongside them, a 1.0 release freezes semantics: what each rule does to a file stops changing except by a new option. Until then a minor release may tighten a rule's guards, which can change output bytes.

## Worms, the parts that are not built

[Worms](/docs/worms/what-a-worm-is) ship today, in their Luau, wasm, and native forms. Four things about them do not.

### The raw transform role

Text in and edits out, with none of the guarantees the rule role carries. Designed and not built. A worm today is a front-end, a set of rules, or both.

### Requires emitted by a late rule

A rule emitting a require that was not in the source is only resolved if that worm runs `"before"`. larvae does not schedule an extra resolution pass after a worm that runs late, so a rule generating requires should ask for `"before"` today. See [using worms](/docs/worms/using-worms).

### Tier two edits

Where a worm synthesizes structure rather than splicing bytes. Not built, so a worm today edits what is already there.

### An `api` compatibility window

`api` in `worm.toml` is exact equality today, so a worm built against `api = 1` is rejected by a host speaking `api = 2`. Whether a window is accepted instead is undecided.

## Related

- [what a worm is](/docs/worms/what-a-worm-is), the extension system the four gaps live in
- [performance](/docs/project/performance), the numbers the published benchmarks will pin down
- [migrating from darklua](/docs/project/migrating-from-darklua), the migration path, no longer blocked on anything here
- [incremental builds](/docs/concepts/incremental-builds), how the cache works today
