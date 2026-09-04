---
title: Editor
description: The larvae language server, the analyzer inside it, every [lsp] key, and the VS Code extension
category: Reference
order: 6
updated: 2026-09-03
---

`larvae-lsp` is a full language server. It carries Luau's own analysis frontend, vendored and compiled in, so hover, completion, type diagnostics, and inlay hints come from the same type inference Luau runs. The lints, the formatter, and the code actions larvae always served ride in the same process. One server, both halves, measured against luau-lsp on a real project until the answers matched.

The server installs beside the CLI: `larvae self install` copies `larvae-lsp` and its analyzer library to `~/.larvae/bin`. The [Larvae extension](https://marketplace.visualstudio.com/items?itemName=AndrewBordis.larvae) starts it in VS Code; any other editor starts `larvae-lsp` over stdio. Setup is on [editor setup](/docs/concepts/editor-setup).

## What the server answers

| capability | what comes back |
|---|---|
| diagnostics | Luau's type errors with their error numbers, larvae's lints, a worm's findings, and the cross-realm requires `larvae check` reports, in one publish |
| hover | the inferred type, doc comments, and the card speaks the author's words: a `const` binding says `const`, an `export local` says so, a member says `hp: number` |
| completion | members, keywords ranked above auto-imports, service auto-imports, module auto-imports, require path completion, the strings a Roblox call takes, and deprecated entries struck through |
| signature help | parameters with the active one marked |
| inlay hints | variable types, parameter types and names, function return types; a double click accepts a type hint into the file |
| go to definition | locals, members, modules, and requires, aliases included |
| document symbols, semantic tokens, rename, document links, colors | as an editor expects |
| formatting | the same layout `larvae fmt` writes |
| code actions | larvae's lint fixes plus what the worms of the project offer |

### Inlay hints hold still while you type

`[lsp.inlay_hints] update_delay` holds the hints during a burst of keystrokes and recomputes once after the pause, so a hint never lands mid-word. Held hints follow their lines as edits move them. `type_hint_max_length` truncates a long label for display; the accept edit still writes the whole type, and a hint whose text is display notation rather than syntax, `@metatable` for one, never inserts.

Hovering a hint answers with the same card as hovering the name it annotates.

### The first list waits for the session

The analyzer takes a few seconds to load at startup. A completion asked in that window is held and answered the moment the session lands, so the popup you were typing toward opens on its own. The editor cancels the ask it no longer wants on every further keystroke, and only the newest one answers.

### The dialect is served

`const` bindings and `export local` declarations parse, type, and hover as written. Value exports ride Luau's `LuauExportValueSyntax` flag, which larvae turns on by default; `[lsp.fflags]` with `LuauExportValueSyntax = "false"` restores stock parsing, and `export` then reports as the error it is there.

### Requires resolve every way the build resolves them

String forms, `.luaurc` and `[aliases]` names, `@game/...` paths, and the instance forms: `require(script.Parent.Widget)`, `require(game.ReplicatedStorage.App)`, and the `GetService`, `FindFirstChild`, and `WaitForChild` call spellings all carry types. A worm-claimed target lowers the same way a string require does, so a `.luaux` component or a data file types through any spelling.

A module that returns `{ }` and carries `export type` lines hints and hovers as `{ type PlayerData, type Slot }` instead of the empty table, because the type exports are what the module is for.

### Roblox classes carry their handlers

A declaration file names every class and member and stops there, so the server puts the same handlers on them that luau-lsp does.

- `instance:IsA("BasePart")` narrows `instance` to the class it names, in the branch and past a `continue` or `return`. An unknown class name is an error. `item:IsA("KeyCode")` narrows an enum item the same way.
- `instance:Clone()` and `Instance.fromExisting(instance)` answer with the class of the instance, not `Instance`.
- `FindFirstChildWhichIsA`, `FindFirstChildOfClass`, `FindFirstAncestorWhichIsA`, and `FindFirstAncestorOfClass` answer with the class they name, or nil.
- `GetPropertyChangedSignal`, `IsPropertyModified`, and `ResetPropertyToDefault` check the property name against the class.
- `QueryDescendants("Part, Model > Folder")` answers with an array of the classes the selector ends on.
- `game:GetService("Nope")` and `Instance.new("Nope")` report `Invalid service name` and `Invalid class name` from the lists the definitions carry.
- With a sourcemap, `FindFirstChild`, `WaitForChild`, and `FindFirstAncestor` answer with the tree's own child or ancestor when the name is in it.
- Inside the quotes of each of these, completion offers the class names, the property names, the children, the enums, the creatable classes, or the services.

`Vector3` and `vector` are one type. Roblox hands the same value out under both names, so `vector.magnitude(part.Position)` and `local p: Vector3 = vector.create(1, 2, 3)` both check, and a hover reads `Vector3` either way. luau-lsp keeps them apart and reports both. `Vector2` stays apart here too: it is userdata at runtime, and the vector library refuses it there.

## The instance tree

The rojo sourcemap becomes types: each node is a declared type, and every script learns its own, so `script.Parent.Config` and `game.ReplicatedStorage.Packages` resolve with real children. A folder that holds only worm-claimed files joins the tree although rojo omits it.

`[lsp] sourcemap` names the file. With `sourcemap_autogenerate` on, the server keeps it fresh itself: `sourcemap_command` names the generator, run through the shell in the project root, and an empty command infers rojo from `rojo_project_file` and runs `rojo sourcemap --watch`. The generator and everything it started die with the server. A generator that does not start is said once and costs the autogeneration alone.

`character_type` decides what `Player.Character` types to: `r15` and `r6` carry the body parts of their rig, every part optional because a part can be destroyed or not yet streamed in. `not_set` types the union of the two.

`[lsp.studio]` links a running Studio through the companion plugin, so the live DataModel joins the tree.

## Config as code

A `.config.luau` file is Luau's config written as Luau, and the server types it as such. The session wraps the file's return value in a check against the declared config shape, forces strict mode on the buffer, and the keys then typecheck, complete, and hover: `languagemode`, the `lint` table with every rule name, `linterrors`, `typeerrors`, `globals`, and `aliases`. A wrong key or a wrong value squiggles before anything reads the file. luau-lsp wires the same file the same way, so the two servers agree about it. Inlay hints stay out of a config file, because a type hint on data is noise.

## Deprecated members

A deprecated use draws a strikethrough in the file and in the completion list. `[lsp.completion] hide_deprecated` drops deprecated entries from the list whole, and stays off by default. Where the platform marks a member, larvae's own `deprecated` finding stands down, so one use never reports twice.

## Worms in the editor

A worm serves the editor in three tiers, declared in its manifest so gating never runs worm code:

1. **Resolve.** The worm answers the requires it claims and hands the analyzer lowered Luau, so `require("./data.json")` and a `.luaux` component carry their real types.
2. **Declarations.** `.d.luau` text the worm injects at session start.
3. **Respond.** The worm transforms hover, completions, or diagnostics before the editor sees them.

A worm that lints plain Luau reports beside the builtin lints, in the editor and in `larvae lint` alike. The worm side of all of this is on [using worms](/docs/worms/using-worms) and [worm.toml](/docs/worms/worm-toml).

`[lsp.<worm>]` holds the editor settings a worm declares:

```toml
[lsp.oop]
hide_private_completions = false
```

Each key checks against the worm's own `[options]`, so a typo, a wrong type, or a name that is no worm warns instead of doing nothing.

## The `[lsp]` table

| key | default | meaning |
|---|---|---|
| `enabled` | `true` | off answers every request with nothing, so another server owns the files |
| `analyzer` | `true` | off serves the lints, format, and actions alone; hover, completion, and type diagnostics go quiet |
| `claim_only` | `false` | on serves only the files worms claim, so stock luau-lsp can own the plain Luau |
| `character_type` | `"r15"` | `r15`, `r6`, or `not_set` |
| `sourcemap` | `"sourcemap.json"` | the sourcemap to read, relative to the project root |
| `sourcemap_autogenerate` | `true` | the server runs the sourcemap command itself |
| `sourcemap_command` | `""` | the generator, through the shell; empty infers rojo |
| `definitions` | `[]` | extra type definition files, loaded after the platform globals; `larvae analyze --definitions` adds to the list |
| `rojo_project_file` | `"default.project.json"` | what the inferred rojo command reads |

The subtables, each with its own keys: `[lsp.completion]`, `[lsp.inlay_hints]`, `[lsp.signature_help]`, `[lsp.hover]`, `[lsp.index]`, `[lsp.studio]`, `[lsp.fflags]`, and `[lsp.bytecode]`. `larvae self code` completes every key with its description, and the [extension](#the-vs-code-extension) mirrors them as editor settings, so the schema is the reference most people read. Two worth naming:

- `[lsp.fflags]` controls Luau's own flags: `enable_new_solver` turns the new type solver on, `enable_by_default` turns on everything stable, and `over` sets one flag by name.
- `[lsp.bytecode]` tunes the `larvae/bytecode` and `larvae/compilerRemarks` requests the extension's compiled views use.

## The VS Code extension

The Larvae extension starts the server, watches `larvae.toml` and restarts on change, and mirrors the `[lsp]` keys as `larvae-lsp.*` settings. The extension also asks larvae which extensions the project's worms claim before the client starts, so a `.luaux` buffer is served from the first keystroke.

### Which side wins

**The project.** Where `larvae.toml` spells a key, that value stands and the editor setting for it is ignored; where the project says nothing, the editor setting applies. So a checkout behaves the same for everyone who opens it, and a developer's own preferences still fill in the rest. The server reads the raw `[lsp]` table to make that distinction, because a key the project left out and a key it set to the default look identical once parsed.

Two keys are the client's to act on before any server exists: `enabled` and `claim_only`. A server that never starts reads no project config, so the extension reads those two out of `larvae.toml` itself and follows the same rule. A project that turns the server on gets it, whatever the editor setting says.

## Embedding the server

Any host that speaks the protocol over stdio can run `larvae-lsp`. A host with no `larvae.toml` and no editor settings has the command line:

```shell
larvae-lsp --new-solver
```

`--new-solver` turns Luau's new type solver on for the whole session, over the project file and the editor, and stays on across every config reload. A library written for the new solver, jecs for one, types wrong under the old: an unannotated `local world = jecs.world()` loses its type there, and `world:component<<number>>()` then reports that it cannot instantiate type parameters. luau-lsp reads it the same way under its old solver. `--no-warning` keeps every warning off screen and publishes the errors alone, whoever raised the warning: a builtin lint, Luau, or a worm. Hints stay, because a strikethrough is not a warning. Any other argument passes through, so an editor that adds `--stdio` is fine.

```shell
larvae-lsp --new-solver --no-warning
```

## When something is wrong

**No types at all, and no diagnostics.** The server is not running, or it is running without the analyzer. Check the extension's output channel: a server that started prints its handshake there. Three usual causes:

- The project or the editor turned it off. `[lsp] enabled = false` in `larvae.toml` beats the editor setting; `[lsp] analyzer = false` keeps the lints and the formatter and takes the type half.
- The binaries are not together. `larvae-lsp` opens the analyzer library at startup, so the two travel as one: `larvae self install` from an unpacked release puts the CLI, the server, and the library in `~/.larvae/bin`. A server without the library beside it cannot start.
- The build carries no analyzer. `larvae lsp`, the CLI subcommand, is the fallback half by design.

**Windows, before 0.7.3.** The analyzer library was built against the dynamic C runtime, so a machine without the Visual C++ redistributable could not load it, and the server failed to start rather than falling back. 0.7.3 links that runtime statically; update and the redistributable stops mattering.

**`script.Parent` completes nothing.** The instance tree comes from the sourcemap. Check that `[lsp] sourcemap` names a file that exists, and that the generator runs: with `sourcemap_autogenerate` on, the server spawns rojo itself, and it says so once when it cannot.

**The terminal and the editor disagree about types.** `larvae analyze` reads `[lsp.fflags]` from `larvae.toml`, and the editor reads the settings too. A project that turns the new solver on in the editor alone gets the stock solver in the terminal. Put the flags in `larvae.toml` and both answer alike.

## Coexisting with luau-lsp

`claim_only = true` narrows larvae to the files worms claim and leaves plain Luau to another server. A worm whose hooks answer inside plain files widens that narrowing for its own answers and says so once. With the analyzer in the server there is no longer a reason to run two servers; the switch stays for the projects that want one anyway.

## Related

- [editor setup](/docs/concepts/editor-setup), the one-time steps
- [configuration](/docs/reference/configuration), the rest of `larvae.toml`
- [using worms](/docs/worms/using-worms), what a worm adds to the editor
