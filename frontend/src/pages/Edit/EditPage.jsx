import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import GeneratedAppPreview from '../Preview/GeneratedAppPreview'
import { getProject, updateProjectEditor } from '../../services/projectService'
import { generatedRouteToString, normalizeGeneratedRoute, readGeneratedRoute } from '../../services/generatedRoute'

const PROJECT_ID_KEY = 'devpilot-current-project-id'
const field = 'w-full rounded-md border border-[#dfe2e0] bg-white px-2.5 py-2 text-xs text-[#171918] outline-none focus:ring-2 focus:ring-[#6d5dfc]'
const textTags = new Set(['h1','h2','h3','h4','h5','h6','p','span','button','a','li'])
const weights = ['300','400','500','600','700','800','900']
const styleGroups = [
  ['TYPOGRAPHY', [['fontFamily','Font Family','text'],['fontSize','Font Size','px'],['fontWeight','Font Weight','select'],['lineHeight','Line Height','text'],['letterSpacing','Letter Spacing','text'],['textAlign','Text Align','align']]],
  ['COLORS', [['color','Text Color','color'],['backgroundColor','Background Color','color']]],
  ['LAYOUT', [['width','Width','text'],['height','Height','text'],['maxWidth','Max Width','text'],['minHeight','Min Height','text']]],
  ['SPACING', [['marginTop','Margin Top','px'],['marginRight','Margin Right','px'],['marginBottom','Margin Bottom','px'],['marginLeft','Margin Left','px'],['paddingTop','Padding Top','px'],['paddingRight','Padding Right','px'],['paddingBottom','Padding Bottom','px'],['paddingLeft','Padding Left','px']]],
  ['BORDER', [['borderWidth','Border Width','px'],['borderStyle','Border Style','border-style'],['borderColor','Border Color','color'],['borderRadius','Border Radius','px']]],
  ['APPEARANCE', [['opacity','Opacity','range'],['boxShadow','Box Shadow','text']]],
]

