import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement, isValidElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createUserMenuPortal } from '../src/pages/Dashboard/components/userMenuPortal.js'

test('portal places the actual menu element inside AnimatePresence', () => {
  const container = { nodeType: 1 }
  const menu = createElement(motion.div, { role: 'menu' }, 'Profile', 'Settings', 'Log out')
  const portal = createUserMenuPortal(menu, container)

  assert.ok(portal)
  assert.equal(portal.containerInfo, container)
  assert.ok(isValidElement(portal.children))
  assert.equal(portal.children.type, AnimatePresence)
  assert.ok(isValidElement(portal.children.props.children))
  assert.equal(portal.children.props.children.props.role, 'menu')
})

test('portal handles an unavailable target without throwing', () => {
  assert.equal(createUserMenuPortal(null, null), null)
})
