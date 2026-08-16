---
title: Migrating from darklua
description: What ports directly, what changes, and what your stylua and selene files keep doing
category: Project
order: 2
updated: 2026-08-16
---

larvae is a drop in alternative to darklua. Most of a `.darklua.json` ports over with a rename and a table move, and nothing that fails ports silently: every darklua rule name gets either a working rule or an error that names the larvae way to do the same thing.

## Instance requires port in both directions

larvae reads instance requires as input, through `[requires] instance_input`, so a codebase written as `require(script.Parent.Foo)` converts. String require input works as it always has: `./`, `../`, `@alias`, `@self`. See [require targets](/docs/concepts/require-targets) for the exact input semantics.

On the output side, all three indexing styles of the `roblox-instance` target are shipped:

| `indexing_style` | emits |
|---|---|
| `find_first_child` | `script.Parent:FindFirstChild("Foo")` |
| `wait_for_child` | `script.Parent:WaitForChild("Foo")` |
| `property` | `script.Parent.Foo` |

`property` falls back to `["name"]` when the name is not a valid identifier.

## What ports directly

### Rule names

There are 36 rules: 27 that match darklua name for name with matching options, and 9 that only larvae has. A darklua rule list ports over unchanged, and the full table is on the [rules](/docs/reference/rules) page.

An unknown rule name is an error, never ignored. Three darklua names are deliberately not larvae rules, and the error points at the larvae way to do the same thing:

| darklua rule | where it went |
|---|---|
| `convert_require` | the `[requires]` table |
| `inject_global_value` | `[defines]` |
| `remove_spaces` | `generator = "dense"`, tuned by `[minify]` |

Requires are the biggest structural change of the three. In darklua they are a rule. In larvae they are a top level table, because larvae validates every require against the DataModel and that is not rule shaped. See [realms and clones](/docs/concepts/realms-and-clones). `inject_global_value` becomes a compile time constant that constant folds, and `remove_spaces` becomes an output generator rather than a transform.

### The idea of a rules list

Same model: a set of named transforms, each either switched on or configured with options. larvae uses TOML instead of JSON, so a rule with options becomes a subtable.

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

The same intent in larvae:

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

One behavior difference in that pair: larvae's `remove_comments` defaults to `except = ["^--!"]`, so Luau directives like `--!strict` survive. darklua removes them, which silently changes how your code runs. Set `except = []` to match darklua exactly.

If you would rather move to native string requires while you are here, drop the `[requires]` block entirely. `roblox-string` is the default target, and it is the thing larvae exists to do.

## Your stylua and selene files keep working

A darklua project usually formats with stylua and lints with selene. larvae replaces both, and the migration cost is zero: larvae reads `stylua.toml` (or `.stylua.toml`) and `selene.toml` as they are, so the project keeps its settings and the output does not change because you changed tools.

The unknown key rule differs by file, on purpose:

- In `stylua.toml` and `selene.toml`, an unknown key is ignored, because those files belong to other tools that add options on their own schedule. Rejecting the whole file over one line that was never larvae's would lose every setting.
- In `larvae.toml`, an unknown key is an error, because larvae owns that file, so an unknown key is a typo.

You can also write both tools' settings directly in `larvae.toml`, under `[fmt]` and `[lint]`, and delete the extra files. selene's spellings are accepted where they differ: the `std` values (`lua51` through `lua54`, `luajit`, and chains such as `roblox+testez`), and `[lint.config]` as a second name for `[lint.options]`.

When a tool's file and `larvae.toml` set the same key, `larvae.toml` wins key by key, because it is the more specific file. For lists (`rules`, `globals`, `exclude`), larvae adds its entries to selene's and does not replace them. Details on [formatting](/docs/reference/formatting) and [linting](/docs/reference/linting).

## The project file

darklua users typically maintain two nearly identical Rojo project files, one pointing at `src` for sourcemaps and editor tooling and one pointing at `dist` for serving. larvae derives the second from the first, so one of them goes away.

`default.project.json` stays the source of truth. larvae writes `.larvae/build.project.json` and you point rojo at that. It never runs rojo for you.

## A migration order that works

1. Write a minimal `larvae.toml` with your rule list, or none at all if you have `.luaurc` aliases
2. Run `larvae check`, it writes nothing and reports every diagnostic every run
3. Fix what it reports
4. Run `larvae process`, then point rojo at `.larvae/build.project.json`
5. Delete the second project file
6. If stylua or selene ran separately, retire them: `larvae fmt` and `larvae lint` read their config files, so this step needs no porting

Step 3 is where migrations spend their time. larvae maps both ends of every require into the DataModel, so it reports realm violations, Starter container violations and casing mismatches that darklua never checked.

## Related

- [rules](/docs/reference/rules), the full 36 rule table with the darklua parity set
- [formatting](/docs/reference/formatting), every `[fmt]` option and the stylua mapping
- [linting](/docs/reference/linting), every lint and the selene mapping
- [configuration](/docs/reference/configuration), every `larvae.toml` key
- [require targets](/docs/concepts/require-targets), the three output targets
- [performance](/docs/project/performance), what the switch buys you
