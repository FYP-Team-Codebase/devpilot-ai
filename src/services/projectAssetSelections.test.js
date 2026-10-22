import assert from 'node:assert/strict'
import test from 'node:test'
import { getPersistedAssetSelections } from './projectAssetSelections.js'

test('Skip assets persists no prior selected image references', () => {
  const previouslySelected = [{
    id: 'asset-image-1',
    purpose: 'content-image',
    placement: 'hero',
  }]

  assert.deepEqual(getPersistedAssetSelections(previouslySelected, true), [])
})

test('asset selections are preserved when Skip assets is not selected', () => {
  const selected = [{
    id: 'asset-image-1',
    purpose: 'content-image',
    placement: 'hero',
  }]

  assert.deepEqual(getPersistedAssetSelections(selected, false), [{
    assetId: 'asset-image-1',
    purpose: 'content-image',
    customPurpose: '',
    placement: 'hero',
    placementDetails: '',
    instructions: '',
  }])
})
