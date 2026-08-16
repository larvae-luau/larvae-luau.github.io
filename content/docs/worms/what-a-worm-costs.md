---
title: What a worm costs
description: Measured per node crossing, why the boundary dominates, and how each of the three forms pays
category: Worms
order: 8
updated: 2026-08-16
---

Measured rather than estimated, on a 120 line file with 120 matching nodes, release build. Reproduce with:

```shell
cargo test --release --test worm_cost -- --ignored --nocapture
```

| | per file | per node crossing |
|---|---:|---:|
| parse only | 0.051 ms | |
| flattening the tree | 0.014 ms | |
| a Luau rule, total | 0.212 ms | **~1.2 µs** |
| a wasm rule, total | 0.890 ms | **~6.9 µs** |

Totals include lex, parse and flatten, so the crossing cost is the difference.

Four things follow, and they are the practical advice for a worm author.

## The boundary dominates, not the parse

Crossings cost three times the parse for Luau and sixteen times for wasm. If a rule is slow, it is almost never because larvae parsed the file.

## A Luau rule is about six times cheaper per crossing than a wasm one

That inverts what most people assume, since wasm is the compiled form. It is the interpreter tax landing on the boundary rather than on your logic.

- **many small node visits** goes in [Luau](/docs/worms/writing-in-luau)
- **heavy compute behind few crossings** goes in [wasm](/docs/worms/writing-in-rust)

A front-end is the second shape by definition, one call per file, which is why wasm suits a compiler and Luau suits a tidy up rule.

## Native pays per file, not per node

A pipe crossing costs about **24 µs**, twenty times a Luau node crossing, so a native rule visiting the 120 nodes above per node would spend around 2.9 ms on the boundary alone. That is why native rules cross as **one batched message per file**: one crossing carries every matched node and the source, and the rule's own logic then runs at native speed. See [the node API](/docs/worms/node-api) for what the batched message holds.

Format and lint cross once per file on every transport, so the form barely moves what they cost. The rules capability is where the form matters.

## `filter` is the cost lever, and it is linear

Halve what a rule matches and you halve what it costs. 120 matching nodes in a 120 line file is an aggressive filter, most rules want far less. A file with no matching kinds at all skips flattening and dispatch entirely, and on native the filter also decides what lands in the batched message.

`filter` is declared per rule in [`worm.toml`](/docs/worms/worm-toml).

## At project scale

At 3000 files, Luau rules are around 80 ms of work and wasm rules around 330 ms, spread across cores.

Both are real, and both are why enabling a worm rule is a choice rather than a default. For comparison, a cold 3000 file build with larvae's own rules is 35 ms, see [performance](/docs/project/performance).

A warm build calls no worm at all, so these are cold numbers. See [how a build runs](/docs/worms/build-pipeline).

## Binary size

Worms take the larvae binary from 4.7 MB to 7.5 MB, roughly 1 MB for the wasm interpreter and 1.7 MB for the embedded Luau VM. That is paid whether or not your project loads a worm, and larvae is still well under half darklua's 19.2 MB. A native worm is its own binary and adds nothing to larvae's.

## Related

- [performance](/docs/project/performance), larvae's own numbers against darklua
- [node API](/docs/worms/node-api), what a crossing actually is
- [how a build runs](/docs/worms/build-pipeline), passes, parallelism and the cache
