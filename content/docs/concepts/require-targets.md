---
title: Require targets
description: One input semantics, three output targets, and the one caveat that can break a correct looking build
category: Concepts
order: 1
updated: 2026-07-29
---

coldluau reads one require syntax and can write three. What you write never changes, what comes out is a config choice.

## Input is always Luau RFC semantics

Whatever target you pick, the input side is identical. coldluau resolves requires the way the Luau RFC says to, so your source stays portable and your editor tooling keeps working.

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

Aliases can come from `.luaurc` or from `[aliases]` in `coldluau.toml`. `.luaurc` can only express filesystem paths, so a DataModel target has to live in `coldluau.toml`. See [configuration](/docs/reference/configuration).

A require that is not RFC valid, ex: a bare `require("util")` with no `./`, is always an error. See [failure classes](/docs/concepts/failure-classes).

## The three targets

Set the target once in `coldluau.toml`.

```toml
[requires]
target = "roblox-string"
```

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

Kebab spellings work too: `find-first-child`, `wait-for-child`, `property-instance`.

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

Today the target is per project. Mixing native string requires with instance requires for just the early replication code is **planned (M2)** as `[requires.overrides]`, a per glob target.

## Related

- [realms and clones](/docs/concepts/realms-and-clones), the validation that runs on both ends of every require
- [failure classes](/docs/concepts/failure-classes), what errors, what warns, what is left alone
- [configuration](/docs/reference/configuration), the full `[requires]` table
