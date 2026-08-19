---
title: Editor setup
description: One command for config completion, a language server for diagnostics and formatting, and go to definition through .luaurc
category: Concepts
order: 6
updated: 2026-08-19
---

Three pieces: `larvae self code` for editing `larvae.toml`, `larvae lsp` for editing Luau, and one `.luaurc` alias for go to definition. None takes more than a minute.

## Config completion

```shell
larvae self code
```

The command sets up completion and hover docs for `larvae.toml`. Its first choice is to write an **Even Better TOML** association into the editor's user settings. The pattern matches `larvae.toml` in every location, so one entry covers every project on the machine. When that extension is absent, the command falls back to writing a `#:schema` line at the top of the file, which any Taplo based editor reads.

The schema is `crates/larvae/larvae.schema.json`, served from the repo. It contains a description for every key, the enum values, and the defaults. A test, `crates/larvae/tests/schema.rs`, checks the lint list against the registry and the `[fmt]` keys against the struct, so the schema cannot differ from the code. The editor is therefore the reference that most people use.

What you get in `larvae.toml`:

- completion for every table and key
- hover docs on each key, the same text as the [configuration reference](/docs/reference/configuration)
- enum completion on value fields, ex: `target` offers `roblox-string`, `path` and `roblox-instance`
- inline errors on unknown keys, before you run anything

That last one is worth the setup on its own. An unknown key in `larvae.toml` is a hard error at load time, because larvae owns the file and an unknown key is a typo. The schema surfaces it in the editor instead of on the next build.

### Projects with worms

A project with [worms](/docs/worms/what-a-worm-is) gets more. larvae merges the declarations of the loaded worms into a copy of the schema at `<cache_dir>/larvae.schema.json`, and `larvae self code` writes both the copy and a **workspace** association that points at it. The editor then completes a worm's lints, format options, rules, and settings, and shows the description of each one.

The workspace association holds an absolute `file://` URL, so the entry belongs to a developer and not to the repository.

The command rewrites the generated copy whenever one is on disk, and not only when the project has worms. A copy can outlive the reason it exists: an older larvae wrote it, or a worm did and the project since removed that worm. The editor settings still point at that file, so without the rewrite the editor would complete against a version of larvae that no longer exists.

### The reload step

The command ends by telling you to run **Developer: Reload Window**. The editor holds the schema in memory, so a new file on disk does not change what the editor already parsed. larvae cannot do this step for you, because the command line of the editor runs no editor command.

## Diagnostics and formatting

```shell
larvae lsp
```

The language server speaks over stdio and serves diagnostics and formatting. It runs the same code paths as `larvae lint` and `larvae fmt`, so the terminal and the editor cannot disagree about a finding or a layout.

The editor follows the same [exclusion lists](/docs/reference/configuration) as the commands. When a file is excluded, larvae clears its diagnostics; it does not keep the diagnostics that were there before you added the exclude.

A buffer claimed by a worm is routed to that worm, through the same code the commands use. The server never downloads a worm, because a keystroke cannot wait for the network; installs happen through `larvae worm install` in the terminal. A worm failure becomes one diagnostic against the file, and the server keeps serving.

See [formatting](/docs/reference/formatting) and [linting](/docs/reference/linting) for what the server reports.

### What the server answers

| method | what comes back |
|---|---|
| `textDocument/publishDiagnostics` | The lints, and the findings of a worm for a file it claims. |
| `textDocument/formatting` | One edit covering the document. A file that does not parse gets no reply, because a report on every keystroke is noise. |
| `textDocument/documentSymbol` | The symbols of the file. |
| `textDocument/codeAction` | The underscore fix for `unused_variable` and `unused_function`, plus what the worms of the project offer. |
| `larvae/definitions` | Luau definition text that a worm supplies. |

### Code actions

larvae offers one fix today, for `unused_variable` and `unused_function`, and it is the sentence those lints already print: prefix the name with an underscore. The underscore is the convention Luau and selene both read, and larvae reads it too, so the name stops being reported and the code keeps working.

The fix renames the declaration and every write of the name. A binding that is assigned and never read also reports, and prefixing the declaration alone there would leave the assignments pointing at a name nothing declares. That is a global, and a worse bug than the warning it silenced.

The capability was advertised before larvae had any actions, because an editor decides at initialize whether it will ever ask.

A worm offers actions here as well. The title of each action carries the worm's name, and an action that names the lint it repairs is grouped under that diagnostic.

### larvae/definitions

`larvae/definitions` is not in the protocol, which is why it carries larvae's name. The reply is Luau definition text that a worm supplies. A worm that makes a data file requirable is the case that asks for it: `require("./items.json")` has a type, the worm knows it, and neither larvae nor luau-lsp can work it out alone. This is a different thing from `larvae worm types`, which writes the definitions of the worm API for the people who write worms.

### When something is missing

A config that fails to resolve raises one editor warning with the reason, and the server serves defaults until it loads. A project without a `larvae.toml` raises nothing.

The editor skips a worm that is not installed and says nothing, because it answers a keystroke and a download is not an answer. Install through `larvae worm install`, see [using worms](/docs/worms/using-worms).

## Go to definition on aliases

**luau-lsp reads `.luaurc`.** That is its source of alias truth. larvae reads `.luaurc` too, and merges `[aliases]` from `larvae.toml` over it per key, so a `.luaurc` alias gives you both halves:

```json
{
  "aliases": {
    "pkg": "Packages"
  }
}
```

Now this require is resolvable by your editor and by larvae:

```luau
local Signal = require("@pkg/signal")
```

Ctrl-click jumps to `Packages/signal.luau`, hover shows the module's type, and rename works. larvae independently rewrites the same require for the engine:

```luau
local Signal = require("@game/ReplicatedStorage/Packages/signal")
```

One alias, two consumers, the editor follows it to a file and larvae follows it to a DataModel path.

### When the alias has to live in larvae.toml

`.luaurc` can only express filesystem paths. A DataModel target has to go in `larvae.toml`:

```toml
[aliases]
pkg = "@game/ReplicatedStorage/Packages"
```

luau-lsp cannot read that, so go to definition on `@pkg` stops working. If you need both, keep a filesystem alias in `.luaurc` for the editor and let larvae's auto mounts handle the DataModel side, since they already know where `Packages` lands. See [Rojo integration](/docs/concepts/rojo-integration).

## Related

- [configuration](/docs/reference/configuration), every key the schema describes
- [using worms](/docs/worms/using-worms), the declarations that get merged into the schema
- [require targets](/docs/concepts/require-targets), how aliases are resolved on the build side
