---
title: Writing a worm in Rust
description: The larvae-worm crate, the wasm macros, and the native pipe protocol
category: Worms
order: 5
updated: 2026-10-20
---

Depend on `larvae-worm`, published on crates.io at the version larvae speaks:

```toml
[dependencies]
larvae-worm = { version = "0.7", features = ["native"] }
```

Release builds should pin against the registry, not a path: a path dependency floats with a checkout, and a released worm wants to name the SDK it was built against. A `[patch.crates-io]` line covers the days you work on an unreleased SDK change. The crate is the guest side of the worm system and does not pull in larvae, because [larvae is the host, not a library](/docs/worms/what-a-worm-is). It gives a Rust author both shipping forms:

- `frontend!` and `rules!`, macros for the **wasm** ABI. Compile to `wasm32-unknown-unknown` and ship the `.wasm`.
- a `native` module with a `Handler` trait and `serve()`, for the **native** pipe protocol. Compile an ordinary binary.

The wire types are the same on every transport, so a handler returns the same values whichever form ships, and moving a worm from wasm to native is a packaging change rather than a rewrite.

The wasm route works for anything that compiles to `wasm32`, so Zig and C are equally valid. Rust is documented here because that is where the helper crate is.

## The wasm form

```rust
larvae_worm::frontend!(|source: &str, config: &str| -> anyhow::Result<String> {
    my_compiler::compile(source, config)
});

larvae_worm::rules! {
    "strip_debug" => |node: larvae_worm::Node| {
        if node.kind() == "CallExpr" && node.text().starts_with("dprint") {
            node.remove();
        }
    },
}
```

`Node` answers the same surface Luau gets, so nothing on [the node API](/docs/worms/node-api) is form specific. Declare each capability in [`worm.toml`](/docs/worms/worm-toml), and set `form = "wasm"` with `entry` pointing at the `.wasm`.

wasm is the default recommendation for a published worm: it runs sandboxed, and one artifact serves every platform.

### The macros are not the only door

`larvae_worm::abi` is public and documented, so a worm doing something unusual can export the raw functions without vendoring a macro. Under the hood, wasm has no strings: text crosses as an offset and a length into the module's own memory. None of that is visible through the macros.

### `api` is a pinned contract

A `.wasm` is compiled against a host ABI, which is why [`worm.toml`](/docs/worms/worm-toml) carries `api`. A worm built for `api = 1` loaded by a larvae speaking `api = 2` is rejected at load with a sentence, rather than discovered as a trap mid build.

## The native form

Implement the `Handler` trait and call `serve()` from `main`. larvae starts the binary and speaks to it over a pipe. The trade is stated plainly on [what a worm is](/docs/worms/what-a-worm-is): native speed and **no sandbox**, so the form is opt in, for code a project trusts.

Rules change shape on native. A pipe crossing costs about 24 µs, so per node dispatch would spend everything on the boundary; instead larvae sends **one batched message per file**. A batched rule reads the matched node and the source, and navigates no tree. Format and lint cross once per file on every transport, so they cost the same whichever form you pick.

### Shipping a native worm

Two channels fit the native form:

- **crates.io.** `x = { cargo = "crate", version = "1.0.0" }` in the user's config runs `cargo install`, so the worm builds from source on the user's machine and one published crate serves every platform. The binary must carry its own `worm.toml` and return it over the pipe when larvae asks, because `cargo install` ships no data files.
- **A GitHub release** with one zip per platform. larvae tries `<name>-worm-<arch>-<os>.zip` first, so that is the name to publish under. larvae makes the entry executable at install.

See [using worms](/docs/worms/using-worms) for the resolution order and caching.

## Answering the editor

`lint` doubles as the plain-Luau linter when the manifest sets `lints_luau`.

Both forms can answer code actions: on wasm the export is `larvae_actions`, on native the `actions` op. Both are optional. A worm that leaves them out answers with nothing rather than an error, the opposite of `format` and `lint`, where the manifest promises the capability and a missing export is a broken promise worth a message. A worm that fails is passed over, because one broken worm must not take the lightbulb from the others.

Actions speak in byte offsets, and larvae turns those into protocol positions. The title carries the worm's name, and an action that names the lint it repairs is grouped under that diagnostic. The user's side is on [using worms](/docs/worms/using-worms).

The `lsp_resolve`, `lsp_load`, `lsp_declarations`, and `lsp_respond` methods of `Handler`, and the `definitions` op, served the analyzer up to 0.9. The 0.10 SDK removes the four methods, so a worm that implements one fails to compile until the implementation goes.

## Pick the right form

| shape of the work | form |
|---|---|
| many small node visits | [Luau](/docs/worms/writing-in-luau), the cheapest crossing |
| heavy compute behind few crossings, shipped anywhere | wasm, the default recommendation |
| native speed for code the project trusts | native, batched rules over a pipe |

wasm is **not** the faster form for a node heavy rule: crossings cost roughly six times what they cost in Luau, and that is interpreter tax landing on the boundary rather than on your logic. A front-end is one call per file by definition, which is why wasm suits a compiler and Luau suits a tidy up rule. The measurements are on [what a worm costs](/docs/worms/what-a-worm-costs).

## Developing one

`larvae worm` does not care which form it is looking at:

```shell
larvae worm run myworm app.mk          # plain transform, print the result
larvae worm run myworm app.mk --fmt    # format it, and report if a second pass changes it
larvae worm run myworm app.mk --lint   # report findings at the manifest defaults
larvae worm info myworm                # what the manifest declares, without running it
```

`info` prints the form and the `api` a manifest declares, which is the fastest way to check it is what you meant. Point a real project at the worm with `path =` for the full pipeline. See the [CLI reference](/docs/reference/cli).

## Related

- [node API](/docs/worms/node-api), the handle model and the batched message
- [worm.toml](/docs/worms/worm-toml), `form`, `entry`, and the capability tables
- [what a worm costs](/docs/worms/what-a-worm-costs), why the boundary dominates
