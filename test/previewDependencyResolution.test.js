import test from 'node:test'
import assert from 'node:assert/strict'
import { collectExternalModuleSpecifiers, externalCssImportError, externalModuleImportError, isSupportedExternalCssResource } from '../src/services/previewDependencyResolution.js'

test('CSS HTTPS imports and asset URLs are not treated as import-map packages', () => {
  const specifiers = collectExternalModuleSpecifiers({
    outputs: {
      'preview-output/main.js': {
        imports: [{ path: 'react', external: true, kind: 'import-statement' }],
      },
      'preview-output/main.css': {
        imports: [
          { path: 'https://fonts.googleapis.com/css2?family=Inter', external: true, kind: 'import-rule' },
          { path: 'https://cdn.example.test/hero.webp', external: true, kind: 'url-token' },
        ],
      },
    },
  })

  assert.deepEqual([...specifiers], ['react'])
  assert.equal(externalModuleImportError('react'), null)
})

test('an external HTTPS JavaScript module gets an actionable error, not dependency https:', () => {
  const error = externalModuleImportError('https://cdn.example.test/library.js')

  assert.match(error, /cannot load external JavaScript module URLs \(https:\)/)
  assert.match(error, /supported dependency in package\.json/)
  assert.doesNotMatch(error, /dependency: https:/)
})

test('other URL schemes are identified as unsupported external modules', () => {
  assert.match(externalModuleImportError('data:text/javascript,export%20default%201'), /\(data:\)/)
})

test('Google Fonts CSS @import is treated as a stylesheet resource', () => {
  const fontImport = {
    path: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    kind: 'import-rule',
  }

  assert.equal(isSupportedExternalCssResource(fontImport), true)
  assert.equal(isSupportedExternalCssResource({ ...fontImport, kind: 'import-statement' }), false)
})

test('ordinary and local CSS imports stay on the CSS resolver path', () => {
  assert.equal(isSupportedExternalCssResource({ path: './theme.css', kind: 'import-rule' }), false)
  assert.equal(externalModuleImportError('./theme.css'), null)
  assert.equal(isSupportedExternalCssResource({ path: 'https://styles.example.test/theme.css', kind: 'import-rule' }), false)
  assert.match(externalCssImportError({ path: 'https://styles.example.test/theme.css', kind: 'import-rule' }), /Use a local stylesheet or a Google Fonts CSS import/)
  assert.equal(externalCssImportError({ path: './theme.css', kind: 'import-rule' }), null)
})

test('HTTPS CSS background images remain CSS resources', () => {
  assert.equal(isSupportedExternalCssResource({
    path: 'https://cdn.example.test/images/hero.webp',
    kind: 'url-token',
  }), true)
})

test('external HTTPS JavaScript imports remain blocked', () => {
  const specifier = 'https://cdn.example.test/library.js'

  assert.equal(isSupportedExternalCssResource({ path: specifier, kind: 'import-statement' }), false)
  assert.match(externalModuleImportError(specifier), /cannot load external JavaScript module URLs \(https:\)/)
})

test('CSS with no external URL does not trigger external resource handling', () => {
  assert.equal(isSupportedExternalCssResource({ path: './tokens.css', kind: 'import-rule' }), false)
  assert.equal(isSupportedExternalCssResource({ path: 'data:image/svg+xml,%3Csvg%3E', kind: 'url-token' }), false)
})
