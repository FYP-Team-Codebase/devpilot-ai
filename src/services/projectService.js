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

export async function getProject(projectId) {
  const id = typeof projectId === 'string' ? projectId.trim() : ''

  if (!id) {
    throw new Error('Project ID is required to load a project.')
  }

  const response = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createProjectError(data, 'Could not load project.')
  }

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

  return {
    projects: Array.isArray(data.projects) ? data.projects.map(normalizeProject) : [],
    isConfigured: true,
  }
}
