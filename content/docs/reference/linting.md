---
title: Linting
description: All forty nine lints, their default levels, and the flag comments that silence them
category: Reference
order: 5
updated: 2026-08-16
---

`larvae lint` reports suspicious code. It ships 49 lints, configured in the `[lint]` table of `larvae.toml`. The table is optional: `larvae lint` works with no config at all.

larvae covers all 28 lints of the Luau compiler, so `larvae init` turns Luau's own linter off in `.luaurc` and the project loses no report. With both linters on, each finding would arrive twice under two names, each needing its own comment to silence. [Quick start](/docs/getting-started/quick-start) describes that step.

## Levels

Every lint has a level: `allow` (off), `warn` (reported), or `deny` (fails the run). `[lint.rules]` sets levels by name:

```toml
[lint.rules]
shadowing = "allow"
unused_variable = "deny"
```

Three lints do not default to `warn`. `undefined_variable` denies, because the name is nil at runtime and the line that reads it throws. `high_cyclomatic_complexity` and `non_const_require` allow, and neither is a lint of the Luau compiler: a branch count is not a defect on its own, and `const` is newer than most codebases. Each Luau lint keeps the level that Luau gives it, so the change of linter changes no report.

## The 49 lints

| Lint | Default | What it reports |
|---|---|---|
| `almost_swapped` | warn | Two assignments that look like a swap but overwrite one of the values. |
| `bad_comment_directive` | warn | A `--!` directive that Luau does not know, or one that comes after the code it should govern. |
| `bad_string_escape` | warn | An escape sequence the language does not define. |
| `builtin_global_write` | warn | An assignment over a standard global, which every later script sees. |
| `compare_nan` | warn | Comparing against nan, which is never equal to anything including itself. |
| `comparison_precedence` | warn | `not a == b`, or a chain like `a < b < c`, which does not group the way it reads. |
| `constant_table_comparison` | warn | Comparing against a table literal, which compares identity and is always false. |
| `deprecated` | warn | A function that still works but has been replaced. |
| `divide_by_zero` | warn | Dividing by a literal zero. |
| `duplicate_function` | warn | Two functions of the same name in one scope, where the first is discarded. |
| `duplicate_keys` | warn | A table key written twice, where only the last one survives. |
| `duplicate_local` | warn | One local statement or parameter list that declares the same name twice. |
| `empty_if` | warn | An if branch with nothing in it. |
| `empty_loop` | warn | A loop body with nothing in it. |
| `format_string` | warn | A format string that `string.format` or `os.date` rejects at runtime. |
| `global_usage` | warn | Reaching into `_G`, which is shared with every other script. |
| `high_cyclomatic_complexity` | allow | A function with more branches than anyone can hold at once. |
| `if_same_then_else` | warn | Two branches of the same if with identical bodies. |
| `ifs_same_cond` | warn | An elseif repeating a condition already tested, which can never run. |
| `implicit_return` | warn | A function that returns a value on one path and falls off the end on another. |
| `loop_invariant_call` | warn | A call inside a loop whose result cannot change between iterations. |
| `manual_table_clone` | warn | A loop that copies a table, which `table.clone` does in one call. |
| `misleading_and_or` | warn | `cond and false or b`, which always gives `b` because the middle is never truthy. |
| `mismatched_arg_count` | warn | Calling a function in this file with the wrong number of arguments. |
| `mixed_table` | warn | A table with both array entries and named keys. |
| `multiple_statements` | warn | More than one statement on a line. |
| `must_use` | warn | Calling a pure function and discarding what it returned. |
| `non_const_require` | allow | A required module bound with `local`, where `const` says it never changes. |
| `number_literal_overflow` | warn | A hexadecimal or binary literal wider than 64 bits, which is truncated. |
| `parenthese_conditions` | warn | Parentheses around a condition, which Luau does not need. |
| `placeholder_read` | warn | Reading `_`, the name that says a value is discarded. |
| `restricted_module_paths` | warn | Requiring a module the project has ruled out. |
| `roblox_incorrect_color3_new_bounds` | warn | `Color3.new` given a channel over 1, where the scale is 0 to 1. |
| `roblox_manual_fromscale_or_fromoffset` | warn | A `UDim2.new` that `fromScale` or `fromOffset` says more clearly. |
| `roblox_suspicious_udim2_new` | warn | `UDim2.new` given two arguments, where it takes four. |
| `self_assignment` | warn | Assigning a value to itself, which does nothing. |
| `shadowing` | warn | A name that hides another still in scope. |
| `string_concat_in_loop` | warn | Building a string by concatenation in a loop, which is quadratic. |
| `suspicious_reverse_loop` | warn | A numeric for counting down without a negative step, which never runs. |
| `table_operations` | warn | A `table.insert` or `table.remove` whose index or argument count is wrong. |
| `type_check_inside_call` | warn | A comparison inside `type()`, where it belongs outside. |
| `unbalanced_assignments` | warn | More names than values, or more values than names. |
| `undefined_variable` | deny | A name nothing declares, which is nil at runtime. |
| `uninitialized_local` | warn | A local declared with no value and never assigned, so every read is nil. |
| `unknown_type` | warn | Comparing `type(x)` against a string that `type()` never returns. |
| `unreachable_code` | warn | Statements after a return, break or continue, which never run. |
| `unscoped_variables` | warn | An assignment with no `local`, which creates a global. |
| `unused_variable` | warn | A name declared and never read. |
| `zero_step_loop` | warn | A numeric for whose step is zero, so the counter never moves. |

