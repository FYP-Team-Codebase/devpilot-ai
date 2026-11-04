import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateUserMenuPosition, isOutsideUserMenuEvent } from '../src/pages/Dashboard/components/userMenuPosition.js'

test('profile menu opens below its trigger while remaining aligned within the viewport', () => {
  const position = calculateUserMenuPosition(
    { top: 24, bottom: 60, right: 1180 },
    { height: 190 },
    { width: 1200, height: 800 },
  )

  assert.deepEqual(position, { top: 68, right: 20, maxHeight: 776 })
})

test('profile menu flips above its trigger when there is insufficient room below', () => {
  const position = calculateUserMenuPosition(
    { top: 560, bottom: 596, right: 390 },
    { height: 190 },
    { width: 400, height: 640 },
  )

  assert.deepEqual(position, { top: 362, right: 12, maxHeight: 616 })
})

test('profile menu constrains its height and horizontal gutter on a narrow viewport', () => {
  const position = calculateUserMenuPosition(
    { top: 20, bottom: 50, right: 310 },
    { height: 900 },
    { width: 320, height: 760 },
  )

  assert.equal(position.top, 12)
  assert.equal(position.right, 12)
  assert.equal(position.maxHeight, 736)
})

test('outside-click containment treats both the avatar and portaled menu as inside', () => {
  const trigger = { contains: (target) => target === 'avatar' }
  const menu = { contains: (target) => target === 'profile-item' }

  assert.equal(isOutsideUserMenuEvent('avatar', trigger, menu), false)
  assert.equal(isOutsideUserMenuEvent('profile-item', trigger, menu), false)
  assert.equal(isOutsideUserMenuEvent('page-content', trigger, menu), true)
})
