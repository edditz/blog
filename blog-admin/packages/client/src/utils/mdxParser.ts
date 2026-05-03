const IMPORT_RE = /^import\s+.+$/gm

const COMPONENT_RE =
  /<([A-Z][A-Za-z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|\{[^}]*\}))?)*\s*)(\/?)>(?:([\s\S]*?)<\/\1>)?/g

const IMPORT_PATH = '@/components/ui/'

const COMPONENT_IMPORT_MAP: Record<string, string> = {
  Callout: 'Callout.astro',
  Tabs: 'Tabs.astro',
  TabItem: 'TabItem.astro',
  Quote: 'Quote.astro',
  ProsCons: 'ProsCons.astro',
  LinkCard: 'LinkCard.astro',
  YouTube: 'YouTube.astro',
  Steps: 'Steps.astro',
  Figure: 'Figure.astro',
  Divider: 'Divider.astro',
  Separator: 'Separator.astro',
  Badge: 'Badge.astro',
}

export function extractImports(content: string): { imports: string[]; body: string } {
  const imports: string[] = []
  const body = content.replace(IMPORT_RE, (match) => {
    imports.push(match.trim())
    return ''
  })
  return { imports, body: body.replace(/^\n+/, '') }
}

function parsePropsString(propsStr: string): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  if (!propsStr.trim()) return props

  const PROP_RE =
    /([a-zA-Z][a-zA-Z0-9-]*)=(?:"([^"]*)"|\{([\s\S]*?)\})|([a-zA-Z][a-zA-Z0-9-]*)/g

  let match: RegExpExecArray | null
  while ((match = PROP_RE.exec(propsStr)) !== null) {
    if (match[4]) {
      props[match[4]] = true
    } else if (match[2] !== undefined) {
      props[match[1]] = match[2]
    } else if (match[3] !== undefined) {
      try {
        props[match[1]] = JSON.parse(match[3])
      } catch {
        props[match[1]] = match[3]
      }
    }
  }
  return props
}

function propsToMdx(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (value === true) return key
      if (typeof value === 'string') return `${key}="${value}"`
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')
}

export function mdxToTipTap(body: string): string {
  return body.replace(
    COMPONENT_RE,
    (_full, name: string, propsStr: string, selfSlash: string, slot: string | undefined) => {
      const props = parsePropsString(propsStr)
      const selfClosing = selfSlash === '/' || (!slot && !selfSlash)
      const slotContent = (slot || '').trim()

      const attrs = [
        `data-component="${name}"`,
        `data-props='${JSON.stringify(props).replace(/'/g, '&#39;')}'`,
        `data-slot="${slotContent.replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}"`,
        `data-self-closing="${selfClosing}"`,
      ].join(' ')

      return `<mdx-component ${attrs}></mdx-component>`
    },
  )
}

export function tipTapToMdx(markdown: string): string {
  return markdown.replace(
    /<mdx-component\s+([^>]+)><\/mdx-component>/g,
    (_full, attrsStr: string) => {
      const component = attrsStr.match(/data-component="([^"]*)"/)?.[1] || 'Unknown'
      const propsRaw = attrsStr.match(/data-props='([^']*)'/)?.[1] || '{}'
      const slot = attrsStr
        .match(/data-slot="([^"]*)"/)?.[1]
        ?.replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#10;/g, '\n') || ''
      const selfClosing = attrsStr.match(/data-self-closing="(true)"/)?.[1] === 'true'

      let props: Record<string, unknown> = {}
      try {
        props = JSON.parse(propsRaw)
      } catch {
        props = {}
      }

      const propsStr = propsToMdx(props)
      const prefix = propsStr ? `<${component} ${propsStr}` : `<${component}`

      if (selfClosing) return `${prefix} />`
      if (slot) return `${prefix}>\n${slot}\n</${component}>`
      return `${prefix}></${component}>`
    },
  )
}

export function generateImports(componentNames: string[]): string[] {
  const unique = [...new Set(componentNames)]
  return unique
    .map((name) => {
      const file = COMPONENT_IMPORT_MAP[name]
      if (!file) return null
      return `import ${name} from '${IMPORT_PATH}${file}';`
    })
    .filter((s): s is string => s !== null)
}

export function collectComponents(markdown: string): string[] {
  const names: string[] = []
  const re = /data-component="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = re.exec(markdown)) !== null) {
    names.push(match[1])
  }
  return names
}
