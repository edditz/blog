import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Sparkles } from 'lucide-react'

export function SeparatorView(_props: NodeViewProps) {
  return (
    <NodeViewWrapper className="my-3">
      <div className="my-12 flex items-center justify-center gap-4 text-neutral-200 dark:text-neutral-800">
        <div className="h-px bg-gradient-to-r from-transparent to-current flex-1" />
        <Sparkles size={16} className="text-indigo-300 dark:text-indigo-700 shrink-0" />
        <div className="h-px bg-gradient-to-l from-transparent to-current flex-1" />
      </div>
    </NodeViewWrapper>
  )
}
