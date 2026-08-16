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

## stylua parity

`[fmt]` accepts every stylua option under its own name, so a project that already formats with stylua keeps its settings. A `stylua.toml` or `.stylua.toml` on disk is read as it is; when both files set the same key, `larvae.toml` wins key by key, because it is the more specific file.

| Option | Default | What it does |
|---|---|---|
| `column_width` | `120` | The column the formatter wraps at. |
| `line_endings` | `"unix"` | Line endings in the output. |
| `indent_type` | `"tabs"` | Tabs or spaces. |
| `indent_width` | `4` | Width of one indent level. |
| `quote_style` | `"auto-prefer-double"` | Which quote a string gets. |
| `call_parentheses` | `"always"` | Whether a call keeps its parentheses. See below. |
| `space_after_function_names` | `"never"` | Space between a function's name and its parameter list. |
| `collapse_simple_statement` | `"never"` | Collapse a one statement block onto one line. |
| `sort_requires` | `{ enabled = false, grouping = "flat" }` | Sort top level requires. |

### `call_parentheses`

Besides stylua's values, `call_parentheses` takes `as-needed`, which is the name that Biome and Prettier use for what stylua spells `none`. The two names select the same output: larvae drops the parentheses where Luau accepts the bare call, and keeps them everywhere else.

The bare call takes one string or one table and nothing else. So `f("s")` becomes `f "s"`, `g({ x = 1 })` becomes `g { x = 1 }`, and `h(a)` keeps its parentheses, because `h a` is not shorter Luau, it is a syntax error. The name suggests a wider rule than Luau permits, which is why this paragraph exists.

## Options beyond stylua

| Option | Default | What it does |
|---|---|---|
| `magic_trailing_comma` | `true` | A trailing comma in a table keeps the table expanded. |
| `space_inside_braces` | `true` | `{ x = 1 }`, the Luau convention. |
| `space_inside_parens` | `false` | `f( x )` when true. |
| `space_inside_brackets` | `false` | `t[ 1 ]` when true. |
| `trailing_comma` | `true` | The last entry of an expanded table gets a comma. |
| `block_newline_gaps` | `"never"` | `preserve` keeps a blank line just inside a block. |
| `require_binding` | `"preserve"` | Which keyword binds a required module. See below. |
| `semicolons` | `"never"` | Whether a statement ends with one. See below. |
| `final_newline` | `true` | Whether the file ends with a newline. See below. |

### `require_binding`

`const` or `local` selects which keyword binds a required module; `preserve` keeps what the author wrote. A name the file reassigns keeps `local` whatever the option says, because Luau enforces `const`.

### `semicolons`

The values are `never`, `always`, and `as-needed`. `never` and `as-needed` name the same output, and both are accepted: Luau needs a semicolon in one place only, before a statement that opens with `(`, and larvae writes that one whatever the option says. In a language where the separator is optional everywhere except one place where it is never optional, "omit the ones that are not needed" and "omit all of them" describe the same file.

### `final_newline`

Selects whether the file ends with a newline. POSIX defines a line as text up to a newline, so a file without a final one ends in something that is not a line: `wc` counts one line less, and git prints "No newline at end of file" on each diff that touches the last line. The option covers that one newline. editorconfig calls the same setting `insert_final_newline`, and larvae accepts that name.

Larvae removes whitespace at the end of every line whatever the option says, because a trailing space is invisible and has no reading in which the author wanted it.

## Spelling and unknown keys

Values in `larvae.toml` use larvae's spelling, which is kebab case: `quote_style = "auto-prefer-double"`, not stylua's `"AutoPreferDouble"`. larvae converts the PascalCase form only when it reads that form from `stylua.toml` itself. When a value is unknown, the error message lists the valid values.

stylua's `syntax` key is accepted and ignored, because larvae only formats Luau. Every other unknown key at the top level of `[fmt]` is refused with a message, because only a worm can own a name that larvae does not.

## Scope

`[fmt]` also accepts `exclude` and `include`, lists of globs relative to the project root. `[fmt] include` brings a file back for the formatter alone, over every exclude; `[fmt] exclude` removes a file for the formatter alone, over the root `include`. The full order lives on [configuration](/docs/reference/configuration).

## Options that come from a worm

A worm adds format options under its own key: `[fmt.<worm>]` is a table of the options that the worm declares.

```toml
[fmt.markup]
wide = true
```

See [using worms](/docs/worms/using-worms).
