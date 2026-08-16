---
title: Failure classes
description: Why strict is not one big switch
category: Concepts
order: 3
updated: 2026-08-16
---

Every require diagnostic falls into one of three groups. Which group it lands in is not a preference, it follows from whether larvae can still produce correct output.

That is why `strict = true` is a small switch rather than a big one. It moves exactly one group, and it cannot touch the other two.

## Always errors, no opt out

These fail because **the output cannot be correct**. There is no string larvae could emit that would work, so there is nothing to downgrade a warning to.

| failure | why there is no correct output |
|---|---|
| unknown alias | nothing to expand it to |
| require cannot be expressed in the DataModel | the target is outside every mount |
| realm violation | client reachable code requiring a server container, it will never resolve |
| Starter container violation | a require pointing into a cloning container from outside |
| module requiring itself | resolves to the file doing the requiring |
| alias cycle | expansion never terminates |
| require is not RFC valid | ex: a bare `require("util")` with no `./` |
| `.luau` / `.lua` ambiguity | both files could match, larvae will not guess |

There is no config key that turns any of these into a warning, by design. Emitting a require that is known to be broken is worse than failing the build.

`larvae check` reports unresolvable requires and realm violations unconditionally. The `[check]` table carries `allow` / `warn` / `deny` levels, but its keys are project questions that are matters of degree: `cycles`, which are legal at runtime, `unused_modules`, and `early_require`. No level touches the failures in the table above, because they are wrong rather than untidy. See [configuration](/docs/reference/configuration) for the `[check]` table.

Two examples. Not RFC valid, because a bare name has no meaning in RFC require semantics:

```luau
-- error
local util = require("util")

-- correct
local util = require("./util")
```

Ambiguity, where `util.luau` and `util.lua` both sit next to the requiring file:

```luau
-- error, both util.luau and util.lua exist
local util = require("./util")
```

`.luau` wins over `.lua` when only the extensionless form is on disk, but when both candidate files exist the request is ambiguous and larvae reports it rather than picking one. Delete or rename one of them.

The realm and Starter container rules have their own page, they are the two that need the most explaining. See [realms and clones](/docs/concepts/realms-and-clones).

## Warnings by default, errors under strict

These are cases where larvae can emit correct output but has good reason to think something is off.

| warning | what it means |
|---|---|
| target file does not exist on disk | the path resolved, nothing is there |
| source and disk casing disagree | ex: `./mymodule` opened `MyModule.luau` |

Both are emitted as warnings by default so a build in progress is not blocked. Both become errors here:

```toml
[requires]
strict = true
```

The missing file case matters because the require may be pointing at something Rojo injects, or at a file that has not been written yet, or at a genuine typo, and larvae cannot tell those apart. The casing case matters because a case insensitive filesystem resolved it and Roblox will not, so the source is portable only by accident. In both, larvae still knows what to write, which is exactly what makes them downgradable.

`strict = true` is the right default for CI:

```shell
larvae check
```

## Left alone on purpose

Dynamic requires are not analyzed, not rewritten, and not reported as failures.

```luau
-- passed through unchanged
local m = require(path)
local n = require(`@x/{y}`)
```

larvae cannot know what a runtime value resolves to, so guessing would be worse than doing nothing. These are copied through verbatim.

What it does instead is **count them**, so the blind spot is visible rather than invisible:

```text
processed 128 file(s): 84 require(s) rewritten, 2 dynamic require(s) left untouched, 3 copied
```

`larvae check` reports the same count. If that number is higher than you expected, the realm and clone validation is covering less of your codebase than you thought, and the uncovered requires are the dynamic ones.

The same blind spot reaches `larvae bundle`. Reachability comes from the require graph, so a module reached only through a dynamic require is dropped by tree shaking; such a require is reported, and a project that needs those modules sets `tree_shake = false`. See [configuration](/docs/reference/configuration).

Note that `quotes` still applies to dynamic requires that are plain strings, since requoting is a lexical change and does not depend on resolving anything.

## Where syntax errors fit

Syntax errors are their own class, and the rule that decides them is short: **larvae accepts the files that Luau accepts, and refuses the files that Luau refuses.** The check gate is only as good as its agreement with the compiler.

One construct makes the rule earn its keep, because its two readings are both reasonable and Luau picks neither:

```lua
print(1)
(f)()
```

Luau reports "Ambiguous syntax: this looks like an argument list for a function call, but could also be a start of new statement; use ';' to separate statements". The token stream reads as one call of the line above, and it reads as two statements.

larvae reports the same case. An earlier larvae read it as a call, and two things went wrong. `larvae check` passed a file that the real compiler rejects, so the check said less than the compiler. And `larvae fmt` joined the two lines into the reading that larvae chose, which is a decision that the author never made. A `(` on the line of the callee is not ambiguous, so a wrapped argument list and a chained call still parse.

Which command surfaces a syntax error follows from what each command needs. `check`, `fmt`, and `lint` parse, so all three report the same refusals, and the editor reports them too, through the same code paths. `process` needs only a lex to rewrite requires and parses when an enabled rule needs a tree, so a file with a syntax error can still get its requires rewritten, and it is `check` that tells you the file does not parse. See the [CLI reference](/docs/reference/cli).

## Related

- [realms and clones](/docs/concepts/realms-and-clones), the two biggest error classes explained in full
- [require targets](/docs/concepts/require-targets), input semantics and the three output forms
- [configuration](/docs/reference/configuration), `strict` and the rest of `[requires]`
