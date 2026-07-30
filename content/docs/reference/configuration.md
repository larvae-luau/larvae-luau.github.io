---
title: Configuration
description: Every coldluau.toml key, its default, and what it does
category: Reference
order: 2
updated: 2026-07-29
---

Configuration lives in `coldluau.toml` next to your Rojo project. Two facts come first, because they shape everything else on this page.

## Every key is optional

There is no required key and no required table. A project with a `default.project.json` and `.luaurc` aliases needs no `coldluau.toml` at all: `coldluau process` discovers `.luau` and `.lua` files under `src`, honors the `.luaurc` aliases it finds, and rewrites to native string requires. Every table below exists to override a default, never to satisfy one.

## Unknown keys are hard errors

coldluau refuses to load a config it does not fully understand. An unknown key fails at load time rather than being skipped. Keys for planned features fail too, and the error names the milestone they land in:

```text
[bundle] is not implemented yet (lands in M3)
```

Nothing is silently ignored. This is deliberate. A typo in a key name, or a config copied from a future version of the docs, should tell you it is not doing anything rather than quietly producing a build that does not match what you wrote.

## Editor support

The canonical annotated config is `coldluau.example.toml`, and `coldluau.schema.json` is the JSON Schema behind editor completion. Both ship with the tool.

The `#:schema` line at the top of `coldluau.toml` points editors at that schema, which is what gives you completion and hover docs in Even Better TOML or Taplo. `coldluau init` writes the line for you, and `coldluau schema` adds or refreshes it on an existing file.

## Tables

### `[aliases]`

The headline feature, and entirely optional. Entries here merge over `.luaurc` per key, so you can keep most aliases in `.luaurc` and override or extend individual ones here.

```toml
[aliases]
pkg = "@game/ReplicatedStorage/Packages"   # a DataModel path
utils = "./src/shared/utils"               # a filesystem path
```

Two value kinds are accepted:

| kind | example | what it names |
|---|---|---|
| DataModel path | `"@game/ReplicatedStorage/Packages"` | a location in the running DataModel |
| filesystem path | `"./src/shared/utils"` | a directory on disk |

Both exist because `.luaurc` can only express filesystem paths. A DataModel target like `@game/ReplicatedStorage/Packages` has nowhere to live except `coldluau.toml`.

Rules for alias names:

- Case insensitive, so `pkg` and `Pkg` are the same alias
- Allowed characters are letters, digits, dot, underscore, and dash
- `@self` and `@game` are reserved and cannot be redefined

Aliases may point at other aliases. Chains resolve, and cycles are detected and reported as errors rather than hanging or resolving to something arbitrary.

Keeping aliases in `.luaurc` is also what gives luau-lsp go to definition on `require("@pkg/thing")`, since `.luaurc` is the file the language server reads.

### `[process]`

Controls what is read, what is written, and how it is printed.

| key | default | meaning |
|---|---|---|
| `input` | `"src"` | root scanned for source files |
| `output` | `"dist"` | mirror of input with transforms applied |
| `include` | `["**/*.luau", "**/*.lua"]` | globs relative to input |
| `exclude` | `[]` | globs skipped entirely, not even copied |
| `generator` | `"retain-lines"` | output printer, `dense` and `readable` are **planned (M2)** |
| `quotes` | `"preserve"` | `preserve`, `double`, or `single` |
| `cache` | `true` | incremental builds |
| `cache_dir` | `".coldluau"` | cache and derived project location |

```toml
[process]
input = "src"
output = "dist"
quotes = "double"
```

Only `retain-lines` is available today. Setting `generator = "dense"` or `generator = "readable"` is an error until M2.

#### `quotes`

`quotes` requotes **every** require string in the output. That includes rewritten requires, untouched pass throughs, and the strings inside generated Instance expressions. `preserve` keeps whatever the source used, which is the default.

```toml
[process]
quotes = "double"
```

#### Copy through for non matching files

Files under `input` that do not match `include` are **copied through unchanged**. So json, txt, and model files land in `output` alongside the transformed Luau, and the derived Rojo project stays self consistent. These files show up in the `N copied` count on the `process` summary.

`exclude` is the stronger option: an excluded path is skipped entirely and not even copied.

### `[requires]`

Controls what the rewritten requires look like.

| key | default | meaning |
|---|---|---|
| `target` | `"roblox-string"` | `roblox-string`, `path`, or `roblox-instance` |
| `indexing_style` | `"find_first_child"` | instance target only |
| `mounts` | derived from the Rojo project | filesystem to DataModel map |
| `strict` | `false` | upgrade warnings to errors |
| `sourcemap` | none | **planned (M2)** |
| `overrides` | none | **planned (M2)**, per glob target |

The three targets each get a full treatment on [require targets](/docs/concepts/require-targets), including the caveat that native string requires have no wait semantics.

`mounts` is rarely written by hand, because parsing your Rojo project gives coldluau the filesystem to DataModel map for free, see [Rojo integration](/docs/concepts/rojo-integration).

`strict = true` promotes the warning class into errors, see [failure classes](/docs/concepts/failure-classes) for exactly which diagnostics move.

`sourcemap` and `overrides` are not usable yet. Both are hard errors today and land in M2.

#### `indexing_style`

Applies only when `target = "roblox-instance"`. All three values are shipped.

| value | emits |
|---|---|
| `find_first_child` | `script.Parent:FindFirstChild("Foo")` |
| `wait_for_child` | `script.Parent:WaitForChild("Foo")` |
| `property` | `script.Parent.Foo`, falls back to `["name"]` when the name is not an identifier |

```toml
[requires]
target = "roblox-instance"
indexing_style = "wait_for_child"
```

Kebab spellings work too, so `find-first-child`, `wait-for-child`, and `property-instance` are accepted as aliases for the three values above. Note the kebab spelling of `property` is `property-instance`.

### `[rojo]`

Points coldluau at your project file and says where the derived one goes.

| key | default | meaning |
|---|---|---|
| `project` | `"default.project.json"` | source of truth project file |
| `build_project` | `<cache_dir>/build.project.json` | where the derived project is written |

```toml
[rojo]
project = "default.project.json"
```

`project` is the key to set when a repository holds several project files, since coldluau needs to know which one is the source of truth. The derived project is what you hand to rojo, coldluau never runs rojo itself. See [Rojo integration](/docs/concepts/rojo-integration).

### `[rules]`

Transforms applied to each output file. Three rules ship today, twenty seven more are **planned (M2)**, and every darklua rule name is accepted so that a `.darklua.json` rule list ports over unchanged.

```toml
[rules]
const_requires = true
remove_comments = { except = ["^--!"] }
add_luau_directive = "strict"
```

Full documentation for each rule, its options, and its before and after Luau lives on [rules](/docs/reference/rules).

## Planned tables, all hard errors today

None of these are usable. Each errors at load time naming its milestone.

| table | status |
|---|---|
| `[defines]` | **planned (M2)** |
| `[profile.<name>]` | **planned (M2)** |
| `[[extensions]]` | **planned (M3)** |
| `[bundle]` | **planned (M3)** |
| `[check]` | **planned (M3)** |
| `[minify]` | **planned (M4)** |

If you are porting a darklua config, `inject_global_value` maps onto `[defines]`, which means that part of the port has to wait for M2. See [migrating from darklua](/docs/project/migrating-from-darklua).

## Related pages

- [CLI reference](/docs/reference/cli) for the commands that read this file
- [rules](/docs/reference/rules) for `[rules]` in full
- [require targets](/docs/concepts/require-targets) for `[requires].target`
- [incremental builds](/docs/concepts/incremental-builds) for `cache` and `cache_dir`
