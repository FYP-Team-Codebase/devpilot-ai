import { getToken } from './authService'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function parseJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function getAuthHeaders() {
  const token = getToken()

  if (!token) {
    throw new Error('Your session has expired. Please log in again.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function createProjectError(data, fallbackMessage) {
  return new Error(data?.message || fallbackMessage)
}

function normalizeProject(project) {
  return {
    ...project,
    id: project.id || project._id,
    name: project.name || project.projectName || project.title || 'Untitled website',
    status: project.status || project.generationStatus || '',
    href: project.href || project.url || project.editUrl || '',
  }
}

export async function createProject(payload) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw createProjectError(data, 'Could not create project.')
  }

  return data
}

export async function updateProject(projectId, payload) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''

  if (!id) {
    throw new Error('Project ID is required to update a project.')
  }

  const response = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createProjectError(data, 'Could not update project.')
  }

  return data
}

export async function updateProjectEditor(projectId, payload) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''
  if (!id) throw new Error('Project ID is required to save editor changes.')
  const url = `${API_URL}/projects/${encodeURIComponent(id)}/editor`
  const response = await fetch(url, {
    method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw createProjectError(data, 'Could not save changes.')
  return data
}

export async function getProject(projectId) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''

  if (!id) {
    throw new Error('Project ID is required to load a project.')
  }

  const url = `${API_URL}/projects/${encodeURIComponent(id)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createProjectError(data, 'Could not load project.')
  }

  return data
}

export async function exportProject(projectId, projectName = 'DevPilot Project') {
  const id = typeof projectId === 'string' ? projectId.trim() : ''
  if (!id) throw new Error('Project ID is required to export a project.')
  let response
  const url = `${API_URL}/projects/${encodeURIComponent(id)}/export`
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${getToken() || ''}` },
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  if (!response.ok) {
    const data = await parseJsonResponse(response)
    const fallback = response.status === 401
      ? 'Your session has expired. Please log in again.'
      : response.status === 404
        ? 'Project not found.'
        : 'Unable to export project. Please try again.'
    throw createProjectError(data, fallback)
  }

  const blob = await response.blob()
  if (!blob.size) throw new Error('The server returned an empty project archive.')
  const safeName = String(projectName || 'DevPilot Project')
    .replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '').trim() || 'DevPilot Project'
  const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }))
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${safeName}.zip`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export async function generateProject(projectId) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''

  if (!id) throw new Error('Project ID is required to generate a project.')

  const response = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  const data = await parseJsonResponse(response)

  if (!response.ok) throw createProjectError(data, 'Could not generate this project.')
  return data
}

export async function getRecentProjects() {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createProjectError(data, 'Could not load projects.')
  }

  const responseProjects = Array.isArray(data.projects) ? data.projects : []
  const projects = responseProjects.map(normalizeProject)
  return {
    projects,
    isConfigured: true,
  }
}

export async function deleteProject(projectId) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''
  if (!id) throw new Error('Project ID is required to delete a project.')

  const response = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createProjectError(data, 'Could not delete project.')
  }

  return data
}
