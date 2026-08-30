---
title: Using worms
description: The [worms] table, three install channels, run order, inheritance, and where a worm's settings live
category: Worms
order: 2
updated: 2026-08-30
---

One table per worm under `[worms]`. The key is the worm's name, and everything the worm adds to the project hangs off that key.

A worm is a table. The old string form, `xml = "luau-xml/worm@0.1.0"`, is refused with a message that prints the table to write instead, because the version is a key of its own now and a pin packed both halves into one string.

```toml
[worms]
xml = { repo = "luau-xml/worm", version = "^" }
vide = { cargo = "vide-worm", version = "0.2.0" } # a crate on crates.io, built on this machine

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
| GitHub release | `x = { repo = "owner/repo", version = "1.0.0" }` | larvae tries `<name>-worm-<arch>-<os>.zip`, then `<name>-worm.zip`, then `worm.zip`. Set `asset` to name one exactly. |
| crates.io | `x = { cargo = "crate", version = "1.0.0" }` | `cargo install`, built from source on this machine, so one crate serves every platform. Always the native form. |
| a path | `x = { path = "../my-worm" }` | For development and for vendoring. Read fresh on every run, no cache. |

`repo` and `path` are never written together, and `cargo` excludes `repo`, `path`, and `asset`.

Installs land in `<cache_dir>/worms/<name>/<version>`, which is `.larvae/worms/...` by default, and later builds do no network at all.

### GitHub releases

`larvae worm install` resolves the version to a release, and larvae looks through its assets in the order above. The per platform name comes first because a native worm ships one zip per platform; the sandboxed forms ship one zip for everyone. larvae lifts a single wrapping directory out of the zip, makes a native entry executable, and records a sha256 that later builds check. The recorded hash is what makes a pin mean something: GitHub allows replacing an asset under a tag that has not moved, so a version number alone would not be enough.

Unpacking refuses any archive entry whose path would land outside the worm directory rather than sanitising it.

`GITHUB_TOKEN` in the environment authenticates a private release.

### crates.io

`cargo = "crate"` with a `version` installs with `cargo install`. The crate builds from source on the machine of the user, so one published crate serves every platform and the author uploads no per platform zip. The binary carries its own `worm.toml` and returns it over the pipe when larvae asks, because `cargo install` ships no data files. The install needs cargo on the PATH and compiles once; later builds read the cache.

## Managing worms

Three commands, and they do one thing each.

| command | what it does |
|---|---|
| `larvae worm add <spec>` | Writes the worm into `[worms]`. Does not install. |
| `larvae worm install`, `i` | Puts every worm the config names on disk. |
| `larvae worm remove <name>`, `rm` | Takes it out of the config and off the disk. |

`add` takes a short name that larvae knows, `luaux`, or `owner/repo`, and either with `@version` on the end. A short name expands through a list written into larvae: `luaux` is `larvae-luau/luaux-worm`. A name larvae does not know is refused rather than guessed, because a guessed owner points the fetch at a repository that may exist and may belong to someone else. `--cargo` takes the crate of that name instead of a GitHub release.

The version `add` writes is `^`, which every install reads as the newest release there is. A user who wants one release writes `@version`, and the entry then never moves. `add` still asks the repository what the newest release is even though it writes `^`, because that call is what catches a typo in the name before it reaches the config.

`add` does not install. An edit to a file is instant and offline while a download is neither, and a user adding three worms wants one download rather than three.

`install` draws a progress bar. Under a pipe it prints one line per worm instead, because a carriage return in a log leaves the whole run on one unreadable line.

## Versions, and why `update` is gone

| written | install takes |
|---|---|
| `"^"` | The newest release, every time. |
| `"^0.1.0"` | The newest release semver calls compatible, so 0.1.x. |
| `"0.1.0"` | That release. It never moves. |

`larvae worm update` existed to bump a pin. It is gone, because the version now says whether the project wants to move: `^` follows and a number holds. A command that bumps a pin the user wrote is a command that undoes the pin.

A leading `v` is accepted and dropped, so `v0.1.0` and `0.1.0` name the same release and the install directory is spelled one way.

## Installing is a step, not a side effect

Larvae used to fetch a missing worm inside whatever command needed it, so the first `larvae fmt` of a checkout downloaded from GitHub while the user waited with nothing on screen. `larvae worm install` is that step now.

Every other command reads what install put there. A worm the config names and the disk does not have is reported once, ``worm `x` is not installed, run `larvae worm install` ``, and the rest of the project still works. The editor is the exception: it skips the worm and says nothing, because it answers a keystroke and a download is not an answer.

A range resolves against what is on disk and not against the repository, so a build makes no request. `install` did the online half and named the directory after the release it settled on, so `^` finds the newest installed release. A build that re-resolved a range would put a request in front of every command and make the result depend on the day it ran.

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

## Requiring a claimed file

A require that names a claimed file resolves to the Luau the worm writes, because a claimed file is a module: the pipeline turns it into Luau in the output. The DataModel targets strip the claimed extension, so `require("../Interface/App")` resolves although the source file is `App.luaux`. A directory whose init file is claimed is a module too: `Pkg/init.luaux` is written as `Pkg/init.luau`, so `require("./Pkg")` resolves.

A claimed script keeps its realm suffix. `boot.client.luaux` is a LocalScript to the realm checks, and `boot.server.luaux` is a Script. Both halves matter, because UI runs on the server as well as the client, and the checks that apply to one do not apply to the other.

A require is still written without an extension, as the Luau RFC says, because the source extension is larvae's business and never appears in output. A claimed file beside a `.luau` of the same name is ambiguous, as two `.luau` files would be.

## Hold-off markers in claimed files

A file a worm claims reads `-- larvae: fmt off`, `fmt on`, and `fmt off(N)` too, and the lint family with them. Larvae does not read such a file as Luau and so finds no comment in it, so the comments come from the worm's reply: the worm reports where they are, and all three forms then hold the formatter and the linter exactly as they do in a Luau file. The marker family itself is on [formatting](/docs/reference/formatting) and [linting](/docs/reference/linting).

The mechanism explains one limit. A worm that claims a file owns its layout, so larvae renders what the worm sent and then writes the source back over each held region. It finds each region by the text of the marker comments, which a worm always reports and which always reach the output. A count, `off(4)`, closes at a position that no comment names, so larvae marks that one boundary in the layout document before it renders.

The limit: a worm can build a document larvae cannot mark, an `if_break` with a region boundary inside one of its two arms for example. Larvae then leaves the file to the worm rather than cut the wrong lines out of it. Write `fmt on` instead of a count in such a file, because a marker larvae can find by its text has no such limit.

## The schema follows the worms

When larvae loads worms it writes `<cache_dir>/larvae.schema.json`, a copy of the shipped schema with the worms' declarations merged in. `larvae self code` points the editor at that copy, so the editor completes a worm's lints, format options, rules, and settings, and shows the description of each one. See [editor setup](/docs/concepts/editor-setup).

## The editor

The language server routes a claimed buffer to its worm for diagnostics and formatting, through the same code the commands use, so the terminal and the editor cannot disagree. It never downloads a worm, because it answers a keystroke and a download is not an answer: a worm the config names and the disk lacks is skipped silently, and `larvae worm install` puts it on disk. It stamps each worm entry with its mtime and length, so a rebuilt `path` worm answers on the next keystroke. A worm failure becomes one diagnostic against the file, and the server keeps serving.

A native worm can go much further, in three tiers its manifest declares:

1. **Resolve.** The worm answers the requires it claims and hands the analyzer lowered Luau with a span map, so `require("./items.json")` and a `.luaux` component carry their real types on hover and completion, unsaved edits included.
2. **Declarations.** `.d.luau` text the worm injects when the session starts.
3. **Respond.** The worm transforms hover, completions, or diagnostics before the editor sees them, which is how a markup worm answers inside its own syntax.

A worm can also lint plain Luau, and the files another worm claims when that worm consents: the oop worm holds a privacy convention across `.luau` and `.luaux` files this way. The findings pass through the same levels and `allow` comments as every other lint. The manifest keys behind all of this are on [worm.toml](/docs/worms/worm-toml).

A worm's editor settings live under `[lsp.<worm>]`:

```toml
[lsp.oop]
hide_private_completions = false
```

Each key checks against the `[options]` the worm declares, so a typo, a wrong type, or a name that is no worm warns instead of doing nothing.

Code actions and Luau type definitions round it out, on every form. Both are optional, and a worm with nothing to say answers with nothing rather than an error. A worm's code actions carry the worm's name in the title, and an action that names the lint it repairs is grouped under that diagnostic. The server itself is described on the [editor reference](/docs/reference/editor); the exports each form provides are on [writing a worm in Luau](/docs/worms/writing-in-luau) and [writing a worm in Rust](/docs/worms/writing-in-rust).

## Related

- [worm.toml](/docs/worms/worm-toml), what the worm declares on its side
- [how a build runs](/docs/worms/build-pipeline), passes, parallelism, and caching
- [configuration](/docs/reference/configuration), every other `larvae.toml` table
