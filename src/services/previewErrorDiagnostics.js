export function sanitizePreviewException(value = {}) {
  // Keep this function self-contained: the isolated iframe embeds its source
  // with toString(), so module-scope helpers are not in that execution realm.
  const MAX_MESSAGE_LENGTH = 300
  const MAX_STACK_FRAMES = 6

  function redactText(text) {
    return String(text || '')
      .replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
      .replace(/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{8,}\b/g, '[redacted key]')
      .replace(/\b(api[_-]?key|secret|token|password|authorization)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
      .replace(/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^\s,;]+/g, '[redacted setting]')
      .replace(/\bhttps?:\/\/[^\s)]+/gi, '[external URL]')
      .replace(/\bdata:[^\s)]+/gi, '[inline asset]')
      .replace(/[A-Za-z]:\\[^\s)]+/g, '[local path]')
      .replace(/(^|\s)\/(?:Users|home|tmp|var|private|workspace|root)\/[^\s)]+/g, '$1[local path]')
  }

  function classifyLocation(location) {
    if (/\bblob:/.test(location)) return 'generated bundle'
    if (/\bhttps?:/.test(location)) return 'external module'
    return 'generated source'
  }

  const name = String(value.name || 'Error').replace(/[^\w.$-]/g, '').slice(0, 50) || 'Error'
  const message = redactText(String(value.message || 'Unknown JavaScript error').split('\n')[0]).slice(0, MAX_MESSAGE_LENGTH)
  const frames = String(value.stack || '').split('\n').slice(1).map((frame) => {
    const location = frame.match(/:(\d+):(\d+)\)?\s*$/)
    if (!location) return ''
    const functionMatch = frame.match(/\bat\s+([^\s(]+)/)
    const functionName = functionMatch && /^[\w.$<>-]{1,80}$/.test(functionMatch[1]) ? `${functionMatch[1]} at ` : ''
    return `${functionName}${classifyLocation(frame)}:${location[1]}:${location[2]}`
  }).filter(Boolean).slice(0, MAX_STACK_FRAMES)
  const line = Number(value.line)
  const column = Number(value.column)

  return {
    name,
    message,
    stack: frames.join('\n'),
    filename: value.filename ? classifyLocation(String(value.filename)) : '',
    line: Number.isSafeInteger(line) && line > 0 ? line : 0,
    column: Number.isSafeInteger(column) && column > 0 ? column : 0,
  }
}

export const previewExceptionSanitizerSource = `var sanitizePreviewException=(${sanitizePreviewException.toString()});`
