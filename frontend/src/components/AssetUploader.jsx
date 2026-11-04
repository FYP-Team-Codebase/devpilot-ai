import { useRef, useState } from 'react'
import { uploadAsset } from '../services/assetService'
import { uniqueFilesBySignature, uploadFilesIndividually } from '../services/uploadQueue'

function fileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export default function AssetUploader({ category, projectId, accept = 'image/png,image/jpeg,image/gif,image/webp,application/pdf', onUploaded, multiple = true, maxFiles = 20 }) {
  const inputRef = useRef(null)
  const [items, setItems] = useState([])
  const [dragging, setDragging] = useState(false)

  function appendFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, multiple ? maxFiles : Math.min(1, maxFiles))
    if (!files.length) return
    const added = uniqueFilesBySignature(items.map((item) => item.file), files, multiple ? 20 : 1)
    if (!added.length) return
    const queue = added.map((file) => ({ key: fileKey(file), file, status: 'uploading', progress: 0, error: '' }))
    setItems((current) => [...current, ...queue])
    void uploadQueue(queue)
  }

  async function uploadQueue(queue) {
    await uploadFilesIndividually(queue.map((item) => item.file), { category, projectId }, {
      upload: uploadAsset,
      onProgress: (index, progress) => setItems((current) => current.map((item) => item.key === queue[index].key ? { ...item, progress } : item)),
      onResult: (result, index) => {
        const queued = queue[index]
        if (result.status === 'success') {
          setItems((current) => current.map((item) => item.key === queued.key ? { ...item, status: 'success', progress: 100, asset: result.asset, error: '' } : item))
          onUploaded?.(result.asset)
        } else {
          setItems((current) => current.map((item) => item.key === queued.key ? { ...item, status: 'error', error: result.error?.message || 'Could not upload this file.' } : item))
        }
      },
    })
  }

  async function retry(item) {
    setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, status: 'uploading', progress: 0, error: '' } : entry))
    try {
      const asset = await uploadAsset(item.file, { category, projectId, onProgress: (progress) => setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, progress } : entry)) })
      setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, status: 'success', progress: 100, asset } : entry))
      onUploaded?.(asset)
    } catch (error) {
      setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, status: 'error', error: error?.message || 'Could not upload this file.' } : entry))
    }
  }

  function handleInput(event) {
    appendFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div className="mt-3 w-full space-y-3">
      <input type="file" accept={accept} multiple={multiple} className="sr-only" ref={inputRef} onChange={handleInput} />
      <div onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); appendFiles(event.dataTransfer.files) }} className={`rounded-xl border border-dashed p-4 ${dragging ? 'border-blue-500 bg-blue-50' : 'border-dp-line'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-sm font-medium text-dp-black">Add files</p><p className="text-xs text-dp-muted">Choose or drop PNG, JPG, GIF, WEBP, or PDF files. Maximum 4 MB each.</p></div>
          <button type="button" disabled={maxFiles <= 0} onClick={() => inputRef.current?.click()} className="rounded-lg border border-dp-line px-3 py-2 text-sm font-medium text-dp-black disabled:opacity-50">Add files</button>
        </div>
        {maxFiles <= 0 && <p className="mt-2 text-xs text-amber-700">This project has reached the 20 file selection limit. Remove a selection to add another file.</p>}
      </div>
      {items.length > 0 && <ul className="space-y-2" aria-label="Upload status">
        {items.map((item) => <li key={item.key} className="flex items-center gap-3 rounded-lg border border-dp-line px-3 py-2">
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.file.name}</span>
            <span className={`text-xs ${item.status === 'error' ? 'text-red-600' : item.status === 'success' ? 'text-green-700' : 'text-dp-muted'}`} role={item.status === 'error' ? 'alert' : item.status === 'success' ? 'status' : undefined}>
              {item.status === 'uploading' ? `Uploading ${item.progress}%` : item.status === 'success' ? 'Uploaded' : item.error}
            </span>
          </span>
          {item.status === 'error' && <button type="button" onClick={() => retry(item)} className="text-xs underline">Retry</button>}
          {item.status !== 'uploading' && <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.key !== item.key))} className="text-xs text-dp-muted underline">Remove</button>}
        </li>)}
      </ul>}
    </div>
  )
}
