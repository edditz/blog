import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { Button, Modal, Spinner } from '@heroui/react'
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteImage(slug, deleteTarget)
    setDeleteTarget(null)
    fetchImages()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  return (
    <>
      <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>图片管理</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div
                className="border-2 border-dashed border-default rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Spinner size="lg" className="mx-auto mb-2" />
                ) : (
                  <Upload className="mx-auto mb-2 text-muted" size={32} />
                )}
                <p className="text-sm text-muted">
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

              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img) => (
                  <div key={img.filename} className="group relative">
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-32 object-cover rounded-lg border border-default"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onPress={() => onInsert(img.url, img.filename)}
                      >
                        插入
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isIconOnly
                        onPress={() => setDeleteTarget(img.filename)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <p className="text-xs text-muted mt-1 truncate">{img.filename}</p>
                  </div>
                ))}
              </div>
              {images.length === 0 && (
                <p className="text-center text-muted py-8">暂无图片</p>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {deleteTarget && (
        <Modal.Backdrop isOpen onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>确认删除</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>确定删除图片 {deleteTarget}？</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setDeleteTarget(null)}>
                  取消
                </Button>
                <Button variant="danger" onPress={handleDelete}>
                  删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </>
  )
}