function unwrap(data) { return data?.project || data?.data?.project || data?.data || null }
function normalizeDesignState(value) {
  if (value && typeof value === 'object' && value.pages && typeof value.pages === 'object') return value
  if (value && typeof value === 'object' && Object.keys(value).length) return { pages: { '/': { elements: value } } }
  return { pages: {} }
}
function editorLanguage(path = '') {
  const extension = path.split('.').pop()?.toLowerCase()
  return ({jsx:'javascript',js:'javascript',mjs:'javascript',tsx:'typescript',ts:'typescript',css:'css',scss:'scss',html:'html',json:'json',md:'markdown',svg:'xml',yaml:'yaml',yml:'yaml'})[extension] || 'plaintext'
}
function DeviceButton({ name, active, onClick }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-md px-3 py-1.5 text-xs ${active ? 'bg-[#171918] text-white' : 'text-[#676d69] hover:bg-[#f1f2f1]'}`}>{name}</button> }

export default function EditPage({ user }) {
  const technical = user?.userType === 'technical'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectIdRef = useRef(searchParams.get('project') || sessionStorage.getItem(PROJECT_ID_KEY))
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [path, setPath] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState('visual')
  const [design, setDesign] = useState({})
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewport, setViewport] = useState('Desktop')
  const [history, setHistory] = useState([])
  const [future, setFuture] = useState([])
  const [currentRoute, setCurrentRoute] = useState(() => readGeneratedRoute(window.location.search))

  useEffect(() => {
    let active = true
    const id = projectIdRef.current
    if (!id) { setError('No active project was found. Open a saved project first.'); return () => { active = false } }
    sessionStorage.setItem(PROJECT_ID_KEY, id)
    getProject(id).then((response) => {
      if (!active) return
      const loaded = unwrap(response)
      if (!loaded) throw new Error('Project not found.')
      const generatedFiles = Array.isArray(loaded.generatedFiles) ? loaded.generatedFiles : []
      const preferred = generatedFiles.find((file) => /(?:^|\/)src\/App\.(jsx|tsx)$/i.test(file.path)) || generatedFiles[0]
      const editorDesign = normalizeDesignState(loaded.editorDesign)
      setProject({ ...loaded, editorDesign }); setFiles(generatedFiles); setDesign(editorDesign); setPath(preferred?.path || ''); setCode(preferred?.content || '')
    }).catch((loadError) => { if (active) setError(loadError.message || 'Could not load project.') })
    return () => { active = false }
  }, [])

  const sourceDirty = technical && JSON.stringify(files) !== JSON.stringify(project?.generatedFiles || [])
  const dirty = Boolean(project && (JSON.stringify(design) !== JSON.stringify(project.editorDesign || {}) || sourceDirty))
  const currentPageElements = design.pages?.[currentRoute.pathname]?.elements || {}
  const selectedOverride = selected ? (currentPageElements[selected.path] || {}) : {}
  const currentStyles = selectedOverride.styles || {}
  function handleNavigation(route) {
    const nextRoute = normalizeGeneratedRoute(route)
    if (generatedRouteToString(nextRoute) === generatedRouteToString(currentRoute)) return
    if (nextRoute.pathname !== currentRoute.pathname) setSelected(null)
    setCurrentRoute(nextRoute)
    setSearchParams((params) => { params.set('path', generatedRouteToString(nextRoute)); return params }, { replace: true })
  }
  function handleElementMessage(element, type) {
    if (type === 'ELEMENT_SELECTED') setSelected(element)
    if (type === 'ELEMENT_SELECTION_CLEARED') setSelected(null)
  }
  const setDesignUndoable = (next) => { setHistory((items) => [...items.slice(-39), design]); setFuture([]); setDesign(next); setStatus('') }

  function updateStyle(property, value) {
    if (!selected?.path) return
    const pages = design.pages || {}
    const page = pages[currentRoute.pathname] || { elements: {} }
    setDesignUndoable({ ...design, pages: { ...pages, [currentRoute.pathname]: { ...page, elements: { ...page.elements, [selected.path]: { ...selectedOverride, styles: { ...currentStyles, [property]: value } } } } } })
  }
  function updateContent(value) {
    if (!selected?.path) return
    const pages = design.pages || {}
    const page = pages[currentRoute.pathname] || { elements: {} }
    setDesignUndoable({ ...design, pages: { ...pages, [currentRoute.pathname]: { ...page, elements: { ...page.elements, [selected.path]: { ...selectedOverride, content: value } } } } })
  }
  function updateImage(property, value) {
    if (!selected?.path) return
    const pages = design.pages || {}
    const page = pages[currentRoute.pathname] || { elements: {} }
    setDesignUndoable({ ...design, pages: { ...pages, [currentRoute.pathname]: { ...page, elements: { ...page.elements, [selected.path]: { ...selectedOverride, image: { ...(selectedOverride.image || {}), [property]: value } } } } } })
  }
  function undo() { if (!history.length) return; setFuture((items) => [design, ...items]); setDesign(history.at(-1)); setHistory((items) => items.slice(0, -1)) }
  function redo() { if (!future.length) return; setHistory((items) => [...items, design]); setDesign(future[0]); setFuture((items) => items.slice(1)) }
  function selectFile(nextPath) { const file = files.find((item) => item.path === nextPath); setPath(nextPath); setCode(file?.content || '') }
  function confirmPreviewNavigation(event) {
    const id = project?._id || project?.id
    if (id) sessionStorage.setItem(PROJECT_ID_KEY, id)
    if (dirty && !window.confirm('You have unsaved changes. Leave this page and discard them?')) event.preventDefault()
  }
  async function save() {
    if (!project) return false
    setSaving(true); setStatus(''); setError('')
    try {
      const result = await updateProjectEditor(project._id || project.id, { editorDesign: design, ...(technical ? { generatedFiles: files } : {}) })
      const saved = unwrap(result)
      const editorDesign = normalizeDesignState(saved.editorDesign)
      setProject({ ...saved, editorDesign }); setFiles(saved.generatedFiles || files); setDesign(editorDesign); setStatus('Saved'); return true
    } catch (saveError) { setError(saveError.message || 'Save failed'); setStatus('Save failed'); return false }
    finally { setSaving(false) }
  }

  async function handleExportNavigation(event) {
    const projectId = project?._id || project?.id
    const url = `/projects/${encodeURIComponent(projectId)}/export?path=${encodeURIComponent(generatedRouteToString(currentRoute))}`
    if (!dirty) return
    event.preventDefault()
    if (!window.confirm('Save your changes before exporting the project?')) return
    const saved = await save()
    if (saved) navigate(url)
  }

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (error && !project) return <section className="mx-auto grid min-h-[45vh] max-w-xl place-content-center gap-3 text-center"><h1 className="text-2xl font-bold">Editor unavailable</h1><p className="text-dp-muted">{error}</p><Link className="underline" to="/dashboard/projects">My Projects</Link></section>
  if (!project) return <div className="p-12 text-center text-dp-muted" role="status">Loading editor…</div>

  return <section className="-m-4 grid min-h-[calc(100vh-7rem)] grid-rows-[auto_1fr] bg-[#f3f4f2] text-[#171918] sm:-m-6">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe2e0] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3"><Link to={`/preview?project=${encodeURIComponent(project._id || project.id)}&path=${encodeURIComponent(generatedRouteToString(currentRoute))}`} onClick={confirmPreviewNavigation} className="shrink-0 text-sm text-[#676d69] hover:text-[#171918]">← Back to Preview</Link><strong className="max-w-56 truncate text-sm">{project.projectName || 'Untitled Project'}</strong><span className="rounded-md bg-[#f1f2f1] px-2 py-1 text-xs text-[#555b57]">Page: {currentRoute.pathname}</span></div>
      <div className="flex flex-wrap items-center gap-2">
        {technical && <div className="flex rounded-lg border border-[#dfe2e0] bg-[#f7f8f7] p-1"><DeviceButton name="Visual" active={mode === 'visual'} onClick={() => setMode('visual')} /><DeviceButton name="Code" active={mode === 'code'} onClick={() => setMode('code')} /></div>}
        <div className="flex rounded-lg border border-[#dfe2e0] bg-[#f7f8f7] p-1">{['Desktop','Tablet','Mobile'].map((size) => <DeviceButton key={size} name={size} active={viewport === size} onClick={() => setViewport(size)} />)}</div>
        <button type="button" onClick={undo} disabled={!history.length} className="rounded-md border border-[#dfe2e0] px-3 py-2 text-xs disabled:opacity-40">Undo</button>
        <button type="button" onClick={redo} disabled={!future.length} className="rounded-md border border-[#dfe2e0] px-3 py-2 text-xs disabled:opacity-40">Redo</button>
        <span className={`text-xs ${status === 'Save failed' ? 'text-red-600' : 'text-[#676d69]'}`} role="status">{dirty ? 'Unsaved changes' : status || 'Saved'}</span>
        <Link to={`/projects/${encodeURIComponent(project._id || project.id)}/export?path=${encodeURIComponent(generatedRouteToString(currentRoute))}`} onClick={handleExportNavigation} className="rounded-md border border-[#dfe2e0] px-3 py-2 text-xs font-semibold text-[#171918] hover:bg-[#f7f8f7]">Export</Link>
        <button type="button" onClick={save} disabled={!dirty || saving} className="rounded-md bg-[#171918] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </header>

    <div className={`grid min-h-0 grid-cols-1 ${mode === 'code' && technical ? 'lg:grid-cols-[230px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_320px]'}`}>
      {mode === 'code' && technical ? <>
        <aside className="max-h-48 overflow-auto border-b border-[#dfe2e0] bg-white p-3 lg:max-h-none lg:border-b-0 lg:border-r" aria-label="Generated project files"><h2 className="mb-3 px-2 text-[11px] font-bold uppercase tracking-widest text-[#737975]">Generated source</h2>{files.map((file) => <button key={file.path} type="button" onClick={() => selectFile(file.path)} aria-current={path === file.path ? 'true' : undefined} className={`mb-1 block w-full truncate rounded-md px-2 py-2 text-left text-xs ${path === file.path ? 'bg-[#171918] text-white' : 'hover:bg-[#f1f2f1]'}`}>{file.path}</button>)}</aside>
        <main className="grid min-h-[500px] min-w-0 grid-rows-[auto_1fr] p-3 sm:p-5"><div className="mb-3 flex items-center justify-between rounded-lg border border-[#dfe2e0] bg-white px-3 py-2"><span className="truncate font-mono text-xs">{path || 'Select a generated file'}</span><span className="text-[10px] uppercase text-[#737975]">Generated source · {editorLanguage(path)}</span></div><div className="min-h-[460px] overflow-hidden rounded-xl border border-[#303030] bg-[#1e1e1e]"><Editor height="min(72vh, 820px)" path={path} language={editorLanguage(path)} value={code} onChange={(value) => { const content = value ?? ''; setCode(content); setFiles((items) => items.map((file) => file.path === path ? { ...file, content } : file)); setStatus('') }} theme="vs-dark" options={{ automaticLayout:true,minimap:{enabled:false},lineNumbers:'on',fontSize:13,tabSize:2,wordWrap:'on',scrollBeyondLastLine:false,padding:{top:14,bottom:14},ariaLabel:`Code editor for ${path}` }} /></div><p className="mt-2 text-xs text-[#737975]">Visual customizations are saved separately as editor state; this view edits generated source files.</p></main>
      </> : <>
        <main className="grid min-h-[500px] min-w-0 grid-rows-[1fr_auto] p-3 sm:p-5"><div className="min-h-[460px] overflow-hidden rounded-xl border border-[#dfe2e0] bg-white shadow-sm"><GeneratedAppPreview files={files} mode="preview" editorEnabled design={currentPageElements} onElementSelect={handleElementMessage} onNavigation={handleNavigation} initialRoute={currentRoute} deviceViewport={viewport} /></div><p className="mt-2 text-xs text-[#737975]">Live generated application · select an element to edit · changes remain in visual customization state</p></main>
        <aside className="overflow-auto border-t border-[#dfe2e0] bg-white p-4 lg:border-l lg:border-t-0" aria-label="Element inspector">
          <div className="mb-4 border-b border-[#e8eae8] pb-3"><h2 className="text-sm font-bold">{selected ? 'Selected Element' : 'Inspector'}</h2>{selected && <p className="mt-1 truncate font-mono text-[10px] text-[#737975]" title={selected.path}>{selected.tagName} · {selected.id ? `#${selected.id}` : selected.path}</p>}</div>
          {!selected ? <p className="text-xs leading-5 text-[#737975]">Select an element to edit.</p> : <div className="grid gap-4">
            {textTags.has(selected.tagName) && <section><h3 className="mb-2 text-[10px] font-bold tracking-widest text-[#737975]">CONTENT</h3><label className="grid gap-1 text-xs">Text<input className={field} value={selectedOverride.content ?? selected.textPreview ?? ''} onChange={(event) => updateContent(event.target.value)} /></label></section>}
            {selected.isImage && <section className="grid gap-2"><h3 className="text-[10px] font-bold tracking-widest text-[#737975]">IMAGE</h3><label className="grid gap-1 text-xs">Image Source<input className={field} value={selectedOverride.image?.src ?? selected.src ?? ''} onChange={(event) => updateImage('src', event.target.value)} /></label><label className="grid gap-1 text-xs">Alt Text<input className={field} value={selectedOverride.image?.alt ?? selected.alt ?? ''} onChange={(event) => updateImage('alt', event.target.value)} /></label><label className="grid gap-1 text-xs">Object Fit<select className={field} value={currentStyles.objectFit || selected.computedStyles?.objectFit || 'cover'} onChange={(event) => updateStyle('objectFit', event.target.value)}>{['cover','contain','fill','none','scale-down'].map((value) => <option key={value}>{value}</option>)}</select></label></section>}
            {styleGroups.map(([group, properties]) => <details key={group} open={['TYPOGRAPHY','COLORS','LAYOUT','SPACING','BORDER','APPEARANCE'].includes(group)} className="border-t border-[#eef0ee] pt-3"><summary className="mb-2 cursor-pointer text-[10px] font-bold tracking-widest text-[#737975]">{group}</summary><div className="grid grid-cols-2 gap-2">{properties.map(([key,label,type]) => <label key={key} className="grid min-w-0 gap-1 text-[11px] text-[#555b57]">{label}{type==='color' ? <input className="h-9 w-full cursor-pointer rounded-md border border-[#dfe2e0] bg-white p-1" type="color" value={currentStyles[key] || selected.computedStyles?.[key] || '#222222'} onChange={(event) => updateStyle(key,event.target.value)} /> : type==='select' ? <select className={field} value={currentStyles[key] || selected.computedStyles?.[key] || '400'} onChange={(event) => updateStyle(key,event.target.value)}>{weights.map((weight) => <option key={weight} value={weight}>{weight}</option>)}</select> : type==='align' ? <select className={field} value={currentStyles[key] || selected.computedStyles?.[key] || 'left'} onChange={(event) => updateStyle(key,event.target.value)}>{['left','center','right','justify'].map((value) => <option key={value}>{value}</option>)}</select> : type==='border-style' ? <select className={field} value={currentStyles[key] || selected.computedStyles?.[key] || 'none'} onChange={(event) => updateStyle(key,event.target.value)}>{['none','solid','dashed','dotted','double'].map((value) => <option key={value}>{value}</option>)}</select> : <input className={field} type={type==='range'?'number':'text'} min={type==='range'?'0':undefined} max={type==='range'?'1':undefined} step={type==='range'?'0.05':undefined} value={currentStyles[key] ?? selected.computedStyles?.[key] ?? (type==='px'?'0px':'')} onChange={(event) => updateStyle(key,type==='px' && event.target.value ? `${event.target.value}px` : event.target.value)} />}</label>)}</div></details>)}
          </div>}
          {error && <p className="mt-4 text-xs text-red-600" role="alert">{error}</p>}
          {!technical && <p className="mt-5 border-t border-[#e8eae8] pt-3 text-xs text-[#737975]">Visual and content editing only.</p>}
        </aside>
      </>}
    </div>
  </section>
}
