import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { previewRouterShimSource } from '../src/services/previewRouterShim.js'

const routerModuleUrl = import.meta.resolve('react-router-dom')
const reactModuleUrl = import.meta.resolve('react')
const executableShim = previewRouterShimSource
  .replaceAll('"react-router-dom"', JSON.stringify(routerModuleUrl))
  .replaceAll('"react"', JSON.stringify(reactModuleUrl))
const previewRouter = await import(`data:text/javascript;base64,${Buffer.from(executableShim).toString('base64')}`)

globalThis.window = { __DEVPILOT_INITIAL_ROUTE__: '/testing' }

function AppContent() {
  const location = previewRouter.useLocation()
  const navigate = previewRouter.useNavigate()
  return React.createElement('main', { 'data-path': location.pathname },
    React.createElement(previewRouter.NavLink, { to: '/testing/next' }, 'Continue'),
    React.createElement(previewRouter.Routes, null,
      React.createElement(previewRouter.Route, { path: '/testing', element: React.createElement('p', null, 'Route mounted') })),
    React.createElement('button', { onClick: () => navigate('/testing/next') }, 'Next'))
}

function App() {
  return React.createElement(previewRouter.BrowserRouter, null, React.createElement(AppContent))
}

test('generation prompt requires an independently mountable App and one router provider', async () => {
  const source = await readFile(new URL('../backend/src/services/projectGenerationService.js', import.meta.url), 'utf8')
  assert.match(source, /independently mountable/)
  assert.match(source, /internal AppContent component/)
  assert.match(source, /default-exported App wrap AppContent in exactly one BrowserRouter/)
  assert.match(source, /main\.jsx or main\.tsx must render <App \/> without adding another router provider/)
  assert.match(source, /Do not combine BrowserRouter with RouterProvider\/createBrowserRouter or nest multiple router providers/)
})

test('self-wrapped generated App mounts through the actual isolated preview router shim', () => {
  const html = renderToString(React.createElement(App))
  assert.match(html, /data-path="\/testing"/)
  assert.match(html, /Route mounted/)
  assert.match(html, /data-devpilot-router-link/)
  assert.match(html, /href="\/testing\/next"/)
})

test('router hooks fail without a provider and nested preview providers are rejected', () => {
  assert.throws(() => renderToString(React.createElement(AppContent)), /useLocation\(\).*Router/i)
  assert.throws(() => renderToString(React.createElement(previewRouter.BrowserRouter, null,
    React.createElement(previewRouter.BrowserRouter, null, React.createElement(AppContent)))), /inside another <Router>/i)
})
