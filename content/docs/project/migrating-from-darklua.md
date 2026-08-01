---
title: Migrating from darklua
description: What ports directly, what changes, and the one gap to know about first
category: Project
order: 2
updated: 2026-07-30
---

coldluau is a drop in alternative to darklua. Most of a `.darklua.json` ports over with a rename and a table move. One thing does not port yet, and it decides whether you can adopt today.

> **Read this first.** coldluau cannot yet read Instance requires as *input*. If your codebase already contains `require(script.Parent.Foo)`, conversion to string requires is **planned (M2)**. Today coldluau reads RFC style string requires only. If that describes your project, you have to wait.

## The gap, in full

coldluau's input dialect is Luau RFC string requires: `./`, `../`, `@alias`, `@self`. See [require targets](/docs/concepts/require-targets) for the exact input semantics.

coldluau can *emit* Instance requires, with all three indexing styles. It just cannot *read* them yet.

| your codebase today | can you adopt now |
|---|---|
| `require("./sibling")` and `require("@pkg/thing")` | yes |
| `require(script.Parent.Foo)` | no, lands in M2 |
| a mix | only the string require files convert |

This is the top item on the [roadmap](/docs/project/roadmap).

## What ports directly

### Rule names

All 32 darklua rule names are accepted, so a rule list ports over unchanged. Names that are not implemented yet fail at config load naming their milestone, and names that live somewhere else in coldluau tell you where. Nothing is silently ignored.

27 of the 32 run today under the same names with matching options, 3 live in other config tables, and 2 are **planned (M2)**. coldluau also adds 7 rules darklua has no equivalent for. The full status table is on the [rules](/docs/reference/rules) page.

### The idea of a rules list

Same model: a set of named transforms, each either switched on or configured with options. coldluau uses TOML instead of JSON, so a rule with options becomes a subtable.

### Instance require output

All three indexing styles are shipped:

| `indexing_style` | emits |
|---|---|
| `find_first_child` | `script.Parent:FindFirstChild("Foo")` |
| `wait_for_child` | `script.Parent:WaitForChild("Foo")` |
| `property` | `script.Parent.Foo` |

`property` falls back to `["name"]` when the name is not a valid identifier.

## What changes

| darklua | coldluau |
|---|---|
| `.darklua.json` | `coldluau.toml` |
| `convert_require` rule | the `[requires]` table |
| `inject_global_value` | `[defines]`, **planned (M2)** |
| `remove_spaces` | `generator = "dense"`, **planned (M2)** |

Requires are the biggest structural change. In darklua they are a rule. In coldluau they are a top level table, because coldluau validates every require against the DataModel and that is not rule shaped. See [realms and clones](/docs/concepts/realms-and-clones).

Two of those replacements are not usable yet. `[defines]` and the dense generator both land in M2 and are hard errors at load time today.

## Before and after

A darklua config:

```json
{
  "rules": [
    {
      "rule": "convert_require",
      "target": { "name": "roblox", "indexing_style": "wait_for_child" }
    },
    "remove_comments",
    {
      "rule": "append_text_comment",
      "text": "generated, do not edit",
      "location": "start"
    }
  ]
}
```

The same intent in coldluau:

```toml
[requires]
target = "roblox-instance"
indexing_style = "wait_for_child"

[rules]
remove_comments = true

[rules.append_text_comment]
text = "generated, do not edit"
location = "start"
```

One behavior difference in that pair: coldluau's `remove_comments` defaults to `except = ["^--!"]`, so Luau directives like `--!strict` survive. darklua removes them, which silently changes how your code runs. Set `except = []` to match darklua exactly.

If you would rather move to native string requires while you are here, drop the `[requires]` block entirely. `roblox-string` is the default target, and it is the thing coldluau exists to do.

## The project file

darklua users typically maintain two nearly identical Rojo project files, one pointing at `src` for sourcemaps and editor tooling and one pointing at `dist` for serving. coldluau derives the second from the first, so one of them goes away.

`default.project.json` stays the source of truth. coldluau writes `.coldluau/build.project.json` and you point rojo at that. It never runs rojo for you.

## A migration order that works

1. Write a minimal `coldluau.toml` with your rule list, or none at all if you have `.luaurc` aliases
2. Run `coldluau check`, it writes nothing and reports every diagnostic every run
3. Fix what it reports
4. Run `coldluau process`, then point rojo at `.coldluau/build.project.json`
5. Delete the second project file

Step 3 is where migrations spend their time. coldluau maps both ends of every require into the DataModel, so it reports realm violations, Starter container violations and casing mismatches that darklua never checked.

## Related

- [rules](/docs/reference/rules), the full 32 name parity table
- [configuration](/docs/reference/configuration), every `coldluau.toml` key
- [require targets](/docs/concepts/require-targets), the three output targets
- [performance](/docs/project/performance), what the switch buys you
