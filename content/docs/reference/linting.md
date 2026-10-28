---
title: Linting
description: All sixty three lints, their default levels, and the flag comments that silence them
category: Reference
order: 5
updated: 2026-10-24
---

`larvae lint` reports suspicious code. It ships 64 lints, configured in the `[lint]` table of `larvae.toml`. The table is optional: `larvae lint` works with no config at all.

larvae covers all 28 lints of the Luau compiler, so `larvae init` turns Luau's own linter off in `.luaurc` and the project loses no report. With both linters on, each finding would arrive twice under two names, each needing its own comment to silence. [Quick start](/docs/getting-started/quick-start) describes that step.

## Levels

Every lint has a level: `allow` (off), `info`, `warn`, or `deny` (fails the run). `[lint.rules]` sets levels by name:

```toml
[lint.rules]
shadowing = "allow"
mixed_table = "info"
unused_variable = "deny"
```

`info` and `warn` both report, and both leave the exit code alone. They differ in what they ask of the reader: an editor draws an info as a hint and a warning as a squiggle. `info` is where a lint goes when a project wants it on the record without adding to the pile it reads every day. The summary line counts infos apart from warnings, and only when a project uses the level, so a project that never writes `info` reads the summary it always read.

Seventeen of the 64 lints do not warn by default: six deny and eleven allow.

A lint denies when two things hold at once. No reading of the code makes the finding wrong, because the check reads a literal or the syntax and never a runtime value. And the code as written cannot be what the author meant: it throws, it hangs, or a line of it is dead. Six pass that bar. `undefined_variable`, because the name is nil at runtime and the line that reads it throws. `duplicate_keys`, because `{ a = 1, a = 2 }` discards the first entry. `duplicate_local`, because `local a, a` kills the first binding where it stands. `format_string`, because `string.format("%y", 1)` raises. `zero_step_loop`, because a step of zero never moves the counter. And `length_as_condition`, because `#t` yields a number and every number is true in Luau, so `if #players then` runs with no players. Over a 364 file corpus the five newer denies report nothing at all, which is the point: nobody writes these shapes on purpose, so the gate costs an existing project nothing on the day it adopts larvae.

`bad_string_escape` is the near miss worth naming. It reads a literal and it cannot be wrong, but Luau accepts `"\q"` and runs the file. The string is wrong and the build is fine, so it warns.

Eleven lints allow. `high_cyclomatic_complexity` and `non_const_require`, because a branch count is not a defect on its own and `const` is newer than most codebases. `prefer_const`, because it rewrites a keyword. `implicit_return`, because a lookup that returns a value on one path and falls off the end on another is idiomatic Luau. `multiple_statements`, because `larvae fmt` owns that ground already: with `collapse_simple_statement` at `never`, a format run removes every finding the lint can make. `implicit_any_parameter`, because most Luau carries no annotations and a `warn` default would report hundreds of times on the first run. And five lints about the shape of a branch or a value: `and_or_conditional`, `if_expression_assignment`, `else_after_return`, `collapsible_if`, and `negated_condition`. Each states a preference about code that is correct.

`if_expression_assignment` has to stay allow, and the reason is worth the line. `misleading_and_or` names `if cond then a else b` as the repair in its own help text, so a default that reported would report the fix larvae asked for.

Every other Luau lint keeps the level that Luau gives it, so the change of linter changes no report.

## Groups

Every lint belongs to one of six groups, and `[lint.groups]` sets a level for all of them at once:

| Group | What it holds |
|---|---|
| `correctness` | The code cannot do what it says: it throws, it hangs, or a line of it is dead. |
| `suspicious` | Probably wrong, and a human decides. |
| `style` | A matter of how the code reads. |
| `complexity` | More shape than the job needs. |
| `performance` | Correct, and it costs more than it has to. |
| `roblox` | A Roblox data type used in a way that does not hold. |

Resolution runs most specific first: a name in `[lint.rules]`, then the group in `[lint.groups]`, then `recommended`, then the default of the lint. So `style = "allow"` with `mixed_table = "warn"` is one style lint back on and the rest off.

