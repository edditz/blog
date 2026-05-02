import { useState, useEffect, useRef, useCallback } from 'react'
import { createPost, updatePost } from '@/api/client'
import type { PostFrontmatter } from '@blog-admin/shared'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  isNew: boolean
  slug: string | undefined
  title: string
  content: string
  frontmatter: PostFrontmatter
  onSuccess?: (slug: string) => void
}

interface UseAutoSaveReturn {
  status: SaveStatus
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
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  const currentSlugRef = useRef(slug)

  useEffect(() => {
    currentSlugRef.current = slug
  }, [slug])

  const performSave = useCallback(async () => {
    setStatus('saving')
    try {
      const data = { ...frontmatter, title }

      if (isNew && !currentSlugRef.current) {
        const newSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'untitled'
        await createPost(newSlug, data, content)
        currentSlugRef.current = newSlug
        onSuccess?.(newSlug)
      } else {
        await updatePost(currentSlugRef.current!, data, content)
      }

      setStatus('saved')
      setLastSavedAt(new Date())

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => {
        setStatus('idle')
      }, SAVED_INDICATOR_MS)
    } catch {
      setStatus('error')
    }
  }, [isNew, title, content, frontmatter, onSuccess])

  const triggerSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    performSave()
  }, [performSave])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (status === 'saving') return

    setStatus('pending')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      performSave()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [title, content, frontmatter, performSave, status])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  return { status, lastSavedAt, triggerSave }
}
