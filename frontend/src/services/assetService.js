import { getToken } from './authService'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

function authHeaders() {
  const token = getToken()
  if (!token) throw new Error('Your session has expired. Please log in again.')
  return { Authorization: `Bearer ${token}` }
}

async function readResponse(response, fallback) {
  let data = {}
  try { data = await response.json() } catch { /* response may be empty */ }
  if (!response.ok) throw new Error(data?.message || fallback)
  return data
}

export async function listAssets() {
  const response = await fetch(`${API_URL}/assets`, { headers: authHeaders() })
  return (await readResponse(response, 'Could not load assets.')).assets || []
}

export async function uploadAsset(file, { category = 'general', projectId, onProgress } = {}) {
  const form = new FormData()
  form.append('file', file)
  form.append('category', category)
  if (projectId) form.append('projectId', projectId)
  const xhr = new XMLHttpRequest()
  const token = getToken()
  if (!token) throw new Error('Your session has expired. Please log in again.')
  return new Promise((resolve, reject) => {
    xhr.open('POST', `${API_URL}/assets`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onerror = () => reject(new Error('Network error while uploading the file.'))
    xhr.onload = () => {
      let data = {}
      try { data = JSON.parse(xhr.responseText) } catch { /* handled below */ }
      if (xhr.status < 200 || xhr.status >= 300) reject(new Error(data?.message || 'Could not upload the file.'))
      else resolve(data.asset)
    }
    xhr.send(form)
  })
}

export async function deleteAsset(assetId) {
  const response = await fetch(`${API_URL}/assets/${encodeURIComponent(assetId)}`, { method: 'DELETE', headers: authHeaders() })
  return readResponse(response, 'Could not delete asset.')
}

export function formatAssetSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
