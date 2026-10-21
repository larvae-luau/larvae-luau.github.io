---
title: Editor
description: The larvae language server, every [lsp] key, the VS Code extension, and luau-lsp beside it
category: Reference
order: 6
updated: 2026-10-20
---

`larvae lsp` is the editor server. It lints, formats, and offers the fixes of the lints, through the same code the commands run, so the terminal and the editor cannot disagree. The types belong to [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp), which runs beside it and answers hover, completion, inlay hints, and navigation.

The [Larvae extension](https://marketplace.visualstudio.com/items?itemName=AndrewBordis.larvae) starts the server in VS Code. Any other editor starts `larvae lsp` over stdio. Setup is on [editor setup](/docs/concepts/editor-setup).

## What the server answers

| capability | what comes back |
|---|---|
| diagnostics | larvae's lints, the findings of the worms, and the cross-realm requires that `larvae check` reports, in one publish |
| formatting | the same layout `larvae fmt` writes |
| code actions | larvae's lint fixes, and the actions the worms of the project offer |

The server advertises nothing that luau-lsp answers, so the editor never has to pick between two answers.

## Worms in the editor

A worm claims its files in the editor as it does on the command line. A `.luaux` buffer goes to its worm for diagnostics and formatting, and the Luau parser never reads it. A worm that lints plain Luau reports beside the builtin lints. The server never downloads a worm, because a keystroke cannot wait for the network, so `larvae worm install` is the download. A worm failure becomes one diagnostic against the file, and the server keeps serving.

`[lsp.<worm>]` holds the editor settings a worm declares:

```toml
# one table per worm, keyed by its name
[lsp.markup]
strict = false   # an option the markup worm declares under [options]
```

Each key checks against the worm's own `[options]`, so a typo, a wrong type, or a name that is no worm warns instead of doing nothing.

## The `[lsp]` table

| key | default | meaning |
|---|---|---|
| `enabled` | `true` | off answers every request with nothing, so another server owns the files |
| `claim_only` | `false` | on lints and formats only the files that a worm claims, and leaves plain Luau to other tools |

## Before 0.10

Up to 0.9, the separate `larvae-lsp` binary carried Luau's analyzer, and `larvae analyze` printed its type diagnostics in the terminal. Both are gone since 0.10, because luau-lsp already serves the types. `larvae self install` and `larvae self update` remove a `larvae-lsp` binary and its `eclipse_analysis` library that an older release left in the install directory.

The other `[lsp]` keys of the analyzer still load, ex: `analyzer`, `sourcemap`, `[lsp.fflags]`, and `[lsp.inlay_hints]`. The editor shows one warning for each key that the project still sets. Remove the key, and set the same thing in luau-lsp if you need it.

A worm manifest that declares `[lsp]` hooks still loads too, and larvae prints one note per worm. The hooks do nothing. See [worm.toml](/docs/worms/worm-toml).

## The VS Code extension

The Larvae extension starts the server, watches `larvae.toml` and restarts on change, and mirrors `enabled` and `claim_only` as `larvae-lsp.*` settings. The extension also asks larvae which extensions the worms of the project claim before the client starts, so a `.luaux` buffer is served from the first keystroke.

### Which side wins

**The project.** Where `larvae.toml` spells a key, that value stands and the editor setting for it is ignored. Where the project says nothing, the editor setting applies. So a checkout behaves the same for everyone who opens it, and the preferences of one developer still fill in the rest. The server reads the raw `[lsp]` table to make that distinction, because a key the project left out and a key it set to the default look identical once parsed.

A server that never starts reads no project config, so the extension reads `enabled` and `claim_only` out of `larvae.toml` itself and follows the same rule.

## When something is wrong

**No diagnostics at all.** The server is not running. Check the output channel of the extension: a server that started prints its handshake there. The project or the editor can also turn it off: `[lsp] enabled = false` in `larvae.toml` beats the editor setting.

**No hover and no completion.** luau-lsp gives these, and larvae does not. Install luau-lsp beside larvae.

**A plain Luau file gets no lints.** `[lsp] claim_only = true` leaves plain Luau to other tools. Set it to `false`, or remove it.

## Related

- [editor setup](/docs/concepts/editor-setup), the one-time steps
- [configuration](/docs/reference/configuration), the rest of `larvae.toml`
- [using worms](/docs/worms/using-worms), what a worm adds to the editor
