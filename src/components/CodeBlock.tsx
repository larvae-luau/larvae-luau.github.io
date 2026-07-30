import { type Lang, TOKEN_CLASSES, tokenize } from '@/lib/highlight'

interface CodeBlockProps {
  code: string
  lang: Lang
  className?: string
}

export default function CodeBlock({
  code,
  lang,
  className = '',
}: CodeBlockProps) {
  let offset = 0
  return (
    <pre
      className={`code-scroll overflow-x-auto font-mono text-sm leading-7 text-foreground/80 ${className}`}
    >
      {tokenize(code, lang).map((token) => {
        const key = `${offset}-${token.type}`
        offset += token.text.length
        return token.type === 'plain' ? (
          token.text
        ) : (
          <span key={key} className={TOKEN_CLASSES[token.type]}>
            {token.text}
          </span>
        )
      })}
    </pre>
  )
}
