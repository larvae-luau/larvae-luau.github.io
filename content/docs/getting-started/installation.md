---
title: Installation
description: Install coldluau with lpm, lpx, cargo, or a prebuilt binary
category: Getting started
order: 1
updated: 2026-07-29
---

coldluau ships as a single binary with no runtime dependencies. Pick one of the routes below, they all end with a `coldluau` you can run.

## Add it to a project with lpm

lpm is the Luau package manager. Adding coldluau as a project tool pins it for everyone who clones the repo.

```shell
lpm tool add coldluau
```

This is the route to prefer for real projects, since the tool version travels with the project rather than with each machine.

## Run it once with lpx

lpx fetches and runs coldluau without installing anything.

```shell
lpx coldluau
```

Good for trying coldluau on a project before committing to it, or for a one off run in CI. Nothing is left on the machine afterwards.

## Build from source

```shell
cargo install --path .
```

Run this from a clone of the coldluau repository. coldluau is not published to crates.io, so `cargo install --path .` needs the local checkout, there is no registry name to install by.

## Prebuilt binaries

Release builds are attached to the GitHub releases page. Assets are named `coldluau-{os}-{arch}`, with `.exe` appended on Windows.

| asset | platform |
|---|---|
| `coldluau-linux-x86_64` | Linux, Intel or AMD |
| `coldluau-macos-aarch64` | macOS, Apple silicon |
| `coldluau-windows-x86_64.exe` | Windows, Intel or AMD |

Download the asset for your platform, mark it executable if your OS needs that, and move it somewhere on your PATH. Or let coldluau do the moving for you, see below.

## Putting coldluau on PATH

`coldluau self install` copies the **running** binary to `~/.coldluau/bin/coldluau`, so run it with the binary you just downloaded or built.

```shell
coldluau self install
```

It then prints the line to add to your shell profile:

```shell
export PATH="$HOME/.coldluau/bin:$PATH"
```

On Windows it prints instructions for adding the directory through Settings instead. It does **not** edit the registry.

Running `self install` twice is safe. The second run reports `coldluau is already installed at <path>` and changes nothing.

## The three self subcommands

`self install`, `self update` and `self uninstall` are separate alternatives, not steps to run in order. You pick the one that matches what you want to do right now.

### self update

Checks GitHub releases, downloads the newer build, and swaps it in.

```shell
coldluau self update
```

It honors `GITHUB_TOKEN` for the releases API, which matters if you hit rate limits on a shared runner. When there is nothing newer it says `coldluau is already up to date` and exits.

### self uninstall

Removes `~/.coldluau`.

```shell
coldluau self uninstall
```

It prompts with `Remove <dir>?` first, and the default answer is **no**, so pressing enter cancels.

## Verify the install

```shell
coldluau
```

With no arguments coldluau prints its logo beside the help text. See the [CLI reference](/docs/reference/cli) for every command and flag.

## Next steps

Head to the [quick start](/docs/getting-started/quick-start) to go from a Rojo project to native string requires. Config lives in `coldluau.toml`, documented in the [configuration reference](/docs/reference/configuration), though a plain Rojo project with `.luaurc` aliases needs no config at all.
