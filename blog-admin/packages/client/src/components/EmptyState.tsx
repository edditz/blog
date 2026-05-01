import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center text-muted">
      <Inbox size={48} strokeWidth={1} />
      <p className="mt-4 text-sm">{message}</p>
    </div>
  )
}
