export type Lang = 'luau' | 'toml' | 'shell' | 'json' | 'yaml' | 'text'

export type TokenType =
  | 'plain'
  | 'keyword'
  | 'builtin'
  | 'string'
  | 'comment'
  | 'number'
  | 'section'
  | 'key'
  | 'prompt'
  | 'command'

export interface Token {
  text: string
  type: TokenType
}

/** Theme colors per token type, shared by the React and HTML renderers. */
export const TOKEN_CLASSES: Record<TokenType, string> = {
  plain: '',
  keyword: 'text-glacier',
  builtin: 'text-white',
  string: 'text-ice',
  comment: 'text-muted',
  number: 'text-ice',
  section: 'text-glacier',
  key: 'text-white',
  prompt: 'text-ice',
  command: 'text-glacier',
}

interface LangSpec {
  pattern: RegExp
  /** Token type per capture group, in order. */
  groups: TokenType[]
}

const SPECS: Record<Exclude<Lang, 'text'>, LangSpec> = {
  luau: {
    pattern:
      /(--[^\n]*)|('[^'\n]*'|"[^"\n]*")|\b(local|const|function|return|end|if|then|elseif|else|for|while|do|and|or|not|nil|true|false)\b|\b(require|script|game|workspace)\b|\b(\d+(?:\.\d+)?)\b/g,
    groups: ['comment', 'string', 'keyword', 'builtin', 'number'],
  },
  toml: {
    pattern:
      /(#[^\n]*)|(^\[[^\]\n]*\])|('[^'\n]*'|"[^"\n]*")|(^[A-Za-z0-9_.-]+(?=\s*=))/gm,
    groups: ['comment', 'section', 'string', 'key'],
  },
  shell: {
    pattern: /(#[^\n]*)|(^\$)|(^[a-z][\w-]*)/gm,
    groups: ['comment', 'prompt', 'command'],
  },
  json: {
    pattern:
      /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")(?=\s*:)|("(?:[^"\\\n]|\\.)*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g,
    groups: ['comment', 'key', 'string', 'keyword', 'number'],
  },
  yaml: {
    pattern:
      /(#[^\n]*)|(^\s*(?:-\s+)?[\w.-]+)(?=\s*:)|('[^'\n]*'|"[^"\n]*")|\b(true|false|null|yes|no)\b|\b(-?\d+(?:\.\d+)?)\b/gm,
    groups: ['comment', 'key', 'string', 'keyword', 'number'],
  },
}

const ALIASES: Record<string, Lang> = {
  luau: 'luau',
  lua: 'luau',
  toml: 'toml',
  shell: 'shell',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  console: 'shell',
  json: 'json',
  jsonc: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  text: 'text',
  txt: 'text',
  plain: 'text',
}

/** Maps a markdown fence language to a supported one, defaulting to plain text. */
export function resolveLang(lang: string | undefined | null): Lang {
  if (!lang) return 'text'
  return ALIASES[lang.trim().toLowerCase()] ?? 'text'
}

/**
 * Regex-based tokenizer for the snippet languages the site shows.
 * Unmatched spans come back as 'plain'; joining all token texts always
 * reproduces the input exactly.
 */
export function tokenize(code: string, lang: Lang): Token[] {
  if (lang === 'text') return code ? [{ text: code, type: 'plain' }] : []

  const spec = SPECS[lang]
  const tokens: Token[] = []
  let last = 0

  for (const match of code.matchAll(spec.pattern)) {
    const index = match.index
    if (index > last) {
      tokens.push({ text: code.slice(last, index), type: 'plain' })
    }
    const groupIndex = match.slice(1).findIndex((g) => g !== undefined)
    tokens.push({ text: match[0], type: spec.groups[groupIndex] ?? 'plain' })
    last = index + match[0].length
  }
  if (last < code.length) {
    tokens.push({ text: code.slice(last), type: 'plain' })
  }
  return tokens
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

/** Highlights code to an HTML string, for markdown rendered at build time. */
export function highlightToHtml(code: string, lang: Lang): string {
  return tokenize(code, lang)
    .map((token) => {
      const escaped = escapeHtml(token.text)
      const className = TOKEN_CLASSES[token.type]
      return className
        ? `<span class="${className}">${escaped}</span>`
        : escaped
    })
    .join('')
}
