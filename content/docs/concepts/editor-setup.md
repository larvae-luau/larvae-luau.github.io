---
title: Editor setup
description: The Larvae extension and luau-lsp, config completion, and go to definition through .luaurc
category: Concepts
order: 6
updated: 2026-10-20
---

Three pieces: the Larvae extension and luau-lsp for editing Luau, `larvae self code` for editing `larvae.toml`, and one `.luaurc` alias habit for portable requires. None takes more than a minute.

## The language servers

Two servers share each Luau file, and each answers what the other does not.

- **larvae** lints, formats, and offers the fixes of the lints.
- **[luau-lsp](https://github.com/JohnnyMorganz/luau-lsp)** gives the types: hover, completion, inlay hints, type diagnostics, and go to definition.

In VS Code, install the [Larvae extension](https://marketplace.visualstudio.com/items?itemName=AndrewBordis.larvae) and the luau-lsp extension. The Larvae extension starts `larvae lsp` and restarts it when `larvae.toml` changes. The `[lsp]` table in `larvae.toml` configures the server.

Any other editor starts the larvae server itself, over stdio:

```shell
larvae lsp
```

The server runs the same code as the commands, so the terminal and the editor cannot disagree. What it answers, key by key, is on the [editor reference](/docs/reference/editor).

A buffer that a worm claims is served through that worm. The server never downloads a worm, because a keystroke cannot wait for the network. `larvae worm install` is the download.

## Config completion

```shell
larvae self code
```

The command sets up completion and hover docs for `larvae.toml`. Its first choice is to write an **Even Better TOML** association into the editor's user settings. The pattern matches `larvae.toml` in every location, so one entry covers every project on the machine. When that extension is absent, the command falls back to writing a `#:schema` line at the top of the file, which any Taplo based editor reads.

The schema is `crates/larvae/larvae.schema.json`, served from the repo. It contains a description for every key, the enum values, and the defaults. A test checks the lint list against the registry, the `[fmt]` keys against the struct, and the `[lsp]` keys against the config, so the schema cannot differ from the code. The editor is therefore the reference that most people use.

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

## Aliases and go to definition

luau-lsp reads `.luaurc`, and larvae reads it too, with `[aliases]` from `larvae.toml` merged over it per key. So one alias serves the editor and the build:

```json
{
  "aliases": {
    "pkg": "Packages"
  }
}
```

```luau
local Signal = require("@pkg/signal")
```

In luau-lsp, Ctrl-click jumps to `Packages/signal.luau` and hover shows the type of the module. larvae rewrites the same require for the engine:

```luau
local Signal = require("@game/ReplicatedStorage/Packages/signal")
```

One alias, two consumers: the editor follows it to a file and the build follows it to a DataModel path.

### When the alias has to live in larvae.toml

`.luaurc` can only express filesystem paths. A DataModel target has to go in `larvae.toml`:

```toml
[aliases]
pkg = "@game/ReplicatedStorage/Packages"
```

luau-lsp reads only `.luaurc`, so it cannot follow that spelling. Keep a filesystem alias in `.luaurc` beside it: `.luaurc` is what every other Luau tool reads, so the requires stay portable beyond larvae.

`larvae self sync-luaurc` maintains that portability for you: it inverts each DataModel alias back to the directory that mounts there and writes that path into `.luaurc`, see the [CLI reference](/docs/reference/cli).

## Related

- [editor reference](/docs/reference/editor), what the server answers and every `[lsp]` key
- [configuration](/docs/reference/configuration), every key the schema describes
- [using worms](/docs/worms/using-worms), the declarations that get merged into the schema
- [require targets](/docs/concepts/require-targets), how aliases are resolved on the build side
