---
title: Performance
description: Real numbers from scripts/bench.sh, and the four architectural reasons behind them
category: Project
order: 1
updated: 2026-07-30
---

coldluau is roughly 17x faster than darklua on a normal project and roughly 74x faster on a single large file. These numbers come from `scripts/bench.sh` in the repo, and the comparison is deliberately stacked against coldluau.

## Methodology

The baseline is darklua 0.19 configured with an empty rule list and the `retain_lines` generator. That means darklua only parses and reprints. coldluau in the same run does full alias expansion, require resolution, validation and rewriting, so it is doing strictly more work.

Every figure is the mean of 5 runs. The single large module is 3,484,526 bytes.

## Numbers

| Workload | cold | warm | one edit | check | darklua | speedup |
|---|---|---|---|---|---|---|
| 3,000 files | 24 ms | 12 ms | 13 ms | 20 ms | 411 ms | 17.1x |
| 5,000 files | 38 ms | 22 ms | 21 ms | 30 ms | 672 ms | 17.6x |
| 1 file, 3.5 MB | 16 ms | 3 ms | 2 ms | 75 ms | 1191 ms | 74.4x |

### What each column means

No number here is ambiguous, so here is every column spelled out:

| column | what it measures |
|---|---|
| cold | a first build with an empty cache |
| warm | a rebuild with nothing changed |
| one edit | a rebuild after touching a single file |
| check | whole project require validation, parses every file |
| darklua | parse and print with every rule off |
| speedup | cold against darklua |

The warm and one edit columns have no darklua counterpart. darklua has no incremental cache, so every darklua run is a cold run. See [incremental builds](/docs/concepts/incremental-builds) for how the cache decides what to skip.

### The one column that costs more

On the single large file, `check` at 75 ms is the only figure that costs more than a cold build at 16 ms. That is expected and worth stating plainly.

`check` is not a build. It is whole project require validation, and it parses every file rather than splicing byte ranges. One 3.5 MB module is its worst case: there is nothing to parallelize and nothing to skip. Even then it still comes in about 16x under darklua on the same input.

Read the `check` column as parser throughput, roughly 45 MB/s on the single large file.

## Why it is faster

Four architectural reasons, not micro optimization.

### Parallelism

Files are processed in parallel with rayon. darklua is single threaded and has been since the parallelize issue was filed in 2021. On the 3,000 and 5,000 file workloads this is the largest single factor.

### Byte range splices

Rewrites are byte range splices into the original source. Untouched bytes are never re-printed. A file with two requires and ten thousand lines of untouched code costs about as much as the two requires.

This is also why the `retain_lines` generator is the default: output line numbers match input line numbers because the untouched bytes are literally the same bytes.

### An incremental cache

coldluau caches clean files and skips them on rebuild. darklua has none. This is what produces the warm and one edit columns, and it is why watch mode stays responsive on a large tree.

The cache key includes a resolution epoch, so editing a `.luaurc` or the project file correctly invalidates files that did not themselves change.

### No double AST

darklua parses with full-moon, then converts the whole tree into its own node types. Every node is allocated twice, once by the parser and once by the converter, before any rule runs.

coldluau does not do that conversion. `process` does not even build a full AST for the common case, which is why the `process` columns are so much cheaper than the `check` column.

## Reproducing it

The benchmark script lives at `scripts/bench.sh`. It generates the synthetic workloads, runs both tools 5 times each, and prints the table above.

Numbers on your machine will differ, in particular the parallel columns scale with core count. The shape holds: the parse and print baseline is the floor darklua cannot go below, and coldluau spends most of its time not parsing.

Published benchmarks on fixed hardware are **planned (M4)**, alongside the 1.0 semantics freeze. See the [roadmap](/docs/project/roadmap).

## Related

- [incremental builds](/docs/concepts/incremental-builds), what the cache keys on and when it rebuilds everything
- [CLI reference](/docs/reference/cli), the difference between `process` and `check`
- [configuration](/docs/reference/configuration), `cache` and `generator` keys
