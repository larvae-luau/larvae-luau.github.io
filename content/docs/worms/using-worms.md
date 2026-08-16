---
title: Using worms
description: The [worms] table, three install channels, run order, inheritance, and where a worm's settings live
category: Worms
order: 2
updated: 2026-08-16
---

One table per worm under `[worms]`. The key is the worm's name, and everything the worm adds to the project hangs off that key.

```toml
[worms]
xml = "luau-xml/worm@0.1.0"          # short form: owner/repo@version
vide = { cargo = "vide-worm@0.2.0" } # a crate on crates.io, built on this machine

[worms.markup]
repo = "someone/markup-worm"         # or path = "build/myworm", never both
version = "2.1.0"
asset = "markup-worm.zip"            # optional, see asset resolution below
run_order = "before"                 # or "after", or a slot number
rules = { tidy = true }              # this worm's rules, under its own names
inherit_lints = true                 # run larvae's own lints on the files it claims

[worms.markup.config]                # this worm's settings
pretty = true

[worms.markup.inherit]               # which inherited work applies, all of it by default
lints_only = ["unused_variable"]     # or lints_except, never both
fmt_except = ["sort_requires"]       # options that keep their default in claimed files
```

## The key is the identity

The key under `[worms]` **must** equal `name` in the worm's own [`worm.toml`](/docs/worms/worm-toml), because the key also namespaces the worm's rules and its settings. It is one identity doing every job: it names the worm, it groups the worm's rules under `rules`, its settings under `[worms.<name>.config]`, its lint levels under `[lint.rules.<name>]`, and its format options under `[fmt.<name>]`. A mismatch is an error naming both sides.

## Three install channels

| channel | the line in `larvae.toml` | notes |
|---|---|---|
| GitHub release | `x = "owner/repo@1.0.0"` | larvae tries `<name>-worm-<arch>-<os>.zip`, then `<name>-worm.zip`, then `worm.zip`. Set `asset` to name one exactly. |
| crates.io | `x = { cargo = "crate@1.0.0" }` | `cargo install`, built from source on this machine, so one crate serves every platform. Always the native form. |
| a path | `x = { path = "../my-worm" }` | For development and for vendoring. Read fresh on every run, no cache. |

`repo` and `path` are never written together, and `cargo` excludes `repo`, `path`, and `asset`.

Installs land in `<cache_dir>/worms/<name>/<version>`, which is `.larvae/worms/...` by default, and later builds do no network at all.

### GitHub releases

A pin resolves to a release, and larvae looks through its assets in the order above. The per platform name comes first because a native worm ships one zip per platform; the sandboxed forms ship one zip for everyone. larvae lifts a single wrapping directory out of the zip, makes a native entry executable, and records a sha256 that later builds check. The recorded hash is what makes a pin mean something: GitHub allows replacing an asset under a tag that has not moved, so a version number alone would not be enough.

Unpacking refuses any archive entry whose path would land outside the worm directory rather than sanitising it.

`GITHUB_TOKEN` in the environment authenticates a private release.

### crates.io

`cargo = "crate@version"` installs with `cargo install`. The crate builds from source on the machine of the user, so one published crate serves every platform and the author uploads no per platform zip. The binary carries its own `worm.toml` and returns it over the pipe when larvae asks, because `cargo install` ships no data files. The install needs cargo on the PATH and compiles once; later builds read the cache.

## Turning a worm's rules on

A worm's rules live under `[worms.<name>] rules`, **not** in `[rules]`.

```toml
[worms.markup]
repo = "someone/markup-worm"
version = "2.1.0"
rules = { tidy = true }
```

That is deliberate. `[rules]` is larvae's own table, so a worm that declares `const_requires` cannot shadow the builtin rule. Namespaced, the two can share a name and mean different things.

A rule the user switches on that its worm does not declare is an error naming it, never a setting that quietly does nothing. That is the same policy the rest of [configuration](/docs/reference/configuration) follows.

## Ordering

`run_order` accepts `"before"`, `"after"`, or a slot number, and it orders the worm's rules relative to larvae's own. larvae's rules sit at `[process] run_order`, which defaults to `1`; you rarely touch it, it exists so `"before"` and `"after"` have something to be relative to.

Between two slots the buffer is spliced and re-lexed, so a rule running after larvae genuinely reads larvae's output. That is why ordering is worth asking for, and why it costs something: see [how a build runs](/docs/worms/build-pipeline).

> **A rule that emits a require which was not in the source is only resolved if that worm runs `"before"`.** larvae does not schedule an extra resolution pass after a worm that runs late.

Transform, format, and lint have fixed places: a front-end runs before the pipeline exists, and format and lint are not build passes at all. So `run_order` speaks only about rules.

## A worm's settings: `[worms.<name>.config]`

A worm declares its settings in `[options]` of its manifest, and the user writes them in `[worms.<name>.config]`. larvae checks the values against the declarations: it refuses an inner name the worm does not declare, refuses a value of the wrong type, and fills a missing option with its default. A typo therefore errors here exactly as it errors anywhere else in `larvae.toml`.

All settings for one worm are under one key, and `config` is a separate table rather than loose keys, so a worm that names one of its settings `repo` cannot collide with the key that says where larvae fetches the worm.

An earlier larvae used a top level `[config.<name>]` table. The old spelling now causes an error that names the new location; larvae does not treat it as an unknown key.

## A worm's lints and format options

A worm declares bare names, and larvae puts them in a table under the key of the worm. So the user writes them beside the builtin names, grouped:

```toml
[lint.rules.markup]                  # the lints of one worm, in one table
tidy = "deny"

[fmt.markup]                         # its format options, in one table
wide = true
```

A finding then reads `markup.tidy` in a message, in `larvae lint --explain`, and in an `-- larvae: allow(...)` comment. A collision with a builtin or with another worm cannot happen, because the key of the worm is already unique. See [linting](/docs/reference/linting) and [formatting](/docs/reference/formatting).

## Inheriting larvae's lints

`inherit_lints = true` runs the builtin lints on the files a worm claims, so a claimed file reports `unused_variable` and `shadowing` without work from the worm. The lints run against the Luau shadow the worm returns, or against its transform output when there is no shadow.

Inheritance takes everything unless `[worms.<name>.inherit]` states less: `lints_only` or `lints_except` for the lints, never both, and `fmt_except` for the format options that keep their default in claimed files.

## The schema follows the worms

When larvae loads worms it writes `<cache_dir>/larvae.schema.json`, a copy of the shipped schema with the worms' declarations merged in. `larvae self code` points the editor at that copy, so the editor completes a worm's lints, format options, rules, and settings, and shows the description of each one. See [editor setup](/docs/concepts/editor-setup).

## The editor

The language server routes a claimed buffer to its worm for diagnostics and formatting, through the same code the commands use, so the terminal and the editor cannot disagree. It never downloads a worm, because a keystroke cannot wait for the network; the first fetch happens in the terminal. It stamps each worm entry with its mtime and length, so a rebuilt `path` worm answers on the next keystroke. A worm failure becomes one diagnostic against the file, and the server keeps serving.

## Related

- [worm.toml](/docs/worms/worm-toml), what the worm declares on its side
- [how a build runs](/docs/worms/build-pipeline), passes, parallelism, and caching
- [configuration](/docs/reference/configuration), every other `larvae.toml` table
