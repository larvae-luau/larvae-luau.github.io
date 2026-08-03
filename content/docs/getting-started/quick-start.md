---
title: Quick start
description: From a Rojo project to native string requires in five minutes
category: Getting started
order: 2
updated: 2026-07-29
---

Three commands take an existing Rojo project from alias requires to Roblox native string requires. This page walks through all three, in order, on a project you already have.

## The whole path

```shell
cd my-rojo-project
larvae init        # writes larvae.toml, offers to update .gitignore
larvae process     # writes dist/ and .larvae/build.project.json
rojo serve .larvae/build.project.json
```

That is the entire loop. The rest of this page explains what each step did.

## Step 1, init

`larvae init` writes a starter `larvae.toml` in the current directory. It refuses to run if one already exists, so it will never overwrite your config.

Two things it does for you:

- Adds the `#:schema` line at the top, which is what gives Even Better TOML and Taplo completion and hover docs for every key
- Handles `.gitignore`. If one exists it appends the missing entries, if not it asks before creating one. The entries are `.larvae/` and `dist/`

### Zero config works

`init` is a convenience, not a requirement. A project with a `default.project.json` and `.luaurc` aliases needs no `larvae.toml` at all. `larvae process` discovers `.luau` and `.lua` files under `src`, honors the `.luaurc` aliases it finds, and rewrites to native string requires.

Reach for `larvae.toml` when you want something the defaults do not give you, ex: a DataModel alias target like `@game/ReplicatedStorage/Packages`, which `.luaurc` cannot express. See the [configuration reference](/docs/reference/configuration) for the full key list.

## Step 2, process

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

## Step 3, point rojo at the derived project

```shell
rojo serve .larvae/build.project.json
```

**larvae never runs rojo.** It keeps `.larvae/build.project.json` fresh and you point rojo at it. This is deliberate, serving is rojo's job and larvae stops at writing files.

There is no `larvae serve` and no `larvae build`. Every rojo command you already use works here, just aimed at the derived project file instead of the source one.

## Next steps

- Add `larvae check` to CI. Same analysis as `process`, writes nothing, exits non zero on errors, and reports syntax errors too
- Read the [CLI reference](/docs/reference/cli) for every command and flag
- Read the [configuration reference](/docs/reference/configuration) when the defaults stop fitting. Unknown keys are hard errors, and keys for planned features error at load time naming the milestone they land in, ex: `[bundle] is not implemented yet (lands in M3)`
