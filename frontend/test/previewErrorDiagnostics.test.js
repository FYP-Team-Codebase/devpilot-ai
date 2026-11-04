import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { previewExceptionSanitizerSource, sanitizePreviewException } from '../src/services/previewErrorDiagnostics.js'

test('preview diagnostics retain the original JavaScript exception and useful stack locations', () => {
  const diagnostic = sanitizePreviewException({
    name: 'TypeError',
    message: "Cannot read properties of undefined (reading 'map')",
    stack: "TypeError: Cannot read properties of undefined\n    at ProjectList (blob:null/opaque-id:1:812)\n    at render (https://esm.sh/react-dom@19.0.0:4:92)",
    filename: 'blob:null/opaque-id',
    line: 1,
    column: 812,
  })

  assert.equal(diagnostic.name, 'TypeError')
  assert.match(diagnostic.message, /undefined/)
  assert.match(diagnostic.stack, /ProjectList at generated bundle:1:812/)
  assert.match(diagnostic.stack, /render at external module:4:92/)
  assert.equal(diagnostic.filename, 'generated bundle')
  assert.equal(diagnostic.line, 1)
  assert.equal(diagnostic.column, 812)
  assert.doesNotMatch(JSON.stringify(diagnostic), /opaque-id|https:\/\/|blob:/)
})

test('preview diagnostics redact credentials, URLs, paths, and source excerpts', () => {
  const diagnostic = sanitizePreviewException({
    name: 'Error',
    message: 'token=secret-value at C:\\Users\\someone\\App.jsx https://example.test/private?token=secret\nCLOUDINARY_API_SECRET=hidden-file-content',
    stack: 'Error: failure\n    at render (/home/person/project/src/App.jsx:12:8)\n    code excerpt containing sensitive content',
    filename: 'https://example.test/bundle.js?secret=value',
  })

  assert.match(diagnostic.message, /token=\[redacted\]/)
  assert.doesNotMatch(JSON.stringify(diagnostic), /secret-value|someone|example\.test|private|hidden-file-content|source excerpt|\/home\/person/)
  assert.equal(diagnostic.stack, 'render at generated source:12:8')
  assert.equal(diagnostic.filename, 'external module')
})

test('the exact sanitizer source embedded in the iframe runs without module-scope helpers', () => {
  const iframeContext = vm.createContext({})
  const diagnostic = vm.runInContext(`${previewExceptionSanitizerSource}\nsanitizePreviewException({message: 'API_TOKEN=hidden', stack: 'Error: failure\\n    at App (blob:null/id:1:44)'})`, iframeContext)

  assert.equal(diagnostic.message, '[redacted setting]')
  assert.equal(diagnostic.stack, 'App at generated bundle:1:44')
})
