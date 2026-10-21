---
title: Installation
description: Install larvae with lpm, lpx, cargo, or a prebuilt binary
category: Getting started
order: 1
updated: 2026-10-20
---

larvae ships as one small binary with no runtime dependencies. The same binary is the CLI and the editor server, `larvae lsp`. Pick one of the routes below, they all end with a `larvae` you can run.

## Add it to a project with lpm

lpm is the Luau package manager. Adding larvae as a project tool pins it for everyone who clones the repo.

```shell
lpm tool add larvae
```

This is the route to prefer for real projects, since the tool version travels with the project rather than with each machine.

## Run it once with lpx

lpx fetches and runs larvae without installing anything.

```shell
lpx larvae
```

Good for trying larvae on a project before committing to it, or for a one off run in CI. Nothing is left on the machine afterwards.

## Build from source

```shell
cargo install larvae
```

That pulls the published crate from crates.io, so it needs no checkout.

To build from a clone instead, ex: to try an unreleased change, point cargo at the path:

```shell
cargo install --path .
```

## Prebuilt binaries

Release builds are attached to the GitHub releases page. Each asset is a zip named `larvae-{os}-{arch}.zip`, holding the `larvae` binary.

| asset | platform |
|---|---|
| `larvae-linux-x86_64.zip` | Linux, Intel or AMD |
| `larvae-linux-aarch64.zip` | Linux, ARM |
| `larvae-macos-x86_64.zip` | macOS, Intel |
| `larvae-macos-aarch64.zip` | macOS, Apple silicon |
| `larvae-windows-x86_64.zip` | Windows, Intel or AMD |
| `larvae-windows-aarch64.zip` | Windows, ARM |

Unpack the zip, mark the binary executable if your OS needs that, and run `larvae self install` from there.

## Putting larvae on PATH

`larvae self install` copies the **running** binary to `~/.larvae/bin/larvae`. It also removes a `larvae-lsp` server and its analyzer library that a release before 0.10 left there, because luau-lsp serves the types now.

```shell
larvae self install
```

On **Windows** it puts the directory on your PATH for real, writing the user Path in the registry and broadcasting the change so newly opened terminals pick it up. Nothing further to do.

On **unix** it prints the line for your shell profile instead:

```shell
export PATH="$HOME/.larvae/bin:$PATH"
```

That asymmetry is deliberate. Editing someone's shell profile without asking is rude, so unix leaves the last step to you.

Running `self install` twice is safe. It also warns when another tool already manages the larvae binary, because a second copy can shadow the first on PATH and leave you running a version you did not expect.

## The four self subcommands

`self install`, `self update`, `self uninstall` and `self code` are separate alternatives, not steps to run in order. You pick the one that matches what you want to do right now.

### self update

Checks GitHub releases, downloads the newer build, and swaps it in.

```shell
larvae self update
```

It honors `GITHUB_TOKEN` for the releases API, which matters if you hit rate limits on a shared runner. When there is nothing newer it says `larvae is already up to date` and exits.

**It only updates the copy `self install` made.** If rokit, aftman, foreman, lpm or cargo owns your binary, it refuses and points you at that manifest instead, since overwriting a pinned tool leaves the manifest and the bytes on disk disagreeing. Bump the version where the pin lives, or pass `--force` if you really want the swap.

```shell
larvae self update --force
```

### self uninstall

Removes `~/.larvae`.

```shell
larvae self uninstall
```

It prompts with `Remove <dir>?` first, and the default answer is **no**, so pressing enter cancels.

### self code

Sets up your editor for `larvae.toml`: completion, hover docs, and the valid values for every key.

```shell
larvae self code
```

It is a one time step per machine, not part of installing the binary, which is why it is its own subcommand. What it writes and why is covered in [editor setup](/docs/concepts/editor-setup).

## Verify the install

```shell
larvae
```

With no arguments larvae prints its logo beside the help text. See the [CLI reference](/docs/reference/cli) for every command and flag.

## Next steps

Head to the [quick start](/docs/getting-started/quick-start) to go from a Rojo project to native string requires. Config lives in `larvae.toml`, documented in the [configuration reference](/docs/reference/configuration), though a plain Rojo project with `.luaurc` aliases needs no config at all.