`larvae lint --explain <name>` prints one lint's description. The schema contains all lints with their defaults, so an editor can offer them by name. `larvae init` writes only `std = "roblox"` and a pointer to `[lint.rules]`, not the lint list.

## The `[lint]` keys

| Key | What it does |
|---|---|
| `std` | The global environment lints check against. Default `"roblox"`. |
| `globals` | Extra globals the project defines. |
| `exclude` | Globs the linter skips, relative to the project root. |
| `include` | Globs the linter reads back, over every exclude. |
| `[lint.rules]` | Levels by lint name. |
| `[lint.options]` | Options for the four lints below. Also spelled `[lint.config]`, selene's name. |

`std` accepts selene's spellings: `lua51` through `lua54`, `luajit`, and chains such as `roblox+testez`, where the first name decides. A `selene.toml` on disk is read the same way, and for lists (`rules`, `globals`, `exclude`) larvae adds its entries to selene's and does not replace them. The exclusion order is on [configuration](/docs/reference/configuration).

## Lints with options

Four lints accept options under `[lint.options]`:

| Table | Option | Default | What it does |
|---|---|---|---|
| `[lint.options.unused_variable]` | `parameters` | `false` | Report unused function parameters too. Off by default, because a parameter is part of a signature the caller decides. |
| | `loop_variables` | `false` | Report unused `for` variables too. Off by default, because `for k, v` where only `k` is wanted is how the language is written. |
| | `ignore_pattern` | `"^_"` | Names exempted, as a regular expression. |
| `[lint.options.high_cyclomatic_complexity]` | `maximum_complexity` | `40` | Branches a function may have before it is reported. selene's default, kept so a project moving over gets the same answers. |
| `[lint.options.deprecated]` | `additional` | none | Names the project has deprecated of its own, as `old = "what to use instead"`. |
| `[lint.options.restricted_module_paths]` | `paths` | none | Require paths the project forbids, as `path = "why"`. |

## Flag comments

A flag comment is a comment addressed to larvae, not to a reader:

```luau
local unused = 1 -- larvae: allow(unused_variable)

-- larvae: allow(unused_variable, shadowing)
local a, b = 1, 2

-- selene: allow(unused_variable)   -- selene's spelling works too
-- larvae: allow(*)                 -- everything on this line
```

A flag covers its own line and the line below it. People write both forms, and to guess which form an author meant is worse than to accept both.

Only `allow(...)` is a flag. The comment `-- larvae: this one is load bearing` is a note to the next reader, and larvae treats it as an ordinary comment.

`larvae process` removes flags by default, because flags are build time instructions and shipped flags are shipped build instructions. Ordinary comments do not change and line numbers stay the same, so `retain-lines` output still matches the source. Set `[process] strip_flags = false` when people read the output, for example a library published as source. When `[rules] remove_comments` is on, that rule controls every comment in the file and `strip_flags` does nothing, so a project that keeps flags with an `except` pattern keeps them.

## Lints that come from a worm

A worm adds lints under its own key: `[lint.rules.<worm>]` is a table of levels, and each name reads `<worm>.<name>` in a message, in `--explain`, and in an `allow` comment.

```toml
[lint.rules.markup]
tidy = "deny"
```

See [using worms](/docs/worms/using-worms).

## Lint or check

`[lint]` holds per-file questions only: a lint reads one file in isolation, which is why `larvae lint` works on stdin, in the editor, and with no config. A question about the whole project, ex: a require cycle, lives in `[check]` and runs under `larvae check`. The split follows the tools it mirrors: selene lints, `cargo check` checks. The two tables share one level vocabulary. See [configuration](/docs/reference/configuration).
