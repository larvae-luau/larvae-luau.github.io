---
title: CLI reference
description: Every larvae command, flag, exit code, and environment variable
category: Reference
order: 1
updated: 2026-08-30
---

larvae has nine commands: `process`, `check`, `fmt`, `lint`, `bundle`, `lsp`, `init`, `worm`, and `self`. That is the whole surface. There is no `serve` command and no `schema` command, and larvae never runs rojo for you.

Running `larvae` with no arguments prints the logo beside the help text, fastfetch style. `larvae --help` does the same. `larvae <cmd> -h` prints that command's help.

Four commands share flags. `process`, `check`, `fmt`, and `lint` accept `--config <path>`, which names a config file other than `./larvae.toml`. `process` and `check` also accept `--profile <name>`, which merges `[profile.<name>]` over the config, see [configuration](/docs/reference/configuration).

## Commands

### `process`

Rewrites requires, applies [rules](/docs/reference/rules), and writes the output tree. It also keeps the derived Rojo project fresh at `.larvae/build.project.json`.

```shell
larvae process
```

| flag | meaning |
|---|---|
| `--config <PATH>` | config file, defaults to `./larvae.toml` when present |
| `--profile <NAME>` | merge `[profile.<name>]` over the config |
| `--watch`, `-w` | rebuild on change, Ctrl-C to stop |

The output summary looks like this:

```text
processed 128 file(s): 84 require(s) rewritten, 2 dynamic require(s) left untouched, 3 copied
derived build project: .larvae/build.project.json
```

Three counts appear only when they are non zero:

| count | meaning |
|---|---|
| `N copied` | non code files passed through unchanged |
| `N unchanged` | files skipped via the incremental cache |
| `N stale removed` | outputs whose source file was deleted |

So a clean rebuild with nothing to do prints a much shorter line than a first run. See [incremental builds](/docs/concepts/incremental-builds) for what the cache keys on and why `unchanged` can drop to zero after an unrelated edit.

Dynamic requires like `require(path)` are left alone on purpose and counted rather than rewritten, see [failure classes](/docs/concepts/failure-classes).

With `--watch`, larvae rebuilds on change, mirrors deletions by pruning stale outputs, and keeps the last good output when a file fails to parse. A half typed save does not cascade require failures through a live rojo session.

### `check`

Runs the same analysis as `process`, writes nothing, and exits non zero if there are errors. This is the CI gate, and it is the command that answers questions about the whole require graph: the per file questions belong to `lint`.

```shell
larvae check
```

```yaml
# in CI
- run: larvae check
```

`check` never skips a file through the cache, so every diagnostic is reported on every run. That is deliberate, because a cached clean file would otherwise report nothing on the second run, which is useless behavior for a CI gate.

larvae's parser accepts the files that Luau accepts and refuses the files that Luau refuses, ambiguous syntax included, so `check` never passes a file that the real compiler rejects.

What fails the run is configured in [`[check]`](/docs/reference/configuration): each analysis has a level, `allow`, `warn`, or `deny`, and only a `deny` fails CI. Two findings are unconditional and no level lowers them, because they are wrong rather than untidy:

- an unresolvable require
- a realm violation, see [realms and clones](/docs/concepts/realms-and-clones)

### `fmt`

Formats files in place. A file claimed by a [worm](/docs/worms/what-a-worm-is) is formatted through that worm.

```shell
larvae fmt
```

| flag | meaning |
|---|---|
| `--config <PATH>` | config file, defaults to `./larvae.toml` when present |
| `--check` | write nothing, fail when a file would change |
| `--stdin` | format one file from stdin to stdout |
| `--stdin-filepath <PATH>` | the path the stdin content notionally lives at, which routes it to a worm by extension |

`fmt` works with no `larvae.toml` at all. It also reads an existing `stylua.toml` or `.stylua.toml` as it is, so a project that already formats with stylua keeps its settings, see [configuration](/docs/reference/configuration).

