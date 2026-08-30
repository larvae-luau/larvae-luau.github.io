---
title: Realms and clones
description: Why larvae refuses to emit a require that would break in a running game
category: Concepts
order: 2
updated: 2026-08-30
---

A require can resolve perfectly on disk and still be wrong in a running game. larvae maps both ends of every require into the DataModel and refuses to emit something that would break at runtime.

This is the part of larvae that has no equivalent anywhere else, so it gets the longest page.

## The problem in one sentence

A path on disk is a fact about your filesystem. A require in a Roblox place is a fact about a live DataModel, where trees get cloned per player, half the tree never reaches the client, and lookups are case sensitive. Resolving the first correctly tells you almost nothing about the second.

larvae knows both. It resolves the require the way the Luau RFC says to, then asks a second question: given where this file lands in the DataModel and where the target lands, will this actually work?

Three answers make it say no.

## Starter containers clone

Code under `StarterPlayerScripts`, `StarterGui` and `StarterCharacterScripts` does not run where it sits. It runs as a *copy*, cloned into the player at join time, once per player and in the case of `StarterCharacterScripts` once per respawn.

That makes absolute requires into those containers a state duplication bug.

Consider a module and a script that both live under `StarterPlayerScripts`:

```text
src/StarterPlayerScripts/
  init.client.luau
  state.luau
```

Written as an absolute require, the emitted output points at the template:

```luau
-- emitted from the clone, resolves to the template
local state = require("@game/StarterPlayer/StarterPlayerScripts/state")
```

The running script is the clone inside `Players.You.PlayerScripts`. The path above points somewhere else entirely, at the `StarterPlayer` template that was never started. Luau caches module results per module instance, so the clone gets one copy of `state` and the template copy gets another. Two modules, same source, separate state. Nothing errors, the values are just silently not shared.

larvae emits a relative require instead, which follows the clone:

```luau
-- emitted by larvae, resolves inside the clone
local state = require("./state")
```

So the rule inside Starter containers is: **relative requires only**. The require walks the cloned tree it is actually running in.

### Requires pointing in from outside

The mirror of that rule is that nothing outside a Starter container may require into one. There is no correct output to emit, because the template is not the thing that runs and the clones are per player and do not exist at all until someone joins.

```luau
-- in src/ReplicatedStorage/shared/thing.luau
local hud = require("@game/StarterGui/HudController")
```

That is an error, no opt out. The fix is to move the shared code somewhere shared, ex: `ReplicatedStorage`, and have the Starter side require it rather than the other way around.

## Realms

Roblox splits the DataModel into what replicates and what does not. `ServerScriptService` and `ServerStorage` never reach a client. A client side require into either one cannot resolve, no matter how the path is spelled.

larvae works out which realms each file is reachable from, using the DataModel map derived from your Rojo project, and grades the require accordingly.

| requiring code | target in ServerScriptService or ServerStorage |
|---|---|
| client reachable | error |
| shared | warning |

Client reachable code requiring a server container is an **error**. The output cannot be correct.

```luau
-- in src/StarterPlayerScripts/init.client.luau
local Secrets = require("@game/ServerStorage/Secrets")
```

Shared code doing the same is a **warning**. Shared code can legitimately be required from the server only, in which case the require is fine, and larvae cannot prove which way it goes. So it tells you and gets out of the way.

```luau
-- in src/ReplicatedStorage/shared/audit.luau
local Log = require("@game/ServerScriptService/Log")
```

Under `strict = true` warnings become errors, so a project that wants the stricter reading can have it. See [failure classes](/docs/concepts/failure-classes).

## Casing

This one bites on macOS and Windows and never on the CI box, which is the worst possible failure shape.

Most developer machines have a case insensitive filesystem. So `require("./mymodule")` happily opens `MyModule.luau` at build time. Roblox instance lookup is case sensitive and will not.

larvae canonicalizes every emitted path segment to the real on disk casing.

Before, source as written, resolving fine on a case insensitive disk:

```luau
local m = require("./mymodule")
```

After, emitted with the actual file name:

```luau
local m = require("@game/ReplicatedStorage/shared/MyModule")
```

The mismatch itself is reported as a warning, `source and disk casing disagree`, and becomes an error under `strict = true`. The emitted output is correct either way, the diagnostic exists so the source gets fixed too.

The same canonicalization applies to the `roblox-instance` target, where the segment ends up inside a string:

```luau
local m = require(script.Parent:FindFirstChild("MyModule"))
```

## What this looks like in practice

The validation runs on every require, on both ends, on every build. It is not a separate lint pass you remember to run, and it is not skippable for the error class, because there is no correct output to emit.

`larvae check` runs the same analysis and writes nothing, which makes it the CI gate:

```shell
larvae check
```

Realm violations and unresolvable requires are reported unconditionally. The `[check]` table holds levels for project questions that are matters of degree, ex: require cycles, but no level touches these two, because they are wrong rather than untidy. See [failure classes](/docs/concepts/failure-classes).

## The honest claim

Nothing else in the ecosystem fully checks this.

darklua rewrites requires but does not model realms, does not know that Starter containers clone, and does not canonicalize casing against the DataModel. luau-lsp understands your files and your `.luaurc` aliases, but it is not modelling the runtime DataModel, so it has nothing to say about a client file reaching into `ServerStorage`. larvae's own editor server does say it: the same cross-realm finding `larvae check` reports squiggles in the open file, string forms and instance forms alike.

larvae can check it because it already built the map, the filesystem to DataModel mounts that come out of parsing your Rojo project. Once you have that map, refusing to emit a broken require is nearly free. See [Rojo integration](/docs/concepts/rojo-integration) for where the map comes from.

## Related

- [require targets](/docs/concepts/require-targets), the three output forms and the no wait caveat
- [failure classes](/docs/concepts/failure-classes), the full list of what errors and what warns
- [Rojo integration](/docs/concepts/rojo-integration), auto mounts and the derived project
- [configuration](/docs/reference/configuration), `strict` and the `[requires]` table
