import assert from 'node:assert/strict'
import test from 'node:test'
import { generationPageStyles } from '../src/pages/Generation/GenerationPage.styles.js'
import { getGenerateActionState } from '../src/pages/Generation/generationActionState.js'

test('generation can start only from ready and failed states', () => {
  assert.deepEqual(getGenerateActionState('ready', false), {
    visible: true,
    disabled: false,
    label: 'Generate Project',
  })
  assert.deepEqual(getGenerateActionState('failed', false), {
    visible: true,
    disabled: false,
    label: 'Retry Generation',
  })
  for (const status of ['draft', 'generating', 'completed', 'unknown']) {
    assert.deepEqual(getGenerateActionState(status, false), {
      visible: false,
      disabled: true,
      label: 'Generate Project',
    })
  }
})

test('submitting disables the action and preserves the loading label', () => {
  assert.deepEqual(getGenerateActionState('ready', true), {
    visible: true,
    disabled: true,
    label: 'Generating…',
  })
})

test('enabled generate styling is interactive and disabled styling is conditional', () => {
  const tokens = generationPageStyles.actionButton.split(/\s+/)
  assert.ok(tokens.includes('cursor-pointer'))
  assert.ok(tokens.includes('hover:bg-neutral-800'))
  assert.ok(tokens.includes('active:scale-[0.99]'))
  assert.ok(tokens.includes('focus-visible:ring-2'))
  assert.ok(tokens.includes('disabled:cursor-not-allowed'))
  assert.ok(tokens.includes('disabled:opacity-50'))
  assert.ok(!tokens.includes('cursor-not-allowed'))
  assert.ok(!tokens.includes('opacity-50'))
})
