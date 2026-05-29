import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  bucket: 'coffee-photos' | 'roaster-photos'
  value: string | null
  onChange: (url: string | null) => void
  name?: string
}

export function PhotoUpload({ bucket, value, onChange, name }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß (max 5 MB)')
      return
    }
    setError('')
    setUploading(true)

    if (value) {
      const oldFilename = value.split('/').pop()!
      await supabase.storage.from(bucket).remove([oldFilename])
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true })

    if (uploadError) {
      setError('Upload fehlgeschlagen')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    onChange(publicUrl)
    setUploading(false)
    e.target.value = ''
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    if (!value) return
    const filename = value.split('/').pop()!
    await supabase.storage.from(bucket).remove([filename])
    onChange(null)
  }

  const initial = name?.[0]?.toUpperCase() ?? '☕'

  return (
    <div className="flex-shrink-0">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative rounded-lg overflow-hidden cursor-pointer group"
        style={{ width: 52, height: 52 }}
      >
        {value ? (
          <img src={value} alt={name ?? 'photo'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">{initial}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-base">📷</span>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity leading-none"
          >
            ×
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-1 w-14">{error}</p>}
    </div>
  )
}
