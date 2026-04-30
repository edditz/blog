import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, X } from 'lucide-react'
import { uploadImage, deleteImage } from '@/api/client'

interface Props {
  slug: string
  onInsert: (url: string, alt: string) => void
  onClose: () => void
}

interface ImageItem {
  filename: string
  url: string
}

export default function ImageManager({ slug, onInsert, onClose }: Props) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [slug])

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/images/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      }
    } catch {
      // Images directory may not exist yet
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadImage(slug, file)
      }
      fetchImages()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除图片 ${filename}？`)) return
    await deleteImage(slug, filename)
    fetchImages()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">图片管理</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X size={20} />
          </button>
        </div>

        <div
          className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg m-4 text-center cursor-pointer hover:border-blue-400"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">
            {uploading ? '上传中...' : '拖拽图片到此处，或点击选择文件'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.filename} className="group relative">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => onInsert(img.url, img.filename)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    插入
                  </button>
                  <button
                    onClick={() => handleDelete(img.filename)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{img.filename}</p>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无图片</p>
          )}
        </div>
      </div>
    </div>
  )
}
