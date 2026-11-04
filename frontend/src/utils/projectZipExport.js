const encoder = new TextEncoder()

const crcTable = new Uint32Array(256)
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  crcTable[index] = value >>> 0
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function normalizeExportPath(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('A generated file has no valid path.')
  let path = value.trim().replace(/\\/g, '/')
  if (path.startsWith('/') || /^[a-z]:/i.test(path)) throw new Error(`Generated file path must be relative: ${value}`)
  path = path.replace(/\/{2,}/g, '/').replace(/^(?:\.\/)+/, '')
  if (/^frontend\//i.test(path)) path = path.slice('frontend/'.length)
  if (!path || path.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error(`Generated file path is unsafe: ${value}`)
  }
  return path
}

function getFiles(project) {
  const generatedFiles = project?.generatedFiles
  const source = Array.isArray(generatedFiles)
    ? generatedFiles
    : generatedFiles && typeof generatedFiles === 'object'
      ? Object.entries(generatedFiles).map(([path, file]) => ({ ...file, path: file?.path || path }))
      : []
  const paths = new Set()
  return source.map((file) => {
    const path = normalizeExportPath(file?.path)
    if (paths.has(path)) throw new Error(`Project contains duplicate file path: ${path}`)
    paths.add(path)
    if (typeof file?.content !== 'string') throw new Error(`Generated file "${path}" has no text content.`)
    return { name: encoder.encode(path), content: encoder.encode(file.content) }
  })
}

function dosTimestamp(date) {
  const year = Math.max(1980, date.getFullYear())
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

function makeLocalHeader(file, timestamp, checksum) {
  const header = new Uint8Array(30 + file.name.length)
  const view = new DataView(header.buffer)
  view.setUint32(0, 0x04034b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 0x0800, true)
  view.setUint16(8, 0, true)
  view.setUint16(10, timestamp.time, true)
  view.setUint16(12, timestamp.date, true)
  view.setUint32(14, checksum, true)
  view.setUint32(18, file.content.length, true)
  view.setUint32(22, file.content.length, true)
  view.setUint16(26, file.name.length, true)
  view.setUint16(28, 0, true)
  header.set(file.name, 30)
  return header
}

function makeCentralHeader(file, timestamp, checksum, localOffset) {
  const header = new Uint8Array(46 + file.name.length)
  const view = new DataView(header.buffer)
  view.setUint32(0, 0x02014b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 20, true)
  view.setUint16(8, 0x0800, true)
  view.setUint16(10, 0, true)
  view.setUint16(12, timestamp.time, true)
  view.setUint16(14, timestamp.date, true)
  view.setUint32(16, checksum, true)
  view.setUint32(20, file.content.length, true)
  view.setUint32(24, file.content.length, true)
  view.setUint16(28, file.name.length, true)
  view.setUint16(30, 0, true)
  view.setUint16(32, 0, true)
  view.setUint16(34, 0, true)
  view.setUint16(36, 0, true)
  view.setUint32(38, 0, true)
  view.setUint32(42, localOffset, true)
  header.set(file.name, 46)
  return header
}

function makeEndRecord(fileCount, centralSize, centralOffset) {
  const record = new Uint8Array(22)
  const view = new DataView(record.buffer)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(4, 0, true)
  view.setUint16(6, 0, true)
  view.setUint16(8, fileCount, true)
  view.setUint16(10, fileCount, true)
  view.setUint32(12, centralSize, true)
  view.setUint32(16, centralOffset, true)
  view.setUint16(20, 0, true)
  return record
}

function makeZip(files) {
  if (!files.length) throw new Error('This project has no generated files to export.')
  if (files.length > 0xffff) throw new Error('This project has too many files for a ZIP archive.')

  const timestamp = dosTimestamp(new Date())
  const localParts = []
  const centralParts = []
  let localOffset = 0
  let centralSize = 0

  for (const file of files) {
    const checksum = crc32(file.content)
    const header = makeLocalHeader(file, timestamp, checksum)
    localParts.push(header, file.content)
    centralParts.push(makeCentralHeader(file, timestamp, checksum, localOffset))
    localOffset += header.length + file.content.length
    centralSize += 46 + file.name.length
    if (localOffset > 0xffffffff || centralSize > 0xffffffff) throw new Error('Project is too large for a ZIP archive.')
  }

  const parts = [...localParts, ...centralParts, makeEndRecord(files.length, centralSize, localOffset)]
  const archive = new Blob(parts, { type: 'application/zip' })
  if (archive.size > 0xffffffff) throw new Error('Project is too large for a ZIP archive.')
  return archive
}

function safeFileName(value) {
  const name = String(value || 'DevPilot Project')
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('').map((character) => character.charCodeAt(0) < 32 ? '-' : character).join('')
    .replace(/[. ]+$/g, '')
    .trim()
  return `${name || 'DevPilot Project'}.zip`
}

export function downloadProjectZip(project) {
  const archive = makeZip(getFiles(project))
  const objectUrl = URL.createObjectURL(archive)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = safeFileName(project?.name || project?.projectName)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
