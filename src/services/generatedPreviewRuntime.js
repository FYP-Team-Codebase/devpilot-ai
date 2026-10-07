import * as esbuild from 'esbuild-wasm'
import wasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { findGeneratedFrontendEntryPoint, normalizeGeneratedProjectFiles } from './generatedProjectFiles'

const supportedPackages = new Set([
  'react', 'react-dom', 'lucide-react', 'framer-motion', 'motion', 'react-router-dom',
  'clsx', 'tailwind-merge', 'date-fns', 'recharts', 'axios', 'zustand',
])
const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm'])
const moduleExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json']
let initialization

function normalizePath(path) {
  const parts = []
  for (const part of path.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return parts.join('/')
}

function findPath(files, requestedPath) {
  if (files.has(requestedPath)) return requestedPath
  const lowercasePath = requestedPath.toLowerCase()
  for (const path of files.keys()) if (path.toLowerCase() === lowercasePath) return path
  return null
}

function packageName(specifier) {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

function explicitPackageVersion(value, packageName) {
  const declared = String(value || '').trim()
  // Generated package.json files commonly use npm's caret/tilde ranges. Pick
  // the declared lower bound so the iframe always loads a reproducible URL.
  const match = declared.match(/^[~^]?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\w.-]+)?)(?:\s|$)/)
  if (match) return match[1]
  if (/^(?:\d+\.x|\d+\.\d+\.x|\*|latest)$/.test(declared)) {
    throw new Error(`Preview cannot resolve ${packageName}: use an explicit major.minor.patch version in package.json, received "${declared}".`)
  }
  throw new Error(`Preview cannot resolve ${packageName}: unsupported or missing package version "${declared || 'not declared'}".`)
}

function getAssetMime(path) {
  const extension = path.slice(path.lastIndexOf('.')).toLowerCase()
  return ({ '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm' })[extension] || 'application/octet-stream'
}

function makePublicAssetMap(files) {
  const assets = {}
  for (const [path, file] of files) {
    if (!path.startsWith('public/') || typeof file.content !== 'string') continue
    const publicPath = `/${path.slice('public/'.length)}`
    const mime = getAssetMime(path)
    assets[publicPath] = `data:${mime};charset=utf-8,${encodeURIComponent(file.content)}`
  }
  return assets
}

function packageImports(packageJson, specifiers) {
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.peerDependencies || {}) }
  const imports = {}
  const requests = []

  for (const specifier of specifiers) {
    const name = packageName(specifier)
    if (!supportedPackages.has(name) && !name.startsWith('@radix-ui/')) {
      throw new Error(`Preview cannot currently resolve dependency: ${name}`)
    }
    const version = explicitPackageVersion(dependencies[name] || (name === 'react' || name === 'react-dom' ? '19.2.8' : ''), name)
    const subpath = specifier === name ? '' : specifier.slice(name.length + 1)
    const url = `https://esm.sh/${name}@${version}${subpath ? `/${subpath}` : ''}?external=react,react-dom`
    imports[specifier] = url
    requests.push({ packageName: name, specifier, version, url })
  }

  return { imports, requests }
}

