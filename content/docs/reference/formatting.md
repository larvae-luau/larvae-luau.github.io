---
title: Formatting
description: Every [fmt] option, its default, and what it does
category: Reference
order: 4
updated: 2026-08-16
---

`[fmt]` in `larvae.toml` configures `larvae fmt`. The table is optional: `larvae fmt` works with no config at all, and every option below has a default. `larvae init` writes only the four options users change most (`column_width`, `indent_type`, `indent_width`, `quote_style`); every other option keeps its default silently, and the schema serves the full list to the editor.

```toml
[fmt]
column_width = 100
indent_type = "spaces"
indent_width = 2
quote_style = "auto-prefer-double"
```

## All options

| Option | Default | What it does |
|---|---|---|
| [`column_width`](#column-width) | `120` | The column the formatter wraps at. |
| [`line_endings`](#line-endings) | `"unix"` | Line endings in the output. |
| [`indent_type`](#indent-type) | `"tabs"` | Tabs or spaces. |
| [`indent_width`](#indent-width) | `4` | Width of one indent level. |
| [`quote_style`](#quote-style) | `"auto-prefer-double"` | Which quote a string gets. |
| [`call_parentheses`](#call-parentheses) | `"always"` | Whether a call keeps its parentheses. |
| [`space_after_function_names`](#space-after-function-names) | `"never"` | Space between a function's name and its parameter list. |
| [`collapse_simple_statement`](#collapse-simple-statement) | `"never"` | Collapse a one statement block onto one line. |
| [`sort_requires`](#sort-requires) | `{ enabled = false, grouping = "flat" }` | Sort top level requires. |
| [`magic_trailing_comma`](#magic-trailing-comma) | `true` | A trailing comma in a table keeps the table expanded. |
| [`space_inside_braces`](#space-inside-braces) | `true` | `{ x = 1 }`, the Luau convention. |
| [`space_inside_parens`](#space-inside-parens) | `false` | `f( x )` when true. |
| [`space_inside_brackets`](#space-inside-brackets) | `false` | `t[ 1 ]` when true. |
| [`trailing_comma`](#trailing-comma) | `true` | The last entry of an expanded table gets a comma. |
| [`block_newline_gaps`](#block-newline-gaps) | `"never"` | `preserve` keeps a blank line just inside a block. |
| [`require_binding`](#require-binding) | `"preserve"` | Which keyword binds a required module. |
| [`semicolons`](#semicolons) | `"never"` | Whether a statement ends with one. |
| [`if_expression`](#if-expression) | `{ expand = "never", ... }` | How an `if` expression lays out. |
| [`final_newline`](#final-newline) | `true` | Whether the file ends with a newline. |

## stylua parity

`[fmt]` accepts every stylua option under its own name, so a project that already formats with stylua keeps its settings. A `stylua.toml` or `.stylua.toml` on disk is read as it is; when both files set the same key, `larvae.toml` wins key by key, because it is the more specific file.

### `column_width`

Default `120`. The column the formatter wraps at. Any positive integer.

### `line_endings`

Default `"unix"`. Line endings in the output. The other value is `"windows"`.

### `indent_type`

Default `"tabs"`. The values are `"tabs"` and `"spaces"`.

### `indent_width`

Default `4`. The width of one indent level, in columns. With `indent_type = "spaces"` it is also the number of spaces written per level.

### `quote_style`

Default `"auto-prefer-double"`. The values are `"auto-prefer-double"`, `"auto-prefer-single"`, `"force-double"`, and `"force-single"`. The `auto` values pick the preferred quote, and keep the other quote when the string contains the preferred one.

```luau
-- before
local a = 'plain'
-- after, with auto-prefer-double
local a = "plain"
```

### `call_parentheses`

Default `"always"`. Besides stylua's values, `call_parentheses` takes `"as-needed"`, which is the name that Biome and Prettier use for what stylua spells `"none"`. The two names select the same output: larvae drops the parentheses where Luau accepts the bare call, and keeps them everywhere else.

The bare call takes one string or one table and nothing else. So `f("s")` becomes `f "s"`, `g({ x = 1 })` becomes `g { x = 1 }`, and `h(a)` keeps its parentheses, because `h a` is not shorter Luau, it is a syntax error. The name suggests a wider rule than Luau permits, which is why this paragraph exists.

```luau
-- with call_parentheses = "as-needed"
f("s")        -- becomes  f "s"
g({ x = 1 })  -- becomes  g { x = 1 }
h(a)          -- stays    h(a)
```

### `space_after_function_names`

Default `"never"`. Whether a space separates a function's name from its parameter list. The values are stylua's: `"never"`, `"definitions"`, `"calls"`, and `"always"`, in larvae's kebab case spelling.

### `collapse_simple_statement`

Default `"never"`. Whether a block that holds one statement collapses onto one line. The values are stylua's: `"never"`, `"function-only"`, `"conditional-only"`, and `"always"`. `"never"` keeps every block expanded; the other values collapse the block kinds they name.

```luau
-- "never" (default)
if ready then
	start()
end
-- a collapsing value
if ready then start() end
```

### `sort_requires`

Default `{ enabled = false, grouping = "flat" }`. Sorts the run of requires at the top of a file. stylua has the `enabled` half of this option; `grouping` is larvae's addition.

```toml
[fmt]
sort_requires = { enabled = true, grouping = "by-kind" }
```

#### `sort_requires.enabled`

Default `false`. Off, nothing about the requires moves. On, the run of top level requires is sorted; the rest of the file is untouched.

#### `sort_requires.grouping`

Default `"flat"`. How the sorted requires are laid out:

- `"flat"` writes one sorted run, which is what stylua does.
- `"by-kind"` groups by what the require points at: aliases first, then absolute paths, then relative ones, with a blank line between each group.

```luau
-- grouping = "flat", one sorted run
local Config = require("./config")
local Signal = require("@pkg/signal")
local Storage = require("@game/ReplicatedStorage/storage")
```

```luau
-- grouping = "by-kind": aliases, then absolute, then relative
local Signal = require("@pkg/signal")

local Storage = require("@game/ReplicatedStorage/storage")

local Config = require("./config")
```

A worm can hold this option at its default for the files it claims with `fmt_except = ["sort_requires"]`; see [using worms](/docs/worms/using-worms).

## Options beyond stylua

### `magic_trailing_comma`

Default `true`. A trailing comma the author wrote in a table keeps the table expanded, even when it would fit on one line.

```luau
-- the author's trailing comma holds this open
local point = {
	x = 1,
}
-- without it, a table that fits collapses: local point = { x = 1 }
```

### `space_inside_braces`

Default `true`, the Luau convention.

```luau
local t = { x = 1 } -- true (default)
local t = {x = 1}   -- false
```

### `space_inside_parens`

Default `false`.

```luau
f(x)   -- false (default)
f( x ) -- true
```

### `space_inside_brackets`

Default `false`.

```luau
t[1]   -- false (default)
t[ 1 ] -- true
```

### `trailing_comma`

Default `true`. The last entry of an expanded table gets a comma.

```luau
local t = {
	"a",
	"b", -- this comma, when true
}
```

### `block_newline_gaps`

Default `"never"`. The other value is `"preserve"`, which keeps a blank line just inside a block.

```luau
if ready then

	start() -- "preserve" keeps the blank line above; "never" removes it
end
```

### `require_binding`

Default `"preserve"`, which keeps what the author wrote. `"const"` or `"local"` selects which keyword binds a required module. A name the file reassigns keeps `local` whatever the option says, because Luau enforces `const`.

```luau
-- before, with require_binding = "const"
local http = require("./http")
-- after
const http = require("./http")
```

### `semicolons`

Default `"never"`. The values are `"never"`, `"always"`, and `"as-needed"`. `never` and `as-needed` name the same output, and both are accepted: Luau needs a semicolon in one place only, before a statement that opens with `(`, and larvae writes that one whatever the option says. In a language where the separator is optional everywhere except one place where it is never optional, "omit the ones that are not needed" and "omit all of them" describe the same file.

```luau
-- with "never"
local x = 1;       -- becomes  local x = 1
-- the one Luau requires stays, whatever the option says
do_setup();
(handlers[name])()
```

### `if_expression`

Lays out Luau's `if` expression. stylua has no option for it, so a long one runs off to the right. Five keys, and the default writes what larvae always wrote:

| Key | Default | Selects |
|---|---|---|
| `expand` | `"never"` | `"never"`, `"always"`, or `"when-large"` |
| `width` | `60` | the boundary that `when-large` measures against |
| `style` | `"block"` | `"block"` or `"leading"`, the shape of an opened expression |
| `placement` | `"same-line"` | whether the `if` stays on the line of the binding |
| `indent` | `1` | the indent levels a continuation line takes |

The two shapes:

```luau
-- style = "block"          -- style = "leading"
local a = if bar then       local a = if bar
    "baz"                       then "baz"
else                            else "foo"
    "foo"
```

Two points are easy to miss. A nested expression waits for `width` in every mode, `always` included: an `if` inside an `if` that opens with its parent gives a stair of keywords for an expression that reads well on one line, so the inner one waits until it earns the room. And the two styles write the same characters on one line, because the break between a keyword and its value is one space either way.

#### `if_expression.expand`

Default `"never"`, which keeps every `if` expression on one line. `"always"` opens each one, and `"when-large"` opens the ones wider than `width`.

#### `if_expression.width`

Default `60`. The boundary that `"when-large"` measures against, in columns.

#### `if_expression.style`

Default `"block"`. The shape of an opened expression, as shown above. `"block"` indents the values under their keywords; `"leading"` starts each continuation line with its keyword.

#### `if_expression.placement`

Default `"same-line"`. `"next-line"` ends the line after the `=` and starts the `if` below it. It applies to an expression that opens, and not to one that stays on one line, so `"when-large"` and `"next-line"` together move only the expressions that earned it.

#### `if_expression.indent`

Default `1`. The indent levels a continuation line takes.

### `final_newline`

Default `true`. Selects whether the file ends with a newline. POSIX defines a line as text up to a newline, so a file without a final one ends in something that is not a line: `wc` counts one line less, and git prints "No newline at end of file" on each diff that touches the last line. The option covers that one newline. editorconfig calls the same setting `insert_final_newline`, and larvae accepts that name.

Larvae removes whitespace at the end of every line whatever the option says, because a trailing space is invisible and has no reading in which the author wanted it.

## What has no option

A comment keeps the blank line below it. A comment is a paragraph of its own: the author who puts a blank line under a note separates it from the code that follows, and the author who does not attaches it to that code. The two say different things, so larvae keeps the difference. Several blank lines collapse to one, as they do between two statements.

## Spelling and unknown keys

Values in `larvae.toml` use larvae's spelling, which is kebab case: `quote_style = "auto-prefer-double"`, not stylua's `"AutoPreferDouble"`. larvae converts the PascalCase form only when it reads that form from `stylua.toml` itself. When a value is unknown, the error message lists the valid values.

### `syntax`

stylua's `syntax` key is accepted and ignored, because larvae only formats Luau. Every other unknown key at the top level of `[fmt]` is refused with a message, because only a worm can own a name that larvae does not.

## Scope

### `exclude`

A list of globs relative to the project root. `[fmt] exclude` removes a file for the formatter alone, over the root `include`.

### `include`

A list of globs relative to the project root. `[fmt] include` brings a file back for the formatter alone, over every exclude. The full order lives on [configuration](/docs/reference/configuration).

## Options that come from a worm

A worm adds format options under its own key: `[fmt.<worm>]` is a table of the options that the worm declares.

```toml
[fmt.markup]
wide = true
```

See [using worms](/docs/worms/using-worms).
