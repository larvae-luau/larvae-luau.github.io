---
title: Formatting
description: Every [fmt] option, its default, and what it does
category: Reference
order: 4
updated: 2026-08-30
---

`[fmt]` in `larvae.toml` configures `larvae fmt`. The table is optional: `larvae fmt` works with no config at all, and every option below has a default. Two keys come first, [`enabled`](#enabled) and [`recommended`](#recommended), because they decide what every other key below means. `larvae init` writes `recommended = true` and the four options users change most (`column_width`, `indent_type`, `indent_width`, `quote_style`); every other option keeps its default silently, and the schema serves the full list to the editor.

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
| [`enabled`](#enabled) | `true` | `false` turns the formatter off everywhere. |
| [`recommended`](#recommended) | `true` | `false` starts from a base that changes as little as possible. |
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
| [`prefer_const`](#prefer-const) | `false` | Turn a `local` that nothing reassigns into a `const`. |
| [`semicolons`](#semicolons) | `"never"` | Whether a statement ends with one. |
| [`if_expression`](#if-expression) | `{ expand = "never", ... }` | How an `if` expression lays out. |
| [`function_call`](#function-call) | `{ expand = "when-needed", ... }` | How the argument list of a call lays out. |
| [`function_declaration`](#function-declaration) | `{ expand = "when-needed", ... }` | How the parameter list of a declaration lays out. |
| [`table_types`](#table-types) | `{ enabled = true, width = 60, separator = "comma" }` | How a table type lays out. |
| [`final_newline`](#final-newline) | `true` | Whether the file ends with a newline. |

## Two keys come first

`enabled` and `recommended` come before every style option, because they decide what those options mean: whether the formatter runs at all, and which defaults it starts from.

### `enabled`

Default `true`. `enabled = false` turns the formatter off: `larvae fmt` writes no file, `--check` reports no failure and exits zero, `--stdin` answers with its input unchanged so a pipeline still reads the output as the file, and the editor gets a formatter that returns no edits. This is for a project that wants larvae for its lints and its requires and keeps another formatter.

```toml
[fmt]
enabled = false
```

### `recommended`

Has the same three states as `[lint] recommended` on [linting](/docs/reference/linting). Absent and `true` both mean larvae's defaults apply. `false` starts from a base that changes as little as possible: `magic_trailing_comma`, `space_inside_braces` and `trailing_comma` go off, and the project turns back on what it wants.

Those three are the whole set, and the reason is worth stating. They are the options where larvae holds an opinion beyond stylua and the opinion rewrites a file on its own. Every other default is either stylua's already or a setting that does nothing until a project asks for it, so a base that moved them would not be neutral, it would be a third style nobody chose.

A `stylua.toml` states the style of the project outright, so it stays the base wherever one exists, whatever `recommended` says.

`larvae init` writes `recommended = true` into `[fmt]`. The value is the default already; the key is the point, because a key in the file can be turned off and an absent key has to be found in the docs first.

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

### `prefer_const`

Default `false`. Turns a `local` that nothing reassigns into a `const`. It is the same rule the `prefer_const` lint reports, with the formatter making the edit, and it carries the same `mutated_tables_stay_local` option under the same name. The [lint's section on linting](/docs/reference/linting#prefer-const) covers what is left alone.

It is off by default, because it rewrites a keyword, which is a bigger step than moving spaces.

```luau
-- before
local MAX_RETRIES = 3
-- after, with prefer_const = true
const MAX_RETRIES = 3
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

A nested expression in parentheses takes the parentheses onto their own lines, and the operator before it stays where it is:

```luau
local option_line =
    if option_index == selected then
        `{index} {option}` .. (
            if submit_on_click then
                CONFIRM_TEXT
            else
                ""
        )
    else
        `   {index} {option}`
```

The `..` does not move below, because the operand it joins already has lines of its own. A parenthesised expression that stays on one line keeps its parentheses against it, as every other one does.

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

### `function_call`

Lays out the argument list of a call. `function_call` and [`function_declaration`](#function-declaration) are separate tables, because a project that wants every call opened does not always want every declaration opened as well.

| Key | Default | Values |
|---|---|---|
| `expand` | `"when-needed"` | `"when-needed"`, `"always"`, or `"never"` |
| `style` | `"one-per-line"` | `"one-per-line"` or `"hug-last"` |
| `indent` | `1` | a number |

#### `function_call.expand`

Default `"when-needed"`, which is the layout larvae always had: the list opens where the line does not fit. `"always"` opens every list, and `"never"` holds the list on one line. Under `"never"` a value inside the list can still open, so `f(t)` with a large table opens the table and leaves the list alone, and the line runs past `column_width`, because that is what the option asks for.

#### `function_call.style`

Default `"one-per-line"`, which gives each argument of an opened call its own line. `"hug-last"` keeps the arguments on the line of the call and opens the last one:

```luau
-- one-per-line                    -- hug-last
Colors:Apply(                      Colors:Apply(frame, "Rarity", {
    frame,                             Children = { stroke },
    "Rarity",                      })
    { Children = { stroke } }
)
```

Two limits. The style applies where the last argument is a table, a function, or a string carrying its own newlines, because those are the values that read as a block; a call of plain arguments has nothing there to hold the shape and opens one per line instead. And the arguments before the last one do not break, so a long list of them runs past `column_width`. That is the trade the style asks for, and it is why `"one-per-line"` stays the default.

#### `function_call.indent`

Default `1`. The indent levels an opened argument takes.

#### With `magic_trailing_comma`

`expand` and [`magic_trailing_comma`](#magic-trailing-comma) govern different things, so a project can set both without one fighting the other. `expand` decides the argument list. The trailing comma decides the table. Under `"never"` the list stays on one line and the table opens inside it:

```luau
f(a, b, {
	x = 1,
})
```

Where the table is the last argument, that is what `"hug-last"` writes as well, by a different route. The two part company as soon as the table is not last: `"hug-last"` has no block at the end to hold the shape and opens one per line, while `"never"` keeps the list flat whatever sits where, and the arguments after the table carry on from the closing brace.

```luau
-- expand = "never"        -- style = "hug-last"
f(a, {                     f(
    x = 1,                     a,
}, b)                          {
                                   x = 1,
                               },
                               b
                           )
```

A reader who meets an expanded call and wants it flat usually wants `magic_trailing_comma = false` instead of either of these. A trailing comma inside a table means "keep this open", and an open table opens the call around it, so a codebase that came from a formatter which left trailing commas everywhere sees calls open that are well inside `column_width`.

### `function_declaration`

Lays out the parameter list of a declaration. It is a separate table from [`function_call`](#function-call), because a project that wants every call opened does not always want every declaration opened as well. There is no `style` key; `hug-last` belongs to `function_call` only.

| Key | Default | Values |
|---|---|---|
| `expand` | `"when-needed"` | `"when-needed"`, `"always"`, or `"never"` |
| `indent` | `1` | a number |

#### `function_declaration.expand`

Default `"when-needed"`: the parameter list opens where the line does not fit. `"always"` opens every one, and `"never"` holds the list on one line, and the line runs past `column_width` when it must, because that is what the option asks for.

#### `function_declaration.indent`

Default `1`. The indent levels an opened parameter takes.

### `table_types`

Lays out table types in every position a type takes: an alias, an annotation on a binding or a parameter, a return type, and a `::` assertion. A table wider than `width` opens with one field per line and a trailing separator. The measure is one table alone, so a short table nested in a long one keeps its line.

```luau
-- before
type Item = { name: string, price: number, rarity: string, tradable: boolean }
-- after: wider than width, so it opens one field per line
type Item = {
	name: string,
	price: number,
	rarity: string,
	tradable: boolean,
}
```

The new solver's forms hold: `read` and `write` modifiers, indexers, intersections, and generic arguments split no field. A comment inside a table type keeps the author's text, and `type function` bodies are never touched.

| Key | Default | Selects |
|---|---|---|
| `enabled` | `true` | whether table types lay out at all |
| `width` | `60` | the boundary a table type opens at |
| `separator` | `"comma"` | `"comma"` or `"semicolon"`, in both layouts |

#### `table_types.enabled`

Default `true`. `false` keeps the one line replay byte for byte.

#### `table_types.width`

Default `60`. The width at which a table type opens, in columns. The measure is the flat form of one table alone.

#### `table_types.separator`

Default `"comma"`. The separator between fields, `"comma"` or `"semicolon"`. It applies in both layouts, because Luau reads both.

### `sort_table_types`

Orders the properties of a table type. Off by default, because a formatter that reorders code nobody asked it to reorder loses the order the author meant.

```luau
-- before
type Row = { description: string, id: string, [number]: any, hp: number }
-- after: order = "ascending", the indexer first
type Row = { [number]: any, id: string, hp: number, description: string }
```

| Key | Default | Selects |
|---|---|---|
| `order` | `"none"` | how the properties are ordered |
| `indexer` | `"first"` | where an indexer such as `[number]: any` lands |

#### `sort_table_types.order`

Default `"none"`, which keeps the order the author wrote.

| Value | Orders by |
|---|---|
| `none` | nothing; the author's order stands |
| `ascending` | the length of the name, shortest first |
| `descending` | the length of the name, longest first |
| `alphabetical` | the name, a to z |
| `size-ascending` | the width of the whole field, narrowest first |
| `size-descending` | the width of the whole field, widest first |

The length orders measure the name, which reads a list of keys down one edge. The size orders measure what the line takes: the name, the type, and the separator between them.

Two properties that measure the same are ordered by name, so the order is total and a second format finds the file exactly as the first one left it.

Two limits come with the option. A table type that holds a comment prints as the author wrote it, so nothing inside it moves: a comment cannot travel with the property it describes, and a comment that now sits on another property is worse than a table the sort skipped. And a table with a field the sort cannot name, the element type of `{ string }` for one, stays whole rather than half sorted.

#### `sort_table_types.indexer`

Default `"first"`. Where an indexer lands once `order` asks for a sort.

| Value | Puts the indexer |
|---|---|
| `first` | above the named properties, as the heading of the table |
| `last` | below them, as the footnote |
| `sorted` | wherever `order` puts it |

`indexer_first` is the older spelling of this key and still works: `true` is `first`, `false` is `sorted`.

### `sort_tables`

The same orders for a value table, and **off by default** for a stronger reason than style. A value table is data: the sort moves each value with its key, so the file evaluates them in the new order. A table whose values call anything is a table whose side effects move.

```toml
[fmt]
sort_tables = { order = "alphabetical" }
```

```luau
-- before
local config = { zeta = 1, alpha = 2, mid = 3 }
-- after
local config = { alpha = 2, mid = 3, zeta = 1 }
```

`order` takes the same six values as `sort_table_types.order`. Three shapes keep a table as written, each because the sort cannot read it whole: a comment anywhere inside it, a positional field, where the position is the data, and a computed key that is not a plain string, which names nothing to sort by.

The separators are the formatter's, so a sorted table cannot leave a `;` behind on a moved field, and the trailing comma [`magic_trailing_comma`](#magic-trailing-comma) reads is the source's own, which the sort never moves.

### `function_style`

The keyword a top-level function declaration takes. Default `"preserve"`, which changes nothing.

| Value | Writes |
|---|---|
| `preserve` | the keyword the author wrote |
| `local` | `local function f()` |
| `const` | `const function f()` |
| `global` | a bare `function f()` |

Three shapes are left exactly as written, because no keyword belongs on them:

```luau
function Class.method() end -- a field of a table takes no keyword
function Class:other() end -- a method takes none either
local anon = function() end -- an expression declares nothing
```

`const` carries one more proof: a name the file reassigns keeps the keyword it had, because Luau refuses `Variable 'X' is constant and may not be reassigned`. A declaration inside a block is left alone as well, where the three spellings stop meaning one thing.

### `final_newline`

Default `true`. Selects whether the file ends with a newline. POSIX defines a line as text up to a newline, so a file without a final one ends in something that is not a line: `wc` counts one line less, and git prints "No newline at end of file" on each diff that touches the last line. The option covers that one newline. editorconfig calls the same setting `insert_final_newline`, and larvae accepts that name.

Larvae removes whitespace at the end of every line whatever the option says, because a trailing space is invisible and has no reading in which the author wanted it.

## What has no option

A comment keeps the blank line below it. A comment is a paragraph of its own: the author who puts a blank line under a note separates it from the code that follows, and the author who does not attaches it to that code. The two say different things, so larvae keeps the difference. Several blank lines collapse to one, as they do between two statements.

## Holding the formatter off

`-- larvae: fmt off` holds the formatter over a span. `off` runs to the matching `-- larvae: fmt on`, or to the end of the file when no `on` follows. One marker covers three needs:

| Written | Holds |
|---|---|
| `-- larvae: fmt off` at the top, no `on` | the whole file |
| `-- larvae: fmt off` ... `-- larvae: fmt on` | the lines between, markers included |
| `-- larvae: fmt off(5)` | the marker line and five lines below it |

```luau
-- larvae: fmt off
local identity = {
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
}
-- larvae: fmt on
```

`format` says the same as `fmt`, in each of the three forms, because an author reaches for either name, and a marker larvae cannot read gives no message and no effect.

stylua's `ignore start` and `ignore end` map onto `fmt off` and `fmt on`, so a project that comes from stylua keeps the markers already in its files.

Two properties are worth knowing.

A file held off in full comes back byte for byte. The general path re-emits a held statement from its own source, which keeps that statement exact, and it makes no promise about the space between two statements. A reader who holds the formatter off for a whole file means the file, so that case returns the source unchanged.

A marker larvae cannot read is an ordinary comment. `fmt off(five)` names no count, so it is not a flag: it stays in the file where a reader sees it, and the formatter runs. Were it a flag, `larvae process` would strip it from the build and the formatter would hold off to the end of the file, with nothing to say why.

These markers are flags, and `larvae process` strips them by default. Each subject reads its own markers only, so a `fmt off` does not quiet the linter. The lint half of this family lives on [linting](/docs/reference/linting).

A file that a worm claims reads the markers too; [using worms](/docs/worms/using-worms) covers how.

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
