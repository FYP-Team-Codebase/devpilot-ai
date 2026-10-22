import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeAssetSelections, removeAssetSelection, updateAssetSelection, toProjectAssetSelection } from '../src/services/projectAssetSelections.js'

test('incremental asset additions retain per-file purposes, placement, and instructions', () => {
  const first = { id: 'logo-1', mimeType: 'image/png', purpose: 'logo', placement: 'header', instructions: 'Keep the aspect ratio' }
  const second = { id: 'hero-1', mimeType: 'image/png', purpose: 'background', placement: 'hero', instructions: 'Use a dark overlay' }
  const selected = mergeAssetSelections([], [first])
  const updated = updateAssetSelection(selected, 'logo-1', { placementDetails: 'Top left' })
  const appended = mergeAssetSelections(updated, [second])

  assert.deepEqual(appended.map(({ id, purpose, placement, placementDetails, instructions }) => ({ id, purpose, placement, placementDetails, instructions })), [
    { id: 'logo-1', purpose: 'logo', placement: 'header', placementDetails: 'Top left', instructions: 'Keep the aspect ratio' },
    { id: 'hero-1', purpose: 'background', placement: 'hero', placementDetails: '', instructions: 'Use a dark overlay' },
  ])
})

test('same-purpose files remain distinct and project selection removal is not library deletion', () => {
  const assets = [
    { id: 'dish-1', mimeType: 'image/jpeg', purpose: 'content-image', placement: 'product', instructions: 'Featured dish' },
    { id: 'dish-2', mimeType: 'image/jpeg', purpose: 'content-image', placement: 'gallery', instructions: 'Use second in order' },
  ]
  const selected = mergeAssetSelections([], assets)
  const projectPayload = selected.map(toProjectAssetSelection)
  const afterRemovingOne = removeAssetSelection(selected, 'dish-1')

  assert.deepEqual(projectPayload.map(({ purpose, placement, instructions }) => ({ purpose, placement, instructions })), [
    { purpose: 'content-image', placement: 'product', instructions: 'Featured dish' },
    { purpose: 'content-image', placement: 'gallery', instructions: 'Use second in order' },
  ])
  assert.deepEqual(afterRemovingOne.map((asset) => asset.id), ['dish-2'])
  assert.deepEqual(assets.map((asset) => asset.id), ['dish-1', 'dish-2'])
})

test('legacy asset selections get safe purpose and placement defaults', () => {
  const [legacyImage, legacyPdf] = mergeAssetSelections([], [
    { id: 'legacy-image', mimeType: 'image/png' },
    { id: 'legacy-pdf', mimeType: 'application/pdf' },
  ])

  assert.equal(legacyImage.purpose, 'content-image')
  assert.equal(legacyImage.placement, 'ai')
  assert.equal(legacyPdf.purpose, 'requirements-document')
})
