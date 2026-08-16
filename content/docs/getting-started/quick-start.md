---
title: Quick start
description: Format, lint, and go from a Rojo project to native string requires in five minutes
category: Getting started
order: 2
updated: 2026-08-16
---

A handful of commands take an existing Rojo project from alias requires to Roblox native string requires, with formatting and linting along the way. This page walks through them, in order, on a project you already have.

## The whole path

```shell
cd my-rojo-project
larvae fmt         # formats in place, works with no config
larvae lint        # reports suspicious code, works with no config
larvae init        # writes larvae.toml, offers to update .gitignore
larvae process     # writes dist/ and .larvae/build.project.json
rojo serve .larvae/build.project.json
```

That is the entire loop. The rest of this page explains what each step did.

## Step 1, format and lint

`larvae fmt` and `larvae lint` need no config at all. Not "sensible defaults you should tweak later", they run on a bare directory with no `larvae.toml`, no `stylua.toml`, and no `selene.toml` in sight.

```shell
larvae fmt
larvae lint
```

`fmt` formats files in place. `fmt --check` writes nothing and fails when it finds a difference, which is the form CI wants. `lint` prints findings, and `lint --explain <name>` describes what one lint reports and why.

If the project already has a `stylua.toml` or a `selene.toml`, larvae reads it as it is, so the output does not change because you changed tools. Every option is documented in [formatting](/docs/reference/formatting) and [linting](/docs/reference/linting).

## Step 2, init

`larvae init` writes a starter `larvae.toml` in the current directory. It refuses to run if one already exists, so it will never overwrite your config.

What it writes:

- `[process]` with the input directories it detected, and `[requires]`
- `[fmt]` and `[lint]` with every option and every lint at its default, as comments. Both lists are generated from the code, so they cannot drift from it. The reason for writing them at all: a config is also the place where you discover that an option exists
- When the project already has a `stylua.toml` or a `selene.toml`, a note pointing at that file instead of keys, because written defaults would silently override settings the project already made

It also offers to add `.larvae/` and `dist/` to `.gitignore`.

Completion and hover docs for the file come from `larvae self code`, a separate one time step covered in [editor setup](/docs/concepts/editor-setup).

### How it picks the input

A Rojo project mounts `src/client`, `src/server` and `src/shared` as separate paths. `init` folds siblings into the directory that holds them and writes `input = "src"`. One root per mount is noisy, and it also skips a file you add under `src` and have not mounted yet. The fold stops at a real shared parent, so unrelated roots such as `src` and `assets` stay separate.

A package directory never becomes an input. `init` reads every component of the path, so `packages/roblox` is a package tree even though its last component is `roblox`, and it becomes the `@pkg` alias instead. Aliases that `.luaurc` already defines are not repeated, because larvae reads them directly and the two files would hold the same fact in two spellings.

### It turns Luau's own lints off

`init` writes `"lint": { "*": false }` into `.luaurc`.

The reason is that both linters report the same defects. The Luau compiler ships 28 lints, and larvae covers all 28, so with both on each finding arrives twice: once from luau-lsp in the editor, once from `larvae lint` in CI. The two use different names, and each needs its own comment to silence one finding. The `*` covers every rule, including a rule that a later Luau adds.

Three promises about the edit, because you are about to let a tool write your file:

- The edit is textual, it does not parse the file and write it again, so every other byte survives, comments included. `.luaurc` belongs to another tool and holds the aliases of your project
- It changes nothing when the file already sets `lint`, because that is a project with an opinion
- It creates no `.luaurc` when the project has none

### Zero config works

`init` is a convenience, not a requirement. A project with a `default.project.json` and `.luaurc` aliases needs no `larvae.toml` at all. `larvae process` discovers `.luau` and `.lua` files under `src`, honors the `.luaurc` aliases it finds, and rewrites to native string requires. `fmt` and `lint` need even less, as above.

Reach for `larvae.toml` when you want something the defaults do not give you, ex: a DataModel alias target like `@game/ReplicatedStorage/Packages`, which `.luaurc` cannot express. See the [configuration reference](/docs/reference/configuration) for the full key list.

## Step 3, process

`larvae process` reads your input tree, rewrites every require it can resolve, and writes the result to `dist/`.

```shell
larvae process
```

A require you wrote as an alias:

```luau
local Signal = require("@pkg/signal")
```

comes out the other side as a native string require:

```luau
local Signal = require("@game/ReplicatedStorage/Packages/signal")
```

`roblox-string` is the default output target. `path` and `roblox-instance` are also available, covered in [require targets](/docs/concepts/require-targets).

### Reading the summary

```text
processed 128 file(s): 84 require(s) rewritten, 2 dynamic require(s) left untouched, 3 copied
derived build project: .larvae/build.project.json
```

The counts that only appear when they are non zero:

| count | meaning |
|---|---|
| `N copied` | non code files passed through unchanged |
| `N unchanged` | skipped via the cache |
| `N stale removed` | outputs whose source was deleted |

Dynamic requires like `require(path)` are left alone on purpose, larvae cannot know what they resolve to.

The second line is the derived Rojo project. larvae takes your `default.project.json`, rewrites every `$path` under the input tree to point at the output tree, and writes the result to `.larvae/build.project.json`. You keep one project file by hand instead of a hand synced pair. See [Rojo integration](/docs/concepts/rojo-integration).

### Rebuild on change

```shell
larvae process --watch
```

Watch mode rebuilds on save, prunes outputs whose source was deleted, and keeps the last good output when a file fails to lex, so a half typed save does not cascade require failures. Repeat runs are fast because clean files are cached, see [incremental builds](/docs/concepts/incremental-builds).

## Step 4, point rojo at the derived project

```shell
rojo serve .larvae/build.project.json
```

**larvae never runs rojo.** It keeps `.larvae/build.project.json` fresh and you point rojo at it. This is deliberate, serving is rojo's job and larvae stops at writing files.

There is no `larvae serve` and no `larvae build`. Every rojo command you already use works here, just aimed at the derived project file instead of the source one.

## Next steps

- Add `larvae check` and `larvae fmt --check` to CI. `check` runs the same analysis as `process` plus the whole project checks, writes nothing, and exits non zero on errors
- Read the [CLI reference](/docs/reference/cli) for every command and flag
- Read [formatting](/docs/reference/formatting) and [linting](/docs/reference/linting) when a default stops fitting
- Read the [configuration reference](/docs/reference/configuration) for the rest of `larvae.toml`. Unknown keys there are hard errors, so a typo fails loudly instead of silently doing nothing
