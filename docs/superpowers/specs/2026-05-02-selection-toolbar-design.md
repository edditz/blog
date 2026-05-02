# Selection Floating Toolbar Design

Date: 2026-05-02

## Overview

Add a floating toolbar that appears near selected text in the TipTap WYSIWYG editor, providing contextual inline/block formatting actions. Built with HeroUI v3 components.

## Architecture

Use TipTap's built-in `BubbleMenu` extension for selection detection and positioning. No custom `selectionchange` listeners needed.

**Coexistence with existing top toolbar**: The top `EditorToolbar` stays for always-available block-level actions (headings, lists). The floating toolbar provides contextual formatting when text is selected.

## Component Structure

```
WysiwygEditor
├── EditorToolbar          (existing, unchanged)
├── BubbleMenu             (new, appears only on text selection)
│   └── SelectionToolbar   (HeroUI Button + lucide-react icons)
│       ├── Bold
│       ├── Italic
│       ├── Strikethrough
│       ├── Inline Code
│       ├── Divider
│       ├── Link
│       ├── Blockquote
│       └── Code Block
└── EditorContent
```

## Toolbar Items

| Action | TipTap Command | Markdown Output | Icon |
|--------|---------------|-----------------|------|
| Bold | `toggleBold()` | `**text**` | `Bold` |
| Italic | `toggleItalic()` | `*text*` | `Italic` |
| Strikethrough | `toggleStrike()` | `~~text~~` | `Strikethrough` |
| Inline Code | `toggleCode()` | `` `text` `` | `Code` |
| Link | `setLink()` / `unsetLink()` | `[text](url)` | `Link` |
| Blockquote | `toggleBlockquote()` | `> text` | `Quote` |
| Code Block | `toggleCodeBlock()` | ` ``` ` | `CodeXml` |

## New TipTap Extensions

- `@tiptap/extension-link` — Link support with `openOnClick: false` (click edits link instead of navigating)
- StarterKit already includes Bold, Italic, Strike, Code, Blockquote, CodeBlock

## Link Action UX

Clicking the link button:
1. If selection already has a link: show current URL, option to edit or unlink
2. If selection has no link: show URL input popover
3. Use HeroUI `Popover` + `Input` for the URL input

## HeroUI Components

- `Button` (`isIconOnly`, `size="sm"`, `variant="ghost"`) — action buttons, matching top toolbar style
- `Tooltip` — hover hints showing action name
- `Popover` + `Input` — link URL input
- `Divider` — separator between inline and block action groups

## BubbleMenu Configuration

```tsx
<BubbleMenu
  editor={editor}
  tippyOptions={{ duration: 150, placement: 'top' }}
  shouldShow={({ editor, state }) => {
    const { empty } = state.selection
    return !empty && editor.isEditable
  }}
>
```

## Interaction Details

- Toolbar appears above the selection, aligned to selection's left edge
- 150ms show/hide transition
- Clicking an action keeps editor focus (except link popover)
- Active state shown with `variant="secondary"`, matching top toolbar
- Underline skipped (Markdown has no native underline syntax)

## File Changes

| File | Action |
|------|--------|
| `SelectionToolbar.tsx` | **New** — floating toolbar component |
| `WysiwygEditor.tsx` | **Modify** — add BubbleMenu, SelectionToolbar, Link extension |
| `index.css` | **Possibly modify** — link styles in editor |
