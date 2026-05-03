import { Node, mergeAttributes } from '@tiptap/core'
import type { Attributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import React from 'react'
import { CalloutView } from '@/components/editor/CalloutView'
import { QuoteView } from '@/components/editor/QuoteView'
import { TabsView } from '@/components/editor/TabsView'
import { TabItemView } from '@/components/editor/TabItemView'
import { StepsView } from '@/components/editor/StepsView'
import { ProsConsView } from '@/components/editor/ProsConsView'
import { LinkCardView } from '@/components/editor/LinkCardView'
import { FigureView } from '@/components/editor/FigureView'
import { YouTubeView } from '@/components/editor/YouTubeView'
import { DividerView } from '@/components/editor/DividerView'
import { BadgeView } from '@/components/editor/BadgeView'
import { SeparatorView } from '@/components/editor/SeparatorView'

const COMPONENT_COLORS: Record<string, { accent: string; bg: string; badge: string }> = {
  Callout: { accent: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  Tabs: { accent: 'border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  TabItem: { accent: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  Quote: { accent: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  ProsCons: { accent: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  LinkCard: { accent: 'border-l-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
  YouTube: { accent: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-950/30', badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  Steps: { accent: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
  Figure: { accent: 'border-l-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' },
  Divider: { accent: 'border-l-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/30', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300' },
  Separator: { accent: 'border-l-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
  Badge: { accent: 'border-l-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
}

const DEFAULT_COLOR = { accent: 'border-l-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300' }

function formatProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (value === true) return key
      if (typeof value === 'string') return `${key}="${value}"`
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')
}

function MdxComponentView({ node }: NodeViewProps) {
  const component = node.attrs.component as string
  const propsRaw = node.attrs.props as string
  const slot = node.attrs.slot as string
  const selfClosing = node.attrs.selfClosing as boolean

  let props: Record<string, unknown> = {}
  try {
    props = JSON.parse(propsRaw || '{}')
  } catch {
    props = {}
  }

  const colors = COMPONENT_COLORS[component] || DEFAULT_COLOR
  const propsStr = formatProps(props)
  const truncatedSlot = slot.length > 120 ? slot.slice(0, 120) + '...' : slot

  return React.createElement(
    NodeViewWrapper,
    { className: 'my-3' },
    React.createElement(
      'div',
      { className: `rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden ${colors.bg} border-l-4 ${colors.accent}` },
      React.createElement(
        'div',
        { className: 'px-3 py-2 flex items-center gap-2 flex-wrap' },
        React.createElement(
          'span',
          { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}` },
          component,
        ),
        selfClosing
          ? React.createElement(
              'span',
              { className: 'text-xs text-neutral-400 dark:text-neutral-500' },
              'self-closing',
            )
          : null,
        propsStr
          ? React.createElement(
              'code',
              { className: 'text-xs text-neutral-500 dark:text-neutral-400 font-mono' },
              propsStr,
            )
          : null,
      ),
      slot
        ? React.createElement(
            'div',
            { className: 'px-3 pb-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-0.5 whitespace-pre-wrap' },
            truncatedSlot,
          )
        : null,
    ),
  )
}

export const MdxComponent = Node.create({
  name: 'mdxComponent',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      component: { default: 'Unknown' },
      props: { default: '{}' },
      slot: { default: '' },
      selfClosing: { default: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mdx-component',
        getAttrs: (dom: HTMLElement) => ({
          component: dom.getAttribute('data-component') || 'Unknown',
          props: dom.getAttribute('data-props') || '{}',
          slot: (dom.getAttribute('data-slot') || '')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#10;/g, '\n'),
          selfClosing: dom.getAttribute('data-self-closing') === 'true',
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Attributes }) {
    return ['mdx-component', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    const viewMap: Record<string, React.ComponentType<NodeViewProps>> = {
      Callout: CalloutView,
      Quote: QuoteView,
      Tabs: TabsView,
      TabItem: TabItemView,
      Steps: StepsView,
      ProsCons: ProsConsView,
      LinkCard: LinkCardView,
      Figure: FigureView,
      YouTube: YouTubeView,
      Divider: DividerView,
      Badge: BadgeView,
      Separator: SeparatorView,
    }
    return ReactNodeViewRenderer((props: NodeViewProps) => {
      const component = props.node.attrs.component as string
      const View = viewMap[component]
      if (View) {
        return React.createElement(View, props)
      }
      return React.createElement(MdxComponentView, props)
    })
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (text: string) => void }, node: { attrs: Record<string, unknown> }) {
          const component = node.attrs.component as string
          const propsRaw = node.attrs.props as string
          const slot = node.attrs.slot as string
          const selfClosing = node.attrs.selfClosing as boolean

          let props: Record<string, unknown> = {}
          try {
            props = JSON.parse(propsRaw || '{}')
          } catch {
            props = {}
          }

          const propsEntries = Object.entries(props)
          const propsStr = propsEntries
            .map(([key, value]) => {
              if (value === true) return key
              if (typeof value === 'string') return `${key}="${value}"`
              return `${key}={${JSON.stringify(value)}}`
            })
            .join(' ')

          const prefix = propsStr ? `<${component} ${propsStr}` : `<${component}`

          if (selfClosing) {
            state.write(`${prefix} />\n\n`)
          } else if (slot) {
            state.write(`${prefix}>\n${slot}\n</${component}>\n\n`)
          } else {
            state.write(`${prefix}></${component}>\n\n`)
          }
        },
      },
    }
  },
})
