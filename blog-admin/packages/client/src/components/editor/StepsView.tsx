import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { parseSteps, markdownToHtml, type StepData } from '@/utils/renderSlotMarkdown'

function stepsToMarkdown(steps: StepData[]): string {
  return steps
    .map((step) => {
      const heading = `### ${step.heading}`
      const content = step.content
        .replace(/<strong>(.+?)<\/strong>/g, '**$1**')
        .replace(/<b>(.+?)<\/b>/g, '**$1**')
        .replace(/<em>(.+?)<\/em>/g, '*$1*')
        .replace(/<i>(.+?)<\/i>/g, '*$1*')
        .replace(/<code>(.+?)<\/code>/g, '`$1`')
        .replace(/<a href="(.+?)">(.+?)<\/a>/g, '[$2]($1)')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/p>\s*<p>/g, '\n\n')
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '')
        .trim()
      return `${heading}\n\n${content}`
    })
    .join('\n\n')
}

export function StepsView({ node, updateAttributes }: NodeViewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const headingRefs = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])

  const slot = (node.attrs.slot as string) || ''
  const steps = parseSteps(slot)

  const handleSave = useCallback(() => {
    const newSteps: StepData[] = steps.map((step, i) => {
      const headingEl = headingRefs.current[i]
      const contentEl = contentRefs.current[i]
      return {
        heading: headingEl?.textContent?.trim() || step.heading,
        html: contentEl?.innerHTML?.trim() || step.html,
      }
    })
    const newSlot = stepsToMarkdown(newSteps)
    if (newSlot !== slot) {
      updateAttributes({ slot: newSlot })
    }
    setEditingIndex(null)
  }, [steps, slot, updateAttributes])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }
      if (e.key === 'Escape') {
        setEditingIndex(null)
        return
      }
      e.stopPropagation()
    },
    [handleSave],
  )

  useEffect(() => {
    if (editingIndex !== null) {
      headingRefs.current[editingIndex]?.focus()
    }
  }, [editingIndex])

  return (
    <NodeViewWrapper className="my-3">
      <div className="steps-container my-8 ml-4 border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 space-y-8 relative">
        {steps.length > 0 ? (
          steps.map((step, i) => (
            <div
              key={i}
              className="relative group/step [&>*:first-child]:mt-0"
            >
              <div
                ref={(el) => {
                  headingRefs.current[i] = el
                }}
                contentEditable={editingIndex === i}
                suppressContentEditableWarning
                onBlur={editingIndex === i ? handleSave : undefined}
                onKeyDown={editingIndex === i ? handleKeyDown : undefined}
                onClick={() => setEditingIndex(i)}
                className={`text-2xl font-bold text-neutral-900 dark:text-neutral-100 outline-none rounded px-1 -mx-1 ${
                  editingIndex === i
                    ? 'cursor-text'
                    : 'cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
                } empty:before:content-['Step_heading'] empty:before:opacity-40`}
                dangerouslySetInnerHTML={{
                  __html: step.heading || '&nbsp;',
                }}
              />
              <div
                ref={(el) => {
                  contentRefs.current[i] = el
                }}
                contentEditable={editingIndex === i}
                suppressContentEditableWarning
                onBlur={editingIndex === i ? handleSave : undefined}
                onKeyDown={editingIndex === i ? handleKeyDown : undefined}
                onClick={() => setEditingIndex(i)}
                className={`mt-2 prose max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 outline-none rounded px-1 -mx-1 ${
                  editingIndex === i
                    ? 'cursor-text'
                    : 'cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
                } empty:before:content-['Click_to_edit_step_content...'] empty:before:opacity-40`}
                dangerouslySetInnerHTML={{ __html: step.html }}
              />
            </div>
          ))
        ) : (
          <div
            className="relative group/step [&>*:first-child]:mt-0"
            onClick={() => setEditingIndex(0)}
          >
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 opacity-40 cursor-pointer">
              Step heading
            </div>
            <div className="mt-2 opacity-40 cursor-pointer">
              Click to edit steps...
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
