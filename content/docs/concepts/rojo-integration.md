---
title: Rojo integration
description: One project file instead of the hand synced pair
category: Concepts
order: 4
updated: 2026-10-20
---

darklua users maintain two nearly identical Rojo project files: one pointing at `src` so sourcemaps and editor tooling work, and one pointing at `dist` so serving works. Every tree change has to be made twice, and the second one is the one you forget.

larvae derives the second from the first.

## The derived project

`default.project.json` stays the source of truth. You edit it, you commit it, your editor tooling reads it.

On every build, larvae:

1. Rewrites every `$path` under `input` to its `output` location
2. Copies everything else verbatim, every `$className`, `$properties`, `$ignoreUnknownInstances` and hand written instance
3. Writes the result to `.larvae/build.project.json`

Paths are also re-relativized, because Rojo resolves `$path` relative to the project file's own directory. The derived project lives one level down in `.larvae/`, so every path needs a `../` in front of it. `src/shared` becomes `../dist/shared`, and an untouched `Packages` becomes `../Packages`.

### Before and after

Your `default.project.json`:

```json
{
  "name": "my-game",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": {
      "$className": "ReplicatedStorage",
      "shared": { "$path": "src/shared" },
      "Packages": { "$path": "Packages" }
    },
    "ServerScriptService": {
      "$className": "ServerScriptService",
      "server": { "$path": "src/server" }
    }
  }
}
```

The generated `.larvae/build.project.json`:

```json
{
  "name": "my-game",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": {
      "$className": "ReplicatedStorage",
      "shared": { "$path": "../dist/shared" },
      "Packages": { "$path": "../Packages" }
    },
    "ServerScriptService": {
      "$className": "ServerScriptService",
      "server": { "$path": "../dist/server" }
    }
  }
}
```

Two things to notice. `src/shared` moved to the output tree and picked up its `../`. `Packages` is not under `input`, so it was left pointing at the same place, just re-relativized so Rojo still finds it.

## Auto mounts, the free side effect

Parsing the project file to rewrite it also tells larvae where every filesystem path lands in the DataModel. That map is what makes require rewriting possible at all.

From the project above, larvae knows that `src/shared` is `game.ReplicatedStorage.shared`, so this:

```luau
local util = require("./util")
```

becomes this:

```luau
local util = require("@game/ReplicatedStorage/shared/util")
```

The same map is what powers realm and Starter container validation, since it is how larvae knows a file is client reachable or lives inside a cloning container. See [realms and clones](/docs/concepts/realms-and-clones).

This is why `[requires.mounts]` is rarely written by hand. Because larvae reads `default.project.json` itself, the mounts are already known. The key exists as an override and as an escape hatch for projects with no Rojo project file, not as something you are expected to maintain:

```toml
# almost never needed, the project file already says this
[requires.mounts]
"src/shared" = "@game/ReplicatedStorage/shared"
```

## Behavior table

| situation | what happens |
|---|---|
| no project file | no derived project, `process` needs mounts or errors with instructions |
| model tree project | relative only rewriting, `@game` paths are meaningless there |
| several project files | `[rojo].project` picks one |
| `$path` to another project file | copied verbatim with a warning, larvae does not follow nested projects |

A model tree project, one whose root is not a `DataModel`, has no `game` to anchor against. larvae still rewrites requires, but only to relative forms.

## Configuring it

```toml
[rojo]
project = "default.project.json"
build_project = ".larvae/build.project.json"
```

`build_project` defaults to `build.project.json` inside `cache_dir`, so changing `[process].cache_dir` moves it. Full key list in [configuration](/docs/reference/configuration).

## The build never runs rojo

This is worth stating flatly. The build keeps `.larvae/build.project.json` fresh and stops there. **You point rojo at the derived project yourself.** larvae spawns no rojo process. luau-lsp runs `rojo sourcemap --watch` for the editor, if you set it up to.

```shell
larvae process --watch
```

```shell
rojo serve .larvae/build.project.json
```

There is no `larvae serve` and no `larvae build`. Serving is rojo's job, and every rojo command you already use works unchanged, just aimed at the derived project instead of the source one:

```shell
rojo build .larvae/build.project.json -o game.rbxl
```

Two terminals, or watch mode in the background, is the normal setup. Watch mode keeps the derived project in sync too, so adding a tree entry to `default.project.json` propagates without a manual rebuild. See [incremental builds](/docs/concepts/incremental-builds).

Add `.larvae/` and `dist/` to `.gitignore`. `larvae init` offers to do it for you.

## Related

- [realms and clones](/docs/concepts/realms-and-clones), what the DataModel map is used for beyond rewriting
- [require targets](/docs/concepts/require-targets), the three output forms
- [incremental builds](/docs/concepts/incremental-builds), watch mode and the cache
- [configuration](/docs/reference/configuration), the `[rojo]` table
