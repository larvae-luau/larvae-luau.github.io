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

Each name links to its section below, so an editor or an extension can deep link to one lint.

| Lint | Default | What it reports |
|---|---|---|
| [`almost_swapped`](#almost-swapped) | warn | Two assignments that look like a swap but overwrite one of the values. |
| [`bad_comment_directive`](#bad-comment-directive) | warn | A `--!` directive that Luau does not know, or one that comes after the code it should govern. |
| [`bad_string_escape`](#bad-string-escape) | warn | An escape sequence the language does not define. |
| [`builtin_global_write`](#builtin-global-write) | warn | An assignment over a standard global, which every later script sees. |
| [`compare_nan`](#compare-nan) | warn | Comparing against nan, which is never equal to anything including itself. |
| [`comparison_precedence`](#comparison-precedence) | warn | `not a == b`, or a chain like `a < b < c`, which does not group the way it reads. |
| [`constant_table_comparison`](#constant-table-comparison) | warn | Comparing against a table literal, which compares identity and is always false. |
| [`deprecated`](#deprecated) | warn | A function that still works but has been replaced. |
| [`divide_by_zero`](#divide-by-zero) | warn | Dividing by a literal zero. |
| [`duplicate_function`](#duplicate-function) | warn | Two functions of the same name in one scope, where the first is discarded. |
| [`duplicate_keys`](#duplicate-keys) | warn | A table key written twice, where only the last one survives. |
| [`duplicate_local`](#duplicate-local) | warn | One local statement or parameter list that declares the same name twice. |
| [`empty_if`](#empty-if) | warn | An if branch with nothing in it. |
| [`empty_loop`](#empty-loop) | warn | A loop body with nothing in it. |
| [`format_string`](#format-string) | warn | A format string that `string.format` or `os.date` rejects at runtime. |
| [`global_usage`](#global-usage) | warn | Reaching into `_G`, which is shared with every other script. |
| [`high_cyclomatic_complexity`](#high-cyclomatic-complexity) | allow | A function with more branches than anyone can hold at once. |
| [`if_same_then_else`](#if-same-then-else) | warn | Two branches of the same if with identical bodies. |
| [`ifs_same_cond`](#ifs-same-cond) | warn | An elseif repeating a condition already tested, which can never run. |
| [`implicit_return`](#implicit-return) | warn | A function that returns a value on one path and falls off the end on another. |
| [`loop_invariant_call`](#loop-invariant-call) | warn | A call inside a loop whose result cannot change between iterations. |
| [`manual_table_clone`](#manual-table-clone) | warn | A loop that copies a table, which `table.clone` does in one call. |
| [`misleading_and_or`](#misleading-and-or) | warn | `cond and false or b`, which always gives `b` because the middle is never truthy. |
| [`mismatched_arg_count`](#mismatched-arg-count) | warn | Calling a function in this file with the wrong number of arguments. |
| [`mixed_table`](#mixed-table) | warn | A table with both array entries and named keys. |
| [`multiple_statements`](#multiple-statements) | warn | More than one statement on a line. |
| [`must_use`](#must-use) | warn | Calling a pure function and discarding what it returned. |
| [`non_const_require`](#non-const-require) | allow | A required module bound with `local`, where `const` says it never changes. |
| [`number_literal_overflow`](#number-literal-overflow) | warn | A hexadecimal or binary literal wider than 64 bits, which is truncated. |
| [`parenthese_conditions`](#parenthese-conditions) | warn | Parentheses around a condition, which Luau does not need. |
| [`placeholder_read`](#placeholder-read) | warn | Reading `_`, the name that says a value is discarded. |
| [`restricted_module_paths`](#restricted-module-paths) | warn | Requiring a module the project has ruled out. |
| [`roblox_incorrect_color3_new_bounds`](#roblox-incorrect-color3-new-bounds) | warn | `Color3.new` given a channel over 1, where the scale is 0 to 1. |
| [`roblox_manual_fromscale_or_fromoffset`](#roblox-manual-fromscale-or-fromoffset) | warn | A `UDim2.new` that `fromScale` or `fromOffset` says more clearly. |
| [`roblox_suspicious_udim2_new`](#roblox-suspicious-udim2-new) | warn | `UDim2.new` given two arguments, where it takes four. |
| [`self_assignment`](#self-assignment) | warn | Assigning a value to itself, which does nothing. |
| [`shadowing`](#shadowing) | warn | A name that hides another still in scope. |
| [`string_concat_in_loop`](#string-concat-in-loop) | warn | Building a string by concatenation in a loop, which is quadratic. |
| [`suspicious_reverse_loop`](#suspicious-reverse-loop) | warn | A numeric for counting down without a negative step, which never runs. |
| [`table_operations`](#table-operations) | warn | A `table.insert` or `table.remove` whose index or argument count is wrong. |
| [`type_check_inside_call`](#type-check-inside-call) | warn | A comparison inside `type()`, where it belongs outside. |
| [`unbalanced_assignments`](#unbalanced-assignments) | warn | More names than values, or more values than names. |
| [`undefined_variable`](#undefined-variable) | deny | A name nothing declares, which is nil at runtime. |
| [`uninitialized_local`](#uninitialized-local) | warn | A local declared with no value and never assigned, so every read is nil. |
| [`unknown_type`](#unknown-type) | warn | Comparing `type(x)` against a string that `type()` never returns. |
| [`unreachable_code`](#unreachable-code) | warn | Statements after a return, break or continue, which never run. |
| [`unscoped_variables`](#unscoped-variables) | warn | An assignment with no `local`, which creates a global. |
| [`unused_variable`](#unused-variable) | warn | A name declared and never read. |
| [`zero_step_loop`](#zero-step-loop) | warn | A numeric for whose step is zero, so the counter never moves. |

`larvae lint --explain <name>` prints one lint's description. The schema contains all lints with their defaults, so an editor can offer them by name. `larvae init` writes only `std = "roblox"` and a pointer to `[lint.rules]`, not the lint list.

### `almost_swapped`

Two adjacent assignments read like a swap, but the first assignment overwrites one of the values before the second one reads it. Both names end up holding the same value.

```luau
local a, b = 1, 2
a = b
b = a -- a was overwritten first, so both hold 2

-- fine: a, b = b, a
```

### `bad_comment_directive`

A `--!` comment is a directive to Luau. This lint reports a directive Luau does not know, and a directive placed after code, because a late directive governs nothing.

```luau
--!non-strict -- Luau does not know this name; it spells it nonstrict
local x = 1
--!strict -- comes after the code it should govern, so it does nothing
```

### `bad_string_escape`

The string holds a backslash escape the language does not define, so the string does not mean what the backslash suggests.

```luau
local dir = "C:\Users\me" -- \U and \m are not escape sequences

-- fine: local dir = "C:\\Users\\me"
```

### `builtin_global_write`

The assignment replaces a standard global. Globals are shared, so every later script sees the replacement instead of the builtin.

```luau
print = function() end -- every later print call now does nothing
```

### `compare_nan`

nan is never equal to anything, itself included, so `== nan` is always false and `~= nan` is always true.

```luau
local nan = 0 / 0
local function isNan(x: number)
	return x == nan -- always false, nan is not equal even to itself
end

-- fine: return x ~= x
```

### `comparison_precedence`

`not a == b` groups as `(not a) == b`, and a chain like `a < b < c` compares a boolean against `c`. Neither means what the line reads as.

```luau
local function different(a, b)
	return not a == b -- groups as (not a) == b
end

-- fine: return a ~= b
```

### `constant_table_comparison`

`==` on tables compares identity, and a table literal is a fresh table with a new identity. The comparison is always false.

```luau
local function isEmpty(t)
	return t == {} -- a new table is never the same table, always false
end

-- fine: return next(t) == nil
```

### `deprecated`

The called function still works but has been replaced, and the replacement is the supported spelling.

```luau
wait(1) -- wait still works, but task.wait replaced it

-- fine: task.wait(1)
```

#### `deprecated` options

| Option | Default | What it does |
|---|---|---|
| `additional` | none | Names the project has deprecated of its own, as `old = "what to use instead"`. |

```toml
[lint.options.deprecated]
additional = { getData = "use fetchData" }
```

### `divide_by_zero`

Dividing by a literal zero never throws in Luau: it gives inf, and `0 / 0` gives nan. Neither is usually the value the author wanted.

```luau
local x = 1 / 0 -- always inf
local y = 0 / 0 -- always nan
```

### `duplicate_function`

Two functions of the same name in one scope: the second definition replaces the first, so the first body is discarded.

```luau
local M = {}
function M.reset() end
function M.reset() end -- the first reset is discarded
```

### `duplicate_keys`

A table constructor writes the same key twice. Only the last write survives, and the earlier value is discarded silently.

```luau
local color = { r = 1, g = 1, r = 0 } -- r is written twice, only the last survives
```

### `duplicate_local`

One local statement or one parameter list declares the same name twice. The second declaration hides the first inside the same statement.

```luau
local width, width = 10, 20 -- one statement declares width twice
```

### `empty_if`

An if branch with nothing in it. Either the body was forgotten, or the branch can go.

```luau
local ready = false
if ready then
end -- nothing happens either way
```

### `empty_loop`

A loop body with nothing in it. The loop spins without an effect.

```luau
for i = 1, 10 do
end -- nothing in the body
```

### `format_string`

The format string is one that `string.format` or `os.date` rejects at runtime, so the call throws when it runs.

```luau
local s = string.format("%d of %w", 3, 7) -- %w is not a specifier
```

### `global_usage`

The code reaches into `_G`, which every other script shares. A write here is visible everywhere, and a read here depends on what every other script did.

```luau
_G.playerCount = 12 -- every script shares _G
```

### `high_cyclomatic_complexity`

Default level: `allow`, because a branch count is not a defect on its own. It is not a lint of the Luau compiler.

The function has more branches than the configured maximum. The example lowers the maximum to 3 so a short function shows the report:

```luau
-- with maximum_complexity = 3:
local function grade(n)
	if n > 90 then return "A" elseif n > 80 then return "B"
	elseif n > 70 then return "C" else return "D" end
end
```

#### `high_cyclomatic_complexity` options

| Option | Default | What it does |
|---|---|---|
| `maximum_complexity` | `40` | Branches a function may have before it is reported. selene's default, kept so a project moving over gets the same answers. |

### `if_same_then_else`

Two branches of the same if have identical bodies, so the condition decides nothing.

```luau
local function pick(fast: boolean)
	if fast then return 1 else return 1 end -- both branches are identical
end
```

### `ifs_same_cond`

An elseif repeats a condition the chain already tested. The earlier branch took every case, so this one can never run.

```luau
local function describe(n)
	if n == 0 then return "zero"
	elseif n == 0 then return "none" -- same condition, never runs
	else return "some" end
end
```

### `implicit_return`

The function returns a value on one path and falls off the end on another. The caller gets a value sometimes and nil the rest of the time.

```luau
local function find(t, v)
	for i, x in t do
		if x == v then return i end
	end
end -- falls off the end and returns nothing
```

### `loop_invariant_call`

A call inside a loop whose arguments do not change between iterations. The result is the same every pass, so the call belongs above the loop.

```luau
local angles = {}
for i = 1, 360 do
	angles[i] = math.rad(90) -- the argument never changes, hoist the call out
end
```

### `manual_table_clone`

The loop copies every pair of a table into a fresh one, which `table.clone` does in one call.

```luau
local original = { a = 1 }
local copy = {}
for k, v in original do
	copy[k] = v
end
-- fine: local copy = table.clone(original)
```

### `misleading_and_or`

In `cond and x or b`, when `x` is `false` or `nil` the middle is never truthy, so the expression always gives `b` whatever `cond` is.

```luau
local function pickMode(fast: boolean)
	return fast and nil or "slow" -- always "slow", because nil is never truthy
end

-- fine: return if fast then nil else "slow"
```

### `mismatched_arg_count`

A call to a function defined in this file passes the wrong number of arguments for its parameter list.

```luau
local function add(a, b)
	return a + b
end
add(1, 2, 3) -- add takes two arguments
```

### `mixed_table`

The table holds both array entries and named keys. Iteration order and length are easy to get wrong on such a table.

```luau
local cfg = { "fast", retries = 3 } -- an array entry and a named key in one table
```

### `multiple_statements`

More than one statement shares a line, and the second one is easy to miss.

```luau
local x = 1 print(x) -- two statements share this line
-- fine: put each statement on its own line
```

### `must_use`

The called function is pure: it computes a value and changes nothing else. Discarding the result makes the call do nothing.

```luau
local name = "larvae"
string.upper(name) -- the returned string is discarded, nothing changes in place

-- fine: name = string.upper(name)
```

### `non_const_require`

Default level: `allow`, because `const` is newer than most codebases. It is not a lint of the Luau compiler.

A required module is bound with `local`, where `const` states that the binding never changes.

```luau
local Signal = require("@game/ReplicatedStorage/packages/signal")

-- fine: const Signal = require("@game/ReplicatedStorage/packages/signal")
```

### `number_literal_overflow`

A hexadecimal or binary literal wider than 64 bits does not fit, so the value is truncated silently.

```luau
local mask = 0xFFFFFFFFFFFFFFFFF -- 17 hex digits, wider than 64 bits, truncated
```

### `parenthese_conditions`

Parentheses around a whole condition, which Luau does not need. They are a habit from other languages.

```luau
local ready = true
if (ready) then -- Luau does not need the parentheses
	print("go")
end
```

### `placeholder_read`

The name `_` says a value is discarded. Reading it contradicts that promise, so either the read or the name is wrong.

```luau
local scores = { 10, 20 }
local _, first = next(scores)
print(_) -- _ says the value is discarded, and here it is read
```

### `restricted_module_paths`

The require names a module path the project has ruled out in its config, and the report carries the configured reason.

```luau
local util = require("@game/ReplicatedStorage/legacy/util")
-- reported when the config forbids this path
```

#### `restricted_module_paths` options

| Option | Default | What it does |
|---|---|---|
| `paths` | none | Require paths the project forbids, as `path = "why"`. |

```toml
[lint.options.restricted_module_paths]
paths = { "@game/ReplicatedStorage/legacy/util" = "use packages/util instead" }
```

### `roblox_incorrect_color3_new_bounds`

`Color3.new` takes channels on a 0 to 1 scale. A value over 1 is almost always an RGB value on the 0 to 255 scale, which `Color3.fromRGB` takes.

```luau
local red = Color3.new(255, 0, 0) -- channels run 0 to 1, not 0 to 255

-- fine: local red = Color3.fromRGB(255, 0, 0)
```

### `roblox_manual_fromscale_or_fromoffset`

A `UDim2.new` whose offsets are all zero, or whose scales are all zero, has a constructor that says the same thing more clearly.

```luau
local size = UDim2.new(0.5, 0, 1, 0)

-- fine: local size = UDim2.fromScale(0.5, 1)
```

### `roblox_suspicious_udim2_new`

`UDim2.new` takes four arguments. Given two, they are read as the x scale and the x offset, and the y axis is zero, which is rarely the intent.

```luau
local frame = Instance.new("Frame")
frame.Size = UDim2.new(0.5, 0.5) -- read as x scale and x offset, y stays zero

-- fine: frame.Size = UDim2.fromScale(0.5, 0.5)
```

### `self_assignment`

A value is assigned to itself, which does nothing. Usually one of the two sides was meant to be another name.

```luau
local health = 100
health = health -- does nothing
```

### `shadowing`

A declaration reuses a name that is still in scope, so the rest of the block cannot reach the outer value.

```luau
local count = 0
local function step(count) -- hides the outer count
	return count + 1
end
```

### `string_concat_in_loop`

Each `..` in the loop copies the whole string built so far, so the loop is quadratic in the total length. Collecting parts and joining once is linear.

```luau
local lines = { "a", "b" }
local out = ""
for _, line in lines do
	out = out .. line -- copies the whole string each pass
end
-- fine: local out = table.concat(lines)
```

### `suspicious_reverse_loop`

A numeric for counting from a larger value down to a smaller one, without a step. The default step is 1, so the loop body never runs.

```luau
local items = { "a", "b" }
for i = #items, 1 do -- the default step is 1, so this never runs
end
-- fine: for i = #items, 1, -1 do
```

### `table_operations`

A `table.insert` or `table.remove` whose index or argument count is wrong for what the function does.

```luau
local list = { "b", "c" }
table.insert(list, 0, "a") -- index 0 is before the first element
```

### `type_check_inside_call`

The comparison sits inside the `type()` call, so `type` receives a boolean and the result is always the string `"boolean"`, which is truthy.

```luau
local function isNumber(x)
	return type(x == "number") -- the comparison belongs outside the call
end

-- fine: return type(x) == "number"
```

### `unbalanced_assignments`

The assignment lists more names than values, or more values than names. The extra names are nil, and the extra values are discarded.

```luau
local x, y, z = 1, 2 -- three names, two values, z is nil
```

### `undefined_variable`

Default level: `deny`, because the name is nil at runtime and the line that reads it throws.

Nothing declares the name, so reading it gives nil.

```luau
local total = subtotal + 0.2 -- nothing declares subtotal, so this line throws
```

### `uninitialized_local`

The local is declared with no value and nothing ever assigns one, so every read gives nil.

```luau
local count
print(count) -- count is never assigned, so this prints nil
```

### `unknown_type`

The code compares `type(x)` against a string that `type()` never returns, so the comparison is always false.

```luau
local function isInt(x)
	return type(x) == "integer" -- type() never returns "integer"
end

-- fine: return type(x) == "number"
```

### `unreachable_code`

Statements placed after the point where every path has already returned, broken, or continued. They can never run.

```luau
local function report(ok)
	if ok then return "ok" else return "bad" end
	print("done") -- both branches return, so this never runs
end
```

### `unscoped_variables`

An assignment with no `local` creates a global, visible to every script, usually by accident.

```luau
local function setup()
	counter = 0 -- no local, so counter becomes a global
end
-- fine: local counter = 0
```

### `unused_variable`

The name is declared and never read, so the declaration does nothing for the program.

```luau
local retries = 3 -- declared and never read
local _limit = 5 -- fine: the name matches ignore_pattern "^_"
```

#### `unused_variable` options

| Option | Default | What it does |
|---|---|---|
| `parameters` | `false` | Report unused function parameters too. Off by default, because a parameter is part of a signature the caller decides. |
| `loop_variables` | `false` | Report unused `for` variables too. Off by default, because `for k, v` where only `k` is wanted is how the language is written. |
| `ignore_pattern` | `"^_"` | Names exempted, as a regular expression. |

### `zero_step_loop`

A numeric for whose step is zero. The counter never moves, so the loop never ends or never runs as intended.

```luau
for i = 1, 10, 0 do -- the step is zero, so i never moves
end
```

## The `[lint]` keys

| Key | What it does |
|---|---|
| `std` | The global environment lints check against. Default `"roblox"`. |
| `globals` | Extra globals the project defines. |
| `exclude` | Globs the linter skips, relative to the project root. |
| `include` | Globs the linter reads back, over every exclude. |
| `[lint.rules]` | Levels by lint name. |
| `[lint.options]` | Options for [`unused_variable`](#unused-variable-options), [`high_cyclomatic_complexity`](#high-cyclomatic-complexity-options), [`deprecated`](#deprecated-options), and [`restricted_module_paths`](#restricted-module-paths-options). Also spelled `[lint.config]`, selene's name. |

`std` accepts selene's spellings: `lua51` through `lua54`, `luajit`, and chains such as `roblox+testez`, where the first name decides. A `selene.toml` on disk is read the same way, and for lists (`rules`, `globals`, `exclude`) larvae adds its entries to selene's and does not replace them. The exclusion order is on [configuration](/docs/reference/configuration).

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
