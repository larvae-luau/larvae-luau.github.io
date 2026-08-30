---
title: Configuration
description: Every larvae.toml key, the other files larvae reads, and how they merge
category: Reference
order: 2
updated: 2026-08-30
---

Configuration lives in `larvae.toml` next to your Rojo project. The file is optional: `larvae fmt` and `larvae lint` work with no `larvae.toml` at all, and a project with a `default.project.json` and `.luaurc` aliases can run `larvae process` on defaults alone. Every table below exists to override a default, never to satisfy one.

## The files larvae reads

| file | role |
|---|---|
| `larvae.toml` | the project's config, optional |
| `stylua.toml` / `.stylua.toml` | read as it is, so a project that already formats with stylua keeps its settings |
| `selene.toml` | read the same way for lint settings |
| `.luaurc` | aliases, merged with `[aliases]` per key |
| `default.project.json` | Rojo mounts, which is why `[requires] mounts` is rarely necessary |
| `sourcemap.json` | the instance tree the editor types `script` against, kept fresh by the server itself |

## The rule about unknown keys

The behavior looks inconsistent until the reason is clear:

- **In `larvae.toml`, an unknown key is an error.** larvae owns this file, so an unknown key is a typo. If larvae ignored a typo silently, you would think a setting is on when it is not.
- **In `stylua.toml` and `selene.toml`, larvae ignores an unknown key.** These files belong to other tools, and those tools add options on their own schedule. If larvae rejected the whole file because of one unknown line, the project would lose every setting because of a key that was never larvae's.

You can also write both tools' settings directly in `larvae.toml` and delete the extra files:

- `[fmt]` accepts every stylua option under its own name. It also accepts stylua's `syntax` key and ignores it, because larvae only formats Luau.
- `[lint]` accepts selene's `config` as a second name for `options`, accepts selene's `exclude`, and accepts selene's `std` spellings (`lua51` through `lua54`, `luajit`, and chains such as `roblox+testez`, where the first name decides).

Values in `larvae.toml` use larvae's spelling, which is kebab case: `quote_style = "auto-prefer-double"`, not stylua's `"AutoPreferDouble"`. larvae converts the PascalCase form only when it reads that form from `stylua.toml` itself. When a value is unknown, the error message lists the valid values.

When a tool's file and `larvae.toml` set the same key, `larvae.toml` wins, because it is the more specific file. For lists (`rules`, `globals`, `exclude`), larvae adds its entries to selene's entries and does not replace them.

## Naming

One rule, stated once: keys are snake case, values are kebab case, and each table is named after the command it configures, so `[fmt]` configures `larvae fmt`. Keys belong to larvae, and values read as prose.

## Editor support

`larvae self code` sets up completion and hover docs for every key, either through an Even Better TOML association or a `#:schema` line that any Taplo based editor reads. A project with worms gets each worm's declarations merged into the schema too. See [editor setup](/docs/concepts/editor-setup).

## The top level

### `extends`

`extends` names a base config that this file layers over, by path relative to this file:

```toml
extends = "./shared/larvae.base.toml"
```

The base loads first, and this file wins key by key with the merge rules of `[profile]`: tables merge per key, arrays and scalars replace whole. A base can extend another base, and a loop is an error. The `[profile]` tables of a base merge too, so one base can hold the profiles of a whole workspace; `--profile` applies after the chain resolves. A monorepo keeps its shared lines in one base this way, and an edit to the base reaches every package.

Only the path form works; a registry form is refused with a message. Globs and paths inside a base stay relative to the project that loads it, not to the base file.

### `input`, `output`, `target`

Short forms of `[process] input`, `[process] output`, and `[requires] target`, so the first line of a config needs no table header:

```toml
input = "src"
output = "dist"
target = "roblox-string"
```

Each pair is one key with two spellings. A config that writes both spellings of one key gets an error, larvae never merges them. TOML reads a root key only before the first table header, so the short forms come first in the file. `larvae init` writes them.

### `exclude` and `include`

Lists of globs relative to the project root. The root `exclude` removes a file from every command: the process walk, the formatter, the linter, and the editor. The root `include` cancels the root `exclude`, and only that.

Each area can override the pair for itself. `[fmt] include` and `[lint] include` bring a file back for that one command, over every exclude. `[fmt] exclude` and `[lint] exclude` remove a file for that one command, over the root `include`, because the local list is more specific than the global one. selene's own `exclude` in `selene.toml` is read too.

