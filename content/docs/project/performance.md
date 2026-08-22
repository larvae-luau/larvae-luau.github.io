---
title: Performance
description: Matched comparisons against darklua and selene, the incremental columns, and the four reasons behind them
category: Project
order: 1
updated: 2026-08-21
---

Running the same 10 rules over the same tree, both tools cold, larvae is **14x faster** than darklua. With rules off on darklua's side it is 17x to 75x, but the matched number is the one worth quoting, and it is still measured while larvae does require rewriting that darklua is not doing at all.

## Methodology

16 cores, 7 runs per cell, median reported. larvae 0.1.0 against darklua 0.19.0. The single large module is 3,484,526 bytes.

Three workloads are timed, because a single number would hide what is being compared:

| workload | what runs |
|---|---|
| same rules | both tools run 10 matching rules with `retain-lines` |
| parse only | darklua runs no rules, larvae still rewrites every require |
| darklua default | darklua's default stack plus its dense generator |

On every row larvae is also resolving and rewriting requires, which darklua is not. darklua can convert requires from a rojo sourcemap, but that needs a separate rojo run, so it is left out rather than timed unfairly.

## Head to head, both cold

| Files | workload | larvae | darklua | speedup |
|---|---|---|---|---|
| 3,000 | parse only | 24 ms | 430 ms | 17.9x |
| 3,000 | same rules | 35 ms | 493 ms | 14.0x |
| 3,000 | darklua default | n/a | 571 ms | - |
| 5,000 | parse only | 40 ms | 703 ms | 17.5x |
| 5,000 | same rules | 57 ms | 799 ms | 14.0x |
| 5,000 | darklua default | n/a | 938 ms | - |
| 1 file, 3.5 MB | parse only | 16 ms | 1206 ms | 75.3x |
| 1 file, 3.5 MB | same rules | 140 ms | 1450 ms | 10.3x |
| 1 file, 3.5 MB | darklua default | n/a | 1605 ms | - |

**No speedup is claimed on the darklua default rows.** darklua's default stack is not mirrored rule for rule on larvae's side, so there is no matched workload to time against it. larvae now ships its own minifier, the `dense` generator tuned by `[minify]`, but these tables predate it, so a matched dense comparison waits for the published benchmark run. Those figures are there to show what darklua costs in the configuration most of its users actually run.

### The large file is the narrowest win

With rules on, one 3.5 MB module costs larvae 140 ms against 16 ms for require rewriting alone. A single enormous file gives the thread pool nothing to split, so the parallelism advantage disappears and the margin drops to 10.3x, the smallest in the table. It is the honest worst case and worth knowing before you assume the 75x figure generalises.

## Incremental, larvae only

darklua has no cache, so every darklua run is a cold run and these columns have no counterpart.

| Files | cold | warm | one edit | check |
|---|---|---|---|---|
| 3,000 | 24 ms | 14 ms | 13 ms | 21 ms |
| 5,000 | 40 ms | 22 ms | 22 ms | 37 ms |
| 1 file, 3.5 MB | 16 ms | 3 ms | 3 ms | 80 ms |

| column | what it measures |
|---|---|
| cold | a first build with an empty cache |
| warm | a rebuild with nothing changed |
| one edit | a rebuild after touching a single file |
| check | whole project require validation, parses every file |

A one file edit costs about what a fully warm run costs, which is the point of the cache. See [incremental builds](/docs/concepts/incremental-builds) for what the key covers.

### The one column that costs more

On the single large file, `check` at 80 ms is the only figure that costs more than a cold build at 16 ms. That is expected.

`check` is not a build. It is whole project require validation, and it parses every file rather than splicing byte ranges. One 3.5 MB module is its worst case, there is nothing to parallelize and nothing to skip. Read that column as parser throughput, roughly 44 MB/s.

## The linter, against selene

Holding both tools to the 30 lints that both implement, larvae is **5.5x to 5.9x faster** than selene. That is the number to quote, not the 279x below.

Two workloads are timed, for the same reason the darklua tables time three:

| workload | what runs |
|---|---|
| matched | both tools hold to the 30 lints that both implement, the head to head |
| defaults | each tool with what it enables: 63 lints for larvae, 33 for selene, what a user gets |

Holding a lint off is not free on either side, so a row cannot be faked by leaving one tool at its defaults: selene drops from 29 ms to 21 ms on 1,500 files when 15 lints go to `allow`.

`larvae lint` keeps no cache, so there is no cold and warm split here. Every run reads the whole tree.

16 cores, median of 7:

| Files | workload | larvae | selene | speedup |
|---|---|---|---|---|
| 3,000 | matched | 22 ms | 121 ms | 5.5x |
| 3,000 | defaults | 26 ms | 121 ms | 4.6x |
| 5,000 | matched | 34 ms | 201 ms | 5.9x |
| 5,000 | defaults | 37 ms | 202 ms | 5.4x |
| 1 file, 1 MB | matched | 48 ms | 13.4 s | 279x |

