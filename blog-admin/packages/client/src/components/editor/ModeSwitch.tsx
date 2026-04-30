interface Props {
  mode: 'source' | 'wysiwyg'
  onChange: (mode: 'source' | 'wysiwyg') => void
}

export default function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onChange('source')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          mode === 'source'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        源码模式
      </button>
      <button
        onClick={() => onChange('wysiwyg')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          mode === 'wysiwyg'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        WYSIWYG
      </button>
    </div>
  )
}
