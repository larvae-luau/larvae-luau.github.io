---
title: The node API
description: Opaque handles, deferred edits, the batched native message, and the 34 node kinds
category: Worms
order: 6
updated: 2026-08-16
---

The wasm and Luau forms see the same thing, and neither ever receives larvae's AST. The native form sees the same values through a different shape, batched, for a reason this page states below.

A worm gets an **opaque handle**, which is a pair of integers, plus accessors. That is what lets larvae reshape its tree without breaking every pinned worm, and it is the trap SWC fell into by making its AST the plugin ABI.

## What a node answers

| call | gives |
|---|---|
| `kind` | the node kind, ex `"CallExpr"` |
| `text` | the source it covers |
| `span` | byte offsets into the original source, half open |
| `children` | direct children, in source order |
| `parent` | the enclosing node, absent only for the root |
| `replace` | queue a replacement of this node's bytes |
| `remove` | queue a deletion |

In Luau these are method calls on the node, with edits going through the context: `node:kind()`, `ctx:remove(node)`. In Rust they are methods on `Node`: `node.kind()`, `node.remove()`.

## Rules are batched on native

On wasm and Luau, a rule is called per matching node, and each accessor is a cheap crossing into the host. On native every crossing is a trip over a pipe costing about 24 µs, so per node dispatch would spend the whole budget on the boundary. larvae instead sends **one batched message per file**: the message carries each matched node and the source, the rule reads them and answers with its edits in one reply, and it navigates no tree: no `parent`, no `children`, no second crossing. The edits splice exactly like any others.

The values are the same on every transport, so a rule that already works from the matched node and the source ports between forms unchanged.

## Handles carry an epoch

Keep a handle past the file it was minted for and the next call errors with `node handle outlived its file`.

That is not paranoia. Without it, a worm stashing a handle in a global would silently read another file's tree, and which file that is depends on work stealing. See [how a build runs](/docs/worms/build-pipeline) for why a worm keeping state between files is undefined in the first place.

## Edits are deferred

Edits are measured against the bytes the pass started with and applied in one splice at the end of that pass, so nothing in a pass sees anything else's output. This is the same model larvae's own rules use.

If you want a rule to read another rule's output, that is what [run order](/docs/worms/using-worms) is for. Ordering puts them in different passes, which is a real re-lex, not a sort.

**`remove` keeps the newlines.** Line N of `dist` stays line N of `src`, and a worm gets that without having to know the rule exists. It is also what `larvae worm run` checks on every run.

## The 34 node kinds

These are the names `filter` takes in [`worm.toml`](/docs/worms/worm-toml), and the values `kind` returns.

```text
Block        Local        Assign       Call
Do           While        Repeat       If
NumericFor   GenericFor   Function     LocalFunction
Return       Break        Continue     TypeAlias
Empty        Nil          True         False
Vararg       Number       String       InterpString
Name         FunctionExpr Table        Binary
Unary        Index        CallExpr     Paren
IfElse       TypeAssert
```

In Luau, `kind()` is typed as a singleton union of exactly these, so a typo fails to typecheck rather than matching nothing at runtime.

Note that `Call` and `CallExpr` are different: one is a call used as a statement, the other a call used as an expression. A rule looking for `f()` in both positions declares both.

## Filter is the cost lever

Undeclared kinds never cross the boundary at all. A file with no matching kinds skips flattening and dispatch entirely, and halving what a rule matches halves what it costs. On native the filter also decides what lands in the batched message. See [what a worm costs](/docs/worms/what-a-worm-costs).

## Related

- [writing a worm in Luau](/docs/worms/writing-in-luau)
- [writing a worm in Rust](/docs/worms/writing-in-rust)
- [how a build runs](/docs/worms/build-pipeline), where the passes and splices happen