Excludes apply to files that a walk finds, not to files that you name. `larvae fmt` with no arguments, or with a directory argument, skips excluded files. `larvae fmt Packages/thing.luau` formats the file, because a user who names a file means that file. A tool that silently does nothing to a named file is worse than a tool that touches an excluded file.

The options live in `[fmt]`, documented on [formatting](/docs/reference/formatting). With `[fmt] enabled = false` the command writes no file, `--check` reports no failure, and the exit code is zero, because that half of larvae is off, see [formatting](/docs/reference/formatting).

### `lint`

Reports suspicious code. A file claimed by a worm is linted through that worm.

```shell
larvae lint
```

| flag | meaning |
|---|---|
| `--config <PATH>` | config file, defaults to `./larvae.toml` when present |
| `--explain <LINT>` | describe one lint, a worm's lint as `worm.name` |
| `--stdin` | lint one file from stdin |
| `--stdin-filepath <PATH>` | routes stdin to a worm by extension, as in `fmt` |

`lint` works with no `larvae.toml` at all. It also reads an existing `selene.toml` for lint settings, see [configuration](/docs/reference/configuration).

A lint reads one file in isolation, which is why `larvae lint` works on stdin, in the editor, and with no config. A question about the whole project, such as a require cycle, runs under `larvae check` instead.

`--explain` also prints the group the lint belongs to, and the list it prints when a name misses is grouped rather than alphabetical, so a reader scans one kind at a time. The groups live on [linting](/docs/reference/linting).

Individual findings are silenced with `-- larvae: allow(...)` flag comments, and selene's spelling works too. The lint list, the levels, and the flag comment rules live on [linting](/docs/reference/linting). With `[lint] enabled = false` the command reports nothing and exits zero, because that half of larvae is off, see [linting](/docs/reference/linting).

The same named file rule as `fmt` applies: excludes affect the walk, never a file you name.

### `bundle`

Writes the project as one file. Modules load on demand through a lazy registry, so bundling cannot move a side effect.

```shell
larvae bundle --entry src/main.luau
```

| flag | meaning |
|---|---|
| `--entry <PATH>` | the module the bundle starts from, beats `[bundle] entry` |

Without `--entry` and without `[bundle] entry` in the config, the command errors. The output path and tree shaking are configured in [`[bundle]`](/docs/reference/configuration), and the bundle is printed by the `[process]` `generator`, so a dense bundle is one config line away.

### `lsp`

Serves an editor over stdio: the lints, the formatter, and the code actions, without the analyzer.

```shell
larvae lsp
```

The full server is the separate `larvae-lsp` binary, which adds Luau's analyzer: hover, completion, type diagnostics, and inlay hints. `larvae self install` installs both, and the [Larvae extension](/docs/concepts/editor-setup) starts the full one. The subcommand stays as the fallback half, and `[lsp] analyzer = false` puts the full server in the same mode.

Either server runs through the same code the commands use, so the terminal and the editor cannot disagree. It follows the same exclude lists as every command, and it routes a claimed buffer to its worm. It never downloads a worm, because a keystroke cannot wait for the network; the first fetch happens in the terminal. See [editor setup](/docs/concepts/editor-setup) and the [editor reference](/docs/reference/editor).

A config that fails to resolve raises one editor warning with the reason, and the server serves defaults until the config loads. A project without a `larvae.toml` raises nothing, because a missing config is a normal state and not a fault.

### `init`

Writes a starter `larvae.toml` in the current directory. It refuses to run if one already exists, so it will never clobber your config.

```shell
larvae init
```

The starter config holds the root short forms `input`, `output`, and `target`, a `[process]` table with the input directories it detected, `[requires]`, and `[fmt]` and `[lint]` with every option and every lint at its default, as comments. Both lists are generated from the code, so they cannot drift from it. The reason for the comments: a config is also the place where a user discovers that an option exists.

Detection folds sibling Rojo mounts into the directory that holds them, so `src/client`, `src/server`, and `src/shared` become `input = "src"`. A package directory never becomes an input; it becomes an alias instead, unless `.luaurc` already defines one.

