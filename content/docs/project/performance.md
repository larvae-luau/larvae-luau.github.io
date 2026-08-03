---
title: Performance
description: Matched comparisons against darklua, the incremental columns, and the four reasons behind them
category: Project
order: 1
updated: 2026-07-30
---

Running the same 10 rules over the same tree, both tools cold, larvae is **14x faster** than darklua. With rules off on darklua's side it is 17x to 75x, but the matched number is the one worth quoting, and it is still measured while larvae does require rewriting that darklua is not doing at all.

## Methodology

16 cores, 7 runs per cell, median reported. larvae 0.1.0 against darklua 0.19.0. The single large module is 3,484,526 bytes.

Three workloads are timed, because a single number would hide what is being compared:

| workload | what runs |
|---|---|
| same rules | both tools run 10 matching rules with `retain_lines` |
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

**No speedup is claimed on the darklua default rows.** larvae has neither that rule set nor a dense generator yet, so there is nothing to compare against. Those figures are there to show what darklua costs in the configuration most of its users actually run.

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

## Binary size

Both stripped:

| tool | size |
|---|---|
| larvae | 4,777 KB |
| darklua | 19,162 KB |

## Why it is faster

Four architectural reasons, not micro optimization.

### Parallelism

Files are processed in parallel with rayon. darklua is single threaded and has been since the parallelize issue was filed in 2021. On the 3,000 and 5,000 file workloads this is the largest single factor.

### Byte range splices

Rewrites are byte range splices into the original source. Untouched bytes are never re-printed. A file with two requires and ten thousand lines of untouched code costs about as much as the two requires.

This is also why the `retain_lines` generator is the default: output line numbers match input line numbers because the untouched bytes are literally the same bytes.

### An incremental cache

larvae caches clean files and skips them on rebuild. darklua has none. This is what produces the warm and one edit columns, and it is why watch mode stays responsive on a large tree.

The cache key includes a resolution epoch, so editing a `.luaurc` or the project file correctly invalidates files that did not themselves change.

### No double AST

darklua parses with full-moon, then converts the whole tree into its own node types. Every node is allocated twice, once by the parser and once by the converter, before any rule runs.

larvae does not do that conversion. `process` does not even build a full AST for the common case, which is why the `process` columns are so much cheaper than the `check` column.

## Reproducing it

The benchmark script lives at `scripts/bench.sh`. It generates the synthetic workloads, runs both tools 7 times per cell, and prints the tables above with the median.

Numbers on your machine will differ, in particular the parallel columns scale with core count. The shape holds: the parse and print baseline is the floor darklua cannot go below, and larvae spends most of its time not parsing.

Published benchmarks on fixed hardware are **planned (M4)**, alongside the 1.0 semantics freeze. See the [roadmap](/docs/project/roadmap).

## Related

- [incremental builds](/docs/concepts/incremental-builds), what the cache keys on and when it rebuilds everything
- [CLI reference](/docs/reference/cli), the difference between `process` and `check`
- [configuration](/docs/reference/configuration), `cache` and `generator` keys
