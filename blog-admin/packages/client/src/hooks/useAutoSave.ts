import { useState, useEffect, useRef, useCallback } from 'react'
import { createPost, updatePost } from '@/api/client'
import type { PostFrontmatter } from '@blog-admin/shared'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions {
  isNew: boolean
  slug: string | undefined
  title: string
  content: string
  frontmatter: PostFrontmatter
  onSuccess?: (slug: string) => void
}

export interface UseAutoSaveReturn {
  status: SaveStatus
  error: string | null
  lastSavedAt: Date | null
  triggerSave: () => void
}

const DEBOUNCE_MS = 3000
const SAVED_INDICATOR_MS = 3000

export function useAutoSave({
  isNew,
  slug,
  title,
  content,
  frontmatter,
  onSuccess,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasChanged = useRef(false)
  const initialValues = useRef({ title, content, frontmatter })
  const savingRef = useRef(false)
  const currentSlugRef = useRef(slug)

  useEffect(() => {
    currentSlugRef.current = slug
  }, [slug])

  const performSaveRef = useRef<(() => Promise<void>) | null>(null)

  const performSave = useCallback(async () => {
    savingRef.current = true
    setStatus('saving')
    try {
      const data = { ...frontmatter, title }

      if (isNew && !currentSlugRef.current) {
        const slugified = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        const newSlug = slugified || `untitled-${Date.now()}`
        await createPost(newSlug, data, content)
        currentSlugRef.current = newSlug
        onSuccess?.(newSlug)
      } else {
        await updatePost(currentSlugRef.current!, data, content)
      }

      setError(null)
      setStatus('saved')
      setLastSavedAt(new Date())

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => {
        setStatus('idle')
      }, SAVED_INDICATOR_MS)
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存失败'
      setError(message)
      setStatus('error')
    } finally {
      savingRef.current = false
    }
  }, [isNew, title, content, frontmatter, onSuccess])

  performSaveRef.current = performSave

  const triggerSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    performSaveRef.current?.()
  }, [])

  useEffect(() => {
    if (savingRef.current) return

    const initial = initialValues.current
    const isSame =
      title === initial.title &&
      content === initial.content &&
      JSON.stringify(frontmatter) === JSON.stringify(initial.frontmatter)

    if (isSame && !hasChanged.current) return

    if (!hasChanged.current) {
      initialValues.current = { title, content, frontmatter }
      hasChanged.current = true
      return
    }

    setStatus('pending')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      performSaveRef.current?.()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [title, content, frontmatter])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  return { status, error, lastSavedAt, triggerSave }
}