When the project already has a `stylua.toml` or a `selene.toml`, `init` writes a note pointing at that file instead of keys, because written defaults would silently override settings the project already made. It also offers to add `.larvae/` and `dist/` to `.gitignore`.

`init` also writes `"lint": { "*": false }` into `.luaurc`, because larvae covers all 28 of the Luau compiler's lints and with both linters on each finding arrives twice under two names. Three promises about that edit:

- The edit is textual, it does not parse the file and write it again, so every other byte survives, comments included.
- The command changes nothing when the file already sets `lint`, because that is a project with an opinion.
- The command creates no `.luaurc` when the project has none.

### `worm`

Manages the [worms](/docs/worms/what-a-worm-is) a project uses, and helps you develop one. The development subcommands work with no project and nothing installed, so you can write a worm before wiring it into a build.

| subcommand | what it does |
|---|---|
| `worm add <spec>` | write the worm into `[worms]` at version `^`, without installing |
| `worm install`, `i` | put every worm the config names on disk |
| `worm remove <name>`, `rm` | take one out of the config and off the disk |
| `worm run <dir> <file>` | transform one file through the worm and print the result |
| `worm run --fmt <dir> <file>` | format the file, and report when a second pass changes the output |
| `worm run --lint <dir> <file>` | print the worm's findings at the manifest defaults |
| `worm info <dir>` | print what the manifest declares, without running it |
| `worm types` | write the Luau definitions for a language server |
| `worm claims` | print the extensions the project's worms claim, as JSON for an editor |

`add` takes a short name that larvae knows, such as `luaux`, or `owner/repo`, and either with `@version` on the end. A short name expands through a list written into larvae: `luaux` is `larvae-luau/luaux-worm`. A name larvae does not know is refused rather than guessed, because guessing an owner points the fetch at a repository that may exist and may belong to someone else. `--cargo` takes the crate of that name instead of a GitHub release.

The version `add` writes is `^`, which every install reads as the newest release there is. `add` still asks the repository for the newest release even though it writes `^`, because that call catches a typo in the name before it reaches the config. `add` does not install, because an edit to a file is instant and offline while a download is neither, and a user adding three worms wants one download rather than three.

`install` is that download. It puts every worm the config names on disk and draws a progress bar. Under a pipe it prints one line per worm instead, because a carriage return in a log leaves the whole run on one unreadable line.

There is no `worm update`. The version already says whether the project wants to move: `^` follows and a number holds. A command that bumps a pin the user wrote is a command that undoes the pin.

`info` reads the manifest and prints it back, which is the fastest way to check a `worm.toml` is what you meant:

```text
$ larvae worm info myworm
luaux init.luau
  form       Luau
  api        1
  requires   Larvae
  claims     .luaux
  run_order  before larvae's rules
  rule       strip_debug (default false)
```

`run` reports the line count on every run, not just failures, because a transform must keep the line count and that is the property most easily broken by accident and hardest to notice. `run --fmt` reports idempotence for the same reason: a formatter that changes its own output on a second pass is broken in a way no single run shows.

`worm types` writes `worm.d.luau` and adds it to `.vscode/settings.json` under `luau-lsp.types.definitionFiles`, so a Luau worm typechecks in the editor with nothing installed. See [writing a worm in Luau](/docs/worms/writing-in-luau).

### `self`

Manages the larvae binary itself, and the editor support around it.

| subcommand | what it does |
|---|---|
| `self install` | copy the binary to `~/.larvae/bin` and get it on PATH |
| `self update` | check GitHub releases, download and swap in the newer build |
| `self update --force` | update even when another tool manages the binary |
| `self uninstall` | prompt, then remove `~/.larvae` |
| `self code` | set up editor schema support for `larvae.toml` |
| `self sync-luaurc` | write the project aliases into `.luaurc` in a form the editor resolves |

`self install` copies the **running** binary to `~/.larvae/bin/larvae`, and `larvae-lsp` with its analyzer library beside it when they sit next to the binary, which the release zips guarantee. PATH handling then differs by platform, on purpose:

