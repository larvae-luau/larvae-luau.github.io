---
title: Writing a worm in Luau
description: No toolchain, typed against worm.d.luau, a file in your own repo
category: Worms
order: 4
updated: 2026-08-19
---

Nothing to install and no toolchain. A Luau worm is a file in your own repo that returns a table, and it runs in a VM embedded in larvae.

## Getting types

```shell
larvae worm types    # writes the Luau definitions and wires them into .vscode/settings.json
```

That wires up luau-lsp for the project by adding an entry to `luau-lsp.types.definitionFiles`, which is a map of package name to path:

```json
"luau-lsp.types.definitionFiles": {
  "larvae-worm": "worm.d.luau"
}
```

Outside an editor:

```shell
luau-lsp analyze --definitions=worm.d.luau init.luau
```

The definitions are the authoritative signatures for every capability, so when this page describes a reply in prose, `worm.d.luau` holds its exact shape.

## The shape

```luau
--!strict
local worm: Worm = {
	-- optional, called once before any file is seen.
	-- a worm receives its own settings from [worms.<name>.config],
	-- the rules that are on, the resolved [fmt] table, and the lint
	-- levels, so it lays its constructs out in the project style and
	-- the user states each setting one time.
	init = function(config, rules)
	end,

	-- the transform capability, [frontend] claims in worm.toml
	frontend = {
		compile = function(source: string, config: string): string
			return (source:gsub("<>", "{}"))
		end,
	},

	-- the rules capability, one table per rule declared in worm.toml
	rules = {
		strip_debug = {
			visit = function(node: Node, ctx: Context)
				if node:kind() == "CallExpr" then
					ctx:remove(node)
				end
			end,
		},
	},
}

return worm
```

A worm needs at least one capability and may hold several. Declare each one in [`worm.toml`](/docs/worms/worm-toml), a rule with its `default` and `filter`, a lint with its default level, or larvae will not know they exist.

## Answering transform

Source in, Luau out, **with the line count kept**. Line N of the output must still be line N of the input, because `retain-lines` output downstream maps stack traces to the source. `larvae worm run` checks this on every run.

## Answering format

A format reply is a layout document, or just the byte ranges of your output that hold Luau. The short form is the whole trick: name the Luau ranges and nothing else, and larvae formats each range in the project style and keeps every other byte as the author wrote it. larvae renders; the worm never does.

Range ends do not need to be exact. larvae pulls a `;` that sits just after a range into it, and leaves a `;` that opens a range outside it, because each range formats as a chunk of its own and a `;` at an edge reads as a stray statement. See [what a worm is](/docs/worms/what-a-worm-is) for the full reasoning.

## Answering lint

A lint reply is findings **without a severity**, plus the comment spans larvae needs to apply `allow` comments, plus an optional Luau shadow of the file. The host stamps the levels from `[lint.rules.<name>]`, applies the `allow` comments, and owns the exit code, so a worm lint behaves exactly like a builtin one from the user's side.

The shadow is what `inherit_lints = true` runs the builtin lints against; without one, they run against your transform output. Returning a shadow is how a worm whose surface syntax is not Luau still gets `unused_variable` for free.

## Answering the editor

Two more entries on `frontend` answer the language server: `frontend.actions` for code actions and `frontend.definitions` for Luau type definitions. Both are optional. Leave them out and the worm answers with nothing rather than an error, the opposite of `format` and `lint`, where the manifest promises the capability and a missing answer is a broken promise worth a message. The editor asks on a keystroke, so a worm that only formats must cost a reply and not a line in the editor log every time the lightbulb opens. A worm that fails is passed over for the same reason: one broken worm must not take the lightbulb from the others.

An action speaks in byte offsets, because the worm parsed the file, and larvae turns those into protocol positions. The title carries the worm's name, and an action that names the lint it repairs is grouped under that diagnostic.

`frontend.definitions` returns Luau definition text, the answer to `larvae/definitions`. A worm that makes a data file requirable is the case that asks for it: `require("./items.json")` has a type, and the worm knows it. This is a different thing from `larvae worm types`, which writes the worm API definitions this page starts with.

## Kinds are a singleton union

`node:kind()` returns a **singleton union** of the node kinds rather than a bare `string`. Comparing against one autocompletes, and a typo fails to typecheck instead of quietly never matching. That last part is what makes it worth the type: a rule that silently never fires is the hardest kind of bug to notice in a build tool.

The full list, and what else a node answers, is on [the node API](/docs/worms/node-api).

## The sandbox

A Luau worm runs under Luau's own sandbox with globals frozen, an instruction budget, and a memory ceiling, so an endless loop stops instead of hanging the build. It cannot reach the filesystem, and that is a property of the sandbox rather than a promise.

To report a problem, call `error("message")`. larvae attributes it to your worm by name and takes that file out of the build. It does not crash.

## Developing one

`larvae worm` works with no project and nothing installed:

```shell
larvae worm run myworm app.mk          # plain transform, print the result
larvae worm run myworm app.mk --fmt    # format it, and report if a second pass changes it
larvae worm run myworm app.mk --lint   # report findings at the manifest defaults
larvae worm info myworm                # what the manifest declares, without running it
larvae worm types                      # write the Luau definitions for a language server
```

`run` reports the line count on **every** run, not just failures:

```text
$ larvae worm run myworm app.mk
2 lines in, 2 lines out
local f = {}
return f
```

```text
$ larvae worm run myworm app.mk
✗ line count changed, 2 in and 4 out, which breaks retain lines downstream
```

Retain lines is the property most easily broken by accident and hardest to notice, which is why it is in front of you on a successful run too. In a real build that same case is a **warning** and the output still ships, since it is valid Luau and only the line numbers below it stop matching. `worm run` is stricter on purpose.

To exercise the full pipeline, the config surface, and the generated schema, point a real project at the worm with `path =` under `[worms]`. A `path` worm is read fresh on every run, so an edit answers immediately.

See the [CLI reference](/docs/reference/cli) for the full `larvae worm` surface.

## Luau, wasm, or native

For a rule that visits many nodes, Luau is the cheapest form: a node crossing costs about six times less than in wasm, which inverts what most people assume. wasm is still the default recommendation for a published worm, because it ships one artifact for every platform whatever language built it. Native is for trusted code that needs native speed, and it batches rules instead of crossing per node. See [what a worm costs](/docs/worms/what-a-worm-costs) before reaching for a compiler.

## Related

- [node API](/docs/worms/node-api), what a node and a context answer
- [worm.toml](/docs/worms/worm-toml), declaring your capabilities
- [writing a worm in Rust](/docs/worms/writing-in-rust), the wasm and native forms
