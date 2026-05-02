# Auto-Save Feature Design

**Date:** 2026-05-02
**Scope:** Blog admin editor (`blog-admin/packages/client`)

## Goal

Automatically save blog posts after the user stops editing for 3 seconds, with debounce. New posts get a default title and are created immediately on first edit.

## Current State

- `PostEdit.tsx` manages title, frontmatter, and content state
- Manual save via "保存" button opens a Drawer for frontmatter settings, then calls `createPost` or `updatePost`
- New posts have no auto-create; user must manually fill the drawer and click save
- `WysiwygEditor.tsx` receives `value`/`onChange` and `title`/`onTitleChange` props

## Design

### New Hook: `useAutoSave`

Location: `blog-admin/packages/client/src/hooks/useAutoSave.ts`

```typescript
interface UseAutoSaveOptions {
  isNew: boolean
  title: string
  content: string
  frontmatter: PostFrontmatter
  onSuccess?: (slug: string) => void
}

interface UseAutoSaveReturn {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  lastSavedAt: Date | null
  triggerSave: () => void
}
```

**Behavior:**
1. Watches `title`, `content`, `frontmatter` for changes
2. On any change, sets status to `'pending'` and starts a 3-second debounce timer
3. Each new change resets the timer (true debounce)
4. When timer fires:
   - Sets status to `'saving'`
   - For new posts: generates slug from title, calls `createPost`, navigates to edit URL
   - For existing posts: calls `updatePost`
   - On success: sets status to `'saved'`, resets to `'idle'` after 3 seconds
   - On error: sets status to `'error'`
5. `triggerSave()` allows manual immediate save (bypasses debounce)
6. Cleans up timer on unmount

### Slug Policy

- Slug is generated from the title at the moment of first auto-save
- Once created, the slug never changes even if the title changes
- Default title for new posts: `"无标题"`

### New Post Default State

```typescript
const defaultFrontmatter: PostFrontmatter = {
  title: '无标题',
  date: 'MM/DD/YYYY', // today
  frontmatter: '',
  tags: [],
  draft: true,
}
```

### Changes to `PostEdit.tsx`

1. Import and use `useAutoSave` hook
2. Initialize new posts with default title `"无标题"`
3. Add status indicator next to the save button:
   - `未保存` — pending (dirty, waiting for debounce)
   - `保存中...` — saving
   - `已保存` — saved (auto-fades after 3s)
   - `保存失败` — error
4. Keep the manual "保存" button and Drawer for frontmatter editing
5. On successful auto-create, navigate to `/posts/{slug}/edit`
6. Disable the "图片" button until post is created (already done via `!slug` check)

### Changes to `WysiwygEditor.tsx`

No changes needed. The editor already propagates changes via `onChange`/`onTitleChange`.

### Server-Side

No changes needed. Existing `POST /api/posts` and `PUT /api/posts/:slug` endpoints handle create and update.

### UI Layout

```
[← 返回]                    [未保存] [图片] [保存]
```

Status indicator is a small text label, color-coded:
- `pending` → muted gray
- `saving` → blue with spinner
- `saved` → green
- `error` → red

## Files to Create/Modify

| File | Action |
|------|--------|
| `blog-admin/packages/client/src/hooks/useAutoSave.ts` | Create |
| `blog-admin/packages/client/src/pages/PostEdit.tsx` | Modify |

## Edge Cases

- **Rapid typing**: Debounce resets on each keystroke, only fires 3s after last change
- **Navigation while pending**: Timer is cleaned up on unmount; unsaved changes are lost (acceptable for v1)
- **Network error**: Status shows error; user can retry via manual save button
- **Empty title on new post**: Falls back to `"无标题"`
- **Concurrent edits**: Not handled (single-user admin tool)
