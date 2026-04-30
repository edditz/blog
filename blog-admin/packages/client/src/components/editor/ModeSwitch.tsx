import { Button } from '@heroui/react'

interface Props {
  mode: 'source' | 'wysiwyg'
  onChange: (mode: 'source' | 'wysiwyg') => void
}

export default function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="flex bg-surface rounded-lg p-1 gap-1">
      <Button
        size="sm"
        variant={mode === 'source' ? 'primary' : 'ghost'}
        onPress={() => onChange('source')}
      >
        源码模式
      </Button>
      <Button
        size="sm"
        variant={mode === 'wysiwyg' ? 'primary' : 'ghost'}
        onPress={() => onChange('wysiwyg')}
      >
        WYSIWYG
      </Button>
    </div>
  )
}
