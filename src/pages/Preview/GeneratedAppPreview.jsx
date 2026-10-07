import { useEffect, useRef, useState } from 'react'
import { bundleGeneratedFrontend, createPreviewDocument } from '../../services/generatedPreviewRuntime'
import { previewPageStyles as styles } from './PreviewPage.styles'

const VIEWPORTS = {
  Desktop: 'w-full',
  Tablet: 'w-[768px] max-w-full',
  Mobile: 'w-[390px] max-w-full',
}

export default function GeneratedAppPreview({ files, selectedFile, mode, editorEnabled = false, design = {}, onElementSelect, deviceViewport, initialRoute, onNavigation }) {
  const iframeRef = useRef(null)
  const messagePortRef = useRef(null)
  const messageHandlerRef = useRef(null)
  const initialRouteRef = useRef(initialRoute || { pathname: '/', search: '', hash: '' })
  const [viewport, setViewport] = useState('Desktop')
  useEffect(() => { if (deviceViewport) setViewport(deviceViewport) }, [deviceViewport])
  const [bundle, setBundle] = useState(null)
  const [runtimeState, setRuntimeState] = useState('preparing')
  const [runtimeError, setRuntimeError] = useState('')
  const [hasImageErrors, setHasImageErrors] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [bundleRevision, setBundleRevision] = useState(0)
  const [loadedFrameKey, setLoadedFrameKey] = useState('')
  const runtimeStageRef = useRef('preparing generated files')
  const frameKey = bundle ? `generated-${attempt}-${bundleRevision}` : `empty-${attempt}`
  initialRouteRef.current = initialRoute || { pathname: '/', search: '', hash: '' }

  useEffect(() => () => messagePortRef.current?.close(), [])
  useEffect(() => {
    if (mode !== 'code') return
    messagePortRef.current?.close()
    messagePortRef.current = null
    setLoadedFrameKey('')
  }, [mode])

  useEffect(() => {
    let current = true
    bundleGeneratedFrontend(files).then((result) => {
      if (current) { setBundle(result); setBundleRevision((revision) => revision + 1) }
    }).catch((error) => {
      if (!current) return
      const details = Array.isArray(error?.errors) ? error.errors.slice(0, 4).map((issue) => {
        const location = issue.location ? `${issue.location.file}:${issue.location.line}:${issue.location.column}: ` : ''
        return `${location}${issue.text || 'Bundle error'}`
      }).join('\n') : ''
      setRuntimeError(details || error?.message || 'The generated frontend could not be prepared.')
      setRuntimeState('error')
    })
    return () => { current = false }
  }, [files, attempt])

  useEffect(() => {
    function handleRuntimeMessage(event) {
      if (event.data?.channel !== 'devpilot-preview' || !event.data || typeof event.data.type !== 'string') return
      if (!['stage', 'DEV_PILOT_PREVIEW_READY', 'ready', 'DEV_PILOT_PREVIEW_ERROR', 'error', 'csp-error', 'image-error', 'ELEMENT_HOVERED', 'ELEMENT_SELECTED', 'ELEMENT_SELECTION_CLEARED', 'DEV_PILOT_PREVIEW_NAVIGATION'].includes(event.data.type)) return
      if (event.data.type === 'DEV_PILOT_PREVIEW_NAVIGATION') {
        const route = event.data.route
        if (route && typeof route.pathname === 'string' && route.pathname.startsWith('/') && !route.pathname.startsWith('//') && route.pathname.length <= 500 && typeof route.search === 'string' && route.search.length <= 1000 && typeof route.hash === 'string' && route.hash.length <= 1000) onNavigation?.(route)
        return
      }
      if (event.data.type === 'stage') {
        runtimeStageRef.current = typeof event.data.stage === 'string' ? event.data.stage.slice(0, 120) : 'iframe runtime'
      }
      if (event.data.type === 'DEV_PILOT_PREVIEW_READY' || event.data.type === 'ready') { runtimeStageRef.current = 'runtime-ready'; setRuntimeState('ready'); setRuntimeError('') }
      if (event.data.type === 'DEV_PILOT_PREVIEW_ERROR' || event.data.type === 'error') {
        const message = event.data.message || 'The application encountered a runtime error.'
        runtimeStageRef.current = event.data.stage || runtimeStageRef.current || 'iframe module evaluation'
        const diagnostic = { stage: runtimeStageRef.current, errorType: event.data.errorType || 'runtime', message, url: event.data.url, specifier: event.data.specifier, packageName: event.data.packageName, directive: event.data.directive, blockedURI: event.data.blockedURI }
        setRuntimeError(Object.entries(diagnostic).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => `${key}: ${value}`).join('\n'))
        setRuntimeState('error')
      }
      if (event.data.type === 'csp-error') {
        const message = `Iframe Content Security Policy blocked ${event.data.blockedURI || 'a resource'} (${event.data.directive || 'unknown directive'}).`
        setRuntimeError(message)
        setRuntimeState('error')
      }
      if (event.data.type === 'image-error') setHasImageErrors(true)
      if (editorEnabled && ['ELEMENT_HOVERED', 'ELEMENT_SELECTED', 'ELEMENT_SELECTION_CLEARED'].includes(event.data.type)) {
        const element = event.data.element
        if (event.data.type === 'ELEMENT_SELECTION_CLEARED') onElementSelect?.(null, event.data.type)
        else if (element && typeof element.path === 'string' && element.path.length < 1200 && typeof element.tagName === 'string' && element.tagName.length < 20) onElementSelect?.(element, event.data.type)
      }
    }
    messageHandlerRef.current = handleRuntimeMessage
    return () => { messageHandlerRef.current = null }
  }, [editorEnabled, onElementSelect, onNavigation])

  useEffect(() => {
    if (!bundle || loadedFrameKey !== frameKey || !iframeRef.current?.contentWindow) return
    runtimeStageRef.current = 'waiting for sandbox frame'
    setRuntimeState('preparing')
    iframeRef.current.contentWindow.postMessage({ channel: 'devpilot-preview', type: 'render', js: bundle.js, css: bundle.css, title: bundle.title, assets: bundle.assets, imports: bundle.imports, dependencies: bundle.dependencyRequests, design, selectionMode: editorEnabled, initialRoute: initialRouteRef.current }, '*')
    const timer = window.setTimeout(() => {
      setRuntimeState((state) => {
        if (state !== 'ready' && state !== 'error') {
          const packages = bundle.dependencyRequests?.map((request) => `${request.packageName}@${request.version} (${request.url})`).join('\n') || 'No external package imports were detected.'
          const message = `The isolated iframe did not finish during ${runtimeStageRef.current}. Parent-page CORS/HTTP preflight passed, but that does not verify iframe module loading.\nDependency URLs:\n${packages}\nCheck iframe CSP violations and module-loading diagnostics for the exact failure.`
          setRuntimeError(message)
          return 'error'
        }
        return state
      })
    }, 28000)
    return () => window.clearTimeout(timer)
  }, [bundle, frameKey, loadedFrameKey, editorEnabled])

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || loadedFrameKey !== frameKey) return
    if (editorEnabled) iframeRef.current.contentWindow.postMessage({ channel: 'devpilot-preview', type: 'selection-mode', enabled: true }, '*')
    iframeRef.current.contentWindow.postMessage({ channel: 'devpilot-preview', type: 'APPLY_EDITOR_STATE', editorState: design }, '*')
  }, [editorEnabled, design, frameKey, loadedFrameKey])

  const documentSource = bundle ? createPreviewDocument(bundle.imports, bundle.rootId) : createPreviewDocument({}, 'root')

  return <div className={styles.previewStage}>
    <div className={styles.previewToolbar}>
      {mode === 'preview' ? <div className={styles.deviceControls} aria-label="Preview device size">{Object.keys(VIEWPORTS).map((name) => <button type="button" key={name} onClick={() => setViewport(name)} aria-pressed={viewport === name} className={`${styles.deviceButton} ${viewport === name ? styles.deviceButtonActive : ''}`}>{name}</button>)}</div> : <span className={styles.fileNameMode}>{selectedFile?.path || 'No generated file selected'}</span>}
      {mode === 'preview' && runtimeState === 'error' && <button type="button" className={styles.retryButton} onClick={() => { setRuntimeState('preparing'); setRuntimeError(''); setHasImageErrors(false); setBundle(null); setLoadedFrameKey(''); setAttempt((value) => value + 1) }}>Retry preview</button>}
    </div>

    {mode === 'code' ? <div className={styles.sourceInspection}>
      {selectedFile ? <><header className={styles.selectedHeader}><div className="min-w-0"><h2 className={styles.selectedHeading}>{selectedFile.path}</h2></div><span className={styles.language}>{selectedFile.language || 'text'}</span></header><div className={styles.codeScroll}><pre className={styles.code}><code>{selectedFile.content || ''}</code></pre></div></> : <div className={styles.emptyCode}>Select a generated file from the project files list.</div>}
    </div> : <div className={styles.responsiveFrameStage}>
      <div className={`${styles.responsiveFrameShell} ${VIEWPORTS[viewport]}`}>
        <iframe
          key={frameKey}
          ref={iframeRef}
          title={editorEnabled ? 'Editable isolated generated application' : 'Isolated generated application preview'}
          className={styles.generatedFrame}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          srcDoc={documentSource}
          onLoad={() => {
            runtimeStageRef.current = bundle ? 'waiting for preview runtime startup' : 'waiting for generated bundle'
            messagePortRef.current?.close()
            const channel = new MessageChannel()
            channel.port1.onmessage = (event) => messageHandlerRef.current?.(event)
            channel.port1.start()
            messagePortRef.current = channel.port1
            iframeRef.current?.contentWindow?.postMessage({ channel: 'devpilot-preview', type: 'INIT_RUNTIME_CHANNEL' }, '*', [channel.port2])
            setLoadedFrameKey(frameKey)
          }}
        />
        {runtimeState === 'preparing' && <div className={styles.runtimeOverlay} role="status" aria-live="polite"><span className={styles.spinner} />Preparing preview…</div>}
        {runtimeState === 'error' && <div className={styles.runtimeError} role="alert"><p className={styles.runtimeErrorTitle}>Preview couldn’t be loaded</p><p className={styles.runtimeErrorCopy}>The generated frontend could not run in the isolated preview. Its source files remain available in Code.</p><button type="button" onClick={() => setDetailsOpen((open) => !open)} className={styles.detailsButton} aria-expanded={detailsOpen}> {detailsOpen ? 'Hide details' : 'Show details'}</button>{detailsOpen && <pre className={styles.runtimeDetails}>{runtimeError}</pre>}</div>}
      </div>
      <p className={styles.runtimeNote}>Runs in a sandboxed frame. Network requests from generated code are blocked; remote images and fonts are allowed.{hasImageErrors ? ' One or more images could not be loaded; failed images are outlined.' : ''}</p>
    </div>}
  </div>
}
