---
title: Roadmap
description: What is coming in M2, M3, and M4, and the gaps we know about
category: Project
order: 3
updated: 2026-07-30
---

Where coldluau is going, so you can tell whether to adopt now or wait.

> **Nothing on this page is usable yet.** Every item below is unimplemented. Config keys for planned features are hard errors at load time, and the error names the milestone the feature lands in, ex: `[bundle] is not implemented yet (lands in M3)`. Nothing is silently ignored, so a config written against this page will fail loudly rather than build something wrong.

For what does work today, see [configuration](/docs/reference/configuration) and [rules](/docs/reference/rules).

## Next up (M2)

The biggest release. It closes the darklua parity gap and unblocks most of the rule surface.

### Instance requires as input

The darklua migration path. Converts `require(script.Parent.Foo)` into string requires. darklua has had this open as a request since 2024.

This is the single item that decides adoption for existing darklua codebases. See [migrating from darklua](/docs/project/migrating-from-darklua).

### Scope tracking

A binding table that knows which `x` refers to which declaration. It unblocks the last two darklua rule names, `rename_variables` and `remove_unused_variable`, which cannot ship safely without it. It also lets `const_requires` and `freeze_module` drop the conservative guards they carry today. See [rules](/docs/reference/rules).

### `[defines]`

Compile time constants that constant fold, so `if __DEV__ then ... end` disappears entirely in release builds. This is where darklua's `inject_global_value` goes.

### Build profiles

`--profile release` overlays config per environment through `[profile.<name>]` tables. One source tree building for both Roblox and Lune.

### `[requires.overrides]`

Per glob targets, so one project can mix native string requires with instance requires for its early replication code. Useful because native string requires have no wait semantics, see [require targets](/docs/concepts/require-targets).

### Sourcemap support

Sharper DataModel mapping when the project file rearranges the tree.

### Dense and readable generators

Two more output printers alongside today's `retain-lines`. `dense` is where darklua's `remove_spaces` goes.

### Wally and npmluau walkthroughs

Plus multiple input roots.

## After that (M3)

### Bundling

Everything into one file, with deterministic and documented module init order, including cycles. darklua explicitly does not guarantee require side effect ordering. Configured through `[bundle]`.

### Cross module dead code elimination

Using the require graph. Possible because coldluau already resolves every require target.

### Luau extensions

Write your own transforms in Luau and they run inside the same traversal as builtin rules. No forking required. Configured through `[[extensions]]`.

### `check` as a full CI gate

Require cycles, unused modules, early require warnings, and the realm diagnostics as first class checks. Configured through `[check]`.

## Later (M4)

- Minifier with a trace map, so crash reports stay readable. Configured through `[minify]`
- Published benchmarks and a 1.0 semantics freeze

## Rules being considered beyond darklua parity

Not scheduled, listed because they show the direction:

- `remove_calls`, one rule covering print, warn, assert and profiling
- `use_get_service`, `game.ReplicatedStorage` becomes `game:GetService("ReplicatedStorage")`
- `dedupe_requires`
- `inject_module_path`
- `freeze_module`

The pattern is that all of these lean on things coldluau knows and darklua does not: resolved require targets and the DataModel map. They are not rules darklua could add.

## Known gaps

Things that are true today and worth knowing before you hit them.

### No differential testing against the official parser

coldluau's parser has not been differentially tested against the official Luau C++ parser yet. New Luau syntax could surface as a false syntax error in `check`.

`process` is unaffected, it does not parse. So a build keeps working even if `check` reports a syntax error it should not.

### Unix PATH is manual

`coldluau self install` prints the `export` line for your shell profile rather than editing it, since editing a shell profile unasked is rude. Windows needs no such step, the user Path is written for you. See [CLI reference](/docs/reference/cli).

### Generic type arguments followed by `=`

A generic type argument list immediately followed by `=` needs a space:

```luau
type X<T>= number   -- error, >= lexes as one operator
type X<T> = number  -- fine
```

`>=` lexes as a single operator, so the closing angle bracket is consumed. The error message says so.

## Related

- [performance](/docs/project/performance), where the M4 published benchmarks fit
- [migrating from darklua](/docs/project/migrating-from-darklua), what the M2 Instance require work unblocks
- [incremental builds](/docs/concepts/incremental-builds), how the cache works today