async function verifyDependencyRequest(request) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(request.url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'force-cache',
      redirect: 'follow',
      signal: controller.signal,
    })
    const body = await response.text()
    const contentType = response.headers.get('content-type') || ''
    const trimmedBody = body.trim()
    const invalidBody = !trimmedBody || /^<!doctype\s+html|^<html\b/i.test(trimmedBody)
      || !/(?:java|ecma)script/i.test(contentType)
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText || ''}`.trim())
    if (invalidBody) throw new Error(`CDN returned an empty or non-JavaScript response (${contentType || 'unknown content type'}).`)
  } catch (error) {
    const timedOut = controller.signal.aborted
    const reason = timedOut ? 'request timed out after 12 seconds' : error?.message || 'network or CORS request failed'
    throw new Error(`Preview dependency request failed for ${request.packageName}@${request.version} (${request.specifier}) at ${request.url}: ${reason}.`, { cause: error })
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function bundleGeneratedFrontend(generatedFiles) {
  if (!initialization) initialization = esbuild.initialize({ wasmURL: wasmUrl })
  await initialization

  const files = normalizeGeneratedProjectFiles(generatedFiles)
  const appFiles = new Map([...files].filter(([path]) => !path.toLowerCase().startsWith('backend/')))
  const packageFile = files.get('package.json')
  let packageJson = {}
  try { packageJson = JSON.parse(packageFile?.content || '{}') } catch { throw new Error('The generated frontend package.json is invalid.') }

  const entryPoint = findGeneratedFrontendEntryPoint(appFiles)
  if (!entryPoint) throw new Error('No supported frontend entry point was found (src/main.jsx or src/main.tsx).')
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    // esbuild emits imported CSS as a separate output file. Even with
    // `write: false`, it requires an output directory to name that file.
    // The output remains in memory and is sent only to the sandbox iframe.
    outdir: 'preview-output',
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    metafile: true,
    jsx: 'automatic',
    sourcemap: false,
    minify: false,
    define: { 'import.meta.env': JSON.stringify({ BASE_URL: '/', MODE: 'production', DEV: false, PROD: true, SSR: false }) },
    plugins: [{
      name: 'generated-project-files',
      setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.namespace === 'preview-router') return { path: args.path, external: true }
          if (args.path === 'react-router-dom') {
            if (!packageJson.dependencies?.['react-router-dom'] && !packageJson.peerDependencies?.['react-router-dom']) return { errors: [{ text: 'Preview does not load undeclared package "react-router-dom".' }] }
            return { path: args.path, namespace: 'preview-router' }
          }
          const directPath = findPath(appFiles, normalizePath(args.path))
          if (directPath) {
            const extension = directPath.slice(directPath.lastIndexOf('.')).toLowerCase()
            if (assetExtensions.has(extension)) return { path: directPath, namespace: 'generated-asset' }
            return { path: directPath, namespace: 'generated' }
          }
          if (args.path.startsWith('.') || args.path.startsWith('/')) {
            const base = args.path.startsWith('@/')
              ? normalizePath(`src/${args.path.slice(2)}`)
              : args.path.startsWith('/src/')
                ? normalizePath(args.path.slice(1))
                : args.path.startsWith('/')
                  ? `public/${args.path.slice(1)}`
                  : normalizePath(`${args.importer ? args.importer.split('/').slice(0, -1).join('/') : ''}/${args.path}`)
            const candidates = [base, ...moduleExtensions.map((extension) => `${base}${extension}`), ...moduleExtensions.map((extension) => `${base}/index${extension}`)]
            const assetMatch = candidates.map((path) => findPath(appFiles, path)).find((path) => path && assetExtensions.has(path.slice(path.lastIndexOf('.')).toLowerCase()))
            if (assetMatch) return { path: assetMatch, namespace: 'generated-asset' }
            const match = candidates.map((path) => findPath(appFiles, path)).find(Boolean)
            if (match) return { path: match, namespace: 'generated' }
            if (assetExtensions.has(base.slice(base.lastIndexOf('.')))) return { path: base, namespace: 'generated-asset' }
            return { errors: [{ text: `Could not resolve generated import "${args.path}" from ${args.importer || entryPoint}.` }] }
          }

          if (/^https:\/\/fonts\.googleapis\.com\//.test(args.path)) return { path: args.path, external: true }
          const name = packageName(args.path)
          const declared = Boolean(packageJson.dependencies?.[name] || packageJson.peerDependencies?.[name] || ['react', 'react-dom'].includes(name))
          if (!declared) return { errors: [{ text: `Preview does not load undeclared package "${name}".` }] }
          if (!supportedPackages.has(name) && !name.startsWith('@radix-ui/')) return { errors: [{ text: `The isolated preview does not support dependency "${name}" yet.` }] }
          return { path: args.path, external: true }
        })

        build.onLoad({ filter: /.*/, namespace: 'generated' }, (args) => {
          const file = appFiles.get(normalizePath(args.path))
          if (!file) return { errors: [{ text: `Generated file "${args.path}" is missing.` }] }
          const extension = args.path.slice(args.path.lastIndexOf('.')).toLowerCase()
          const loader = extension === '.jsx' ? 'jsx' : extension === '.tsx' ? 'tsx' : extension === '.ts' ? 'ts' : extension === '.json' ? 'json' : extension === '.css' ? 'css' : 'js'
          return { contents: file.content, loader, resolveDir: args.path.slice(0, args.path.lastIndexOf('/')) }
        })

        build.onLoad({ filter: /.*/, namespace: 'generated-asset' }, (args) => {
          const path = normalizePath(args.path)
          const file = appFiles.get(path)
          if (!file) return { errors: [{ text: `Generated asset "${path}" is missing.` }] }
          return { contents: file.content, loader: 'dataurl' }
        })

        build.onLoad({ filter: /.*/, namespace: 'preview-router' }, () => ({
          contents: `export * from "react-router-dom";
