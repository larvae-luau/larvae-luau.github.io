import { describe, expect, it } from 'vitest'
import {
  escapeHtml,
  highlightToHtml,
  type Lang,
  resolveLang,
  tokenize,
} from '@/lib/highlight'

function typesOf(code: string, lang: Lang, text: string): string[] {
  return tokenize(code, lang)
    .filter((t) => t.text === text)
    .map((t) => t.type)
}

describe('tokenize · luau', () => {
  const code = `-- setup
local Signal = require('@pkg/signal')
if ready then return 42 end`

  it('reassembles to the exact input', () => {
    const joined = tokenize(code, 'luau')
      .map((t) => t.text)
      .join('')
    expect(joined).toBe(code)
  })

  it('classifies keywords', () => {
    expect(typesOf(code, 'luau', 'local')).toEqual(['keyword'])
    expect(typesOf(code, 'luau', 'return')).toEqual(['keyword'])
  })

  it('classifies const like local', () => {
    expect(
      typesOf("const Signal = require('@pkg/signal')", 'luau', 'const'),
    ).toEqual(['keyword'])
  })

  it('classifies require as a builtin', () => {
    expect(typesOf(code, 'luau', 'require')).toEqual(['builtin'])
  })

  it('classifies strings, comments, and numbers', () => {
    expect(typesOf(code, 'luau', "'@pkg/signal'")).toEqual(['string'])
    expect(typesOf(code, 'luau', '-- setup')).toEqual(['comment'])
    expect(typesOf(code, 'luau', '42')).toEqual(['number'])
  })

  it('does not match keywords inside identifiers', () => {
    const tokens = tokenize('mylocal = 1', 'luau')
    expect(tokens.find((t) => t.type === 'keyword')).toBeUndefined()
  })
})

describe('tokenize · toml', () => {
  const code = `# larvae.toml
[aliases]
pkg = '@game/ReplicatedStorage/packages'`

  it('reassembles to the exact input', () => {
    const joined = tokenize(code, 'toml')
      .map((t) => t.text)
      .join('')
    expect(joined).toBe(code)
  })

  it('classifies sections, keys, strings, and comments', () => {
    expect(typesOf(code, 'toml', '[aliases]')).toEqual(['section'])
    expect(typesOf(code, 'toml', 'pkg')).toEqual(['key'])
    expect(typesOf(code, 'toml', "'@game/ReplicatedStorage/packages'")).toEqual(
      ['string'],
    )
    expect(typesOf(code, 'toml', '# larvae.toml')).toEqual(['comment'])
  })
})

describe('tokenize · shell', () => {
  const code = `larvae process   # rewrite requires
cargo install larvae`

  it('reassembles to the exact input', () => {
    const joined = tokenize(code, 'shell')
      .map((t) => t.text)
      .join('')
    expect(joined).toBe(code)
  })

  it('classifies leading commands and comments', () => {
    expect(typesOf(code, 'shell', 'larvae')).toEqual(['command'])
    expect(typesOf(code, 'shell', 'cargo')).toEqual(['command'])
    expect(typesOf(code, 'shell', '# rewrite requires')).toEqual(['comment'])
  })

  it('leaves arguments plain', () => {
    const tokens = tokenize('cargo install larvae', 'shell')
    const plain = tokens.find((t) => t.text.includes('install'))
    expect(plain?.type).toBe('plain')
  })
})

describe('tokenize · json', () => {
  const code = `{
  "name": "larvae",
  "strict": true,
  "passes": 2
}`

  it('reassembles to the exact input', () => {
    expect(
      tokenize(code, 'json')
        .map((t) => t.text)
        .join(''),
    ).toBe(code)
  })

  it('separates keys from string values', () => {
    expect(typesOf(code, 'json', '"name"')).toEqual(['key'])
    expect(typesOf(code, 'json', '"larvae"')).toEqual(['string'])
  })

  it('classifies literals and numbers', () => {
    expect(typesOf(code, 'json', 'true')).toEqual(['keyword'])
    expect(typesOf(code, 'json', '2')).toEqual(['number'])
  })
})

describe('tokenize · yaml', () => {
  const code = `# in CI
steps:
  - run: larvae check
    strict: true`

  it('reassembles to the exact input', () => {
    expect(
      tokenize(code, 'yaml')
        .map((t) => t.text)
        .join(''),
    ).toBe(code)
  })

  it('classifies comments and keys', () => {
    expect(typesOf(code, 'yaml', '# in CI')).toEqual(['comment'])
    expect(typesOf(code, 'yaml', 'steps')).toEqual(['key'])
  })
})

describe('tokenize · text', () => {
  it('leaves plain text untouched', () => {
    const code = 'processed 128 file(s): 84 require(s) rewritten'
    expect(tokenize(code, 'text')).toEqual([{ text: code, type: 'plain' }])
  })

  it('returns nothing for empty input', () => {
    expect(tokenize('', 'text')).toEqual([])
  })
})

describe('resolveLang', () => {
  it('maps markdown fence aliases onto supported languages', () => {
    expect(resolveLang('lua')).toBe('luau')
    expect(resolveLang('bash')).toBe('shell')
    expect(resolveLang('sh')).toBe('shell')
    expect(resolveLang('yml')).toBe('yaml')
    expect(resolveLang('JSON')).toBe('json')
  })

  it('falls back to plain text for unknown or missing languages', () => {
    expect(resolveLang('rust')).toBe('text')
    expect(resolveLang(undefined)).toBe('text')
    expect(resolveLang('')).toBe('text')
  })
})

describe('highlightToHtml', () => {
  it('escapes markup so code cannot inject html', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
    expect(highlightToHtml('type X<T> = number', 'luau')).not.toContain('<T>')
  })

  it('wraps tokens in theme color classes', () => {
    const html = highlightToHtml("local x = 'hi'", 'luau')
    expect(html).toContain('class="text-spore"')
    expect(html).toContain('class="text-hive"')
  })
})
