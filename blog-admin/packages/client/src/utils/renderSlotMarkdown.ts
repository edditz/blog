/**
 * Lightweight markdown-to-HTML converter for MDX component slot content.
 * Handles headings, paragraphs, bold, italic, code, and links.
 */
export function renderSlotMarkdown(text: string): string {
  if (!text) return ''

  return parseBlocks(text).join('')
}

export interface StepData {
  heading: string
  html: string
}

/**
 * Convert inline markdown to HTML.
 */
export function markdownToHtml(text: string): string {
  return inlineMarkdown(text)
}

/**
 * Parse markdown into an array of HTML block strings.
 */
export function parseBlocks(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const content = inlineMarkdown(headingMatch[2])
        return `<h${level}>${content}</h${level}>`
      }

      const lines = trimmed.split('\n').map(inlineMarkdown).join('<br>')
      return `<p>${lines}</p>`
    })
    .filter(Boolean)
}

/**
 * Split markdown into step groups, each starting with an h3 heading.
 * Returns structured step data with heading text and content HTML.
 */
export function parseSteps(text: string): StepData[] {
  if (!text) return []

  const blocks = parseBlocks(text)
  const steps: StepData[] = []
  let currentHeading = ''
  let currentBlocks: string[] = []

  for (const block of blocks) {
    if (block.startsWith('<h3')) {
      if (currentHeading || currentBlocks.length > 0) {
        steps.push({
          heading: currentHeading,
          html: currentBlocks.join(''),
        })
      }
      const match = block.match(/^<h3>(.+?)<\/h3>$/)
      currentHeading = match ? match[1] : block
      currentBlocks = []
    } else {
      currentBlocks.push(block)
    }
  }

  if (currentHeading || currentBlocks.length > 0) {
    steps.push({
      heading: currentHeading,
      html: currentBlocks.join(''),
    })
  }

  return steps
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
}