Four layers decide one file, and the most specific layer wins:

1. **The include of the area.** A match is read, over every exclude.
2. **The exclude of the area.** A match is skipped for that area alone.
3. **The root `include`.** A match cancels the root `exclude`, and only that.
4. **The root `exclude`.** A match is skipped for every command.

So a project writes `exclude = ["gen"]` once at the root, and the linter alone reads one file back with `[lint] include = ["gen/keep.luau"]`. The formatter still skips the whole tree.

Two behaviors are decisions, not accidents:

1. **A match on any parent directory counts.** `exclude = ["Packages"]` and `exclude = ["Packages/**"]` do the same thing, so you do not have to remember which spelling the tool accepts.
2. **Excludes apply to files that a walk finds, not to files that you name.** `larvae fmt` with no arguments, or with a directory argument, skips excluded files. `larvae fmt Packages/thing.luau` formats the file, because a user who names a file means that file. A tool that silently does nothing to a named file is worse than a tool that touches an excluded file.

The editor follows the same lists. larvae clears the diagnostics of an excluded file rather than keeping the ones that were there before you added the exclude.

The root lists also apply to `larvae process`: a file the root `exclude` matches is not transformed and not copied. `[process] exclude` is the area exclude of that walk and follows the same order, so it wins over the root `include`. `[process] include` is not part of the order above; it is a filter with a different job, described under `[process]`.

## `[aliases]`

Entries here merge over `.luaurc` per key, so you can keep most aliases in `.luaurc` and override or extend individual ones here.

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

Both exist because `.luaurc` can only express filesystem paths. A DataModel target like `@game/ReplicatedStorage/Packages` has nowhere to live except `larvae.toml`.

Rules for alias names:

- Case insensitive, so `pkg` and `Pkg` are the same alias
- `@self` and `@game` are reserved and cannot be redefined

The language server reads `.luaurc` too and merges `[aliases]` over it, so go to definition follows `require("@pkg/thing")` whichever file defines the alias. Keeping the filesystem aliases in `.luaurc` still keeps the requires portable to other Luau tools.

## `[process]`

Controls what is read, what is written, and how it is printed.

| key | default | meaning |
|---|---|---|
| `input` | `"src"` | one directory or a list |
| `output` | `"dist"` | where the output tree goes |
| `include` | `["**/*.luau", "**/*.lua"]` | globs relative to the project root, picks which found files are transformed; the rest are copied |
| `exclude` | `[]` | globs relative to the project root, skipped fully: not transformed and not copied. A directory name is enough |
| `generator` | `"retain-lines"` | how the output prints, see below |
| `quotes` | `"preserve"` | quote style for require strings in the output |
| `strip_flags` | `true` | removes flag comments from the output, see below |
| `cache` | `true` | incremental builds by content hash |
| `cache_dir` | `".larvae"` | cache and derived project location |
| `run_order` | `1` | the position of larvae's own rules relative to worms |

When there is one input root, larvae flattens it into the output. When there are several roots, each root keeps its own directory so two roots cannot collide.

```toml
[process]
input = "src"
output = "dist"
quotes = "double"
```

### `generator`

| value | output |
|---|---|
| `retain-lines` | the output keeps the lines of the input, so stack traces map to the source |
| `dense` | the minifier, tuned by `[minify]` |
| `readable` | the formatter, in the `[fmt]` style of the project |

The generator also prints the `larvae bundle` output.

### `strip_flags`

A flag comment is a comment addressed to larvae, such as `-- larvae: allow(unused_variable)`. Flags are build time instructions, so shipped flags are shipped build instructions, and `process` removes them by default. Ordinary comments are untouched and line numbers stay the same, so `retain-lines` output still matches the source. Set `strip_flags = false` when people read the output, for example a library published as source.

When `[rules] remove_comments` is on, that rule controls every comment in the file and `strip_flags` does nothing, so an `except` pattern that keeps flags keeps them. Flag comments are documented in full on [linting](/docs/reference/linting).

### Copy through for non matching files

Files the walk keeps that do not match `include` are **copied through unchanged**. So json, txt, and model files land in `output` alongside the transformed Luau, and the derived Rojo project stays self consistent. These files show up in the `N copied` count on the `process` summary. `exclude` is the stronger option: an excluded path is skipped entirely and not even copied.

### `run_order`

