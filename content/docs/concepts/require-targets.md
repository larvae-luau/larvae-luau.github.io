---
title: Require targets
description: One input semantics, three output targets, and the one caveat that can break a correct looking build
category: Concepts
order: 1
updated: 2026-08-21
---

larvae reads one require syntax and can write three. What you write never changes, what comes out is a config choice.

## Input is always Luau RFC semantics

Whatever target you pick, the input side is identical. larvae resolves requires the way the Luau RFC says to, so your source stays portable and your editor tooling keeps working.

That means all of the following are understood:

- `./sibling` and `../parent/thing`, relative to the requiring file
- `@alias/path`, resolved from aliases
- `@self`, the requiring file's own directory
- `.luaurc` alias lookup, walking up the directory tree from the requiring file
- `init.luau` abstract module rules, a directory containing `init.luau` is requirable as a module
- `.luau` before `.lua`, and if both could match, that ambiguity is an error

```luau
local Signal = require("@pkg/signal")
local util = require("./util")
local json = require("../lib/json")
local sibling = require("@self/helper")
```

Aliases can come from `.luaurc` or from `[aliases]` in `larvae.toml`. `.luaurc` can only express filesystem paths, so a DataModel target has to live in `larvae.toml`. See [configuration](/docs/reference/configuration).

A require that is not RFC valid, ex: a bare `require("util")` with no `./`, is always an error. See [failure classes](/docs/concepts/failure-classes).

## The three targets

Set the target once in `larvae.toml`.

```toml
[requires]
target = "roblox-string"
```

The root key `target` is a short form of the same key, so the first line of a config needs no table header:

```toml
target = "roblox-string"
```

They are one key with two spellings. A config that writes both gets an error, larvae never merges them.

| target | emits | use it for |
|---|---|---|
| `roblox-string` | `require("@game/ReplicatedStorage/shared/util")` | Roblox, modern clients |
| `path` | `require("../lib/json")` | Lune, zune, the luau CLI |
| `roblox-instance` | `require(script.Parent:FindFirstChild("util"))` | older clients, and code that runs before replication |

`roblox-string` is the default.

### roblox-string

The headline target. Aliases and relative paths become native string requires against the DataModel.

Before:

```luau
local Signal = require("@pkg/signal")
local util = require("./util")
```

After:

```luau
local Signal = require("@game/ReplicatedStorage/Packages/signal")
local util = require("@game/ReplicatedStorage/shared/util")
```

### path

Filesystem paths, for runtimes that load off disk. Aliases expand, relative paths stay relative.

Before:

```luau
local json = require("@pkg/json")
```

After:

```luau
local json = require("../lib/json")
```

#### What the path target writes for an init file

An `init.luau` does not read `./` the way every other file does. The RFC resolves a relative require from an init file against the parent of the directory it sits in, and a runtime enforces that: `./utils/helper` inside `pkg/init.luau` fails to resolve, and `./pkg/utils/helper` works.

So larvae writes `@self` for a module inside the directory of an init file:

```luau
-- src/init.luau, and dist/init.luau, both
const helper = require("@self/utils/helper")
```

`@self` names that directory without spelling it. The same require reads correctly at `src/init.luau`, at `dist/init.luau`, and inside a package a consumer has vendored under a name neither tree used. A relative form cannot do that, because it has to name the directory, and the name changes when the output moves.

Everything else keeps the relative form. A sibling is `./test` in both trees, because both ends travel together, and a target outside the init file's own directory has no `@self` to reach it by.

### roblox-instance

Instance chains instead of strings. This is the darklua style output, and the target you need when code runs before replication.

Before:

```luau
local util = require("./util")
```

After, with the default `indexing_style`:

```luau
local util = require(script.Parent:FindFirstChild("util"))
```

`indexing_style` picks how each segment is indexed:

| value | emits |
|---|---|
| `find_first_child` | `script.Parent:FindFirstChild("Foo")` |
| `wait_for_child` | `script.Parent:WaitForChild("Foo")` |
| `property` | `script.Parent.Foo`, falls back to `["name"]` when the name is not an identifier |

`find_first_child` and `property` do not wait for replication. `larvae check` has a gate for that: `[check] early_require` warns when a client script requires through an indexing style that does not wait, because such a require can run before the target has replicated. It is reported once per file, because the fix is one config line. See [failure classes](/docs/concepts/failure-classes).

## The roblox-string caveat, read this one

**Native string requires have no wait semantics.** They resolve immediately or they error. There is no yielding, no retry, and no `WaitForChild` equivalent hiding inside them.

Client code that runs before ReplicatedStorage has replicated will therefore fail on a native string require, even though the build was correct and every path resolved. This is the one way a correct looking build can fail at runtime, so it is worth stating plainly.

Code that runs early needs `roblox-instance` with `wait_for_child`.

```toml
[requires]
target = "roblox-instance"
indexing_style = "wait_for_child"
```

Before:

```luau
local Signal = require("@pkg/signal")
```

After, with `roblox-string`, which resolves immediately or errors:

```luau
local Signal = require("@game/ReplicatedStorage/Packages/signal")
```

After, with `roblox-instance` and `wait_for_child`, which yields until the instance exists:

```luau
local Signal = require(game:GetService("ReplicatedStorage"):WaitForChild("Packages"):WaitForChild("signal"))
```

The target does not have to be per project. `[requires.overrides]` sets a target per glob, so just the early replication code can take `roblox-instance` while the rest of the project keeps native strings. See [configuration](/docs/reference/configuration) for the key.

And `[check] early_require` warns when a client script ends up on an indexing style that does not wait for replication, so the gap this section describes is caught rather than remembered.

## Related

- [realms and clones](/docs/concepts/realms-and-clones), the validation that runs on both ends of every require
- [failure classes](/docs/concepts/failure-classes), what errors, what warns, what is left alone
- [configuration](/docs/reference/configuration), the full `[requires]` table
