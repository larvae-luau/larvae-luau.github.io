---
title: Source layout
description: Where each decision lives in the CLI repo, for contributors reading the code
category: Project
order: 4
updated: 2026-08-19
---

This page is for contributors reading the CLI repo. A reader looking for where something happens should not have to open a two thousand line file to find out it is somewhere else. The two areas that grew past that size are split, and each split follows a line the code already had.

## The formatter, `crates/larvae/src/fmt/emit/`

| file | what decides here |
|---|---|
| `mod.rs` | The emitter, the token layer, and comments. |
| `blocks.rs` | What goes between two statements: blank lines, and the require sort. |
| `stmt.rs` | One statement. |
| `expr.rs` | An expression, and a string literal. |
| `calls.rs` | A call and its arguments, which is where `call_parentheses` lives. |
| `tables.rs` | A table constructor, and the magic trailing comma. |

## The worm host, `crates/larvae/src/worm/`

| file | what decides here |
|---|---|
| `mod.rs` | The worm itself, and the dispatch to its form. |
| `luau/`, `host.rs`, `native.rs` | The three forms. `host.rs` is wasm. |
| `proto/mod.rs` | The shapes that cross a worm boundary. |
| `proto/render.rs` | Turning a layout a worm sent into text. |
| `proto/regions.rs` | Writing the source back over a `fmt off` region. |
| `registry/` | Loading the worms a project names, and resolving what they receive. |
| `known.rs`, `version.rs` | The short name list, and what a version asks for. |
| `fetch.rs`, `pool.rs` | Installing, and the instance a worker holds. |

What a worm is and how the three forms differ is covered in [what a worm is](/docs/worms/what-a-worm-is).

## The worm command, `crates/larvae/src/commands/worm/`

`manage.rs` is `add`, `install`, and `remove`, the three that touch `larvae.toml` and the cache. `develop.rs` is `run`, `info`, and `types`, the three a worm author uses before anything is published, and they need no project.

## Where the tests sit

A test file sits beside the code it exercises where the tests grew past the code, which is `luau/tests.rs` and `registry/tests.rs`. Everywhere else the tests stay at the bottom of the file.