You rarely need to touch this. It exists so a worm saying `"before"` or `"after"` has something to be relative to, see [using worms](/docs/worms/using-worms).

## `[requires]`

Controls what the rewritten requires look like. `target` is the most important key, and the root key `target` is its short form.

| key | meaning |
|---|---|
| `target` | `roblox-string` (native `@game/...` strings, the default), `path` (relative filesystem paths, for Lune), or `roblox-instance` (Instance expressions) |
| `sourcemap` | a sourcemap file to read paths from |
| `mounts` | filesystem to DataModel map, rarely written by hand |
| `strict` | upgrade warnings to errors |
| `instance_input` | how instance style requires in the input are read |
| `overrides` | per glob target |
| `indexing_style` | `roblox-instance` only, see below |

The three targets each get a full treatment on [require targets](/docs/concepts/require-targets).

`mounts` is rarely necessary, because larvae reads `default.project.json` and gets the filesystem to DataModel map for free, see [Rojo integration](/docs/concepts/rojo-integration).

`strict = true` promotes the warning class into errors, see [failure classes](/docs/concepts/failure-classes) for exactly which diagnostics move.

### `indexing_style`

Applies only when `target = "roblox-instance"`.

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

## `[rojo]`

Points larvae at your project file and says where the derived one goes.

| key | default | meaning |
|---|---|---|
| `project` | `"default.project.json"` | source of truth project file |
| `build_project` | `<cache_dir>/build.project.json` | where the derived project is written |

`project` is the key to set when a repository holds several project files, since larvae needs to know which one is the source of truth. The derived project is what you hand to rojo, larvae never runs rojo itself. See [Rojo integration](/docs/concepts/rojo-integration).

## `[defines]`

Compile time constants. larvae replaces the name with a literal everywhere the name appears.

```toml
[defines]
DEBUG = false
VERSION = "1.4.0"
```

If you are porting a darklua config, `inject_global_value` maps onto this table.

## `[rules]`

Transforms applied to each output file. There are 36 rules, and every rule is off until the config turns it on. A rule takes `true`, or a table with its options.

```toml
[rules]
const_requires = true
remove_comments = { except = ["^--!"] }
add_luau_directive = "strict"
```

An unknown rule name is an error, larvae never ignores a name. Three darklua names are deliberately not larvae rules, and the error points at the larvae way to do the same thing: `convert_require` (the `[requires]` table), `inject_global_value` (`[defines]`), and `remove_spaces` (`generator = "dense"`).

Every rule, its options, and its before and after Luau lives on [rules](/docs/reference/rules).

A worm's rules do **not** live here. They live under `[worms.<name>] rules`, so a worm cannot shadow a builtin rule. See [using worms](/docs/worms/using-worms).

## `[fmt]`

Options for `larvae fmt`. The table accepts every stylua option under larvae's spelling, options beyond stylua such as `magic_trailing_comma` and `require_binding`, plus `exclude` and `include` as described under [the top level](#exclude-and-include). stylua's `syntax` key is accepted and ignored, because larvae only formats Luau.

`enabled = false` turns the formatter off, for a project that wants larvae for one job and keeps another formatter, see [formatting](/docs/reference/formatting).

`recommended = false` starts from a base that changes as little as possible, and the project turns back on what it wants, see [formatting](/docs/reference/formatting).

A worm adds format options under its own key: `[fmt.<worm>]` is a table of the options that worm declares. An unknown key at the top level of `[fmt]` is refused with a message, because only a worm can own a name that larvae does not.

Every option and its default lives on [formatting](/docs/reference/formatting).

## `[lint]`

Options for `larvae lint`.