### Why the 279x row is not the headline

The last row is one module of about a megabyte, and it measures a scaling curve rather than a build. selene's cost per byte climbs with the size of a file: 278 ms at 124 KB, 1.0 s at 252 KB, 3.5 s at 510 KB, 18 s at 1 MB. Four times the bytes is sixty times the work. larvae stays linear over the same range, 10 ms to 117 ms. No project is one file, so read that row as parser throughput.

### What makes the comparison honest

**The matched set is computed, not written down.** larvae's half comes out of the schema larvae ships, so it cannot drift from the lints larvae has. selene has no command that prints its lints, and it ignores a name it does not know rather than refusing it, so a typo would leave a lint running on one side with nothing to say so. Its half is a list in the script, and a probe file checks that list on every run. A lint that selene reports and the list does not name stops the run.

**The tree avoids what the two tools read differently.** `if a > 0 then x end` on one line is such a case: selene calls it `multiple_statements` and larvae does not, because larvae compares statements within a block and the body there is a block of its own. Two of those per file had selene format several thousand more diagnostics than larvae, and the timings then compared reporting volume rather than analysis.

**Every tenth file carries a fault**, so the run measures the reporting path and not only a clean parse. Two of the faults are lints both tools have, and one is larvae's alone. The report prints the finding counts, and those counts are how a reader sees that the matched configs hold the other lints off instead of silently running everything:

| Files | larvae default | larvae matched | selene default | selene matched |
|---|---|---|---|---|
| 5,000 | 2,500 | 2,000 | 2,500 | 2,500 |

larvae reports 500 fewer under the matched set. That difference is `string_concat_in_loop`, which selene does not have.

### Two limits to state

**The matched row favours selene.** 30 of selene's 33 lints are in the shared set, so the row holds 3 of them off. It holds 19 of larvae's off. Most of the restriction lands on larvae, and larvae is still five times quicker, so treat the row as a floor on the gap.

**The tree is synthetic.** The files are generated, of even size, and free of the constructs the two tools disagree about. The result is a throughput measurement on clean code. It is not a survey of real Roblox source.

## Binary size

Both stripped:

| tool | size |
|---|---|
| larvae | 7,500 KB |
| darklua | 19,162 KB |

larvae's own machinery is 4,777 KB of that. The rest is [worms](/docs/worms/what-a-worm-is): roughly 1 MB of wasm interpreter and 1.7 MB of embedded Luau VM, shipped in the binary whether or not a project loads one. That is the price of a worm being a single artifact that runs everywhere instead of a per platform build matrix.

## Why it is faster

Four architectural reasons, not micro optimization.

### Parallelism

Files are processed in parallel with rayon. darklua is single threaded and has been since the parallelize issue was filed in 2021. On the 3,000 and 5,000 file workloads this is the largest single factor.

### Byte range splices

Rewrites are byte range splices into the original source. Untouched bytes are never re-printed. A file with two requires and ten thousand lines of untouched code costs about as much as the two requires.

This is also why the `retain-lines` generator is the default: output line numbers match input line numbers because the untouched bytes are literally the same bytes.

### An incremental cache

larvae caches clean files and skips them on rebuild. darklua has none. This is what produces the warm and one edit columns, and it is why watch mode stays responsive on a large tree.

The cache key includes a resolution epoch, so editing a `.luaurc` or the project file correctly invalidates files that did not themselves change.

### No double AST

darklua parses with full-moon, then converts the whole tree into its own node types. Every node is allocated twice, once by the parser and once by the converter, before any rule runs.

larvae does not do that conversion. `process` does not even build a full AST for the common case, which is why the `process` columns are so much cheaper than the `check` column.

## Reproducing it

Two scripts measure larvae against the tool it replaces. `scripts/bench_darklua.sh` compares `larvae process` against darklua, and `scripts/bench_selene.sh` compares the linter against selene. Each generates a synthetic tree, runs both tools over it, and prints the tables above with the median of 7 samples. `RUNS=15` raises the sample count, a number argument picks a size of your own, and the selene script runs larvae alone when selene is absent.

Numbers on your machine will differ, in particular the parallel columns scale with core count. The shape holds: the parse and print baseline is the floor darklua cannot go below, and larvae spends most of its time not parsing.

Published benchmarks on fixed hardware are **planned**, alongside the 1.0 semantics freeze. See the [roadmap](/docs/project/roadmap).

## Related

- [incremental builds](/docs/concepts/incremental-builds), what the cache keys on and when it rebuilds everything
- [what a worm costs](/docs/worms/what-a-worm-costs), the per node numbers for extensions
- [CLI reference](/docs/reference/cli), the difference between `process` and `check`
- [configuration](/docs/reference/configuration), `cache` and `generator` keys