import { MemoryRouter as RuntimeMemoryRouter, createMemoryRouter as runtimeCreateMemoryRouter, Link as RuntimeLink, NavLink as RuntimeNavLink, useLocation, useNavigate } from "react-router-dom";
import * as React from "react";
function DevPilotRouteBridge({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: location.pathname, search: location.search, hash: location.hash } }));
  }, [location.pathname, location.search, location.hash]);
  React.useEffect(() => {
    const handleNavigation = (event) => {
      const route = event.detail;
      if (!route || typeof route.pathname !== "string" || !route.pathname.startsWith("/") || route.pathname.startsWith("//")) return;
      navigate(route.pathname + (route.search || "") + (route.hash || ""));
    };
    window.addEventListener("devpilot:route-navigate", handleNavigation);
    return () => window.removeEventListener("devpilot:route-navigate", handleNavigation);
  }, [navigate]);
  return React.createElement(React.Fragment, null, children);
}
function RuntimeRouter({ children, ...props }) {
  const route = window.__DEVPILOT_INITIAL_ROUTE__ || "/";
  return React.createElement(RuntimeMemoryRouter, { ...props, initialEntries: [route], initialIndex: 0 }, React.createElement(DevPilotRouteBridge, null, children));
}
export const BrowserRouter = RuntimeRouter;
export const HashRouter = RuntimeRouter;
export const MemoryRouter = RuntimeRouter;
export const Link = (props) => React.createElement(RuntimeLink, { ...props, "data-devpilot-router-link": "" });
export const NavLink = (props) => React.createElement(RuntimeNavLink, { ...props, "data-devpilot-router-link": "" });
export function createBrowserRouter(routes, options = {}) {
  const route = window.__DEVPILOT_INITIAL_ROUTE__ || "/";
  const router = runtimeCreateMemoryRouter(routes, { ...options, initialEntries: [route], initialIndex: 0 });
  router.subscribe((state) => window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: state.location.pathname, search: state.location.search, hash: state.location.hash } })));
  window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: router.state.location.pathname, search: router.state.location.search, hash: router.state.location.hash } }));
  window.addEventListener("devpilot:route-navigate", (event) => {
    const next = event.detail;
    if (next && typeof next.pathname === "string" && next.pathname.startsWith("/") && !next.pathname.startsWith("//")) router.navigate(next.pathname + (next.search || "") + (next.hash || ""));
  });
  return router;
}
export const createHashRouter = createBrowserRouter;`,
          loader: 'js',
        }))
      },
    }],
  })

  const js = result.outputFiles.find((file) => file.path.endsWith('.js'))?.text
  const css = result.outputFiles.find((file) => file.path.endsWith('.css'))?.text || ''
  if (!js) throw new Error('The generated frontend bundle is empty.')
  const externalSpecifiers = new Set(['react', 'react-dom', ...Object.values(result.metafile.outputs).flatMap((output) => output.imports || []).filter((item) => item.external).map((item) => item.path)])
  const { imports, requests } = packageImports(packageJson, externalSpecifiers)
  await Promise.all(requests.map(verifyDependencyRequest))
  return { js, css, imports, dependencyRequests: requests, assets: makePublicAssetMap(files), title: getHtmlTitle(files.get('index.html')?.content), rootId: getHtmlRootId(files.get('index.html')?.content) }
}

function getHtmlTitle(html = '') {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match?.[1]?.replace(/<[^>]*>/g, '').trim().slice(0, 120) || 'Generated Preview'
}

function getHtmlRootId(html = '') {
  const match = html.match(/<div\b[^>]*\bid=["']([\w-]+)["'][^>]*>/i)
  return match?.[1] || 'root'
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function createPreviewDocument(imports, rootId = 'root') {
  const importMap = escapeScriptJson({ imports })
      const safeRootId = /^[\w-]+$/.test(rootId) ? rootId : 'root'
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob: https://esm.sh; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src https: data: blob:; connect-src https://esm.sh; form-action 'none'; base-uri 'none';"><script type="importmap">${importMap}</script><style>html,body,#${safeRootId}{min-height:100%;margin:0}#${safeRootId}{min-height:100vh}#preview-error{font:14px system-ui,sans-serif;margin:32px;color:#9b1c1c;white-space:pre-wrap}[data-devpilot-hovered="true"]{outline:1px solid #8b80ff!important;outline-offset:1px}[data-devpilot-selected="true"]{outline:2px solid #6d5dfc!important;outline-offset:2px}</style></head><body><div id="${safeRootId}"></div><script>(function(){
 var channel='devpilot-preview', stage='iframe-boot', runtimeFailed=false, runtimeReady=false, communicationPort=null;
function send(type,detail){var message=Object.assign({channel:channel,type:type},detail||{});if(communicationPort)communicationPort.postMessage(message)}
function setStage(value){stage=value;send('stage',{stage:value})}
 function fail(message,details){if(runtimeFailed||runtimeReady)return;runtimeFailed=true;send('DEV_PILOT_PREVIEW_ERROR',Object.assign({stage:stage,errorType:'runtime',message:String(message||'Preview runtime error').slice(0,1000)},details||{}))}
window.addEventListener('error',function(e){var target=e.target;var url=target&&(target.src||target.href)||'';fail(e.message||'Preview resource or script error',{errorType:url?'resource-load':'javascript',url:String(url).slice(0,500),filename:String(e.filename||'').slice(0,500),line:e.lineno||0})});
 window.addEventListener('unhandledrejection',function(e){var reason=e.reason,message=reason&&reason.message||reason||'Unhandled preview rejection';if(runtimeReady||(reason&&reason.code==='ERR_NETWORK')||/network error|failed to fetch|load failed|network request failed/i.test(String(message)))return;fail(message,{errorType:'unhandled-rejection'})});
 window.addEventListener('securitypolicyviolation',function(e){if(e.violatedDirective==='connect-src')return;fail('Iframe Content Security Policy blocked a resource',{errorType:'csp',directive:e.violatedDirective,blockedURI:String(e.blockedURI||'').slice(0,500)})});
var selectionMode=false, selectedElement=null, hoveredElement=null, assets={}, editorState={};
var currentRoute={pathname:'/',search:'',hash:''};
function normalizeRoute(value){try{var raw=typeof value==='string'?value:String((value&&value.pathname)||'/')+(value&&value.search||'')+(value&&value.hash||'');if(raw.length>2500||raw.indexOf('//')===0||/[\\u0000-\\u001f]/.test(raw))return null;var url=new URL(raw,'https://devpilot.invalid');if(url.origin!=='https://devpilot.invalid')return null;return {pathname:url.pathname,search:url.search,hash:url.hash}}catch(_){return null}}
function reportNavigation(value){var route=normalizeRoute(value);if(!route)return;currentRoute=route;send('DEV_PILOT_PREVIEW_NAVIGATION',{route:route})}
window.addEventListener('devpilot:generated-navigation',function(event){reportNavigation(event.detail)});
window.addEventListener('hashchange',function(){if(window.location.hash&&window.location.hash.slice(1).startsWith('/')){var hashRoute=normalizeRoute(window.location.hash.slice(1));if(hashRoute){reportNavigation(hashRoute);window.dispatchEvent(new CustomEvent('devpilot:route-navigate',{detail:hashRoute}))}}else reportNavigation({pathname:currentRoute.pathname,search:currentRoute.search,hash:window.location.hash})});
document.addEventListener('error',function(event){var image=event.target;if(image&&image.tagName==='IMG'){image.setAttribute('data-devpilot-image-error','true');image.setAttribute('title','Image could not be loaded');image.style.outline='1px dashed #c44';image.style.outlineOffset='-2px';send('image-error')}},true);
function rewriteAssets(){document.querySelectorAll('[src],[poster],[href]').forEach(function(node){['src','poster','href'].forEach(function(attr){var value=node.getAttribute(attr);if(value&&assets[value])node.setAttribute(attr,assets[value])})})}
var assetObserver=new MutationObserver(rewriteAssets);assetObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','poster','href']});
function elementPath(node){var parts=[];while(node&&node!==document.body){var index=1,sibling=node;while((sibling=sibling.previousElementSibling))if(sibling.tagName===node.tagName)index++;parts.unshift(node.tagName.toLowerCase()+':nth-of-type('+index+')');node=node.parentElement}return 'body>'+parts.join('>')}
function describe(node){var computed=getComputedStyle(node),rect=node.getBoundingClientRect();return {path:elementPath(node),tagName:node.tagName.toLowerCase(),textPreview:(node.innerText||node.textContent||'').trim().slice(0,500),classNames:String(node.className&&node.className.baseVal||node.className||'').slice(0,300),id:String(node.id||'').slice(0,120),rect:{x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)},computedStyles:{fontFamily:computed.fontFamily,fontSize:computed.fontSize,fontWeight:computed.fontWeight,lineHeight:computed.lineHeight,letterSpacing:computed.letterSpacing,textAlign:computed.textAlign,color:computed.color,backgroundColor:computed.backgroundColor,width:computed.width,height:computed.height,maxWidth:computed.maxWidth,minHeight:computed.minHeight,margin:computed.margin,padding:computed.padding,borderWidth:computed.borderWidth,borderStyle:computed.borderStyle,borderColor:computed.borderColor,borderRadius:computed.borderRadius,opacity:computed.opacity,boxShadow:computed.boxShadow,objectFit:computed.objectFit},isImage:node.tagName==='IMG',src:node.tagName==='IMG'?node.getAttribute('src')||'':'',alt:node.tagName==='IMG'?node.getAttribute('alt')||'':'',href:node.tagName==='A'?node.getAttribute('href')||'':''}}
function applyEditorState(state){editorState=state&&typeof state==='object'?state:{};Object.keys(editorState).forEach(function(path){try{var node=document.querySelector(path);if(!node)return;var value=editorState[path]||{},styles=value.styles||{};Object.keys(styles).forEach(function(key){if(/^(fontFamily|fontSize|fontWeight|lineHeight|letterSpacing|textAlign|color|backgroundColor|width|height|maxWidth|minHeight|marginTop|marginRight|marginBottom|marginLeft|paddingTop|paddingRight|paddingBottom|paddingLeft|borderWidth|borderStyle|borderColor|borderRadius|opacity|boxShadow|objectFit)$/.test(key))node.style[key]=String(styles[key]).slice(0,200)});if(typeof value.content==='string'&&/^(h[1-6]|p|span|button|a|li)$/.test(node.tagName.toLowerCase()))node.textContent=value.content.slice(0,5000);if(node.tagName==='IMG'&&value.image){if(typeof value.image.src==='string')node.setAttribute('src',value.image.src.slice(0,2000));if(typeof value.image.alt==='string')node.setAttribute('alt',value.image.alt.slice(0,500))}}catch(_){}})}
document.addEventListener('mousemove',function(event){if(!selectionMode)return;var target=event.target.closest('*');if(!target||target===document.body||target===document.documentElement){if(hoveredElement)hoveredElement.removeAttribute('data-devpilot-hovered');hoveredElement=null;return}if(hoveredElement===target)return;if(hoveredElement)hoveredElement.removeAttribute('data-devpilot-hovered');hoveredElement=target;target.setAttribute('data-devpilot-hovered','true');send('ELEMENT_HOVERED',{element:describe(target)})},true);
document.addEventListener('click',function(event){var anchor=event.target.closest&&event.target.closest('a[href]');if(anchor&&!anchor.hasAttribute('data-devpilot-router-link')&&!event.defaultPrevented&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){var href=(anchor.getAttribute('href')||'').trim();if(href&&href.charAt(0)!=='#'&&!/^[a-z][a-z0-9+.-]*:/i.test(href)&&href.indexOf('//')!==0){try{var base='https://devpilot.invalid'+currentRoute.pathname+currentRoute.search;var targetUrl=new URL(href,base);if(targetUrl.origin==='https://devpilot.invalid'){var nextRoute={pathname:targetUrl.pathname,search:targetUrl.search,hash:targetUrl.hash};event.preventDefault();window.dispatchEvent(new CustomEvent('devpilot:route-navigate',{detail:nextRoute}));return}}catch(_){}}}if(!selectionMode)return;var target=event.target.closest('*');if(!target||target===document.body||target===document.documentElement){if(selectedElement)selectedElement.removeAttribute('data-devpilot-selected');selectedElement=null;send('ELEMENT_SELECTION_CLEARED');return}if(anchor&&!anchor.hasAttribute('data-devpilot-router-link')&&(anchor.getAttribute('href')||'').charAt(0)!=='#')event.preventDefault();if(selectedElement)selectedElement.removeAttribute('data-devpilot-selected');selectedElement=target;target.setAttribute('data-devpilot-selected','true');send('ELEMENT_SELECTED',{element:describe(target)})},true);
function waitFor(promise,ms,label){return new Promise(function(resolve,reject){var timer=setTimeout(function(){reject(new Error(label+' timed out after '+ms+' ms'))},ms);promise.then(function(value){clearTimeout(timer);resolve(value)},function(error){clearTimeout(timer);reject(error)})})}
window.addEventListener('message',function(event){if(event.source!==parent||!event.data||event.data.channel!==channel||event.data.type!=='render')return;currentRoute=normalizeRoute(event.data.initialRoute)||{pathname:'/',search:'',hash:''};window.__DEVPILOT_INITIAL_ROUTE__=currentRoute.pathname+currentRoute.search+currentRoute.hash});
window.addEventListener('message',async function(event){if(event.source!==parent||!event.data||event.data.channel!==channel)return;if(event.data.type==='INIT_RUNTIME_CHANNEL'&&event.ports&&event.ports[0]){communicationPort=event.ports[0];communicationPort.start();return}if(event.data.type==='selection-mode'){selectionMode=Boolean(event.data.enabled);return}if(event.data.type==='APPLY_EDITOR_STATE'){applyEditorState(event.data.editorState);return}if(event.data.type==='render')try{assets=event.data.assets&&typeof event.data.assets==='object'?event.data.assets:{};selectionMode=Boolean(event.data.selectionMode);document.title=String(event.data.title||'Generated Preview').slice(0,120);var style=document.createElement('style');style.textContent=String(event.data.css||'');document.head.appendChild(style);if(!style.sheet)throw new Error('Generated CSS could not be applied by the iframe.');send('stage',{stage:'generated-css-loaded'});setStage('iframe-dependency-modulepreload');var dependencies=event.data.dependencies||[];var urls=Array.from(new Set(Object.entries(event.data.imports||{}).map(function(entry){return entry[1]})));var links=urls.map(function(url){var link=document.createElement('link');link.rel='modulepreload';link.crossOrigin='anonymous';link.href=url;document.head.appendChild(link);var dependency=dependencies.find(function(item){return item.url===url});return {url:url,packageName:dependency&&dependency.packageName||'unknown package',specifier:dependency&&dependency.specifier||'',link:link}});await waitFor(Promise.all(links.map(function(item){return new Promise(function(resolve,reject){item.link.onload=function(){send('stage',{stage:'dependency-module-loaded',packageName:item.packageName,specifier:item.specifier,url:item.url});resolve()};item.link.onerror=function(){reject(new Error('Iframe could not load '+item.packageName+' ('+item.specifier+') from '+item.url))}})})),15000,'Iframe dependency loading');setStage('generated-main-module-loading');var root=document.getElementById(${JSON.stringify(safeRootId)});if(!root)throw new Error('Generated React mount element #${safeRootId} was not found.');var mounted=new Promise(function(resolve){var observer=new MutationObserver(function(){rewriteAssets();if(root.childNodes.length){observer.disconnect();resolve()}});observer.observe(root,{subtree:true,childList:true});if(root.childNodes.length){observer.disconnect();resolve()}});var blobUrl=URL.createObjectURL(new Blob([String(event.data.js||'')],{type:'text/javascript'}));var moduleScript=document.createElement('script');moduleScript.type='module';moduleScript.src=blobUrl;moduleScript.onload=function(){URL.revokeObjectURL(blobUrl);send('stage',{stage:'generated-main-module-loaded'});setStage('react-mount-started');waitFor(mounted,10000,'React mount').then(function(){rewriteAssets();applyEditorState(event.data.design);runtimeReady=true;setStage('react-mount-completed');setStage('runtime-ready');send('DEV_PILOT_PREVIEW_READY',{stage:'runtime-ready'})}).catch(function(error){fail(error.message,{errorType:'react-mount-timeout'})})};moduleScript.onerror=function(){URL.revokeObjectURL(blobUrl);fail('Generated main module failed to load or evaluate',{errorType:'module-script',url:blobUrl})};document.head.appendChild(moduleScript)}catch(error){fail(error&&error.message||error,{errorType:'dependency-or-runtime',stage:stage})}});
send('stage',{stage:'iframe-booted'});
})();</script></body></html>`
}