| key | meaning |
|---|---|
| `enabled` | `false` turns the linter off, see [linting](/docs/reference/linting) |
| `recommended` | `false` starts every lint at `allow`, so the project gets the lints it names and no others, see [linting](/docs/reference/linting) |
| `std` | the standard library, `"roblox"` by default; selene's spellings are accepted |
| `globals` | extra globals |
| `exclude`, `include` | per area lists, see [the top level](#exclude-and-include) |
| `[lint.groups]` | a level for a whole kind of lint at once, see [linting](/docs/reference/linting) |
| `[lint.rules]` | lint levels: `allow`, `info`, `warn`, or `deny` |
| `[lint.options]` | per lint options, also named `[lint.config]` under selene's name |

A worm's lints live under `[lint.rules.<worm>]`, and each name reads `<worm>.<name>` in a message, in `--explain`, and in an `allow` comment.

`[lint]` holds per file questions only: a lint reads one file in isolation, which is why `larvae lint` works on stdin, in the editor, and with no config. A question about the whole project, such as a require cycle, lives in `[check]` below and runs under `larvae check`. The split follows the tools it mirrors: selene lints, `cargo check` checks. The two tables share one level vocabulary.

Every lint, its default level, its options, and the flag comment rules live on [linting](/docs/reference/linting).

## `[check]`

The CI gate. `larvae check` runs the analyses that need the whole require graph, and this table decides what fails the run. Each key is a level, the same `allow` / `warn` / `deny` that `[lint.rules]` uses, and only a `deny` fails CI. A cycle spans many files, so no `allow` comment can carry the decision; the level in this table is the only switch.

| key | default | meaning |
|---|---|---|
| `cycles` | `"warn"` | modules that require each other, directly or through a chain. The report names the whole cycle. A cycle is legal at runtime and common in Roblox code, so the default does not fail the build |
| `unused_modules` | `"allow"` | modules that nothing requires. Off by default, because a module reached only through a dynamic require, or from outside the project, would be a false positive. A Script or a LocalScript is never reported, because Roblox runs those |
| `early_require` | `"warn"` | client scripts that require through an indexing style that does not wait for replication. Only meaningful for the `roblox-instance` target. Reported once per file, because the fix is one config line |
| `entries` | `[]` | extra entry points, as paths relative to the project root. A module in this list counts as one the project runs, so it is never reported as unused |

`larvae check` also reports unresolvable requires and realm violations unconditionally. Those are wrong rather than untidy, so no level lowers them.

## `[bundle]`

`larvae bundle` writes the project as one file. Modules load on demand through a lazy registry, so bundling cannot move a side effect.

| key | default | meaning |
|---|---|---|
| `entry` | none | the module the bundle starts from, relative to the project root. `--entry` on the command line beats this key; without either, the command errors |
| `output` | `"bundle.luau"` | where the single file goes, relative to the project root |
| `tree_shake` | `true` | drop the modules that the entry cannot reach. Reachability comes from the require graph, so a module reached only through a dynamic require is dropped; such a require is reported, and a project that needs those modules turns this off |
| `module_ids` | `"paths"` | what the registry calls each module. `paths` reads well in an error; `opaque` numbers the modules instead, see below |

### `module_ids`

A path id in the registry reads well in a crash report, and it also ships the whole project layout: every file, package, and vendor directory in a table key anyone who reads the bundle can read. `opaque` numbers the modules instead. Numbers, not hashes, on purpose: a hash of a path is deterministic, so a list of likely paths recovers the names, and a number carries nothing to recover. The numbering follows the sorted paths, so a rebuild emits the same bytes.

The bundler follows the requires of a vendored package until the graph closes, with the same resolver, the same `.luaurc` walk, and the same `@self`, so a package that requires a package follows too. A resolution failure inside a vendored module warns instead of stopping the bundle, because a package can require another runtime, ex: `task or require("@lune/task")`. The require ships as written.

`@self` requires enter the require graph as well, so `check` follows a cycle through one and a bundle keeps what one names.

## `[minify]`

Tuning for `generator = "dense"`, which is the minifier. The dense generator re-emits the tokens of the finished output with the least whitespace that lexes the same. The token stream cannot change, so the program cannot change meaning; comments are trivia and do not survive. Under another generator the table is inert configuration.

| key | default | meaning |
|---|---|---|
| `column_span` | `120` | the column where the emitter breaks the line. A minified file on one line makes every reported line number useless, so the emitter breaks near a column instead. A token wider than the span, such as a long string, stays whole |
| `rename_variables` | `false` | give every local a short name while minifying. The same rule as `[rules] rename_variables`, turned on for dense builds only, so one profile can hold the whole minify story |
| `obfuscate` | `false` | make the output hard to read, see below |

### `obfuscate`

On, every emitted file prints through the dense emitter whatever `generator` says, with three changes: every type is gone, every local takes a name from `_0x0` upward, and every string literal becomes the `\xNN` form of its own bytes. The file lands on one line, because `obfuscate` sets the column span to unlimited; a project that wrote its own `column_span` keeps that number, the same way an explicit key beats an implied one everywhere else.

Roblox has no `loadstring`, so a file cannot ship as a decoded blob: it has to be Luau the compiler reads, and hiding the names, the strings, and the shape is what obfuscation can be. A backtick string stays whole, because splitting its static text from its holes means implementing interpolation twice, and a wrong split is a broken build; the names inside a hole are pinned instead of renamed.

#### What it is not

It adds no code. Some obfuscators wrap a program in opaque predicates, dead branches, and flattened control flow, so the reader follows a machine instead of a function. larvae does not, and the reason is that the output still has to run in a game:

- **Every branch it adds is a branch the engine runs.** Roblox executes this on a player's device, inside a frame budget, and a hot function wrapped in decision noise costs that budget for as long as the game lives.
- **A stack trace has to stay readable to you.** Line numbers already survive obfuscation, because `column_span` keeps the emitter breaking lines; control flow noise would keep the numbers and take the meaning.
- **It buys less than it looks like.** The names, the strings, and the layout are what a reader recovers a program from, and those are what this removes. Someone determined enough to trace flattened control flow is someone the extra branches do not stop either.

A require spec is left as written for the same practical reason: the engine decodes either spelling, so escaping the path hides nothing from a reader while breaking every tool that reads a spec as text, larvae's own checker included.

With `[bundle]` set, the bundle output gets the same treatment, because a bundle prints through the generator like any file. Pair it with `[bundle] module_ids = "opaque"` so the registry keys stop shipping the project layout.

A typical release profile:

```toml
[profile.ship.process]
generator = "dense"

[profile.ship.minify]
rename_variables = true
obfuscate = true

[profile.ship.bundle]
module_ids = "opaque"
```

## `[worms]`

Extensions, one table per worm. The key is the worm's name and must match `name` in the worm's own `worm.toml`, because the key also namespaces the worm's rules and its settings.

A worm is a table. The old string form, `xml = "luau-xml/worm@0.1.0"`, is refused with a message that prints the table to write instead, because the version is a key of its own now and a pin packed both halves into one string.

```toml
[worms]
xml = { repo = "luau-xml/worm", version = "^" }
vide = { cargo = "vide-worm", version = "0.2.0" } # a crate on crates.io, built on this machine

[worms.mine]
path = "build/myworm"                # a directory, for development
```

`version` takes three forms. `"^"` takes the newest release on every install. `"^0.1.0"` takes the newest release semver calls compatible, so 0.1.x. `"0.1.0"` takes that release and never moves. A leading `v` is accepted and dropped. `larvae worm add` writes an entry, `larvae worm install` puts every worm on disk, and `larvae worm remove` takes one out; there is no `worm update`, because `^` follows and a number holds.

A worm's settings live under `[worms.<name>.config]`, its rules under `[worms.<name>] rules`, its lint levels under `[lint.rules.<name>]`, and its format options under `[fmt.<name>]`. An older larvae used a top level `[config.<name>]` table; that spelling now causes an error that names the new location.

Every key, the version forms, the three install channels, the managing commands, and inheritance are documented on [using worms](/docs/worms/using-worms).

## `[lsp]`

The editor server, and `larvae analyze` reads it too. `enabled = false` hands the files to another server, `analyzer = false` serves the lints and the formatter without the type half, and `claim_only = true` narrows larvae to the files worms claim. The table also holds the sourcemap keys, `character_type`, `definitions` for extra `.d.luau` files, and the subtables for completion, inlay hints, hover, signature help, Luau's fflags, and the Studio link. `[lsp.<worm>]` carries the editor settings a worm declares.

Every key with its default lives on the [editor reference](/docs/reference/editor), and `larvae self code` completes them all.

## `[profile.<name>]`

This table holds the same keys as the root. larvae merges it over the base when you pass `--profile <name>` to `process` or `check`. Tables merge per key. Arrays and scalars are replaced whole, because if larvae appended to lists instead, a profile could not state that it does not append.

## Related pages

- [CLI reference](/docs/reference/cli) for the commands that read this file
- [rules](/docs/reference/rules) for `[rules]` in full
- [formatting](/docs/reference/formatting) for `[fmt]` in full
- [linting](/docs/reference/linting) for `[lint]` and flag comments in full
- [using worms](/docs/worms/using-worms) for `[worms]` in full
- [require targets](/docs/concepts/require-targets) for `[requires] target`
- [incremental builds](/docs/concepts/incremental-builds) for `cache` and `cache_dir`