Two rules about groups surprise a reader who knows Biome.

The table is separate from `[lint.rules]`, not nested inside it. This is not a matter of taste: a table under `[lint.rules]` already means the lints of a worm of that name, and nothing reserves a worm name, so a worm published as `style` would make `[lint.rules.style]` mean two things at once. A separate table has no such collision, and every config written before groups existed reads exactly as it did. `selene.toml` needs no change either, because selene has no group concept and its flat `[lints]` still resolves at the first step.

And a group does not wake a lint that is `allow` on purpose. `prefer_const` is off because it rewrites a keyword, and a project that writes `style = "info"` is asking the style lints it already sees to say less, not asking for a lint it never had. To turn one on, name it in `[lint.rules]`, which beats the group anyway.

`larvae lint --explain <name>` prints the group of a lint, and the list it prints when a name misses is grouped rather than one alphabetical run.

## The 64 lints

Each name links to its section below, so an editor or an extension can deep link to one lint. The tables follow the six groups of [`[lint.groups]`](#groups), which is also how `larvae lint --explain` prints the list when a name misses.

### correctness

The code cannot do what it says: it throws, it hangs, or a line of it is dead.

| Lint | Default | What it reports |
|---|---|---|
| [`almost_swapped`](#almost-swapped) | warn | Two assignments that look like a swap but overwrite one of the values. |
| [`bad_comment_directive`](#bad-comment-directive) | warn | A `--!` directive that Luau does not know, or one that comes after the code it should govern. |
| [`bad_string_escape`](#bad-string-escape) | warn | An escape sequence the language does not define. |
| [`compare_nan`](#compare-nan) | warn | Comparing against nan, which is never equal to anything including itself. |
| [`comparison_precedence`](#comparison-precedence) | warn | `not a == b`, or a chain like `a < b < c`, which does not group the way it reads. |
| [`constant_condition`](#constant-condition) | warn | A condition that is a literal, so the branch is decided already. |
| [`constant_table_comparison`](#constant-table-comparison) | warn | Comparing against a table literal, which compares identity and is always false. |
| [`duplicate_function`](#duplicate-function) | warn | Two functions of the same name in one scope, where the first is discarded. |
| [`duplicate_keys`](#duplicate-keys) | deny | A table key written twice, where only the last one survives. |
| [`duplicate_local`](#duplicate-local) | deny | One local statement or parameter list that declares the same name twice. |
| [`format_string`](#format-string) | deny | A format string that `string.format` or `os.date` rejects at runtime. |
| [`ifs_same_cond`](#ifs-same-cond) | warn | An elseif repeating a condition already tested, which can never run. |
| [`length_as_condition`](#length-as-condition) | deny | `#t` used as a condition. A length is a number, and every number is true in Luau. |
| [`misleading_and_or`](#misleading-and-or) | warn | `cond and x or b` where the middle can never be truthy: a literal `false` or `nil`, or a boolean that syntax proves. |
| [`mismatched_arg_count`](#mismatched-arg-count) | warn | Calling a function in this file with the wrong number of arguments. |
| [`must_use`](#must-use) | warn | Calling a pure function and discarding what it returned. |
| [`number_literal_overflow`](#number-literal-overflow) | warn | A hexadecimal or binary literal wider than 64 bits, which is truncated. |
| [`suspicious_reverse_loop`](#suspicious-reverse-loop) | warn | A numeric for counting down without a negative step, which never runs. |
| [`table_operations`](#table-operations) | warn | A `table.insert` or `table.remove` whose index or argument count is wrong. |
| [`type_check_inside_call`](#type-check-inside-call) | warn | A comparison inside `type()`, where it belongs outside. |
| [`unbalanced_assignments`](#unbalanced-assignments) | warn | More names than values, or more values than names. |
| [`undefined_variable`](#undefined-variable) | deny | A name nothing declares, which is nil at runtime. |
| [`uninitialized_local`](#uninitialized-local) | warn | A local declared with no value and never assigned, so every read is nil. |
| [`unknown_type`](#unknown-type) | warn | Comparing `type(x)` against a string that `type()` never returns. |
| [`unreachable_code`](#unreachable-code) | warn | Statements after a return, break or continue, which never run. |
| [`unused_function`](#unused-function) | warn | A `local function` that nothing calls, and a global `function f() end` that no line reads. |
| [`unused_import`](#unused-import) | warn | A module required and never used. |
| [`unused_variable`](#unused-variable) | warn | A name declared and never read. A `local function` is [`unused_function`](#unused-function) instead. |
| [`zero_step_loop`](#zero-step-loop) | deny | A numeric for whose step is zero, so the counter never moves. |

### suspicious

Probably wrong, and a human decides.

| Lint | Default | What it reports |
|---|---|---|
| [`builtin_global_write`](#builtin-global-write) | warn | An assignment over a standard global, which every later script sees. |
| [`builtin_shadowed`](#builtin-shadowed) | warn | A local that takes the name of a standard global, so the library is unreachable below that line. |
| [`divide_by_zero`](#divide-by-zero) | warn | Dividing by a literal zero. |
| [`empty_if`](#empty-if) | warn | An if branch with nothing in it. |
| [`empty_loop`](#empty-loop) | warn | A loop body with nothing in it. |
| [`global_usage`](#global-usage) | warn | Reaching into `_G`, which is shared with every other script. |
| [`if_same_then_else`](#if-same-then-else) | warn | Two branches of the same if with identical bodies. |
| [`ignored_pcall_result`](#ignored-pcall-result) | warn | A `pcall` or `xpcall` used as a statement, which catches the error and discards it. |
| [`implicit_any_local`](#implicit-any-local) | warn | A local with no value and no type, so whatever assigns it first decides what it holds. |
| [`implicit_any_parameter`](#implicit-any-parameter) | allow | A parameter with no type, so what the function takes is decided by each caller. |
| [`implicit_return`](#implicit-return) | allow | A function that returns a value on one path and falls off the end on another. |
| [`mixed_table`](#mixed-table) | warn | A table with both array entries and named keys. |
| [`placeholder_read`](#placeholder-read) | warn | Reading `_`, the name that says a value is discarded. |
| [`self_assignment`](#self-assignment) | warn | Assigning a value to itself, which does nothing. |
| [`shadowing`](#shadowing) | warn | A name that hides another still in scope. |
| [`unscoped_variables`](#unscoped-variables) | warn | An assignment with no `local`, which creates a global. |

### style

A matter of how the code reads.

| Lint | Default | What it reports |
|---|---|---|
| [`and_or_conditional`](#and-or-conditional) | allow | `cond and a or b` used as a value, where an if statement states one case per branch. |
| [`collapsible_if`](#collapsible-if) | allow | An if that holds one if and nothing else, where the two conditions are one `and` apart. |
| [`deprecated`](#deprecated) | warn | A function that still works but has been replaced. |
| [`else_after_return`](#else-after-return) | allow | An else after branches that all end in a return, break or continue. |
| [`if_expression_assignment`](#if-expression-assignment) | allow | `if cond then a else b` used as a value. |
| [`multiple_statements`](#multiple-statements) | allow | More than one statement on a line. |
| [`negated_condition`](#negated-condition) | allow | An if with a negated condition and an else, where swapped bodies read in the expected order. |
| [`non_const_require`](#non-const-require) | allow | A required module bound with `local`, where `const` says it never changes. |
| [`parenthese_conditions`](#parenthese-conditions) | warn | Parentheses around a condition, which Luau does not need. |
| [`prefer_const`](#prefer-const) | allow | A local that nothing reassigns, which `const` states outright. |
| [`restricted_globals`](#restricted-globals) | warn | Reading a global the project has ruled out. Silent until the config names one. |
| [`restricted_module_paths`](#restricted-module-paths) | warn | Requiring a module the project has ruled out. Quiet until the config names a path. |

### complexity

More shape than the job needs.

| Lint | Default | What it reports |
|---|---|---|
| [`high_cyclomatic_complexity`](#high-cyclomatic-complexity) | allow | A function with more branches than anyone can hold at once. |

### performance

Correct, and it costs more than it has to.

| Lint | Default | What it reports |
|---|---|---|
| [`loop_invariant_call`](#loop-invariant-call) | warn | A call inside a loop whose result cannot change between iterations. |
| [`manual_table_clone`](#manual-table-clone) | warn | A loop that copies a table, which `table.clone` does in one call. |
| [`string_concat_in_loop`](#string-concat-in-loop) | warn | Building a string by concatenation in a loop, which is quadratic. |

### roblox

A Roblox data type used in a way that does not hold.

| Lint | Default | What it reports |
|---|---|---|
| [`roblox_incorrect_color3_new_bounds`](#roblox-incorrect-color3-new-bounds) | warn | `Color3.new` given a channel over 1, where the scale is 0 to 1. |
| [`roblox_manual_fromscale_or_fromoffset`](#roblox-manual-fromscale-or-fromoffset) | warn | A `UDim2.new` that `fromScale` or `fromOffset` says more clearly. |
| [`roblox_suspicious_udim2_new`](#roblox-suspicious-udim2-new) | warn | `UDim2.new` given two arguments, where it takes four. |

`larvae lint --explain <name>` prints one lint's description and its group. The schema contains all lints with their defaults, so an editor can offer them by name. `larvae init` writes only `std = "roblox"` and a pointer to `[lint.rules]`, not the lint list.

### `almost_swapped`

Two adjacent assignments read like a swap, but the first assignment overwrites one of the values before the second one reads it. Both names end up holding the same value.

```luau
local a, b = 1, 2
a = b
b = a -- a was overwritten first, so both hold 2

-- fine: a, b = b, a
```

### `and_or_conditional`

Default level: `allow`, because it states a preference about code that is correct.

`cond and a or b` is used as a value. The decision hides inside an expression, where an if statement states one case per branch.

```luau
local fast = true
local speed = fast and 20 or 10 -- the decision hides inside the expression
```

The shape also has a trap when the middle can be false or nil, and [`misleading_and_or`](#misleading-and-or) reports that case on its own.

### `bad_comment_directive`

A `--!` comment is a directive to Luau. This lint reports a directive Luau does not know, and a directive placed after code, because a late directive governs nothing.

```luau
--!non-strict -- Luau does not know this name; it spells it nonstrict
local x = 1
--!strict -- comes after the code it should govern, so it does nothing
```

### `bad_string_escape`

The string holds a backslash escape the language does not define, so the string does not mean what the backslash suggests. The check reads a literal, but Luau accepts the escape and runs the file, so the lint warns instead of denying.

```luau
local dir = "C:\Users\me" -- \U and \m are not escape sequences

-- fine: local dir = "C:\\Users\\me"
```

### `builtin_global_write`

The assignment replaces a standard global. Globals are shared, so every later script sees the replacement instead of the builtin.

```luau
print = function() end -- every later print call now does nothing
```

### `builtin_shadowed`

A local takes the name of a standard global, such as `local table = {}`. The library is unreachable below that line.

```luau
local table = {} -- the table library is unreachable below this line
```

A declaration whose value reads the same global is left alone, because `local pairs = pairs` caches it and loses nothing.

```luau
local pairs = pairs -- fine: caches the global under the same name
```

### `collapsible_if`

Default level: `allow`, because it states a preference about code that is correct.

An if holds one if and nothing else. The two conditions are one `and` apart.

```luau
local ready, armed = true, true
if ready then
	if armed then -- the outer if holds only this if
		print("go")
	end
end

-- fine: if ready and armed then print("go") end
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

### `constant_condition`

The condition is a literal, so the branch is decided already. Only nil and false are false in Luau, so `if 0 then` and `if "" then` both pass.

```luau
if 0 then
	print("always") -- only nil and false are false, so 0 passes
end
```

`while true do` and `repeat ... until false` are exempt, because each one is a deliberate loop.

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

Default level: `deny`, because `{ a = 1, a = 2 }` discards the first entry, and no reading of the code makes that what the author meant.

A table constructor writes the same key twice. Only the last write survives, and the earlier value is discarded silently.

```luau
local color = { r = 1, g = 1, r = 0 } -- r is written twice, only the last survives
```

### `duplicate_local`

Default level: `deny`, because `local a, a` kills the first binding where it stands.

One local statement or one parameter list declares the same name twice. The second declaration hides the first inside the same statement.

```luau
local width, width = 10, 20 -- one statement declares width twice
```

### `else_after_return`

Default level: `allow`, because it states a preference about code that is correct.

An else follows a branch that returns, breaks or continues. The jump already ends the branch, so the code in the else runs in the same cases without it. The lint fires only when every branch ends in the jump, because an elseif that falls through still needs the else.

```luau
local function sign(n: number)
	if n < 0 then
		return -1
	else -- the branch above returns, so the else can go
		return 1
	end
end
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

Default level: `deny`, because `string.format("%y", 1)` raises, and the check reads the literal, so no reading of the code makes the finding wrong.

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

### `if_expression_assignment`

Default level: `allow`, and it must stay `allow`, because [`misleading_and_or`](#misleading-and-or) names this exact form as the repair in its own help text. A default that reported would report the fix larvae asked for.

`if cond then a else b` is used as a value.

```luau
local fast = true
local speed = if fast then 20 else 10 -- the if expression as a value
```

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

### `ignored_pcall_result`

A `pcall` or `xpcall` is used as a statement. It catches the error and discards it, so the failure leaves no trace at all.

```luau
local function save()
	error("disk full")
end
pcall(save) -- the error is caught and discarded, no trace remains

-- fine: local ok, err = pcall(save)
```

### `implicit_any_local`

A local is declared with no value and no type, so what it holds is decided by whatever assigns it first. In a file with no `--!strict` directive Luau then accepts any later assignment of any type. The fix is one of two words: write the type, or write the value.

```luau
local items = { 1, 5 }
local found -- no value and no type
for _, v in items do
	if v > 3 then
		found = v
	end
end

-- fine: local found: number?
```

A local that nothing ever assigns is left to [`uninitialized_local`](#uninitialized-local), which says the more urgent thing about the same line.

### `implicit_any_parameter`

Default level: `allow`, because most Luau carries no annotations, and a `warn` default would report hundreds of times on the first run.

A parameter has no type, so what the function takes is decided by each caller. The sibling of [`implicit_any_local`](#implicit-any-local), on the other side of the call.

```luau
local function scale(n) -- what n is, each caller decides
	return n * 2
end

-- fine: local function scale(n: number)
```

### `implicit_return`

Default level: `allow`, because a lookup that returns a value on one path and falls off the end on another is idiomatic Luau.

The function returns a value on one path and falls off the end on another. The caller gets a value sometimes and nil the rest of the time.

```luau
local function find(t, v)
	for i, x in t do
		if x == v then return i end
	end
end -- falls off the end and returns nothing
```

### `length_as_condition`

Default level: `deny`, because `#t` yields a number, every number is true in Luau, and so the guard does nothing.

`#t` is used as a condition. A length is a number, and every number is true, so `if #players then` runs with no players.

```luau
local players = {}
if #players then
	print("someone is here") -- #players is 0, and 0 is true, so this runs
end

-- fine: if #players > 0 then
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

In `cond and x or b`, when the middle can never be truthy the expression always gives `b` whatever `cond` is. Two cases fire, and each carries its own message.

The middle is a literal `false` or `nil`. The expression is wrong for every input.

```luau
local function pickMode(fast: boolean)
	return fast and nil or "slow" -- always "slow", because nil is never truthy
end

-- fine: return if fast then nil else "slow"
```

The middle is a boolean that syntax proves. A comparison yields a boolean because it is a comparison, so the check needs no types. Here the expression is wrong for half the inputs: it gives `"pending"` exactly when the author wanted `false`.

```luau
local function status(ready: boolean, count: number)
	return ready and (count == 0) or "pending" -- "pending" when the count is not zero
end

-- fine: return if ready then count == 0 else "pending"
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

Default level: `allow`, because `larvae fmt` owns that ground already: with `collapse_simple_statement` at `never`, a format run removes every finding the lint can make.

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

### `negated_condition`

Default level: `allow`, because it states a preference about code that is correct.

An if has a negated condition and an else. Swapping the bodies states the same thing in the order a reader expects.

```luau
local ready = false
if not ready then
	print("wait")
else
	print("go")
end

-- fine: if ready then print("go") else print("wait") end
```

### `non_const_require`

Default level: `allow`, because `const` is newer than most codebases. It is not a lint of the Luau compiler.

A required module is bound with `local`, where `const` states that the binding never changes. The lint skips a name that the file reassigns, because `const` would then be a syntax error.

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

### `prefer_const`

Default level: `allow`, because `const` is larvae's own reading of Luau, so a codebase of ordinary `local` would report on nearly every line the first time it ran. It is not a lint of the Luau compiler.

A local that nothing reassigns, which `const` states outright.

```luau
local retries = 3 -- nothing reassigns retries
print(retries)

-- fine: const retries = 3
```

In the editor the report carries a code action that changes `local` to `const`, so the fix is one click. [Editor setup](/docs/concepts/editor-setup) describes the language server.

Three forms are left alone, and each one is a place where `const` does not compile or does not exist. A declaration with no initialiser stays, because `const x` is "Missing initializer in const declaration". A `local function` and a `for` variable take no `const` at all. And `const` binds the declaration and not one name inside it, so `local a, b = 1, 2` is reported only when nothing reassigns either name; where one of them changes, there is no edit to suggest.

#### `prefer_const` options

| Option | Default | What it does |
|---|---|---|
| `mutated_tables_stay_local` | `false` | Keep `local` on a binding the file mutates through a field, such as `t.x = 1` or `table.insert(t, 1)`. |

The option is off because `const` is correct on a mutated table. Luau enforces `const` against reassignment of the name and says nothing about the value, so this compiles:

```luau
const t = {}
t.x = 1
table.insert(t, 2)
```

The option is for a project that reads `local` as "this one changes" and wants the two keywords to carry that difference. With it on, larvae skips a binding the file changes through a field, an index, a nested chain, a compound assignment, or one of the `table` functions that mutates its first argument. `table.freeze` is not one of them, because it returns a copy, so a binding that only reaches `table.freeze` still reports.

```toml
[lint.options.prefer_const]
mutated_tables_stay_local = true
```

### `restricted_globals`

The code reads a global the project has ruled out in its config, and the report carries the configured reason. The lint is quiet until `[lint.options.restricted_globals]` names one, so it costs nothing until a project asks.

```luau
local env = getfenv() -- reported when the config restricts getfenv
```

#### `restricted_globals` options

The table itself is the map: one `name = "why"` line per global. The reason is the message a reader gets, which is why a bare list of names is not the shape: it would report "this is restricted" and leave them guessing.

```toml
[lint.options.restricted_globals]
getfenv = "turns the optimiser off, read the docs page on environments"
setfenv = "turns the optimiser off, read the docs page on environments"
```

`getfenv` and `setfenv` are worth naming in a project that cares about speed, because each one turns Luau's optimiser off for the function that holds it.

### `restricted_module_paths`

The require names a module path the project has ruled out in its config, and the report carries the configured reason. The lint is quiet until `[lint.options.restricted_module_paths]` names something.

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

The local is declared with no value and nothing ever assigns one, so every read gives nil. A local the file assigns later but never types is [`implicit_any_local`](#implicit-any-local) instead.

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

A `function f() end` declaration is not reported. It creates a global the same way, but neither selene nor the Luau compiler calls that an unscoped variable.

### `unused_function`

A `local function` that nothing calls, and a global `function f() end` that no line reads.

```luau
local function helper() -- nothing calls helper
	return 1
end
```

The declaring form decides which unused lint fires, not the value: `local function f() end` is `unused_function`, and `local f = function() end` is [`unused_variable`](#unused-variable), though both hold a function. Each carries its own level, so a project that keeps unused helpers around while still wanting unused locals reported can say so. Both lints read [`[lint.options.unused_variable]`](#unused-variable-options), because `ignore_pattern` means the same thing to either one, and `_helper` silences a function as it silences a variable.

### `unused_import`

A module required and bound to a name nothing reads. The fix is always to delete the line, which is why the leftover gets its own lint and its own level instead of riding [`unused_variable`](#unused-variable).

```luau
local Signal = require("@pkg/signal") -- nothing reads Signal
```

A method that happens to be named `require` stays a variable question. A worm can also exempt what it knows: in a `.luaux` file the factory package never reports, because the markup uses it even where no call spells it out.

### `unused_variable`

The name is declared and never read, so the declaration does nothing for the program. The declaring form decides, not the value: a `local function` that nothing calls is [`unused_function`](#unused-function) instead, and the two lints carry their own levels while sharing the options below.

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

Default level: `deny`, because a step of zero never moves the counter, so the loop hangs where it stands.

A numeric for whose step is zero. The counter never moves, so the loop never ends or never runs as intended.

```luau
for i = 1, 10, 0 do -- the step is zero, so i never moves
end
```

## The `[lint]` keys

| Key | What it does |
|---|---|
| `enabled` | Default `true`. `false` turns the linter off entirely. |
| `recommended` | Default `true`. `false` starts every lint at `allow`. |
| `std` | The global environment lints check against. Default `"roblox"`. |
| `globals` | Extra globals the project defines. |
| `exclude` | Globs the linter skips, relative to the project root. |
| `include` | Globs the linter reads back, over every exclude. |
| [`[lint.groups]`](#groups) | A level for a whole kind of lint at once. |
| `[lint.rules]` | Levels by lint name. |
| `[lint.options]` | Options for [`unused_variable`](#unused-variable-options), [`high_cyclomatic_complexity`](#high-cyclomatic-complexity-options), [`deprecated`](#deprecated-options), [`restricted_globals`](#restricted-globals-options), [`restricted_module_paths`](#restricted-module-paths-options), and [`prefer_const`](#prefer-const-options). Also spelled `[lint.config]`, selene's name. |

`enabled = false` turns the linter off: `larvae lint` reports nothing and exits zero, and the language server clears the diagnostics of every file instead of leaving the last ones on screen. This is for a project that wants larvae for its formatter and its requires and keeps another linter.

`recommended` has three states, as Biome has them. Absent and `true` both mean the default levels apply. `false` starts every lint at `allow`, so the project gets the lints it names under `[lint.rules]` and no others. A level the project wrote always wins in either state, so `recommended = false` with `shadowing = "warn"` is one lint on and the rest off. That pair is the reason to reach for it.

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

### Switching the linter off over a span

A second family holds a tool off over a span:

```luau
-- larvae: lint off
local DEBUG = true
local VERBOSE = false
-- larvae: lint on
```

`off` runs to the matching `on`, or to the end of the file when no `on` follows. One marker therefore covers three needs:

| Written | Holds |
|---|---|
| `-- larvae: lint off` at the top, no `on` | the whole file |
| `-- larvae: lint off` then `-- larvae: lint on` | the lines between, markers included |
| `-- larvae: lint off(5)` | the marker line and five lines below it |

A `lint` marker holds every lint, where `allow(...)` names the lints it holds. Each subject reads its own markers only, so a `fmt off` does not quiet the linter. The `fmt` half of the family lives on [formatting](/docs/reference/formatting).

A marker larvae cannot read is an ordinary comment. `-- larvae: lint off(five)` names no count, so it is not a flag: it stays in the file where a reader sees it, and the linter runs. That is deliberate, because were it a flag, `larvae process` would strip it from the build and the linter would hold off to the end of the file, with nothing to say why.

These markers are flags, so `larvae process` strips them by default, as it strips `allow(...)`.

Only `allow(...)` and this family are flags. The comment `-- larvae: this one is load bearing` is a note to the next reader, and larvae treats it as an ordinary comment.

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
