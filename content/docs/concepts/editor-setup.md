---
title: Editor setup
description: Config completion through the JSON schema, and go to definition through .luaurc
category: Concepts
order: 6
updated: 2026-07-29
---

Two small pieces of setup, one for editing `larvae.toml` and one for editing Luau. Neither takes more than a minute.

## Config completion

`larvae.toml` ships with a JSON Schema, and one comment line at the top of the file is what connects them.

```shell
larvae schema
```

That adds or refreshes the `#:schema` line at the top of an existing `larvae.toml`, pointing at the `larvae.schema.json` for your version.

The command is idempotent, it replaces a stale schema URL rather than adding a second line, and errors if there is no `larvae.toml`. `larvae init` adds the line for you, so reach for `schema` only when you wrote the config by hand or after upgrading larvae.

### What you get

Install **Even Better TOML** or **Taplo**, both of which read `#:schema`. Then in `larvae.toml` you get:

- completion for every table and key
- hover docs on each key, the same text as the [configuration reference](/docs/reference/configuration)
- enum completion on value fields, ex: `target` offers `roblox-string`, `path` and `roblox-instance`
- inline errors on unknown keys, before you run anything

That last one is worth the setup on its own. Unknown keys are hard errors at load time, and keys for planned features error with the milestone they land in, so the schema surfaces both in the editor instead of on the next build.

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
- [require targets](/docs/concepts/require-targets), how aliases are resolved on the build side
