---
title: CLI reference
description: Every coldluau command, flag, exit code, and environment variable
category: Reference
order: 1
updated: 2026-07-29
---

coldluau has five commands: `process`, `check`, `init`, `schema`, and `self`. That is the whole surface. There is no `serve`, no `build`, and no `minify` command, and coldluau never runs rojo for you.

Running `coldluau` with no arguments prints the logo beside the help text, fastfetch style. `coldluau --help` does the same. `coldluau <cmd> -h` prints that command's help.

## Commands

### `process`

Reads `[process].input`, applies transforms, and writes the result to `[process].output`. It also keeps the derived Rojo project fresh at `.coldluau/build.project.json`.

```shell
coldluau process
```

| flag | meaning |
|---|---|
| `--config <PATH>` | config file, defaults to `./coldluau.toml` when present |
| `--watch`, `-w` | rebuild on change, Ctrl-C to stop |
| `--profile <NAME>` | **planned (M2)**, errors today |

`--profile` is not usable yet. Passing it today is an error, not a no-op. Build profiles land in M2.

The output summary looks like this:

```text
processed 128 file(s): 84 require(s) rewritten, 2 dynamic require(s) left untouched, 3 copied
derived build project: .coldluau/build.project.json
```

Three counts appear only when they are non zero:

| count | meaning |
|---|---|
| `N copied` | non code files passed through unchanged |
| `N unchanged` | files skipped via the incremental cache |
| `N stale removed` | outputs whose source file was deleted |

So a clean rebuild with nothing to do prints a much shorter line than a first run. See [incremental builds](/docs/concepts/incremental-builds) for what the cache keys on and why `unchanged` can drop to zero after an unrelated edit.

Dynamic requires like `require(path)` are left alone on purpose and counted rather than rewritten, see [failure classes](/docs/concepts/failure-classes).

With `--watch`, coldluau rebuilds on change, mirrors deletions by pruning stale outputs, and keeps the last good output when a file fails to lex. A half typed save does not cascade require failures through a live rojo session.

### `check`

Runs the same analysis as `process`, writes nothing, and exits non zero if there are errors. This is the CI gate.

```shell
coldluau check
```

It does two things `process` does not:

1. Parses every file and reports **syntax errors**. `process` does not parse, it splices byte ranges.
2. Never uses the cache, so every diagnostic is reported on every run.

That second point is deliberate. A cached clean file would otherwise report nothing on the second run, which is useless behavior for a CI gate.

```yaml
# in CI
- run: coldluau check
```

Because `check` parses everything, it is the only command that can report a syntax error at all. `process` never parses, so it is unaffected by parser gaps.

### `init`

Writes a starter `coldluau.toml` in the current directory. It refuses to run if one already exists, so it will never clobber your config.

```shell
coldluau init
```

Two things it does beyond writing the file:

- Adds the `#:schema` line automatically, which is what gives editors completion and hover docs
- Manages `.gitignore`. If one exists it appends the missing entries, if not it asks before creating one. The entries are `.coldluau/` and `dist/`

A project with a `default.project.json` and `.luaurc` aliases needs no `coldluau.toml` at all, so `init` is a convenience rather than a required first step.

### `schema`

Adds or refreshes the `#:schema` line at the top of an existing `coldluau.toml`.

```shell
coldluau schema
```

That line is what Even Better TOML and Taplo read to give completion and hover documentation for every config key. The command is idempotent, it replaces a stale schema URL rather than adding a second line, and it errors if there is no `coldluau.toml` to edit.

You do not need to run it after `init`, since `init` already adds the line. Run it on a config that predates the schema, or after upgrading coldluau.

### `self`

Manages the coldluau binary itself.

| subcommand | what it does |
|---|---|
| `self install` | copy the binary to `~/.coldluau/bin`, print PATH instructions |
| `self update` | check GitHub releases, download and swap in the newer build |
| `self uninstall` | prompt, then remove `~/.coldluau` |

`self install` copies the **running** binary to `~/.coldluau/bin/coldluau` and prints the `export PATH="$HOME/.coldluau/bin:$PATH"` line to add to your shell profile. On Windows it prints instructions for adding the directory through Settings, it does not edit the registry. Running it twice is safe, it reports `coldluau is already installed at <path>`.

`self update` honors `GITHUB_TOKEN` for the releases API, which matters on shared runners where anonymous rate limits bite. When there is nothing newer it says `coldluau is already up to date`.

`self uninstall` asks `Remove <dir>?` and defaults to **no**, so pressing enter cancels.

## Exit codes

| code | meaning |
|---|---|
| `0` | success |
| `1` | errors were reported, or the command failed |

Usage mistakes come from clap and also exit non zero. Warnings alone are not errors, but `strict = true` promotes some of them into errors and therefore into a non zero exit, see [failure classes](/docs/concepts/failure-classes).

## Environment variables

| var | effect |
|---|---|
| `NO_COLOR` | disables all color, output goes plain |
| `COLUMNS` | overrides detected terminal width for the help layout |
| `GITHUB_TOKEN` | used by `self update` for the releases API |

Color is also disabled automatically when output is piped, so `coldluau check > log.txt` is plain text without any flag. You only need `NO_COLOR` for a terminal that coldluau would otherwise colorize.

## What coldluau does not do

coldluau is a preprocessor and it stops there. It writes `dist/` and keeps `.coldluau/build.project.json` in sync, then you point rojo at the derived project yourself:

```shell
coldluau process
rojo serve .coldluau/build.project.json
```

Serving is rojo's job. See [Rojo integration](/docs/concepts/rojo-integration) for how the derived project is generated from your `default.project.json`.

## Related pages

- [configuration](/docs/reference/configuration) for every `coldluau.toml` key the commands above read
- [rules](/docs/reference/rules) for the transforms `process` and `check` apply
- [migrating from darklua](/docs/project/migrating-from-darklua) if you are coming from `.darklua.json`
