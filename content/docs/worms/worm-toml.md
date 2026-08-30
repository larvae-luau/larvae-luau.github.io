---
title: worm.toml
description: The manifest beside the artifact, the four capability tables, and what larvae refuses at load
category: Worms
order: 3
updated: 2026-08-30
---

`worm.toml` ships beside the artifact. It is what larvae reads before it runs anything. A worm declares what it adds, and larvae checks the project's config against those declarations, so the manifest is also where the schema and the editor learn a worm's names.

```toml
name  = "markup"          # must equal the key under [worms]
api   = 1                 # the extension API this worm was built against
form  = "wasm"            # or "luau" or "native"
entry = "markup.wasm"     # the artifact, beside this file
requires = "larvae"       # optional, "larvae" (default) or "worm"

[frontend]                # the transform and format capabilities
claims = [".mk"]          # file extensions this worm compiles
fmt = true                # this worm answers format requests

[lints]                   # the lints this worm reports: bare names,
                          # each with a description and a default level

[fmt]                     # the format options this worm reads: bare names,
                          # each with a description and a default

[rules.tidy]              # one table per rule this worm creates
default = false
description = "Collapse adjacent markup nodes"
filter = ["Call"]

[options]                 # the settings this worm reads from [worms.<name>.config]
                          # and from [lsp.<name>]: bare names, each with a
                          # description, a type, and a default

[lsp]                     # the editor tiers this worm answers, native form only
resolve = true            # requires it claims, lowered for the analyzer
declarations = true       # .d.luau text injected at session start
respond = ["hover", "completions", "diagnostics"]
serves_luau = true        # its hooks answer inside plain Luau files too
```

## Top level keys

| key | meaning |
|---|---|
| `name` | must equal the key under `[worms]` in the user's config, because that key namespaces everything the worm adds |
| `api` | the extension API this worm was built against |
| `form` | `"luau"`, `"wasm"`, or `"native"` |
| `entry` | the artifact's path. For `native`, larvae makes the entry executable at install |
| `requires` | who owns the requires in what the worm produces |

### `form`

The [three forms](/docs/worms/what-a-worm-is) answer the same capabilities, so the form is a packaging and trust decision, not a feature decision. `luau` and `wasm` run sandboxed inside larvae. `native` is an ordinary executable spoken to over a pipe, with no sandbox.

A cargo worm has no zip to put this file in: the binary carries its own `worm.toml` and returns it over the pipe when larvae asks, because `cargo install` ships no data files. A cargo worm is always the native form.

### `api`

This matters most for wasm. A `.wasm` is a pinned artifact compiled against a host ABI, so a worm built for `api = 1` loaded by a larvae speaking `api = 2` is rejected with a sentence rather than discovered as a trap somewhere in the middle of a build.

### `requires`

`requires` says who owns the requires in whatever the worm produces: `"larvae"`, the default, means larvae processes them normally; `"worm"` means the worm resolved them itself and larvae keeps its hands off. It is declared rather than inferred, because a worm that resolves its own requires and one that emits ordinary requires look identical until larvae has already rewritten something it should not have. Choosing `"worm"` turns off realm and clone validation for those files, and larvae warns once at load naming the worm, rather than letting that disappear quietly. See [realms and clones](/docs/concepts/realms-and-clones).

## The four capability tables

Each table declares one capability, and a worm needs at least one. larvae refuses a promise the artifact cannot answer.

| table | capability | what it declares |
|---|---|---|
| `[frontend] claims` | Transform | the file extensions this worm compiles to Luau |
| `[frontend] fmt` | Format | that this worm answers a format request with a layout document or byte ranges |
| `[lints]` | Lint | the worm's lints, bare names with a default level. `larvae worm run --lint` reports at these defaults, and a project overrides them in `[lint.rules.<name>]` |
| `[rules]` | Rules | the worm's transform rules, one table per rule |
| `[lsp]` | Editor | the tiers above: resolve, declarations, and respond, plus `serves_luau`. Native form only, because the hooks sit on the analyzer's hot path |

Two more keys reach beyond the claims:

- `lints_luau = true`, top level, runs the worm's Lint op over every plain Luau file, after the builtin lints and on the same levels and suppressions. This is how a worm about conventions in ordinary code exists at all; the oop worm is the example.
- `shared = true`, under `[frontend]`, is a claiming worm's consent for foreign `lints_luau` worms to read its byte-true Luau shadow, so a convention holds inside its files too. The luaux worm sets it.

The names in every table are bare. larvae groups them under the worm's key in the project config and in the generated schema, so a worm's `tidy` can never collide with a builtin or with another worm's `tidy`. See [using worms](/docs/worms/using-worms) for the user's side of each table.

### `[rules.<name>]`

| key | meaning |
|---|---|
| `default` | whether the rule is on when the user says nothing |
| `description` | one line, shown by `larvae worm info` and in the editor |
| `filter` | the node kinds this rule sees |

`filter` is not a convenience. Undeclared kinds **never cross the boundary**, which is the single biggest lever a worm author has over cost. See [what a worm costs](/docs/worms/what-a-worm-costs). The names in `filter` are [node kinds](/docs/worms/node-api), not rule names.

### `[options]`

The worm's own settings, which the user writes in `[worms.<name>.config]`. Because the manifest declares each name with its type and default, larvae refuses an undeclared name and a wrong type on the user's side, and fills a missing option with its default. The declarations also land in the generated schema, so the editor completes them with descriptions.

## What larvae refuses at load

Validation happens once, before any file is read. It refuses:

- a `name` that does not match the key under `[worms]`
- an `api` mismatch
- a declared capability the artifact cannot answer
- a `claims` entry that is not a file extension
- any unknown key

A worm that loads is a worm whose manifest larvae fully understood, which is the same policy [configuration](/docs/reference/configuration) applies to `larvae.toml`.

To see what a manifest declares without running anything:

```shell
larvae worm info <dir>
```

## Related

- [using worms](/docs/worms/using-worms), the other side of this file in `larvae.toml`
- [node API](/docs/worms/node-api), the kinds `filter` names
- [CLI reference](/docs/reference/cli), `larvae worm info` and friends
