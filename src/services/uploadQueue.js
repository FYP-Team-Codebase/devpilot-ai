export function uniqueFilesBySignature(existing, incoming, limit = 20) {
  const seen = new Set(Array.from(existing || [], (file) => `${file.name}:${file.size}:${file.lastModified}`))
  return Array.from(incoming || []).filter((file) => {
    const signature = `${file.name}:${file.size}:${file.lastModified}`
    if (seen.has(signature)) return false
    seen.add(signature)
    return true
  }).slice(0, limit)
}

export async function uploadFilesIndividually(files, options = {}, { upload, concurrency = 3, onResult } = {}) {
  const queue = Array.from(files || [])
  const results = new Array(queue.length)
  let nextIndex = 0
  async function worker() {
    while (nextIndex < queue.length) {
      const index = nextIndex++
      try {
        const asset = await upload(queue[index], { ...options, onProgress: (progress) => options.onProgress?.(index, progress) })
        results[index] = { file: queue[index], status: 'success', asset }
      } catch (error) {
        results[index] = { file: queue[index], status: 'error', error }
      }
      onResult?.(results[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), queue.length) }, worker))
  return results
}