| platform | what happens |
|---|---|
| Windows | the directory is added to your PATH for real, written to the user Path in the registry and broadcast so new terminals pick it up |
| unix | the `export PATH="$HOME/.larvae/bin:$PATH"` line is printed for you to add to your shell profile |

Editing someone's shell profile behind their back is rude, which is why unix stays manual. Running it twice is safe, and it warns when another tool already manages the binary, because a second copy can shadow the first on PATH.

`self update` only replaces the copy that `self install` put in place. **If rokit, aftman, foreman, lpm or cargo owns the binary it refuses**, and tells you to bump the version in that manifest instead. Overwriting a pinned tool would leave the manifest and the bytes on disk disagreeing, which is a confusing state to debug later. Pass `--force` when you mean it anyway.

It honors `GITHUB_TOKEN` for the releases API, which matters on shared runners where anonymous rate limits bite. When there is nothing newer it says `larvae is already up to date`.

`self uninstall` asks `Remove <dir>?` and defaults to **no**, so pressing enter cancels.

`self code` gives your editor completion and hover docs for every `larvae.toml` key. Its first choice is an Even Better TOML association in the editor's user settings; when that extension is absent it writes a `#:schema` line at the top of the file, which any Taplo based editor reads. A project with worms gets the merged schema too, so the editor also completes each worm's lints, options, and rules. The full story is on [editor setup](/docs/concepts/editor-setup).

`self sync-luaurc` writes the project aliases into the `.luaurc` that an editor reads. A `@game/...` alias value is a DataModel path, and luau-lsp cannot follow one, so a verbatim copy would cost the editor types and go to definition on every require through that alias. The command inverts the mount table instead: the DataModel path goes back to the directory that mounts there, and `.luaurc` gets a path the editor can resolve. Source keeps its `@pkg` forms, and this file backs them.

The command rewrites only the `aliases` key. Other keys survive. Comments do not, because larvae reads `.luaurc` as JSON with comments and writes plain JSON back. `--check` reports what would change and fails without writing, which is the form CI wants.

## Exit codes

| code | meaning |
|---|---|
| `0` | success |
| `1` | errors were reported, or the command failed |

Usage mistakes come from clap and also exit non zero. Warnings alone are not errors: `larvae check` fails only on a `deny` level finding or an unconditional error, and `[requires] strict = true` promotes some warnings into errors and therefore into a non zero exit, see [failure classes](/docs/concepts/failure-classes). `larvae fmt --check` exits non zero when it finds a difference.

## Environment variables

| var | effect |
|---|---|
| `NO_COLOR` | disables all color, output goes plain |
| `COLUMNS` | overrides detected terminal width for the help layout |
| `GITHUB_TOKEN` | used by `self update` and by private worm release downloads |

Color is also disabled automatically when output is piped, so `larvae check > log.txt` is plain text without any flag. You only need `NO_COLOR` for a terminal that larvae would otherwise colorize.

## What larvae does not do

The build stops at writing files. It writes `dist/` and keeps `.larvae/build.project.json` in sync, then you point rojo at the derived project yourself:

```shell
larvae process
rojo serve .larvae/build.project.json
```

Serving is rojo's job. See [Rojo integration](/docs/concepts/rojo-integration) for how the derived project is generated from your `default.project.json`.

The one process larvae does run is the editor's sourcemap generator: the language server spawns `rojo sourcemap --watch`, or the `[lsp] sourcemap_command` of the project, and ends it with the session. That serves the editor's instance tree and never the build; `sourcemap_autogenerate = false` turns it off. See the [editor reference](/docs/reference/editor).

## Related pages

- [configuration](/docs/reference/configuration) for every `larvae.toml` key the commands above read
- [rules](/docs/reference/rules) for the transforms `process` and `check` apply
- [formatting](/docs/reference/formatting) for every `[fmt]` option
- [linting](/docs/reference/linting) for every lint, its level, and flag comments
- [what a worm is](/docs/worms/what-a-worm-is) for what `larvae worm` manages and develops
- [migrating from darklua](/docs/project/migrating-from-darklua) if you are coming from `.darklua.json`
