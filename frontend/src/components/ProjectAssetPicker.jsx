import { useState } from 'react'
import AssetUploader from './AssetUploader'
import { listAssets, formatAssetSize } from '../services/assetService'
import { ASSET_PURPOSES, createAssetSelection, getAssetPlacements, removeAssetSelection, updateAssetSelection } from '../services/projectAssetSelections'

const controlClass = 'w-full rounded-lg border border-dp-line bg-white px-3 py-2 text-sm text-dp-black'

export default function ProjectAssetPicker({ selections = [], onChange, category = 'requirements', projectId, accept = 'image/png,image/jpeg,image/gif,image/webp,application/pdf', emptyMessage = 'No files selected yet.' }) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [library, setLibrary] = useState([])
  const [libraryState, setLibraryState] = useState('idle')
  const [libraryError, setLibraryError] = useState('')
  const selectedIds = new Set(selections.map((item) => String(item.id || item.assetId)))

  function toggleLibrary() {
    if (libraryOpen) {
      setLibraryOpen(false)
      return
    }
    setLibraryOpen(true)
    if (libraryState !== 'idle') return
    setLibraryState('loading')
    listAssets().then((assets) => {
      setLibrary(assets)
      setLibraryState('ready')
    }).catch((error) => {
      setLibraryError(error?.message || 'Could not load My Assets.')
      setLibraryState('error')
    })
  }

  function addAsset(asset) {
    const item = createAssetSelection(asset)
    onChange((current) => {
      const list = Array.isArray(current) ? current : selections
      if (list.some((existing) => String(existing.id || existing.assetId) === item.id)) return list
      if (list.length >= 20) return list
      return [...list, item]
    })
  }

  function changeAsset(id, changes) {
    onChange((current) => updateAssetSelection(Array.isArray(current) ? current : selections, id, changes))
  }

  function removeAsset(id) {
    onChange((current) => removeAssetSelection(Array.isArray(current) ? current : selections, id))
  }

  const placementChoices = (purpose) => getAssetPlacements(purpose)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <AssetUploader category={category} projectId={projectId} accept={accept} multiple maxFiles={20 - selections.length} onUploaded={addAsset} />
        <button type="button" onClick={toggleLibrary} className="rounded-lg border border-dp-line px-3 py-2 text-sm font-medium text-dp-black">
          {libraryOpen ? 'Close My Assets' : 'Add from My Assets'}
        </button>
      </div>
      {libraryOpen && (
        <div className="rounded-xl border border-dp-line bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-dp-black">Choose existing files</p>
          {libraryState === 'loading' && <p role="status" className="text-sm text-dp-muted">Loading your assets…</p>}
          {libraryState === 'error' && <p role="alert" className="text-sm text-red-600">{libraryError}</p>}
          {libraryState === 'ready' && !library.length && <p className="text-sm text-dp-muted">Your asset library is empty.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {library.map((asset) => {
              const id = String(asset.id || asset._id)
              const selected = selectedIds.has(id)
              return <button key={id} type="button" disabled={selected || selections.length >= 20} onClick={() => addAsset(asset)} className="flex min-w-0 items-center gap-3 rounded-lg border border-dp-line p-2 text-left disabled:opacity-55">
                {asset.mimeType?.startsWith('image/') ? <img src={asset.secureUrl} alt="" className="h-12 w-12 rounded object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded bg-slate-100 text-xs font-bold text-slate-600">PDF</span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{asset.originalFilename}</span><span className="text-xs text-dp-muted">{asset.mimeType} · {formatAssetSize(asset.size)}</span></span>
                <span className="text-xs">{selected ? 'Added' : 'Add'}</span>
              </button>
            })}
          </div>
        </div>
      )}
      {!selections.length && <p className="text-sm text-dp-muted">{emptyMessage}</p>}
      <div className="grid gap-3">
        {selections.map((asset) => {
          const id = String(asset.id || asset.assetId)
          const placements = placementChoices(asset.purpose)
          const purposeChoices = ASSET_PURPOSES.filter((purpose) => asset.mimeType === 'application/pdf'
            ? purpose.value === 'requirements-document'
            : purpose.value !== 'requirements-document')
          return <article key={id} className="rounded-xl border border-dp-line bg-white p-3 sm:p-4">
            <div className="flex items-start gap-3">
              {asset.mimeType?.startsWith('image/') ? <img src={asset.secureUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">PDF</span>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dp-black">{asset.originalFilename || asset.filename || 'Uploaded file'}</p>
                <p className="mt-0.5 text-xs text-dp-muted">{asset.mimeType || 'File'} · {formatAssetSize(asset.size || 0)} · Ready</p>
              </div>
              <button type="button" onClick={() => removeAsset(id)} className="text-sm text-dp-muted underline">Remove</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-dp-muted">Purpose
                <select className={`${controlClass} mt-1`} value={asset.purpose} onChange={(event) => changeAsset(id, { purpose: event.target.value, placement: 'ai', customPurpose: event.target.value === 'other' ? asset.customPurpose : '' })}>
                  {purposeChoices.map((purpose) => <option key={purpose.value} value={purpose.value}>{purpose.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-dp-muted">Placement
                <select className={`${controlClass} mt-1`} value={placements.some(([value]) => value === asset.placement) ? asset.placement : 'ai'} onChange={(event) => changeAsset(id, { placement: event.target.value, placementDetails: event.target.value === 'other' ? asset.placementDetails : '' })}>
                  {placements.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
            {(asset.purpose === 'other' || asset.placement === 'other') && <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {asset.purpose === 'other' && <label className="text-xs font-medium text-dp-muted">Intended use<input className={`${controlClass} mt-1`} maxLength={160} value={asset.customPurpose || ''} onChange={(event) => changeAsset(id, { customPurpose: event.target.value })} placeholder="Describe what this file is for" /></label>}
              {asset.placement === 'other' && <label className="text-xs font-medium text-dp-muted">Placement details<input className={`${controlClass} mt-1`} maxLength={160} value={asset.placementDetails || ''} onChange={(event) => changeAsset(id, { placementDetails: event.target.value })} placeholder="Name the section or location" /></label>}
            </div>}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-dp-muted">Specific instructions (optional)</summary>
              <textarea className={`${controlClass} mt-2`} rows={2} maxLength={1000} value={asset.instructions || ''} onChange={(event) => changeAsset(id, { instructions: event.target.value })} placeholder="For example: do not crop this image." />
            </details>
          </article>
        })}
      </div>
    </div>
  )
}
